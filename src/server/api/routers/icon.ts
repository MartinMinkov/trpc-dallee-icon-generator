import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { Configuration, OpenAIApi } from "openai";
import AWS from "aws-sdk";
import { nanoid } from "nanoid";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { env } from "~/env.mjs";
import { imageMockUrl } from "~/data/imageMock";
import { type PrismaClient } from "@prisma/client";

const configuration = new Configuration({
  apiKey: env.DALLEE_API_KEY,
});

const s3 = new AWS.S3({
  credentials: {
    accessKeyId: env.S3_AWS_ACCESS_KEY_ID,
    secretAccessKey: env.S3_AWS_SECRET_ACCESS_KEY,
  },
  region: env.S3_AWS_REGION,
});

function generatePrompt(input: GenerateInput) {
  const { prompt, color } = input;
  return `A modern icon in ${color} of a ${prompt}`;
}

async function generateIcon(prompt: string, numberOfIcons: number) {
  const openai = new OpenAIApi(configuration);
  let errorMessage: string | null = null;

  try {
    const response = await openai.createImage({
      prompt,
      n: numberOfIcons,
      size: "256x256",
      response_format: "b64_json",
    });
    if (response.data.data[0]?.b64_json) {
      return response.data.data.map((result) => result.b64_json);
    } else {
      errorMessage = "Something went wrong";
    }
  } catch (error) {
    console.log(error);
    errorMessage = "Something went wrong";
  }

  throw new TRPCError({
    code: "BAD_REQUEST",
    message: errorMessage,
  });
}

async function saveIconToDatabase(
  data: { prompt: string; imageUrl: string },
  ctx: { prisma: PrismaClient; session: { user: { id: string } } }
) {
  return ctx.prisma.icon.create({
    data: {
      prompt: data.prompt,
      url: data.imageUrl,
      userId: ctx.session.user.id,
    },
  });
}

async function uploadIconToS3(base64EncodedImage: string, iconId: string) {
  await s3
    .putObject({
      Bucket: env.S3_AWS_BUCKET_NAME,
      Key: iconId,
      Body: Buffer.from(base64EncodedImage, "base64"),
      ContentEncoding: "base64",
      ContentType: "image/gif",
    })
    .promise();
}

function generateIconUrl(iconId: string) {
  return `https://${env.S3_AWS_BUCKET_NAME}.s3.${env.S3_AWS_REGION}.amazonaws.com/${iconId}`;
}

const inputSchema = z.object({
  prompt: z.string(),
  color: z.string(),
  numberOfIcons: z.number(),
});

type GenerateResponse = {
  imageUrl: string;
}[];
type GenerateInput = z.infer<typeof inputSchema>;

export const iconRouter = createTRPCRouter({
  generateIcon: protectedProcedure
    .input(inputSchema)
    .mutation(async ({ ctx, input }) => {
      // Return mock response if in development
      if (env.MOCK_DALLEE === "true") {
        return [
          {
            imageUrl: imageMockUrl,
          },
        ] satisfies GenerateResponse;
      }

      const { count } = await ctx.prisma.user.updateMany({
        where: {
          id: ctx.session.user.id,
          credits: {
            gte: 1 * input.numberOfIcons,
          },
        },
        data: {
          credits: {
            decrement: 1 * input.numberOfIcons,
          },
        },
      });
      if (count <= 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Not enough credits",
        });
      }

      const prompt = generatePrompt(input);
      const base64EncodedImages = await generateIcon(
        prompt,
        input.numberOfIcons
      );

      const icons: GenerateResponse = [];
      for (const base64EncodedImage of base64EncodedImages) {
        if (base64EncodedImage === undefined) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Something went wrong",
          });
        }
        const iconId = nanoid();
        const imageUrl = generateIconUrl(iconId);

        await saveIconToDatabase({ prompt, imageUrl }, ctx);
        await uploadIconToS3(base64EncodedImage, iconId);
        icons.push({ imageUrl });
      }
      return icons satisfies GenerateResponse;
    }),
});
