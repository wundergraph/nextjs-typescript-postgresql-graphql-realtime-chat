import {useQuery, withWunderGraph} from "../components/generated/wundergraph.nextjs.integration";

const Countries = () => {
    const germany = useQuery.Germany();
    const us = useQuery.Us()
    const userIfno = useQuery.UserInfo();
    return (
        <div>
            <p>
                {JSON.stringify({
                    germany,
                    us,
                    userIfno
                })}
            </p>
        </div>
    )
}

export default withWunderGraph(Countries);