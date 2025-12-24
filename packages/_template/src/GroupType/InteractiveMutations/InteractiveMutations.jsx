import { CardCapsule } from "../Components"
import { VectorItemsURI } from "../Pages"
import { CreateButton, CreateLink } from "./Create"
import { UpdateButton, UpdateLink } from "./Update"
import { ProxyLink } from "../../Base/Components/ProxyLink"
import { DeleteButton } from "./Delete"

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

export const InteractiveMutations = ({ item }) => {
    return (
        <CardCapsule item={item} title="Nástroje">
            <PageLink className="btn btn-outline-success">Stránka</PageLink>
            <UpdateLink className="btn btn-outline-success" item={item}>Upravit</UpdateLink>
            <UpdateButton className="btn btn-outline-success" item={item}>Upravit Dialog</UpdateButton>
            <CreateButton className="btn btn-outline-success">Vytvořit nový</CreateButton>
            <DeleteButton className="btn btn-outline-danger" >Odstranit</DeleteButton>
            
        </CardCapsule>
    )
}
