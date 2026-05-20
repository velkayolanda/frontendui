import { useState, useCallback, useEffect } from "react";
import { useDispatch } from "react-redux";
import { LoadingSpinner } from "@hrbolek/uoisfrontend-shared";
import { useGQLClient } from "../../../../dynamic/src/Store/RootProviders";
import { useGQLEntityContext } from "../../../../_template/src/Base/Helpers/GQLEntityProvider";
import { UpdateAsyncAction, ReadAsyncAction } from "../Queries";
import { SemesterUpdateAsyncAction } from "../Queries/SemesterUpdateAsyncAction";
import { SemesterInsertAsyncAction } from "../Queries/SemesterInsertAsyncAction";
import { MediumEditableContent } from "./MediumEditableContent";

/**
 * SubjectEditForm - Hlavní formulář pro editaci entity Subject.
 *
 * Tato komponenta implementuje "draft/commit" pattern:
 * - Udržuje lokální draft stav, který uživatel může měnit
 * - Změny se neukládají okamžitě, ale až po kliknutí na tlačítko "Uložit"
 * - Detekuje změny (dirty) porovnáním draftu s původním itemem
 * - Umožňuje zrušit změny tlačítkem "Zrušit"
 *
 * Správa semestrů:
 * - Komponenta přijímá změny semestrů od SemestersManager přes callback onSemestersChange
 * - Při uložení porovnává aktuální a původní semestry a určuje:
 *   - toAdd: Semestry k přidání (nastavení subjectId na ID předmětu)
 *   - toRemove: Semestry k odebrání (nastavení subjectId na null)
 *   - toUpdate: Semestry se změněným pořadím (update order s explicitním subjectId)
 *
 * DŮLEŽITÉ - Řešení problému lastchange:
 * Při aktualizaci více semestrů je nutné načítat aktuální lastchange před každou mutací,
 * protože předchozí mutace mohly lastchange změnit. Funkce fetchFreshSemesterData
 * zajišťuje načtení aktuálních dat ze serveru.
 *
 * DŮLEŽITÉ - Zachování vazby na předmět:
 * Při změně pořadí semestru je nutné explicitně poslat subjectId: item.id,
 * jinak se undefined interpretuje jako null a semestr se odpojí od předmětu!
 *
 * Architektura:
 * 1. Uživatel provádí změny v draftu (textová pole, výběr programu, správa semestrů)
 * 2. Komponenta sleduje dirty stav porovnáním draft vs item
 * 3. Po kliknutí "Uložit":
 *    a) Načtou se aktuální lastchange hodnoty pro semestry
 *    b) Provedou se změny semestrů (add/remove/update order)
 *    c) Uloží se změny předmětu (UpdateAsyncAction)
 *    d) Načtou se aktuální data z backendu (ReadAsyncAction)
 *    e) Aktualizuje se kontext pro překreslení stránky
 *
 * @component
 * @param {Object} props
 * @param {React.ReactNode} [props.children] - Další obsah zobrazený pod formulářem
 *
 * @example
 * <SubjectEditForm>
 *   <AdditionalContent />
 * </SubjectEditForm>
 */
