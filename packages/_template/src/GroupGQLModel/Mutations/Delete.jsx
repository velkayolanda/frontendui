import { LinkURI, MediumContent } from "../Components";
import { DeleteAsyncAction } from "../Queries";
import { makeMutationURI } from "./helpers";
import { 
    DeleteBody as BaseDeleteBody, 
    DeleteButton as BaseDeleteButton, 
    DeleteDialog as BaseDeleteDialog, 
    DeleteLink as BaseDeleteLink
} from "../../Base/Mutations/Delete";
import { VectorItemsURI } from "../Pages";


export const DeleteURI = makeMutationURI(LinkURI, "delete", { withId: true });
const DefaultContent = MediumContent
const mutationAsyncAction = DeleteAsyncAction

const permissions = {
    oneOfRoles: ["superadmin"],
    mode: "absolute",
}

export const DeleteLink = ({ ...props }) => {
    return (
        <BaseDeleteLink 
            {...props} 
            uriPattern={DeleteURI} 
            {...permissions}
        />
    )
};

export const DeleteButton = ({ ...props }) => {
    return (
        <BaseDeleteButton 
            {...props} 
            DefaultContent={DefaultContent} 
            mutationAsyncAction={mutationAsyncAction}
            vectorItemsURI={VectorItemsURI}
            {...permissions}
        />
    )
}

export const DeleteDialog = ({ ...props }) => {
    return (
        <BaseDeleteDialog 
            {...props} 
            DefaultContent={DefaultContent} 
            mutationAsyncAction={mutationAsyncAction}
            vectorItemsURI={VectorItemsURI}
            {...permissions}
        />
    )
}

export const DeleteBody = ({ ...props }) => {
    return (
        <BaseDeleteBody 
            {...props} 
            DefaultContent={DefaultContent} 
            mutationAsyncAction={mutationAsyncAction}
            vectorItemsURI={VectorItemsURI}
            {...permissions}
        />
    )
}
