import styles from '../styles/Home.module.css'
import {useEffect, useState} from "react";
import {NextPage} from "next";
import {
    useWunderGraph,
    withWunderGraph,
    AuthProviders,
    useMutation, useLiveQuery, useQuery
} from '../components/generated/wundergraph.nextjs.integration';

const Chat: NextPage = () => {
    const {user,login,logout} = useWunderGraph();
    const [message, setMessage] = useState('');
    const {result: messages} = useLiveQuery.Messages();
    const {result: userInfo} = useQuery.UserInfo();
    const {mutate: addMessage, result: messageAdded} = useMutation.AddMessage();
    useEffect(() => {
        if (messageAdded.status === "ok") {
            setMessage('');
        }
    },[messageAdded])
    return (
        <div className={styles.container}>
            <h2>
                Add Message
            </h2>
            {!user ? (
                <div>
                    <p>
                        Please Login to be able to use the chat!
                    </p>
                    <br/>
                    <button onClick={() => login(AuthProviders.github)}>Login GitHub</button><br/><br/>
                </div>
            ) : <div>
                <input placeholder="message" value={message} onChange={e => setMessage(e.target.value)}/>
                <br/>
                <button onClick={() => addMessage({
                    input: {message},
                    refetchMountedOperationsOnSuccess: true
                })}>submit</button>
                <br/>
                <h3>
                    User
                </h3>
                <p>
                    Logged in as: {user?.name}, {user?.email} , {JSON.stringify(user?.roles)}
                </p>
                {userInfo.status === "ok" && userInfo.data?.findFirstusers?.lastlogin && <p>
                    LastLogin: {userInfo.data.findFirstusers.lastlogin}
                </p>}
                <button onClick={async () => {
                    await logout({
                        logout_openid_connect_provider: true,
                    });
                    window.location.reload();
                }
                }>Logout</button>
            </div>}
            {messages.status === "ok" && messages.data.findManymessages.length !== 0 && (
                <div>
                    {messages.data.findManymessages.map(message => {
                        return (<div key={message.id}>
                            <p>
                                from {message.users.name}: {message.message}
                            </p>
                        </div>)
                    })}
                </div>
            )}
        </div>
    )
}

export default withWunderGraph(Chat);