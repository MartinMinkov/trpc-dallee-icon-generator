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
  errors: z.object({
    prompt: z.string().optional(),
    color: z.string().optional(),
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
    errors: {
      prompt: undefined,
      color: undefined,
      authorized: undefined,
    },
  });
  const [imageUrl, setImageUrl] = useState<string>("");

  const generateIcon = api.icon.generateIcon.useMutation({
    onSuccess: (data) => {
      setImageUrl(data.imageUrl);
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
      }
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
          <FormGroup>
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
        {imageUrl && (
          <>
            <h2 className="my-12 text-2xl">Your Icons</h2>
            <section className="grid grid-cols-4 gap-4">
              <img
                src={imageUrl}
                alt="Image of generated prompt"
                width={100}
                height={100}
                className="w-full"
              />
              <img
                src={imageUrl}
                alt="Image of generated prompt"
                width={100}
                height={100}
                className="w-full"
              />
              <img
                src={imageUrl}
                alt="Image of generated prompt"
                width={100}
                height={100}
                className="w-full"
              />
              <img
                src={imageUrl}
                alt="Image of generated prompt"
                width={100}
                height={100}
                className="w-full"
              />
            </section>
          </>
        )}
      </main>
    </>
  );
};

export default GeneratePage;
