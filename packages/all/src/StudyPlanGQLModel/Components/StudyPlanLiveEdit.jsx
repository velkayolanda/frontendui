import { useAsyncAction } from "@hrbolek/uoisfrontend-gql-shared";
import { StudyPlanUpdateAsyncAction } from "../Queries";
import { StudyPlanMediumEditableContent } from "./StudyPlanMediumEditableContent";
import { useState } from "react";
import { CreateDelayer, ErrorHandler, LoadingSpinner } from "@hrbolek/uoisfrontend-shared";
import { StudyPlanPivotTable } from "./StudyPlanPivotTable";

/**
 * StudyPlanLiveEdit Component
 *
 * Interaktivní React komponenta pro live editaci entity `studyplan` s podporou optimistického fetchování a debounce delaye.
 *
 * - Používá `useAsyncAction` k načítání a update entit (např. GraphQL mutation).
 * - Pokud se hodnota pole změní, spustí se update po krátkém zpoždění (`delayer`) — uživatelské změny nejsou ihned posílány, ale až po pauze.
 * - Zobrazuje loading a error stav pomocí komponent `LoadingSpinner` a `ErrorHandler`.
 * - Předává editované hodnoty do komponenty `StudyPlanMediumEditableContent`, která zajišťuje zobrazení a editaci jednotlivých polí šablony (`studyplan`).
 *
 * @component
 * @param {Object} props - Props objekt.
 * @param {Object} props.studyplan - Objekt reprezentující editovanou šablonu (studyplan entity).
 * @param {React.ReactNode} [props.children] - Libovolné children, které se vloží pod editační komponentu.
 * @param {Function} [props.asyncAction=StudyPlanUpdateAsyncAction] - Asynchronní akce pro update (`useAsyncAction`), typicky GraphQL update mutation.
 *
 * @example
 * // Standardní použití
 * <StudyPlanLiveEdit studyplan={studyplanEntity} />
 *
 * @example
 * // S vlastním asyncAction a doplňkovým obsahem
 * <StudyPlanLiveEdit studyplan={studyplanEntity} asyncAction={myUpdateAction}>
 *   <div>Extra obsah nebo poznámka</div>
 * </StudyPlanLiveEdit>
 *
 * @returns {JSX.Element}
 *   Interaktivní komponenta pro live editaci šablony, včetně spinneru a error handleru.
 */
export const StudyPlanLiveEdit = ({studyplan, children, asyncAction=StudyPlanUpdateAsyncAction}) => {
    const { loading, error, entity, fetch } = useAsyncAction(asyncAction, studyplan, { deferred: true });
    const [delayer] = useState(() => CreateDelayer());
    const onChange_ = async (e) => {
        const { value, id } = e.target;
        if (value) {
            if (entity) {
                // console.log(entity[id] === value, entity[id], value)
                if (entity[id] === value) return;
            } else {
                console.log(studyplan[id] === value, studyplan[id], value)
                if (studyplan[id] === value) return;
            }
            return
            await delayer(() => fetch({ 
                id: studyplan.id, 
                lastchange: (entity?.lastchange || studyplan?.lastchange), 
                [id]: value 
            }));
        }
    }
    
    return (<>
        {loading && <LoadingSpinner />}
        {error && <ErrorHandler errors={error} />}
        {entity && (<>
            <StudyPlanMediumEditableContent studyplan={entity} onChange={onChange_} onBlur={onChange_} >
                <StudyPlanPivotTable studyplan={entity} onChange={onChange_} onBlur={onChange_} editable={true}/>
                {children}
                <button className="btn btn-outline-success form-control">Přidat lekci</button>
            </StudyPlanMediumEditableContent>
            {/* <StudyPlanPivotTable studyplan={entity} onChange={onChange_} onBlur={onChange_} editable={true}/> */}
        </>)}
        {children}
    </>)
}