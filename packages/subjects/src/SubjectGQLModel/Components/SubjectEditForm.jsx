import { LoadingSpinner } from "@hrbolek/uoisfrontend-shared";
import { useEditAction } from "../../../../dynamic/src/Hooks/useEditAction";
import { UpdateAsyncAction } from "../Queries";
import { MediumEditableContent } from "./MediumEditableContent";

/**
 * Direct edit form for Subject entity.
 *
 * Uses useEditAction (mode: "confirm") with MediumEditableContent — the same
 * infrastructure and fields the original autosave path used, but saving is
 * now triggered explicitly by the Uložit button instead of on blur/stop-typing.
 */
export const SubjectEditForm = ({ item, children }) => {
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
    } = useEditAction(UpdateAsyncAction, item, {
        mode: "confirm",
    });

    return (
        <MediumEditableContent item={draft} onChange={onChange} onBlur={onBlur}>
            {saving && <LoadingSpinner />}
            {saved && <div className="alert alert-success py-2">Uloženo</div>}
            {error && (
                <div className="alert alert-danger py-2">
                    {error?.message || "Chyba při ukládání"}
                </div>
            )}

            <div className="d-flex gap-2 mt-3">
                <button
                    className="btn btn-outline-secondary flex-grow-1"
                    onClick={onCancel}
                    disabled={!dirty || saving}
                >
                    Zrušit
                </button>
                <button
                    className="btn btn-primary flex-grow-1"
                    onClick={() => onConfirm().catch(() => {})}
                    disabled={!dirty || saving}
                >
                    {saving ? (
                        <>
                            <span
                                className="spinner-border spinner-border-sm me-2"
                                role="status"
                                aria-hidden="true"
                            />
                            Ukládání…
                        </>
                    ) : "Uložit"}
                </button>
            </div>

            {children}
        </MediumEditableContent>
    );
};
