import { type NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { PrimaryLinkButton } from "~/components/PrimaryLinkButton";

function HeroBanner() {
  return (
    <section className="mt-28 grid grid-cols-1 gap-12 px-8 sm:grid-cols-2">
      <div className="flex flex-col gap-2">
        <h1 className="text-6xl">Generate icons with a click of a button</h1>
        <p className="2xl">
          Leverage the power of AI to effortlessly generate stunning icons,
          saving you time and money while eliminating the need to rely on a
          designer.
        </p>
        <p className="2xl">
          Transform your creative process with instant, tailor-made icon
          solutions at your fingertips.
        </p>
        <div className="mt-2 w-full">
          <PrimaryLinkButton href="/generate" variant="primary">
            Generate your icons
          </PrimaryLinkButton>
        </div>
      </div>
      <>
        <Image
          src="/banner.png"
          alt="Image of a bunch of icons"
          width="400"
          height="400"
        ></Image>
      </>
    </section>
  );
}

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>Icon Generator</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="container mx-auto flex flex-col items-center justify-center">
        <HeroBanner />
      </main>
    </>
  );
};

export default Home;
