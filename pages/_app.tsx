import '../styles/globals.css'
import {WunderGraphProvider} from "../components/generated/provider";
import type {AppProps} from "next/app";

function MyApp({ Component, pageProps } :AppProps ) {
  return (
      <WunderGraphProvider extraHeaders={{"X-WunderGraph":"IsAwesome"}}>
        <Component {...pageProps} />
      </WunderGraphProvider>
  )
}

export default MyApp
