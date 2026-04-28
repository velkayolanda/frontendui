import { useCallback } from "react";

import { UpdateAsyncAction } from "../Queries";
import { MediumEditableContent } from "./MediumEditableContent";
import { useEditAction } from "../../../../dynamic/src/Hooks/useEditAction";
import { AsyncStateIndicator } from "../Helpers/AsyncStateIndicator";
import { useGQLEntityContext } from "../Helpers/GQLEntityProvider";

/**
 * TemplateLiveEdit Component
 *
 * Interaktivní React komponenta pro live editaci entity `template` s podporou optimistického fetchování a debounce delaye.
 *
 * - Používá `useAsyncAction` k načítání a update entit (např. GraphQL mutation).
 * - Pokud se hodnota pole změní, spustí se update po krátkém zpoždění (`delayer`) — uživatelské změny nejsou ihned posílány, ale až po pauze.
 * - Zobrazuje loading a error stav pomocí komponent `LoadingSpinner` a `ErrorHandler`.
 * - Předává editované hodnoty do komponenty `TemplateMediumEditableContent`, která zajišťuje zobrazení a editaci jednotlivých polí šablony (`template`).
 *
 * @component
 * @param {Object} props - Props objekt.
 * @param {Object} props.template - Objekt reprezentující editovanou šablonu (template entity).
 * @param {React.ReactNode} [props.children] - Libovolné children, které se vloží pod editační komponentu.
 * @param {Function} [props.asyncAction=TemplateUpdateAsyncAction] - Asynchronní akce pro update (`useAsyncAction`), typicky GraphQL update mutation.
 *
 * @example
 * // Standardní použití
 * <TemplateLiveEdit template={templateEntity} />
 *
 * @example
 * // S vlastním asyncAction a doplňkovým obsahem
 * <TemplateLiveEdit template={templateEntity} asyncAction={myUpdateAction}>
 *   <div>Extra obsah nebo poznámka</div>
 * </TemplateLiveEdit>
 *
 * @returns {JSX.Element}
 *   Interaktivní komponenta pro live editaci šablony, včetně spinneru a error handleru.
 */
export const LiveEdit = ({
    item,
    children,
    mutationAsyncAction=UpdateAsyncAction,
    DefaultContent=MediumEditableContent
}) => {
    const { onChange: contextOnChange } = useGQLEntityContext()

    const {
        draft,
        dirty,
        loading: saving,
        saved,
        error,
        onChange,
        onBlur,
        onCancel,
        onConfirm,
    } = useEditAction(mutationAsyncAction, item, {
        mode: "confirm",
    })

    const handleConfirm = useCallback(async () => {
        const result = await onConfirm()
        if (result && !result.failed) {
            // Notify context about the updated entity (with new lastchange)
            const event = { target: { value: result } }
            await contextOnChange?.(event)
            // Reload page to show updated data
            window.location.reload()
        }
        return result
    }, [onConfirm, contextOnChange])

    return (

        <DefaultContent item={draft} onChange={onChange} onBlur={onBlur} >
            <AsyncStateIndicator loading={saving} error={error} text={"Ukládám"} />
            {saved && <div className="alert alert-success py-1 mt-2">Uloženo</div>}
            <div className="d-flex gap-2 mt-2">
                <button
                    className="btn btn-outline-secondary flex-grow-1"
                    onClick={onCancel}
                    disabled={!dirty || saving}
                >
                    Zrušit
                </button>
                <button
                    className="btn btn-primary flex-grow-1"
                    onClick={handleConfirm}
                    disabled={!dirty || saving}
                >
                    Uložit
                </button>
            </div>
            {children}
        </DefaultContent>

    )
}
