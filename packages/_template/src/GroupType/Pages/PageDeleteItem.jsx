import { DeleteAsyncAction } from "../Queries"
import { LinkURI } from "../Components";
import { PageBase } from "./PageBase";
import { DeleteBody } from "../InteractiveMutations/Delete";

export const DeleteItemURI = `${LinkURI.replace('view', 'delete')}`

export const PageDeleteItem = ({ children, queryAsyncAction=DeleteAsyncAction, ...props }) => {
    return (
        <PageBase>
            <DeleteBody {...props} mutationAsyncAction={queryAsyncAction} />
        </PageBase>
    )
}

