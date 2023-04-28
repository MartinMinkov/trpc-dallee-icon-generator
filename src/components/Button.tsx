import clsx from "clsx";
import { Spinner } from "./Spinner";

export function Button(
  props: React.ComponentPropsWithoutRef<"button"> & {
    variant?: "primary" | "secondary";
    isLoading?: boolean;
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

  const { isLoading, ...rest } = props;

  return (
    <button
      {...rest}
      className={clsx(
        "flex items-center justify-center gap-2 rounded px-1 py-1 text-white disabled:bg-gray-500 sm:px-4 sm:py-3",
        color
      )}
    >
      {isLoading && <Spinner />}
      {props.children}
    </button>
  );
}
