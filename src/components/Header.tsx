import { useSession, signIn, signOut } from "next-auth/react";
import { useBuyCredits } from "~/hooks/useBuyCredits";
import { PrimaryLink } from "./PrimaryLink";
import { Button } from "./Button";

export function Header() {
  const session = useSession();
  const isLoggedIn = session.status === "authenticated";

  const { buyCredits } = useBuyCredits();

  const renderAuthenticationButtons = () => {
    return !isLoggedIn ? (
      <Button
        onClick={() => {
          signIn().catch(console.error);
        }}
        className="rounded bg-blue-400 px-4 py-4 text-white hover:bg-blue-500"
      >
        Login
      </Button>
    ) : (
      <div className="flex gap-4">
        <Button
          onClick={() => {
            signOut().catch(console.error);
          }}
          className="rounded bg-blue-400 px-4 py-4 text-white hover:bg-blue-500"
        >
          Logout
        </Button>
        <Button
          onClick={() => {
            buyCredits().catch(console.error);
          }}
          className="rounded bg-blue-400 px-4 py-4 text-white hover:bg-blue-500"
        >
          Buy Credits
        </Button>
      </div>
    );
  };
  return (
    <header className="bg- container mx-auto flex h-16 items-center justify-between px-4 sm:px-0">
      <PrimaryLink href="/" className="hover:text-cyan-800">
        Icon Generator
      </PrimaryLink>
      <div className="justify-cente flex items-center gap-8">
        <ul>
          <li>
            <PrimaryLink href="/generate">Generate</PrimaryLink>
          </li>
        </ul>
        <div>{renderAuthenticationButtons()}</div>
      </div>
    </header>
  );
}
