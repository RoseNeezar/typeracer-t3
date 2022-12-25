import "../styles/globals.css";
import { type AppType } from "next/app";
import { Toaster } from "react-hot-toast";
import { trpc } from "../utils/trpc";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <>
      <Component {...pageProps} />
      <Toaster />
    </>
  );
};

export default trpc.withTRPC(MyApp);
