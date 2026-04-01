import { CreateURI, MediumEditableContent, ReadItemURI } from "../Components"
import { InsertAsyncAction } from "../Queries"
import { 
    CreateBody as BaseCreateBody, 
    CreateButton as BaseCreateButton, 
    CreateDialog as BaseCreateDialog, 
    CreateLink  as BaseCreateLink
} from "../../../../_template/src/Base/Mutations/Create"

const DefaultContent = MediumEditableContent
const MutationAsyncAction = InsertAsyncAction

// const permissions = {
//     oneOfRoles: ["superadmin"],
//     mode: "absolute",
// }

// ALTERNATIVE, CHECK GQLENDPOINT
const permissions = {
    oneOfRoles: ["administrátor", "personalista"],
    mode: "item",
}

export const CreateLink = ({
    uriPattern=CreateURI,
    ...props
}) => (
    <BaseCreateLink {...props} uriPattern={uriPattern} />
);

export const CreateButton = ({
    mutationAsyncAction=MutationAsyncAction,
    DefaultContent:defaultContent=DefaultContent,
    readItemURI=ReadItemURI, 
    ...props
}) => {
    return <BaseCreateButton 
        {...props}
        DefaultContent={defaultContent} 
        readItemURI={readItemURI}
        mutationAsyncAction={mutationAsyncAction}
        {...permissions}
    />
}

export const CreateDialog = ({
    mutationAsyncAction=MutationAsyncAction,
    DefaultContent:defaultContent=DefaultContent,
    readItemURI=ReadItemURI, 
    ...props
}) => {
    return <BaseCreateDialog 
        {...props} 
        DefaultContent={defaultContent} 
        readItemURI={readItemURI}
        mutationAsyncAction={mutationAsyncAction}
    />
};

export const CreateBody = ({
    mutationAsyncAction=MutationAsyncAction,
    DefaultContent:defaultContent=DefaultContent,
    readItemURI=ReadItemURI, 
    ...props
}) => {
    return <BaseCreateBody 
        {...props} 
        DefaultContent={defaultContent} 
        readItemURI={readItemURI}
        mutationAsyncAction={mutationAsyncAction}
    />
};

