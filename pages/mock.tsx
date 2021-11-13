import {NextPage} from "next";
import {useQuery, useWunderGraph} from "../.wundergraph/generated/hooks";

const MockPage: NextPage = () => {
    const {user} = useWunderGraph();
    const mock = useQuery.MockQuery();
    return (
        <div>
            <h1>
                MockPage
            </h1>
            <h2>
                UserInfo
            </h2>
            <p>
                {JSON.stringify(user)}
            </p>
            <p>
                {JSON.stringify(mock)}
            </p>
        </div>
    )
}

export default MockPage;