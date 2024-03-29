import "@/styles/global.css";
import "@/../App.css";
// import 'bootstrap/dist/css/bootstrap.min.css'; // TODO make this look as good as our copy
import "./bootstrap.min.css";
import type { AppProps } from "next/app";
import Head from "next/head";

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <div>
      <Head>
        <title>FinKitty</title>
        <link rel="icon" href="/cat.ico" />
        <meta
          name="Finkitty personal financial forecaster"
          content={"FinKitty"}
        />
      </Head>
      <Component {...pageProps} />
    </div>
  );
}
