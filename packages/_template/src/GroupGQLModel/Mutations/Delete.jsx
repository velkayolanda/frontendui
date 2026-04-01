import { DeleteItemURI, ListURI, MediumContent, VectorItemsURI } from "../Components";
import { DeleteAsyncAction } from "../Queries";
import { 
    DeleteBody as BaseDeleteBody, 
    DeleteButton as BaseDeleteButton, 
    DeleteDialog as BaseDeleteDialog, 
    DeleteLink as BaseDeleteLink
} from "../../../../_template/src/Base/Mutations/Delete";

const DefaultContent = MediumContent
const MutationAsyncAction = DeleteAsyncAction

// const permissions = {
//     oneOfRoles: ["superadmin"],
//     mode: "absolute",
// }

// ALTERNATIVE, CHECK GQLENDPOINT
const permissions = {
    oneOfRoles: ["administrátor", "personalista"],
    mode: "item",
}

export const DeleteLink = ({ 
    uriPattern=DeleteItemURI,
    ...props
 }) => {
    return (
        <BaseDeleteLink 
            {...props} 
            uriPattern={uriPattern} 
            {...permissions}
        />
    )
};

export const DeleteButton = ({
    mutationAsyncAction=MutationAsyncAction,
    DefaultContent:DefaultContent_=DefaultContent,
    vectorItemsURI=ListURI,
    ...props 
}) => {
    return (
        <BaseDeleteButton 
            {...props} 
            DefaultContent={DefaultContent_} 
            mutationAsyncAction={mutationAsyncAction}
            vectorItemsURI={vectorItemsURI}
            Dialog={DeleteDialog}
            {...permissions}
        />
    )
}

export const DeleteDialog = ({
    mutationAsyncAction=MutationAsyncAction,
    DefaultContent:DefaultContent_=DefaultContent,
    vectorItemsURI=ListURI,
    ...props 
}) => {
    return (
        <BaseDeleteDialog 
            {...props} 
            DefaultContent={DefaultContent} 
            mutationAsyncAction={MutationAsyncAction}
            vectorItemsURI={vectorItemsURI}
            {...permissions}
        />
    )
}

export const DeleteBody = ({ 
    mutationAsyncAction=MutationAsyncAction,
    DefaultContent:DefaultContent_=DefaultContent,
    vectorItemsURI=ListURI,
    ...props
}) => {
    return (
        <BaseDeleteBody 
            {...props} 
            DefaultContent={DefaultContent} 
            mutationAsyncAction={MutationAsyncAction}
            vectorItemsURI={vectorItemsURI}
            {...permissions}
        />
    )
}
