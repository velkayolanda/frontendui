import { useAsyncAction } from "@hrbolek/uoisfrontend-gql-shared";
import { ExamUpdateAsyncAction } from "../Queries";
import { ExamMediumEditableContent } from "./ExamMediumEditableContent";
import { useState } from "react";
import { CreateDelayer, ErrorHandler, LoadingSpinner } from "@hrbolek/uoisfrontend-shared";

/**
 * ExamLiveEdit Component
 *
 * Interaktivní React komponenta pro live editaci entity `exam` s podporou optimistického fetchování a debounce delaye.
 *
 * - Používá `useAsyncAction` k načítání a update entit (např. GraphQL mutation).
 * - Pokud se hodnota pole změní, spustí se update po krátkém zpoždění (`delayer`) — uživatelské změny nejsou ihned posílány, ale až po pauze.
 * - Zobrazuje loading a error stav pomocí komponent `LoadingSpinner` a `ErrorHandler`.
 * - Předává editované hodnoty do komponenty `ExamMediumEditableContent`, která zajišťuje zobrazení a editaci jednotlivých polí šablony (`exam`).
 *
 * @component
 * @param {Object} props - Props objekt.
 * @param {Object} props.exam - Objekt reprezentující editovanou šablonu (exam entity).
 * @param {React.ReactNode} [props.children] - Libovolné children, které se vloží pod editační komponentu.
 * @param {Function} [props.asyncAction=ExamUpdateAsyncAction] - Asynchronní akce pro update (`useAsyncAction`), typicky GraphQL update mutation.
 *
 * @example
 * // Standardní použití
 * <ExamLiveEdit exam={examEntity} />
 *
 * @example
 * // S vlastním asyncAction a doplňkovým obsahem
 * <ExamLiveEdit exam={examEntity} asyncAction={myUpdateAction}>
 *   <div>Extra obsah nebo poznámka</div>
 * </ExamLiveEdit>
 *
 * @returns {JSX.Element}
 *   Interaktivní komponenta pro live editaci šablony, včetně spinneru a error handleru.
 */
export const ExamLiveEdit = ({exam, children, asyncAction=ExamUpdateAsyncAction}) => {
    const { loading, error, entity, fetch } = useAsyncAction(asyncAction, exam, { deferred: true });
    const [delayer] = useState(() => CreateDelayer());
    const onChange_ = async (e) => {
        const { value, id } = e.target;
        if (value) {
            if (entity) {
                console.log(entity[id] === value, entity[id], value)
                if (entity[id] === value) return;
            } else {
                console.log(exam[id] === value, exam[id], value)
                if (exam[id] === value) return;
            }
            await delayer(() => fetch({ 
                id: exam.id, 
                lastchange: (entity?.lastchange || exam?.lastchange), 
                [id]: value 
            }));
        }
    }
    
    return (<>
        {loading && <LoadingSpinner />}
        {error && <ErrorHandler errors={error} />}
        {entity && (
            <ExamMediumEditableContent exam={entity} onChange={onChange_} onBlur={onChange_} />
        )}
        {children}
    </>)
}