export function Button(props: React.ComponentPropsWithoutRef<"button">) {
  return <button {...props}>{props.children}</button>;
}
