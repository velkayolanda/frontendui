import { GeneratedContentBase } from "../../Base/Pages/Page"
import { ReadItemURI } from "../Components"
import { ReadAsyncAction } from "../Queries"
import { ReadSubEventsAsyncAction } from "../Queries/ReadSubEventsAsyncAction"
import { PageReadItem } from "./PageReadItem"

export const SubEventsURI = ReadItemURI.replace("view", "subevents")


/**
 * Základní obálka pro „read“ stránku entity podle `:id` z routy.
 *
 * Využívá `PageItemBase`, který zajistí:
 * - získání `id` z URL (`useParams`)
 * - načtení entity přes `AsyncActionProvider` pomocí `queryAsyncAction`
 * - vložení navigace (`PageNavbar`)
 *
 * Uvnitř provideru vykreslí `ReadWithComponent`, který si vezme načtený `item`
 * z `useGQLEntityContext()` a zobrazí ho v zadané komponentě (defaultně `LargeCard`).
 *
 * @component
 * @param {object} props
 * @param {Function} [props.queryAsyncAction=ReadAsyncAction]
 *   Async action (např. thunk) pro načtení entity z backendu/GraphQL dle `id`.
 * @param {Object<string, any>} [props]
 *   Další props předané do `ReadWithComponent` (např. `Component`, layout props).
 *
 * @returns {import("react").JSX.Element}
 */
export const PageSubevents = ({ 
    queryAsyncAction=ReadSubEventsAsyncAction, 
    children, 
    ...props 
}) => {
    return (
        <PageReadItem 
            queryAsyncAction={queryAsyncAction}
            SubPage={GeneratedContentBase} 
            {...props}
        />
    )
}

