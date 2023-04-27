import { type NextApiRequest, type NextApiResponse } from "next";
import Stripe from "stripe";
import { buffer } from "micro";

import { env } from "~/env.mjs";
import { prisma } from "~/server/db";

const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: "2022-11-15",
});

export const config = {
  api: {
    bodyParser: false,
  },
};

const webhook = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "POST") {
    const buf = await buffer(req);
    const sig = req.headers["stripe-signature"] as string;
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        buf,
        sig,
        env.STRIPE_WEBHOOK_SECRET
      );
    } catch (error) {
      let message = "Unknown Error";
      if (error instanceof Error) message = error.message;
      res.status(400).send(`Webhook Error: ${message}`);
      return;
    }

    switch (event.type) {
      case "checkout.session.completed":
        const completedEvent = event.data.object as {
          id: string;
          metadata: {
            userId: string;
          };
        };
        await prisma.user.update({
          where: {
            id: completedEvent.metadata.userId,
          },
          data: {
            credits: {
              increment: 100,
            },
          },
        });
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }
    res.json({ received: true });
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }
};

export default webhook;
