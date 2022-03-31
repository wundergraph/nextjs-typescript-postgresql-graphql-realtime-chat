import {useLoadingComplete, useQuery} from "../components/generated/hooks";

const Countries = () => {
    const germany = useQuery.Germany({
        lazy: true,
    });
    return (
        <div>
            <p>
                {JSON.stringify({
                    germany: germany.response,
                })}
            </p>
            <button onClick={()=>germany.refetch()}>lazyLoad</button>
        </div>
    )
}

export default Countries;