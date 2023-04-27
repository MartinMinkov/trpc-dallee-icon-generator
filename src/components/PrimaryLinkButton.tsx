import clsx from "clsx";

import Link, { type LinkProps } from "next/link";

export function PrimaryLinkButton(
  props: React.ComponentPropsWithoutRef<"a"> &
    LinkProps & {
      variant?: "primary" | "secondary";
    }
) {
  let color = "primary";
  switch (props.variant) {
    case "primary":
      color = "bg-blue-400 hover:bg-blue-500";
      break;
    case "secondary":
      color = "bg-gray-400 hover:bg-gray-500";
      break;
    default:
      throw new Error("Invalid variant");
  }

  return (
    <Link
      {...props}
      className={clsx("rounded px-4 py-2 text-center text-white", color)}
    >
      {props.children}
    </Link>
  );
}
