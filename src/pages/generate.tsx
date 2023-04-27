import { type NextPage } from "next";
import { useState } from "react";
import Head from "next/head";
import { z } from "zod";
import Image from "next/image";

import { api } from "~/utils/api";
import { Input } from "~/components/Input";
import { Button } from "~/components/Button";
import { FormGroup } from "~/components/FormGroup";
import { TRPCClientError } from "@trpc/client";
import { Spinner } from "~/components/Spinner";

const validationSchema = z.object({
  prompt: z.string().nonempty(),
  errors: z.object({
    prompt: z.string().optional(),
    authorized: z.string().optional(),
  }),
});

type ValidationSchema = z.infer<typeof validationSchema>;

const GeneratePage: NextPage = () => {
  const [form, setForm] = useState<ValidationSchema>({
    prompt: "",
    errors: {
      prompt: undefined,
      authorized: undefined,
    },
  });
  const [imageUrl, setImageUrl] = useState<string>("");

  const generateIcon = api.generate.generateIcon.useMutation({
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
        if (path[0] === "prompt") {
          setForm((currentState) => {
            const newErrors = {
              ...currentState.errors,
              prompt: "Prompt is required",
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
      setImageUrl("");
      setForm({ prompt: "", errors: {} });
    } catch (error) {
      handleFormErrors(error);
    }
  };

  const updateForm = (key: string) => {
    return function (e: React.ChangeEvent<HTMLInputElement>) {
      const errors = { ...form.errors, [key]: undefined };
      setForm((prev) => {
        return { ...prev, errors, [key]: e.target.value };
      });
    };
  };

  const renderSpinner = () => {
    if (generateIcon.isLoading) {
      return <Spinner />;
    }
  };

  return (
    <>
      <Head>
        <title>Create T3 App</title>
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
          <FormGroup>
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
          <Button disabled={generateIcon.isLoading} variant="primary">
            Generate
          </Button>
          {form.errors.authorized && (
            <p className="italic text-red-500">{form.errors.authorized}</p>
          )}
          {renderSpinner()}
        </form>
        {imageUrl && (
          <Image
            src={imageUrl}
            alt="Image of generated prompt"
            width={100}
            height={100}
          />
        )}
      </main>
    </>
  );
};

export default GeneratePage;
