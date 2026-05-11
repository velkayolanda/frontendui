import { useState, useCallback, useEffect } from "react";
import { useDispatch } from "react-redux";
import { LoadingSpinner } from "@hrbolek/uoisfrontend-shared";
import { useGQLClient } from "../../../../dynamic/src/Store/RootProviders";
import { useGQLEntityContext } from "../../../../_template/src/Base/Helpers/GQLEntityProvider";
import { UpdateAsyncAction } from "../Queries";
import { MediumEditableContent } from "./MediumEditableContent";

/**
 * Formulář pro přímou editaci entity Subject s explicitním tlačítkem uložení.
 *
 * Na rozdíl od LiveEdit a ConfirmEdit tato komponenta přímo používá
 * dispatch a UpdateAsyncAction pro uložení změn. Nepoužívá hook useEditAction.
 *
 * Funkce:
 * - Udržuje lokální draft stav, který se synchronizuje s kontextem
 * - Detekuje změny (dirty) porovnáním draftu s původním itemem
 * - Zobrazuje indikátor načítání během ukládání
 * - Zobrazuje zprávu o úspěšném uložení nebo chybu
 * - Po úspěšném uložení aktualizuje kontext pro překreslení stránky
 *
 * @component
 * @param {Object} props
 * @param {React.ReactNode} [props.children] - Další obsah zobrazený pod formulářem
 *
 * @example
 * <SubjectEditForm>
 *   <p>Dodatečné informace</p>
 * </SubjectEditForm>
 */
export const SubjectEditForm = ({ children }) => {
    const dispatch = useDispatch();
    const gqlClient = useGQLClient();
    // Získání aktuálního itemu a funkce pro aktualizaci kontextu
    const { item, onChange: contextOnChange } = useGQLEntityContext();

    // Lokální stav formuláře
    const [draft, setDraft] = useState(item);      // Pracovní kopie entity
    const [saved, setSaved] = useState(false);     // Indikátor úspěšného uložení
    const [loading, setLoading] = useState(false); // Indikátor probíhajícího ukládání
    const [error, setError] = useState(null);      // Případná chyba při ukládání

    /**
     * Synchronizace draftu s kontextem.
     * Když se změní item v kontextu (např. po uložení), aktualizuje draft.
     */
    useEffect(() => {
        setDraft(item);
    }, [item]);

    // Detekce změn - porovnání aktuálního draftu s původním itemem
    const dirty = JSON.stringify(item) !== JSON.stringify(draft);

    /**
     * Handler pro změnu hodnoty pole.
     * Aktualizuje draft a resetuje indikátor uložení.
     */
    const onChange = useCallback((e) => {
        const { id, value } = e?.target || {};
        if (id === undefined || value === undefined) return;

        setDraft((prev) => ({
            ...prev,
            [id]: value,
        }));
        setSaved(false);
    }, []);

    /**
     * Handler pro opuštění pole.
     * Může být použit pro validaci (momentálně prázdný).
     */
    const onBlur = useCallback(() => {
    }, []);

    /**
     * Handler pro zrušení změn.
     * Vrátí draft na původní hodnoty z kontextu.
     */
    const onCancel = useCallback(() => {
        setDraft(item);
        setSaved(false);
    }, [item]);

    /**
     * Handler pro uložení změn.
     * Odesílá mutaci na backend pomocí dispatch a UpdateAsyncAction.
     * Po úspěšném uložení aktualizuje kontext, což způsobí překreslení stránky.
     */
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
