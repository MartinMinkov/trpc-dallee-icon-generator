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
    <button {...props} className={`rounded ${color} px-4 py-4 text-white `}>
      {props.children}
    </button>
  );
}
