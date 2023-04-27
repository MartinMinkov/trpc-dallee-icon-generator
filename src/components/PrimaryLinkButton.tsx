import clsx from "clsx";

import Link, { type LinkProps } from "next/link";

export function PrimaryLinkButton(
  props: React.ComponentPropsWithoutRef<"a"> &
    LinkProps & {
      variant?: "primary" | "secondary";
      size?: "small" | "medium" | "large";
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
  let size = "medium";
  switch (props.size) {
    case "small":
      size = "w-1/4";
      break;
    case "medium":
      size = "w-1/2";
      break;
    case "large":
      size = "w-full";
      break;
    default:
      throw new Error("Invalid size");
  }
  return (
    <Link
      {...props}
      className={clsx("rounded px-4 py-2 text-center text-white", color, size)}
    >
      {props.children}
    </Link>
  );
}
