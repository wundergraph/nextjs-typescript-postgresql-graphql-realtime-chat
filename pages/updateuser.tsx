import {ChangeUserNameForm} from "../components/generated/forms";

const UpdateUser = () => {
    return (
        <ChangeUserNameForm liveValidate={true} onResult={e=>{
            console.dir(e)
        }}/>
    )
}

export default UpdateUser;