import { CardCapsule, VectorItemsURI } from "../Components"
import { CreateButton as CreateFormButton, CreateLink } from "./Create"
import { UpdateButton, UpdateLink } from "./Update"
import { ProxyLink } from "../../../../_template/src/Base/Components/ProxyLink"
import { DeleteButton } from "./Delete"
import { CreateButton as CreateSubmissionButton } from "../../DigitalSubmission/Mutations/Create"
import { useAsyncThunkAction } from "../../../../dynamic/src/Hooks"
import { InsertAsyncAction } from "../../DigitalSubmission/Queries"
import { AsyncStateIndicator } from "../../../../_template/src/Base/Helpers/AsyncStateIndicator"
import { FillItemURI } from "../../DigitalSubmission/Components"

export const PageLink = ({ children, preserveHash = true, preserveSearch = true, ...props }) => {
    return (
        <ProxyLink
            to={VectorItemsURI}
            preserveHash={preserveHash}
            preserveSearch={preserveSearch}
            {...props}
        >
            {children}
        </ProxyLink>
    );
};

export const Button = (props) => <button {...props} />
export const A = (props) => <a {...props} />
export const CreateSubmissionFromFormButton = ({
    as: Component, 
    params, 
    asyncAction = InsertAsyncAction,
    ...rest 
}) => {
    const {run, error, loading: creating} = useAsyncThunkAction(asyncAction, params, {deferred: true})
    const handleClick = async(e) => {
        const result = await run()
        console.log("CreateSubmissionFromFormButton", result)
    }
    return (<>
        <AsyncStateIndicator error={error} loading={creating} text={"Vytvářím formulář"} />
        <Component {...rest} onClick={handleClick}/>
    </>)
}


export const InteractiveMutations = ({ item }) => {
    const id = crypto.randomUUID();
    return (
        <CardCapsule item={item} title="Nástroje">
            <PageLink className="btn btn-outline-success">Stránka</PageLink>
            <UpdateLink className="btn btn-outline-success" item={item}>Upravit</UpdateLink>
            <UpdateButton className="btn btn-outline-success" item={item}>Upravit Dialog</UpdateButton>
            <CreateFormButton className="btn btn-outline-success" rbacitem={{}}>Vytvořit nový</CreateFormButton>
            <DeleteButton className="btn btn-outline-danger" item={item}>Odstranit</DeleteButton>
            <CreateSubmissionButton className="btn btn-outline-danger" item={item}>Vytvořit dokument</CreateSubmissionButton>
            <CreateSubmissionFromFormButton 
                as={ProxyLink} 
                asyncAction={InsertAsyncAction}
                className="btn btn-outline-warning"
                params={{id, formId: item?.id}}
                to={FillItemURI.replace(":id", `${id}`)}
                reloadDocument={false}
            >
                Vytvořit dokument
            </CreateSubmissionFromFormButton>
        </CardCapsule>
    )
}
