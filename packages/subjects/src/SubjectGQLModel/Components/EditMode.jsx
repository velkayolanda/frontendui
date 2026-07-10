import { useCallback, useState, useRef, useEffect } from "react";
import { UpdateAsyncAction, SemesterInsertAsyncAction, SemesterDeleteAsyncAction, SemesterUpdateAsyncAction } from "../Queries";
import { MediumEditableContent } from "./MediumEditableContent";
import { useEditAction } from "../../../../dynamic/src/Hooks/useEditAction";
import { useGQLEntityContext } from "../../../../_template/src/Base/Helpers/GQLEntityProvider";
import { useGQLClient } from "../../../../dynamic/src/Store/RootProviders";
import { useDispatch } from "react-redux";

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
    const dispatch = useDispatch();
    const gqlClient = useGQLClient();

    // Track original semesters for comparison
    const [originalSemesters, setOriginalSemesters] = useState(item?.semesters || []);
    const [currentSemesters, setCurrentSemesters] = useState(item?.semesters || []);
    const [semestersSaving, setSemestersSaving] = useState(false);
    const [semestersError, setSemestersError] = useState(null);

    // Track if we have locally saved semesters that shouldn't be overwritten by item prop
    const [hasLocalSemesters, setHasLocalSemesters] = useState(false);

    // Ref to track pending semester changes for live mode
    const semesterTimerRef = useRef(null);
    // Ref to always have access to the latest originalSemesters in callbacks
    const originalSemestersRef = useRef(originalSemesters);
    // Ref to track the current semesters for pending save operations
    const currentSemestersRef = useRef(currentSemesters);
    useEffect(() => {
        originalSemestersRef.current = originalSemesters;
    }, [originalSemesters]);
    useEffect(() => {
        currentSemestersRef.current = currentSemesters;
    }, [currentSemesters]);

    // Track the previous item.id to detect actual changes
    const prevItemIdRef = useRef(item?.id);

    // Reset semesters only when item.id actually changes (navigating to different subject)
    useEffect(() => {
        const prevId = prevItemIdRef.current;
        const currentId = item?.id;

        console.log('[SemesterSync] useEffect triggered. prevId:', prevId, 'currentId:', currentId, 'hasLocalSemesters:', hasLocalSemesters);

        // Only reset if item.id actually changed to a different value
        if (prevId !== currentId) {
            console.log('[SemesterSync] Item ID changed, resetting semesters to:', item?.semesters);
            setHasLocalSemesters(false);
            setOriginalSemesters(item?.semesters || []);
            setCurrentSemesters(item?.semesters || []);
            prevItemIdRef.current = currentId;
        }
    }, [item?.id, item?.semesters]);

    const {
        draft,
        setDraft,
        dirty: fieldsDirty,
        loading: saving,
        error,
        autoSaveEnabled,
        toggleAutoSave,
        effectiveMode,
        onChange,
        onBlur,
        onCancel: baseOnCancel,
        onConfirm: baseOnConfirm,
    } = useEditAction(mutationAsyncAction, item, {
        mode: "live",
        defaultAutoSave: true,
    });

    // Check if semesters have changed
    const semestersDirty = useCallback(() => {
        if (originalSemesters.length !== currentSemesters.length) return true;
        const origIds = new Set(originalSemesters.map(s => s.id));
        const currIds = new Set(currentSemesters.map(s => s.id));
        // Check for added/removed
        for (const id of currIds) if (!origIds.has(id)) return true;
        for (const id of origIds) if (!currIds.has(id)) return true;
        // Check for order changes
        for (const curr of currentSemesters) {
            const orig = originalSemesters.find(s => s.id === curr.id);
            if (orig && orig.order !== curr.order) return true;
        }
        return false;
    }, [originalSemesters, currentSemesters]);

    const dirty = fieldsDirty || semestersDirty();

    // Ref to prevent concurrent save operations
    const isSavingRef = useRef(false);

    // Save semester changes to server
    const saveSemesterChanges = useCallback(async (semesters) => {
        // Prevent concurrent saves - if already saving, skip this call
        // The next debounced call will pick up the changes
        if (isSavingRef.current) {
            console.log('[SemesterSave] Skipping - already saving');
            return false;
        }
        isSavingRef.current = true;
        setSemestersSaving(true);
        setSemestersError(null);

        console.log('[SemesterSave] Starting save with semesters:', semesters);
        console.log('[SemesterSave] Original semesters:', originalSemestersRef.current);

        // Validace maximálního počtu semestrů
        const MAX_SEMESTERS = 12;
        if (semesters.length > MAX_SEMESTERS) {
            setSemestersError(new Error(`Překročen maximální počet semestrů (${MAX_SEMESTERS}). Aktuálně: ${semesters.length}`));
            isSavingRef.current = false;
            setSemestersSaving(false);
            return false;
        }

        // Track which semesters failed to delete (for rollback)
        const failedToDelete = [];

        try {
            // Use ref to get the most current original semesters (avoids stale closure)
            const currentOriginalSemesters = originalSemestersRef.current;
            const origMap = new Map(currentOriginalSemesters.map(s => [s.id, s]));
            const currMap = new Map(semesters.map(s => [s.id, s]));

            // Track updated lastchange values from server responses
            const lastchangeMap = new Map(currentOriginalSemesters.map(s => [s.id, s.lastchange]));

            // Find semesters to create (have _action: 'create' flag)
            const toCreate = semesters.filter(s => s._action === 'create');

            // Find semesters to delete (in original but not in current, excluding newly created ones)
            const toDelete = currentOriginalSemesters.filter(s => !currMap.has(s.id) && !s._action);

            // Execute creates
            console.log('[SemesterSave] To create:', toCreate);
            console.log('[SemesterSave] To delete:', toDelete);
            for (const semester of toCreate) {
                console.log('[SemesterSave] Creating semester:', semester);
                const response = await dispatch(SemesterInsertAsyncAction({
                    id: semester.id,
                    subjectId: item.id,
                    order: semester.order
                }, gqlClient));
                console.log('[SemesterSave] Create response:', response);
                // Extract result from GraphQL response structure
                const result = response?.data?.semesterInsert || response?.semesterInsert || response;
                // Store the lastchange from server response for future operations
                if (result?.id) {
                    lastchangeMap.set(result.id, result.lastchange);
                    console.log('[SemesterSave] Created successfully, id:', result.id, 'lastchange:', result.lastchange);
                } else {
                    console.error('[SemesterSave] Create failed - no id in result:', result);
                }
            }

            // Execute deletes - use fresh lastchange from map
            for (const semester of toDelete) {
                const currentLastchange = lastchangeMap.get(semester.id) || semester.lastchange;
                // Validate lastchange before making API call
                if (!currentLastchange) {
                    console.error('Cannot delete semester - missing lastchange:', semester.id);
                    failedToDelete.push(semester);
                    continue;
                }
                const response = await dispatch(SemesterDeleteAsyncAction({
                    id: semester.id,
                    lastchange: currentLastchange
                }, gqlClient));
                // Extract result from GraphQL response structure
                const result = response?.data?.semesterDelete || response?.semesterDelete || response;
                // Check for error response
                if (result?.failed === true) {
                    failedToDelete.push(semester);
                    continue;
                }
            }

            // Sestavení pracovního seznamu: odstranění _action flagu, přidání neúspěšně smazaných
            let workingSemesters = semesters.map(s => { const { _action, ...rest } = s; return rest; });
            for (const failedSemester of failedToDelete) {
                if (!workingSemesters.some(s => s.id === failedSemester.id)) {
                    workingSemesters.push(failedSemester);
                }
            }

            // Seřazení pro konzistentní zobrazení
            workingSemesters.sort((a, b) => (a.order || 0) - (b.order || 0));

            // Najít semestry, jejichž pořadí se změnilo oproti originálu
            // DŮLEŽITÉ: Neměníme automaticky pořadí všech semestrů!
            // Aktualizujeme pouze ty, které uživatel explicitně změnil.
            const toUpdate = workingSemesters.filter(s => {
                const orig = origMap.get(s.id);
                // Aktualizovat pouze pokud existoval v originálu a pořadí se změnilo
                return orig && orig.order !== s.order;
            });

            // Execute updates - use fresh lastchange from map for each update
            for (const semester of toUpdate) {
                // Try multiple sources for lastchange: map (from previous ops), semester itself, or original
                const currentLastchange = lastchangeMap.get(semester.id) || semester.lastchange || origMap.get(semester.id)?.lastchange;
                // Validate lastchange before making API call
                if (!currentLastchange) {
                    console.error('Cannot update semester - missing lastchange:', semester.id);
                    throw new Error('Nepodařilo se aktualizovat semestr - chybí lastchange');
                }
                const response = await dispatch(SemesterUpdateAsyncAction({
                    id: semester.id,
                    lastchange: currentLastchange,
                    subjectId: item.id,
                    order: semester.order
                }, gqlClient));
                // Extract result from GraphQL response structure
                const result = response?.data?.semesterUpdate || response?.semesterUpdate || response;
                // Check for error response
                if (result?.__typename?.includes('Error') || result?.failed === true) {
                    throw new Error(result?.msg || 'Nepodařilo se aktualizovat pořadí semestru');
                }
                // Update lastchange for any subsequent operations on this semester
                if (result?.lastchange) {
                    lastchangeMap.set(semester.id, result.lastchange);
                }
            }

            // Apply updated lastchange values to the final list
            let savedSemesters = workingSemesters.map(s => {
                const updatedLastchange = lastchangeMap.get(s.id);
                return updatedLastchange ? { ...s, lastchange: updatedLastchange } : s;
            });

            // Mark that we have locally saved semesters - prevents useEffect from overwriting
            console.log('[SemesterSave] Save complete. Final savedSemesters:', savedSemesters);
            setHasLocalSemesters(true);
            setOriginalSemesters(savedSemesters);
            setCurrentSemesters(savedSemesters);
            setDraft(prev => ({ ...prev, semesters: savedSemesters }));

            // If any deletes failed, show error but don't fail the whole operation
            if (failedToDelete.length > 0) {
                setSemestersError(new Error('Nelze smazat semestr - obsahuje klasifikace nebo jiná data'));
                return false;
            }

            return true;
        } catch (err) {
            // On error, restore original semesters to UI
            setCurrentSemesters(originalSemestersRef.current);
            setDraft(prev => ({ ...prev, semesters: originalSemestersRef.current }));
            setSemestersError(err);
            return false;
        } finally {
            isSavingRef.current = false;
            setSemestersSaving(false);

            // Check if there are pending changes that happened during save
            // If so, schedule another save
            if (pendingSaveRef.current) {
                pendingSaveRef.current = false;
                semesterTimerRef.current = setTimeout(() => {
                    saveSemesterChanges(currentSemestersRef.current);
                }, 300);
            }
        }
    }, [dispatch, gqlClient, item?.id, setDraft]);

    // Ref to track if there are pending changes during a save operation
    const pendingSaveRef = useRef(false);

    // Handle semester changes from SemestersManager
    const handleSemestersChange = useCallback((newSemesters) => {
        setCurrentSemesters(newSemesters);
        // Update draft so it has the new semesters for display
        setDraft(prev => ({ ...prev, semesters: newSemesters }));

        // In live mode, auto-save semester changes after debounce
        if (effectiveMode === "live") {
            // If currently saving, mark that there are pending changes
            if (isSavingRef.current) {
                pendingSaveRef.current = true;
                return;
            }

            if (semesterTimerRef.current) {
                clearTimeout(semesterTimerRef.current);
            }
            semesterTimerRef.current = setTimeout(() => {
                // Use ref to get the most current semesters at save time
                // This prevents saving stale data if user made more changes during debounce
                saveSemesterChanges(currentSemestersRef.current);
            }, 800); // Increased debounce to 800ms for more stability
        }
    }, [effectiveMode, setDraft, saveSemesterChanges]);

    // Clean up timer on unmount
    useEffect(() => {
        return () => {
            if (semesterTimerRef.current) {
                clearTimeout(semesterTimerRef.current);
            }
        };
    }, []);

    const handleConfirm = useCallback(async () => {
        // Save semester changes first
        if (semestersDirty()) {
            const semesterSuccess = await saveSemesterChanges(currentSemesters);
            if (!semesterSuccess) return null;
        }

        // Then save field changes
        const result = await baseOnConfirm();
        if (result) {
            const event = { target: { value: result } };
            await contextOnChange(event);
        }
        return result;
    }, [baseOnConfirm, contextOnChange, semestersDirty, saveSemesterChanges, currentSemesters]);

    const handleCancel = useCallback(() => {
        // Reset semesters to original
        setCurrentSemesters(originalSemesters);
        setDraft(prev => ({ ...prev, semesters: originalSemesters }));
        // Cancel field changes
        baseOnCancel();
    }, [baseOnCancel, originalSemesters, setDraft]);

    const isSaving = saving || semestersSaving;
    const combinedError = error || semestersError;

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
                {effectiveMode === "live" && isSaving && (
                    <span className="text-muted small">
                        <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true" />
                        Ukládám...
                    </span>
                )}
            </div>

            {/* Obsah formuláře */}
            <DefaultContent
                item={{ ...draft, semesters: currentSemesters }}
                onChange={onChange}
                onBlur={onBlur}
                onSemestersChange={handleSemestersChange}
            >
                {children}
            </DefaultContent>

            {/* Tlačítka - zobrazí se jen v confirm režimu */}
            {effectiveMode === "confirm" && (
                <div className="d-flex gap-2 mt-3">
                    <button
                        className="btn btn-outline-secondary flex-grow-1"
                        onClick={handleCancel}
                        disabled={!dirty || isSaving}
                    >
                        Zrušit změny
                    </button>
                    <button
                        className="btn btn-primary flex-grow-1"
                        onClick={handleConfirm}
                        disabled={!dirty || isSaving}
                    >
                        {isSaving ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                                Ukládám...
                            </>
                        ) : "Uložit změny"}
                    </button>
                </div>
            )}

            {/* Error */}
            {combinedError && (
                <div className="alert alert-danger mt-2">
                    {combinedError?.message || "Chyba při ukládání"}
                </div>
            )}
        </>
    );
};
