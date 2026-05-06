import { useState, useCallback, useEffect } from "react";
import { useDispatch } from "react-redux";
import { LoadingSpinner } from "@hrbolek/uoisfrontend-shared";
import { useGQLClient } from "../../../../dynamic/src/Store/RootProviders";
import { useGQLEntityContext } from "../../../../_template/src/Base/Helpers/GQLEntityProvider";
import { UpdateAsyncAction } from "../Queries";
import { MediumEditableContent } from "./MediumEditableContent";

/**
 * Direct edit form for Subject entity.
 *
 * Uses dispatch with UpdateAsyncAction. Saving is triggered explicitly
 * by the Uložit button which dispatches the update action with GraphQL client.
 * After save, updates the context to refresh all components on the page.
 */
export const SubjectEditForm = ({ children }) => {
    const dispatch = useDispatch();
    const gqlClient = useGQLClient();
    const { item, onChange: contextOnChange } = useGQLEntityContext();

    const [draft, setDraft] = useState(item);
    const [saved, setSaved] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Synchronize draft with context item changes
    useEffect(() => {
        setDraft(item);
    }, [item]);

    // Track if form is dirty (has changes)
    const dirty = JSON.stringify(item) !== JSON.stringify(draft);

    const onChange = useCallback((e) => {
        const { id, value } = e?.target || {};
        if (id === undefined || value === undefined) return;

        setDraft((prev) => ({
            ...prev,
            [id]: value,
        }));
        setSaved(false);
    }, []);

    const onBlur = useCallback(() => {
        // Optional: can be used for validation
    }, []);

    const onCancel = useCallback(() => {
        setDraft(item);
        setSaved(false);
    }, [item]);

    const onSave = useCallback(async () => {
        try {
            setSaved(false);
            setError(null);
            setLoading(true);

            const response = await dispatch(UpdateAsyncAction(draft, gqlClient));

            if (response) {
                setSaved(true);

                // Update context to refresh all components on the page
                // This will trigger useEffect to update draft
                const event = { target: { value: response } };
                await contextOnChange(event);
            }
        } catch (err) {
            console.error("Save error:", err);
            setError(err);
        } finally {
            setLoading(false);
        }
    }, [draft, dispatch, gqlClient, contextOnChange]);

    return (
        <MediumEditableContent item={draft} onChange={onChange} onBlur={onBlur}>
            {loading && <LoadingSpinner />}
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
                    disabled={!dirty || loading}
                >
                    Zrušit
                </button>
                <button
                    className="btn btn-primary flex-grow-1"
                    onClick={onSave}
                    disabled={!dirty || loading}
                >
                    {loading ? (
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
