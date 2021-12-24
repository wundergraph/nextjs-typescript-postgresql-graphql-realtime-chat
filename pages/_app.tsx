import '../styles/globals.css'
import {WunderGraphProvider} from "../.wundergraph/generated/provider";
import type {AppProps} from "next/app";

function MyApp({ Component, pageProps } :AppProps ) {
  return (
      <WunderGraphProvider>
        <Component {...pageProps} />
      </WunderGraphProvider>
  )
}

export default MyApp
