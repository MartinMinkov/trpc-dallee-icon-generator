import { loadStripe } from "@stripe/stripe-js";

import { env } from "~/env.mjs";
import { api } from "~/utils/api";

const stripePromise = loadStripe(env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);

export function useBuyCredits() {
  const checkout = api.checkout.createCheckout.useMutation();
  return {
    buyCredits: async () => {
      const response = await checkout.mutateAsync();
      const stripe = await stripePromise;
      if (!stripe) {
        return;
      }
      await stripe.redirectToCheckout({
        sessionId: response.id,
      });
    },
  };
}
