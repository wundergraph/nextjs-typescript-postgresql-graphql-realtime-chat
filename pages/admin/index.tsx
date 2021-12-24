import {NextPage} from "next";
import {useWunderGraph} from "../../.wundergraph/generated/hooks";
import {DeleteAllMessagesByUserEmailForm} from "../../.wundergraph/generated/forms";
import {useState} from "react";

const AdminPage: NextPage = () => {
    const {user} = useWunderGraph();
    const [deletedMessages,setDeletedMessages] = useState<undefined|number>();
    return (
        <div>
            <h1>
                Admin
            </h1>
            <h2>
                UserInfo
            </h2>
            <p>
                {JSON.stringify(user)}
            </p>
            <h2>
                Delete all messages by user email
            </h2>
            <DeleteAllMessagesByUserEmailForm liveValidate={true} onResult={e=>{
                if (e.status === "ok"){
                    setDeletedMessages(e.body.data?.deleteManymessages?.count);
                    return
                }
                setDeletedMessages(undefined);
            }} />
            <p>
                delted: {deletedMessages !== undefined ? deletedMessages : "nothing deleted"}
            </p>
        </div>
    )
}

export default AdminPage;