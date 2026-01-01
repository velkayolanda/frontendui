import { CreateURI, MediumEditableContent, ReadItemURI } from "../Components"
import { InsertAsyncAction } from "../Queries"
import { 
    CreateBody as BaseCreateBody, 
    CreateButton as BaseCreateButton, 
    CreateDialog as BaseCreateDialog, 
    CreateLink  as BaseCreateLink
} from "../../../../_template/src/Base/Mutations/Create"

const DefaultContent = ({...props}) => <MediumEditableContent {...props}/>
const MutationAsyncAction = InsertAsyncAction

const permissions = {
    oneOfRoles: ["superadmin"],
    mode: "absolute",
}

export const CreateLink = ({
    uriPattern=CreateURI,
    ...props
}) => (
    <BaseCreateLink {...props} uriPattern={uriPattern} />
);

export const CreateButton = ({
    mutationAsyncAction=MutationAsyncAction,
    CreateDialog: CreateDialog_=CreateDialog,
    DefaultContent:defaultContent=DefaultContent,
    readItemURI=ReadItemURI, 
    rbacitem,
    initialitem={
        name: "Nový",
    },
    ...props
}) => {
    return <BaseCreateButton 
        {...props}
        DefaultContent={defaultContent} 
        CreateDialog={CreateDialog_}
        readItemURI={readItemURI}
        rbacitem={rbacitem}
        initialitem={initialitem}
        mutationAsyncAction={mutationAsyncAction}
        {...permissions}
    />
}

export const CreateDialog = ({
    title = "Nov(ý/é)",
    mutationAsyncAction=MutationAsyncAction,
    DefaultContent:defaultContent=DefaultContent,
    readItemURI=ReadItemURI, 
    initialItem,
    ...props
}) => {
    return <BaseCreateDialog 
        {...props} 
        title={title}
        DefaultContent={defaultContent} 
        readItemURI={readItemURI}
        initialItem={initialItem}
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

