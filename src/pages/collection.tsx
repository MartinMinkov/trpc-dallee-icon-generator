import { type NextPage } from "next";
import Head from "next/head";
import { api } from "~/utils/api";

const CollectionPage: NextPage = () => {
  const getUserIcons = api.user.getUserIcons.useQuery();

  const renderIcons = () => {
    return getUserIcons.data?.map((icon) => {
      return (
        <div
          key={icon.id}
          className="flex flex-col items-center justify-center"
        >
          <img
            src={icon.url}
            alt="icon"
            width={200}
            height={200}
            className="rounded"
          />
          <p>{icon.prompt}</p>
        </div>
      );
    });
  };

  return (
    <>
      <Head>
        <title>Generated Icons</title>
        <meta name="description" content="Your Icons" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="container mx-auto mt-12 min-h-screen sm:mt-24">
        <h1 className="text-3xl">Your Generated Icons</h1>
        <div className="mt-12 grid grid-cols-2 gap-12 sm:grid-cols-4 md:grid-cols-6">
          {renderIcons()}
        </div>
      </main>
    </>
  );
};

export default CollectionPage;