export const SubjectEditForm = ({ children }) => {
    const dispatch = useDispatch();
    const gqlClient = useGQLClient();
    const { item, onChange: contextOnChange } = useGQLEntityContext();

    // Lokální stav formuláře
    const [draft, setDraft] = useState(item);
    const [saved, setSaved] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Původní semestry pro porovnání změn
    const [originalSemesters, setOriginalSemesters] = useState(item?.semesters || []);

    /**
     * Synchronizace draftu s kontextem.
     */
    useEffect(() => {
        setDraft(item);
        setOriginalSemesters(item?.semesters || []);
    }, [item]);

    // Detekce změn
    const dirty = JSON.stringify(item) !== JSON.stringify(draft);

    /**
     * Handler pro změnu hodnoty pole.
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
     */
    const onBlur = useCallback(() => {
    }, []);

    /**
     * Handler pro změnu semestrů (lokálně v draftu).
     */
    const onSemestersChange = useCallback((newSemesters) => {
        setDraft((prev) => ({
            ...prev,
            semesters: newSemesters,
        }));
        setSaved(false);
    }, []);

    /**
     * Handler pro zrušení změn.
     */
    const onCancel = useCallback(() => {
        setDraft(item);
        setSaved(false);
    }, [item]);

    /**
     * Načtení aktuálních dat semestrů ze serveru.
     *
     * Tato funkce je klíčová pro řešení problému "stale lastchange".
     * Před každou mutací semestru je nutné mít aktuální lastchange,
     * jinak mutace selže s chybou optimistic locking.
     *
     * @param {string[]} semesterIds - Pole ID semestrů k načtení
     * @returns {Promise<Array>} Pole semestrů s aktuálními daty (včetně lastchange)
     */
    const fetchFreshSemesterData = useCallback(async (semesterIds) => {
        // Jednoduchý přístup - načteme všechny semestry a vyfiltrujeme
        const { ReadPageAsyncAction: SemesterReadPageAsyncAction } = await import("../../../../granting2/src/SemesterGQLModel/Queries/ReadPageAsyncAction");
        const result = await dispatch(SemesterReadPageAsyncAction({ limit: 1000 }, gqlClient));
        const allSemesters = result?.data?.semesterPage || result || [];
        return allSemesters.filter(s => semesterIds.includes(s.id));
    }, [dispatch, gqlClient]);

    /**
     * Handler pro uložení změn předmětu a semestrů.
     *
     * Proces uložení:
     * 1. Porovná původní a aktuální semestry a určí změny (toAdd, toRemove, toUpdate)
     * 2. Načte aktuální lastchange pro všechny dotčené semestry
     * 3. Přidá nové semestry (nastaví jim subjectId na ID předmětu)
     * 4. Odebere semestry (nastaví jim subjectId na null)
     * 5. Aktualizuje pořadí semestrů (s explicitním subjectId pro zachování vazby!)
     * 6. Uloží změny předmětu (název, popis, program atd.)
     * 7. Načte aktuální data z backendu pro refresh UI
     *
     * DŮLEŽITÉ: Při update pořadí musíme poslat subjectId: item.id,
     * jinak se undefined interpretuje jako null a semestr se odpojí!
     */
    const onSave = useCallback(async () => {
        try {
            setSaved(false);
            setError(null);
            setLoading(true);

            const currentSemesters = draft.semesters || [];
            const originalIds = new Set(originalSemesters.map(s => s.id));
            const currentIds = new Set(currentSemesters.map(s => s.id));

            // Nově vytvořené semestry (mají _action: 'create')
            const toCreate = currentSemesters.filter(s => s._action === 'create');
            // Existující semestry k přidání (jsou v current, ale ne v original, a nemají _action: 'create')
            const toAdd = currentSemesters.filter(s => !originalIds.has(s.id) && s._action !== 'create');
            // Semestry k odebrání (jsou v original, ale ne v current)
            const toRemove = originalSemesters.filter(s => !currentIds.has(s.id));
            // Semestry které zůstávají - kontrola změny pořadí
            const toUpdate = currentSemesters.filter(s => {
                const orig = originalSemesters.find(o => o.id === s.id);
                return orig && orig.order !== s.order;
            });

            // Načti aktuální data pro semestry, které budeme měnit (kromě nově vytvořených)
            const semesterIdsToFetch = [...toAdd.map(s => s.id), ...toRemove.map(s => s.id), ...toUpdate.map(s => s.id)];
            let freshSemesters = [];
            if (semesterIdsToFetch.length > 0) {
                freshSemesters = await fetchFreshSemesterData(semesterIdsToFetch);
            }

            // Vytvoření nových semestrů
            for (const semester of toCreate) {
                // Vytvoř semestr s id, subjectId a order (backend nepodporuje name)
                const insertResult = await dispatch(SemesterInsertAsyncAction({
                    id: semester.id,
                    subjectId: item.id,
                    order: semester.order
                }, gqlClient));

                console.log("Insert result:", insertResult);
                const newSemester = insertResult?.data?.semesterInsert || insertResult;

                if (newSemester?.failed || newSemester?.__typename?.includes('Error')) {
                    console.error("Failed to create semester:", insertResult);
                    throw new Error(newSemester?.msg || "Chyba při vytváření semestru");
                }
            }

            // Přidání existujících semestrů (nastavení subjectId)
            for (const semester of toAdd) {
                const fresh = freshSemesters.find(s => s.id === semester.id);
                if (fresh) {
                    await dispatch(SemesterUpdateAsyncAction({
                        id: semester.id,
                        lastchange: fresh.lastchange,
                        subjectId: item.id,
                        order: semester.order
                    }, gqlClient));
                }
            }

            // Odebrání semestrů (nastavení subjectId na null)
            for (const semester of toRemove) {
                const fresh = freshSemesters.find(s => s.id === semester.id);
                if (fresh) {
                    await dispatch(SemesterUpdateAsyncAction({
                        id: semester.id,
                        lastchange: fresh.lastchange,
                        subjectId: null
                    }, gqlClient));
                }
            }

            // Aktualizace pořadí - musíme načítat fresh data před každým updatem
            // a zachovat subjectId aby se nesmazala vazba
            for (const semester of toUpdate) {
                // Načti aktuální lastchange před každým updatem
                const freshData = await fetchFreshSemesterData([semester.id]);
                const fresh = freshData.find(s => s.id === semester.id);
                if (fresh) {
                    const result = await dispatch(SemesterUpdateAsyncAction({
                        id: semester.id,
                        lastchange: fresh.lastchange,
                        subjectId: item.id, // Zachovat vazbu na subject
                        order: semester.order
                    }, gqlClient));

                    if (result?.failed || result?.__typename === 'SemesterGQLModelUpdateError') {
                        console.error("Failed to update semester order:", result);
                        throw new Error(result?.msg || "Chyba při změně pořadí semestru");
                    }
                }
            }

            // Uložení ostatních změn předmětu
            const response = await dispatch(UpdateAsyncAction(draft, gqlClient));

            if (response) {
                setSaved(true);

                // Refresh dat z backendu
                const refreshResponse = await dispatch(ReadAsyncAction({ id: item.id }, gqlClient));
                const subjectData = refreshResponse?.data?.subjectById || refreshResponse;
                if (subjectData) {
                    const event = { target: { value: subjectData } };
                    await contextOnChange(event);
                }
            }
        } catch (err) {
            console.error("Save error:", err);
            setError(err);
        } finally {
            setLoading(false);
        }
    }, [draft, originalSemesters, item, dispatch, gqlClient, contextOnChange, fetchFreshSemesterData]);

    return (
        <MediumEditableContent
            item={draft}
            onChange={onChange}
            onBlur={onBlur}
            onSemestersChange={onSemestersChange}
        >
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
