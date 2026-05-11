import { CardCapsule, VectorItemsURI } from "../Components"
import { CreateButton, CreateLink } from "./Create"
import { UpdateButton, UpdateLink } from "./Update"
import { ProxyLink } from "../../../../_template/src/Base/Components/ProxyLink"
import { DeleteButton } from "./Delete"

/**
 * Link na stránku se seznamem entit (vector page).
 * Zachovává hash a search parametry z URL.
 *
 * @component
 * @param {Object} props
 * @param {React.ReactNode} props.children - Obsah linku
 * @param {boolean} [props.preserveHash=true] - Zachovat hash z URL
 * @param {boolean} [props.preserveSearch=true] - Zachovat search parametry z URL
 */
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

/**
 * Komponenta zobrazující panel nástrojů pro práci s entitou Subject.
 *
 * Obsahuje tlačítka:
 * - Stránka: odkaz na seznam entit
 * - Upravit: odkaz na edit stránku
 * - Upravit Dialog: otevře editační dialog
 * - Vytvořit nový: otevře dialog pro vytvoření nové entity
 * - Odstranit: otevře potvrzovací dialog pro smazání
 *
 * Všechna tlačítka respektují RBAC oprávnění definovaná v jednotlivých komponentách.
 *
 * @component
 * @param {Object} props
 * @param {Object} props.item - Entita Subject pro operace úpravy a mazání
 *
 * @example
 * <InteractiveMutations item={subjectEntity} />
 */
export const InteractiveMutations = ({ item }) => {
    return (
        <CardCapsule item={item} title="Nástroje">
            <PageLink className="btn btn-outline-success">Stránka</PageLink>
            <UpdateLink className="btn btn-outline-success" item={item}>Upravit</UpdateLink>
            <UpdateButton className="btn btn-outline-success" item={item}>Upravit Dialog</UpdateButton>
            <CreateButton className="btn btn-outline-success" rbacitem={{}}>Vytvořit nový</CreateButton>
            <DeleteButton className="btn btn-outline-danger" item={item}>Odstranit</DeleteButton>
        </CardCapsule>
    )
}
