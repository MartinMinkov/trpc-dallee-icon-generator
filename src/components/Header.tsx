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
        variant="primary"
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
          variant="primary"
          onClick={() => {
            signOut().catch(console.error);
          }}
          className="rounded bg-blue-400 px-4 py-4 text-white hover:bg-blue-500"
        >
          Logout
        </Button>
        <Button
          variant="primary"
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
    <header className=" bg-gray-800 px-4 sm:px-0">
      <div className="container mx-auto flex h-16 items-center justify-between text-white">
        <PrimaryLink href="/">Icon Generator</PrimaryLink>
        <div className="justify-cente flex items-center gap-8">
          <ul>
            <li>
              <PrimaryLink href="/generate">Generate</PrimaryLink>
            </li>
          </ul>
          <div>{renderAuthenticationButtons()}</div>
        </div>
      </div>
    </header>
  );
}
