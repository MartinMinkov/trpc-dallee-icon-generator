import { type NextPage } from "next";
import { useState } from "react";
import Head from "next/head";
import { z } from "zod";
import { HexColorInput, HexColorPicker } from "react-colorful";

import { api } from "~/utils/api";
import { Input } from "~/components/Input";
import { Button } from "~/components/Button";
import { FormGroup } from "~/components/FormGroup";
import { TRPCClientError } from "@trpc/client";

const validationSchema = z.object({
  prompt: z.string().nonempty(),
  color: z.string().nonempty(),
  numberOfIcons: z.number().int().positive().default(1),
  errors: z.object({
    prompt: z.string().optional(),
    color: z.string().optional(),
    numberOfIcons: z.string().optional(),
    authorized: z.string().optional(),
  }),
});

type ValidationSchema = z.infer<typeof validationSchema>;

function findError<T extends string | number>(errors: T[], error: string) {
  return errors.find((err) => err === error);
}

const GeneratePage: NextPage = () => {
  const [form, setForm] = useState<ValidationSchema>({
    prompt: "",
    color: "#808080",
    numberOfIcons: 1,
    errors: {
      prompt: undefined,
      color: undefined,
      numberOfIcons: undefined,
      authorized: undefined,
    },
  });
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  const generateIcon = api.icon.generateIcon.useMutation({
    onSuccess: (data) => {
      console.log("DEBUG", data);
      setImageUrls(data.map((icon) => icon.imageUrl));
    },
    onError: (error) => {
      if (error instanceof TRPCClientError) {
        if (error.message === "UNAUTHORIZED") {
          setForm((currentState) => {
            const newErrors = {
              ...currentState.errors,
              authorized: "Must be logged in to generate icons",
            };
            return { ...currentState, errors: newErrors };
          });
        }
      }
    },
  });

  const renderIcons = () => {
    if (imageUrls.length === 0) return null;
    return (
      <div className="mt-6 flex flex-col gap-4">
        <h2 className="text-2xl">Generated Icons:</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 md:grid-cols-6">
          {imageUrls.map((url) => (
            <img
              key={url}
              src={url}
              alt="Image of generated prompt"
              width={200}
              height={200}
            />
          ))}
        </div>
      </div>
    );
  };

  const handleFormErrors = (error: unknown) => {
    if (error instanceof z.ZodError) {
      for (const issue of error.issues) {
        const { path } = issue;
        if (path.length === 0) continue;
        if (findError(path, "prompt")) {
          setForm((currentState) => {
            const newErrors = {
              ...currentState.errors,
              prompt: "Prompt is required",
            };
            return { ...currentState, errors: newErrors };
          });
        }
        if (findError(path, "color")) {
          setForm((currentState) => {
            const newErrors = {
              ...currentState.errors,
              color: "Color is required",
            };
            return { ...currentState, errors: newErrors };
          });
        }
        if (findError(path, "numberOfIcons")) {
          setForm((currentState) => {
            const newErrors = {
              ...currentState.errors,
              numberOfIcons: "Number of icons is required",
            };
            return { ...currentState, errors: newErrors };
          });
        }
      }
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setForm((currentState) => {
      const newErrors = {
        ...currentState.errors,
        prompt: undefined,
        color: undefined,
        numberOfIcons: undefined,
        authorized: undefined,
      };
      return { ...currentState, errors: newErrors };
    });
    try {
      const data = validationSchema.parse(form);
      generateIcon.mutate(data);
    } catch (error) {
      handleFormErrors(error);
    }
  };

  const updateForm = (key: string) => {
    return function (e: React.ChangeEvent<HTMLInputElement> | string) {
      const errors = { ...form.errors, [key]: undefined };
      setForm((prev) => {
        if (typeof e === "string") return { ...prev, errors, [key]: e };
        if (key === "numberOfIcons")
          return { ...prev, errors, [key]: parseInt(e.target.value) };
        return { ...prev, errors, [key]: e.target.value };
      });
    };
  };

  return (
    <>
      <Head>
        <title>Icon Generator</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="container mx-auto mt-12 min-h-screen sm:mt-24">
        <h1 className="text-4xl">Generate Your Icons</h1>
        <p className=" mb-6 text-2xl sm:mb-12">
          Fill out the form below to start generating your icon
        </p>
        <form className="flex flex-col gap-4" onSubmit={onSubmit}>
          <h2>1. Describe what you want your icon to look like</h2>
          <FormGroup className="mb-12">
            <label htmlFor="prompt">Prompt</label>
            <Input
              value={form.prompt}
              id="prompt"
              placeholder="Write your prompt here..."
              onChange={updateForm("prompt")}
            />
            {form.errors.prompt && (
              <p className="italic text-red-500">{form.errors.prompt}</p>
            )}
          </FormGroup>
          <h2>2. Pick your icon color</h2>
          <FormGroup className="mb-12">
            <div className="flex flex-col items-center gap-6 sm:flex-row">
              <HexColorPicker
                color={form.color}
                onChange={updateForm("color")}
              />
              <div
                className="h-48 w-48 rounded"
                style={{ backgroundColor: form.color ?? "transparent" }}
              />
            </div>
            <HexColorInput
              className="w-1/6 uppercase"
              color={form.color}
              onChange={updateForm("color")}
            />
          </FormGroup>
          {form.errors.color && (
            <p className="italic text-red-500">{form.errors.color}</p>
          )}
          <h2>3. Pick how many icons you want to generate</h2>
          <FormGroup>
            <label htmlFor="numberOfIcons">Number of icons to generate</label>
            <Input
              inputMode="numeric"
              type="number"
              pattern="[1-9]|10"
              value={form.numberOfIcons}
              id="numberOfIcons"
              onChange={updateForm("numberOfIcons")}
            />
            {form.errors.numberOfIcons && (
              <p className="italic text-red-500">{form.errors.numberOfIcons}</p>
            )}
          </FormGroup>
          <Button
            isLoading={generateIcon.isLoading || false}
            disabled={generateIcon.isLoading || false}
            variant="primary"
          >
            Generate
          </Button>
          {form.errors.authorized && (
            <p className="italic text-red-500">{form.errors.authorized}</p>
          )}
        </form>
        {renderIcons()}
      </main>
    </>
  );
};

export default GeneratePage;
