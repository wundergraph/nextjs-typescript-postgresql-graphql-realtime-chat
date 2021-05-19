import styles from '../styles/Home.module.css'
import {useLiveQuery, useMutation, useQuery, useWunderGraph} from "../.wundergraph/generated/hooks";
import {useEffect, useState} from "react";
import {MessagesResponse} from "../.wundergraph/generated/models";

export default function Home() {
    const {user,client: {login,logout}} = useWunderGraph();
    const [message,setMessage] = useState("");
    const {mutate: addMessage, response: messageAdded} = useMutation.AddMessage({refetchMountedQueriesOnSuccess: true});
    const {response: loadMessages} = useLiveQuery.Messages();
    const [messages,setMessages] = useState<MessagesResponse["data"]["findManymessages"]>([]);
    useEffect(()=>{
        if (loadMessages.status === "ok"){
            setMessages(loadMessages.body.data.findManymessages.reverse());
        }
    },[loadMessages]);
    useEffect(()=>{
        if (messageAdded.status === "ok"){
            setMessage("");
        }
    },[messageAdded]);
    return (
        <div className={styles.container}>
            <h2>
                Add Message
            </h2>
            {user === undefined ? (
                <div>
                    <p>
                        Please Login to post messages
                    </p>
                    <br/>
                    <button onClick={()=>login.github()}>Login</button>
                </div>
            ) : <div>
                <input placeholder="message" value={message} onChange={e=>setMessage(e.target.value)}/>
                <br/>
                <button onClick={()=>addMessage({input: {message}})}>submit</button>
                <br/>
                <h3>
                    User
                </h3>
                <p>
                    Logged in as: {user.name}, {user.email}
                </p>
                <button onClick={()=>logout()}>Logout</button>
            </div>}
            {messages.length && (
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