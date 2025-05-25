import { useAsyncAction } from "@hrbolek/uoisfrontend-gql-shared";
import { MembershipUpdateAsyncAction } from "../Queries";
import { MembershipMediumEditableContent } from "./MembershipMediumEditableContent";
import { useState } from "react";
import { CreateDelayer, ErrorHandler, LoadingSpinner } from "@hrbolek/uoisfrontend-shared";

/**
 * MembershipLiveEdit Component
 *
 * Interaktivní React komponenta pro live editaci entity `membership` s podporou optimistického fetchování a debounce delaye.
 *
 * - Používá `useAsyncAction` k načítání a update entit (např. GraphQL mutation).
 * - Pokud se hodnota pole změní, spustí se update po krátkém zpoždění (`delayer`) — uživatelské změny nejsou ihned posílány, ale až po pauze.
 * - Zobrazuje loading a error stav pomocí komponent `LoadingSpinner` a `ErrorHandler`.
 * - Předává editované hodnoty do komponenty `MembershipMediumEditableContent`, která zajišťuje zobrazení a editaci jednotlivých polí šablony (`membership`).
 *
 * @component
 * @param {Object} props - Props objekt.
 * @param {Object} props.membership - Objekt reprezentující editovanou šablonu (membership entity).
 * @param {React.ReactNode} [props.children] - Libovolné children, které se vloží pod editační komponentu.
 * @param {Function} [props.asyncAction=MembershipUpdateAsyncAction] - Asynchronní akce pro update (`useAsyncAction`), typicky GraphQL update mutation.
 *
 * @example
 * // Standardní použití
 * <MembershipLiveEdit membership={membershipEntity} />
 *
 * @example
 * // S vlastním asyncAction a doplňkovým obsahem
 * <MembershipLiveEdit membership={membershipEntity} asyncAction={myUpdateAction}>
 *   <div>Extra obsah nebo poznámka</div>
 * </MembershipLiveEdit>
 *
 * @returns {JSX.Element}
 *   Interaktivní komponenta pro live editaci šablony, včetně spinneru a error handleru.
 */
export const MembershipLiveEdit = ({membership, children, asyncAction=MembershipUpdateAsyncAction}) => {
    const { loading, error, entity, fetch } = useAsyncAction(asyncAction, membership, { deferred: true });
    const [delayer] = useState(() => CreateDelayer());
    const onChange_ = async (e) => {
        const { value, id } = e.target;
        if (value) {
            if (entity) {
                console.log(entity[id] === value, entity[id], value)
                if (entity[id] === value) return;
            } else {
                console.log(membership[id] === value, membership[id], value)
                if (membership[id] === value) return;
            }
            await delayer(() => fetch({ 
                id: membership.id, 
                lastchange: (entity?.lastchange || membership?.lastchange), 
                [id]: value 
            }));
        }
    }
    
    return (<>
        {loading && <LoadingSpinner />}
        {error && <ErrorHandler errors={error} />}
        {entity && (
            <MembershipMediumEditableContent membership={entity} onChange={onChange_} onBlur={onChange_} />
        )}
        {children}
    </>)
}