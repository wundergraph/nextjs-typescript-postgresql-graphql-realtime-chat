import '../styles/globals.css'
import {WunderGraphProvider} from "../.wundergraph/generated/provider";

function MyApp({ Component, pageProps }) {
  return (
      <WunderGraphProvider>
        <Component {...pageProps} />
      </WunderGraphProvider>
  )
}

export default MyApp
