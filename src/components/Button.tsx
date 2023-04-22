export function Button(props: React.ComponentPropsWithoutRef<"button">) {
  return (
    <button
      {...props}
      className="rounded bg-blue-400 px-4 py-4 text-white hover:bg-blue-500"
    >
      {props.children}
    </button>
  );
}
