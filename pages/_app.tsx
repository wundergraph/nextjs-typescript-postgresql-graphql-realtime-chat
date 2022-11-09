import '../styles/globals.css'
import type {AppProps} from "next/app";
import Link from "next/link";

function MyApp({Component, pageProps}: AppProps) {
    return (
        <div>
            <div>
                <ul>
                    <li>
                        <Link href="/">Home</Link>
                    </li>
                    <li>
                        <Link href="/countries">Countries</Link>
                    </li>
                </ul>
            </div>
            <Component {...pageProps} />
        </div>
    )
}

export default MyApp
