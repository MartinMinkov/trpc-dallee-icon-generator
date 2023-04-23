import { createTRPCRouter, protectedProcedure } from "../trpc";
import Stripe from "stripe";

import { env } from "~/env.mjs";

const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: "2022-11-15",
});

export const checkoutRouter = createTRPCRouter({
  createCheckout: protectedProcedure.mutation(async ({ ctx }) => {
    return stripe.checkout.sessions.create({
      success_url: env.HOSTNAME,
      cancel_url: env.HOSTNAME,
      line_items: [{ price: env.PRICE_ID, quantity: 1 }],
      mode: "payment",
      metadata: {
        userId: ctx.session.user.id,
      },
      payment_method_types: ["card"],
    });
  }),
});
