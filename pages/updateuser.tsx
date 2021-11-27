import {ChangeUserNameForm} from "../.wundergraph/generated/forms"

const UpdateUser = () => {
    return (
        <ChangeUserNameForm liveValidate={true} onResult={e=>{
            console.dir(e)
        }}/>
    )
}

export default UpdateUser;