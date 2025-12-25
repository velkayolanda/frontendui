import { 
    UpdateBody as BaseUpdateBody, 
    UpdateButton as BaseUpdateButton, 
    UpdateDialog as BaseUpdateDialog, 
    UpdateLink as BaseUpdateLink 
} from "../../Base/Mutations/Update";

import { LinkURI, MediumEditableContent } from "../Components";
import { UpdateAsyncAction } from "../Queries";
import { makeMutationURI } from "./helpers";
//import { UpdateBody, UpdateButton, UpdateDialog, UpdateLink } from "./Update";

export const UpdateURI = makeMutationURI(LinkURI, "edit", { withId: true });

const DefaultContent = MediumEditableContent
const mutationAsyncAction = UpdateAsyncAction

const permissions = {
    oneOfRoles: ["superadmin"],
    mode: "absolute",
}

// ALTERNATIVE, CHECK GQLENDPOINT
// const permissions = {
//     oneOfRoles: ["administrátor", "personalista"],
//     mode: "item",
// }


export const UpdateLink = ({...props}) => {
    return <BaseUpdateLink 
        {...props} 
        uriPattern={UpdateURI} 
        {...permissions}
    />
}

export const UpdateButton = ({...props}) => {
    return <BaseUpdateButton 
        {...props} 
        DefaultContent={DefaultContent} 
        mutationAsyncAction={mutationAsyncAction}
        {...permissions}
    />
}

export const UpdateDialog = ({...props}) => {
    return <BaseUpdateDialog 
        {...props} 
        DefaultContent={DefaultContent} 
        mutationAsyncAction={mutationAsyncAction}
        {...permissions}
    />
}

export const UpdateBody = ({...props}) => {
    return <BaseUpdateBody 
        {...props} 
        DefaultContent={DefaultContent} 
        mutationAsyncAction={mutationAsyncAction}
        {...permissions}
    />
}