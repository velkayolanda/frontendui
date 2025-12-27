import { 
    UpdateBody as BaseUpdateBody, 
    UpdateButton as BaseUpdateButton, 
    UpdateDialog as BaseUpdateDialog, 
    UpdateLink as BaseUpdateLink 
} from "../../Base/Mutations/Update";

import { MediumEditableContent, UpdateItemURI } from "../Components";
import { UpdateAsyncAction } from "../Queries";

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


export const UpdateLink = ({
    uriPattern=UpdateItemURI, 
    ...props
}) => {
    return <BaseUpdateLink 
        {...props} 
        uriPattern={uriPattern} 
        {...permissions}
    />
}

export const UpdateButton = ({
    DefaultContent:DefaultContent_=DefaultContent,
    mutationAsyncAction:mutationAsyncAction_=mutationAsyncAction,
    ...props
}) => {
    return <BaseUpdateButton 
        {...props} 
        DefaultContent={DefaultContent_} 
        mutationAsyncAction={mutationAsyncAction_}
        {...permissions}
    />
}

export const UpdateDialog = ({
    DefaultContent:DefaultContent_=DefaultContent,
    mutationAsyncAction:mutationAsyncAction_=mutationAsyncAction,
    ...props
}) => {
    return <BaseUpdateDialog 
        {...props} 
        DefaultContent={DefaultContent} 
        mutationAsyncAction={mutationAsyncAction}
        {...permissions}
    />
}

export const UpdateBody = ({
    DefaultContent:DefaultContent_=DefaultContent,
    mutationAsyncAction:mutationAsyncAction_=mutationAsyncAction,
    ...props
}) => {
    return <BaseUpdateBody 
        {...props} 
        DefaultContent={DefaultContent} 
        mutationAsyncAction={mutationAsyncAction}
        {...permissions}
    />
}