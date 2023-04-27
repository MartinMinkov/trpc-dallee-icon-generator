import clsx from "clsx";

export function Button(
  props: React.ComponentPropsWithoutRef<"button"> & {
    variant: "primary" | "secondary";
  }
) {
  let color: string;
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
    <button {...props} className={clsx("rounded px-4 py-2 text-white", color)}>
      {props.children}
    </button>
  );
}
