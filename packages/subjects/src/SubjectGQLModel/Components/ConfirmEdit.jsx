import { UpdateAsyncAction } from "../Queries";
import { MediumEditableContent } from "./MediumEditableContent";
import { useEditAction } from "../../../../dynamic/src/Hooks/useEditAction";
import { useCallback } from "react";
import { useGQLEntityContext } from "../../../../_template/src/Base/Helpers/GQLEntityProvider";

/**
 * ConfirmEdit komponenta pro editaci entity Subject s explicitním potvrzením.
 *
 * Používá hook `useEditAction` v režimu "confirm" - změny se neukládají automaticky,
 * ale až po kliknutí na tlačítko "Uložit změny". Uživatel může změny také zrušit.
 *
 * Po úspěšném uložení se aktualizuje kontext (GQLEntityContext), což způsobí
 * překreslení všech komponent na stránce, které tento kontext používají.
 *
 * @component
 * @param {Object} props
 * @param {Object} props.item - Entita Subject k editaci
 * @param {React.ReactNode} [props.children] - Další obsah zobrazený ve formuláři
 *
 * @example
 * <ConfirmEdit item={subjectEntity}>
 *   <p>Dodatečné informace</p>
 * </ConfirmEdit>
 */
export const ConfirmEdit = ({ item, children }) => {
    // Získání funkcí z kontextu pro aktualizaci stavu po uložení
    const { run , error, loading, entity, data, onChange: contextOnChange, onBlur: contextOnBlur } = useGQLEntityContext()

    /**
     * Vytvoří handler pro mutační události, který spojí lokální změnu s notifikací kontextu.
     * Nejprve notifikuje kontext o změně, poté provede mutaci.
     */
    const localOnMutationEvent = useCallback((mutationHandler, notifyHandler) => async (e) => {
        const newItem = { ...item, [e.target.id]: e.target.value }
        const newEvent = { target: { value: newItem } }

        await notifyHandler(newEvent)
        return await mutationHandler(e)
    })

    /**
     * Hook useEditAction v režimu "confirm":
     * - draft: aktuální stav formuláře (kopie item s aplikovanými změnami)
     * - dirty: true pokud jsou neuložené změny
     * - onChange/onBlur: handlery pro vstupní pole
     * - onCancel: vrátí draft na původní hodnoty
     * - onConfirm: odešle mutaci na backend
     */
    const {
        draft,
        dirty,
        onChange,
        onBlur,
        onCancel,
        onConfirm,
    } = useEditAction(UpdateAsyncAction, item, {mode: "confirm"})

    /**
     * Handler pro potvrzení změn.
     * Po úspěšném uložení aktualizuje kontext, což způsobí překreslení celé stránky.
     */
    const handleConfirm = useCallback(async () => {
        const result = await onConfirm();
        console.log("ConfirmEdit handleConfirm result", result, "draft", draft)
        if (result) {
            const event = { target: { value: result } };
            // důležité: použij params z kontextu (provider si je drží jako "poslední vars")
            await contextOnChange(event);
        }
        return result;
    }, [onConfirm, contextOnChange]);


    return (
        <MediumEditableContent item={item} onChange={onChange} onBlur={onBlur} >
            {children}
            <hr />
            {/* <pre>{JSON.stringify(item, null, 2)}</pre> */}
            <button
                className="btn btn-warning form-control"
                onClick={onCancel}
                disabled={!dirty || loading}
            >
                Zrušit změny
            </button>
            <button
                className="btn btn-primary form-control"
                onClick={handleConfirm}
                disabled={!dirty || loading}
            >
                Uložit změny
            </button>
        </MediumEditableContent>
    )
}