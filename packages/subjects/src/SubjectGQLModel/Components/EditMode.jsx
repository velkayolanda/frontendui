import { useCallback } from "react";
import { UpdateAsyncAction } from "../Queries";
import { MediumEditableContent } from "./MediumEditableContent";
import { useEditAction } from "../../../../dynamic/src/Hooks/useEditAction";
import { LoadingSpinner } from "@hrbolek/uoisfrontend-shared";
import { useGQLEntityContext } from "../../../../_template/src/Base/Helpers/GQLEntityProvider";

/**
 * EditMode Component
 *
 * Univerzální komponenta pro editaci entity Subject s přepínačem mezi automatickým a manuálním ukládáním.
 *
 * - Defaultně je zapnuté automatické ukládání (live mode)
 * - Přepínač umožňuje přepnout na manuální režim s tlačítky Uložit/Zrušit
 *
 * @component
 * @param {Object} props
 * @param {Object} props.item - Objekt reprezentující editovanou entitu
 * @param {React.ReactNode} [props.children] - Další obsah pod formulářem
 * @param {Function} [props.mutationAsyncAction=UpdateAsyncAction] - Asynchronní akce pro update
 * @param {React.ComponentType} [props.DefaultContent=MediumEditableContent] - Komponenta pro zobrazení obsahu
 */
export const EditMode = ({
    item,
    children,
    mutationAsyncAction = UpdateAsyncAction,
    DefaultContent = MediumEditableContent
}) => {
    const { onChange: contextOnChange } = useGQLEntityContext();

    const {
        draft,
        dirty,
        loading: saving,
        error,
        autoSaveEnabled,
        toggleAutoSave,
        effectiveMode,
        onChange,
        onBlur,
        onCancel,
        onConfirm,
    } = useEditAction(mutationAsyncAction, item, {
        mode: "live",
        defaultAutoSave: true,
    });

    const handleConfirm = useCallback(async () => {
        const result = await onConfirm();
        if (result) {
            const event = { target: { value: result } };
            await contextOnChange(event);
        }
        return result;
    }, [onConfirm, contextOnChange]);

    return (
        <>
            {/* Přepínač autosave - nahoře */}
            <div className="d-flex justify-content-end align-items-center mb-3 p-2 bg-light rounded">
                <div className="form-check form-switch m-0 me-3">
                    <input
                        className="form-check-input"
                        type="checkbox"
                        role="switch"
                        id="autoSaveSwitch"
                        checked={autoSaveEnabled}
                        onChange={toggleAutoSave}
                    />
                    <label className="form-check-label" htmlFor="autoSaveSwitch">
                        Automatické ukládání
                    </label>
                </div>
                {effectiveMode === "live" && saving && (
                    <span className="text-muted small">
                        <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true" />
                        Ukládám...
                    </span>
                )}
            </div>

            {/* Obsah formuláře */}
            <DefaultContent item={draft} onChange={onChange} onBlur={onBlur}>
                {children}
            </DefaultContent>

            {/* Tlačítka - zobrazí se jen v confirm režimu */}
            {effectiveMode === "confirm" && (
                <div className="d-flex gap-2 mt-3">
                    <button
                        className="btn btn-outline-secondary flex-grow-1"
                        onClick={onCancel}
                        disabled={!dirty || saving}
                    >
                        Zrušit změny
                    </button>
                    <button
                        className="btn btn-primary flex-grow-1"
                        onClick={handleConfirm}
                        disabled={!dirty || saving}
                    >
                        {saving ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                                Ukládám...
                            </>
                        ) : "Uložit změny"}
                    </button>
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="alert alert-danger mt-2">
                    {error?.message || "Chyba při ukládání"}
                </div>
            )}
        </>
    );
};
