import styles from '../styles/Home.module.css'
import {useLiveQuery, useMutation, useQuery, useWunderGraph} from "../components/generated/hooks";
import {useEffect, useState} from "react";
import type {MessagesResponseData} from "../components/generated/models";
import {GetServerSideProps, NextPage} from "next";
import {Client} from '../components/generated/wundergraph.web.client';
import type {User} from "../components/generated/wundergraph.server";

type Messages = MessagesResponseData["findManymessages"];

interface Props {
    messages?: Messages;
    user: User | null;
}

const Chat: NextPage<Props> = ({messages: serverSideMessages, user: serverSideUser}) => {

    // use the serverSideUser as the default value in case the client is not yet initialized
    const {user: clientSideUser, client: {login, logout}, initialized} = useWunderGraph();
    const user = (typeof window !== 'undefined' && initialized) ? clientSideUser : serverSideUser;
    const [message, setMessage] = useState("");
    const {mutate: addMessage, response: messageAdded} = useMutation.AddMessage({refetchMountedQueriesOnSuccess: true});
    const {response: loadMessages} = useLiveQuery.Messages();
    const [messages, setMessages] = useState<Messages>(user !== undefined && serverSideMessages || []);
    const {response: userInfo, refetch} = useQuery.UserInfo();
    useEffect(() => {
        if (loadMessages.status === "ok") {
            setMessages((loadMessages.body.data?.findManymessages || []).reverse());
        }
        if (loadMessages.status === "requiresAuthentication"){
            setMessages([]);
        }
    }, [loadMessages]);
    useEffect(() => {
        if (messageAdded.status === "ok") {
            setMessage("");
        }
    }, [messageAdded]);
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
                    <button onClick={() => login.github()}>Login GitHub</button><br/><br/>
                </div>
            ) : <div>
                <input placeholder="message" value={message} onChange={e => setMessage(e.target.value)}/>
                <br/>
                <button onClick={() => addMessage({input: {message}})}>submit</button>
                <br/>
                <h3>
                    User
                </h3>
                <p>
                    Logged in as: {user?.name}, {user?.email} , {JSON.stringify(user?.roles)}
                </p>
                {userInfo.status === "ok" && userInfo.body.data?.findFirstusers?.lastlogin && <p>
                    LastLogin: {userInfo.body.data.findFirstusers.lastlogin}
                </p>}
                <button onClick={async () => {
                    await logout({
                        logout_openid_connect_provider: true,
                    });
                    window.location.reload();
                }
                }>Logout</button>
            </div>}
            {messages !== null && messages.length !== 0 && (
                <div>
                    {messages.map(message => {
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

export const getServerSideProps: GetServerSideProps<Props> = async (context) => {
    // for SSR, simply create a new client and pass on the cookie header from the client context
    // this way, we can make authenticated requests via SSR
    const client = new Client({
        extraHeaders: {
            "cookie": context.req.headers.cookie || "",
        }
    });
    // fetch the user so that we can render the UI based on the user name and email
    const user = await client.fetchUser();
    // fetch the initial messages
    const messages = await client.query.Messages({});
    return {
        props: {
            // pass on the data to the page renderer
            user: user || null,
            messages: messages.status === "ok" && messages.body.data?.findManymessages.reverse() || [],
        }
    }
}

export default Chat;