import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { Configuration, OpenAIApi } from "openai";
import AWS from "aws-sdk";
import { nanoid } from "nanoid";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { env } from "~/env.mjs";
import { imageMockUrl } from "~/data/imageMock";
import { type PrismaClient } from "@prisma/client";

type GenerateIconResponse = {
  b64_json: string;
};

type GenerateResponse = {
  imageUrl: string;
};

const configuration = new Configuration({
  apiKey: env.DALLEE_API_KEY,
});

const s3 = new AWS.S3({
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
  region: env.AWS_REGION,
});

async function generateIcon(prompt: string) {
  const openai = new OpenAIApi(configuration);
  let errorMessage: string | null = null;

  try {
    const response = await openai.createImage({
      prompt,
      n: 1,
      size: "256x256",
      response_format: "b64_json",
    });
    if (response.data.data[0]?.b64_json) {
      return {
        b64_json: response.data.data[0].b64_json,
      } as GenerateIconResponse;
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

async function uploadIconToS3(
  base64EncodedImage: GenerateIconResponse,
  iconId: string
) {
  await s3
    .putObject({
      Bucket: env.AWS_BUCKET_NAME,
      Key: iconId,
      Body: Buffer.from(base64EncodedImage.b64_json, "base64"),
      ContentEncoding: "base64",
      ContentType: "image/gif",
    })
    .promise();
}

function generateIconUrl(iconId: string) {
  return `https://${env.AWS_BUCKET_NAME}.s3.${env.AWS_REGION}.amazonaws.com/${iconId}`;
}

export const generateRouter = createTRPCRouter({
  generateIcon: protectedProcedure
    .input(z.object({ prompt: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Return mock response if in development
      if (env.MOCK_DALLEE) {
        return { imageUrl: imageMockUrl } as GenerateResponse;
      }

      const { count } = await ctx.prisma.user.updateMany({
        where: {
          id: ctx.session.user.id,
          credits: {
            gte: 1,
          },
        },
        data: {
          credits: {
            decrement: 1,
          },
        },
      });
      if (count <= 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Not enough credits",
        });
      }

      const iconId = nanoid();
      const base64EncodedImage = await generateIcon(input.prompt);
      const imageUrl = generateIconUrl(iconId);
      await saveIconToDatabase({ prompt: input.prompt, imageUrl }, ctx);
      await uploadIconToS3(base64EncodedImage, iconId);
      return { imageUrl } as GenerateResponse;
    }),
});
