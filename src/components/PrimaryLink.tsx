import Link, { type LinkProps } from "next/link";

export function PrimaryLink(
  props: React.ComponentPropsWithoutRef<"a"> & LinkProps
) {
  return (
    <Link {...props} className="hover:text-cyan-800">
      {props.children}
    </Link>
  );
}
