import { type NextPage } from "next";
import Head from "next/head";
import { api } from "~/utils/api";

const CollectionPage: NextPage = () => {
  const getUserIcons = api.icon.getUserIcons.useQuery();

  const renderIcons = () => {
    return getUserIcons.data?.map((icon) => {
      return (
        <div
          key={icon.id}
          className="flex flex-col items-center justify-center"
        >
          <img src={icon.url} alt="icon" />
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
      <main className="container mx-auto mt-12 flex min-h-screen items-start justify-center gap-8 sm:mt-24">
        {renderIcons()}
      </main>
    </>
  );
};

export default CollectionPage;
