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

    // Ref to track pending semester changes for live mode
    const semesterTimerRef = useRef(null);

    // Reset semesters when item changes
    useEffect(() => {
        setOriginalSemesters(item?.semesters || []);
        setCurrentSemesters(item?.semesters || []);
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

    // Save semester changes to server
    const saveSemesterChanges = useCallback(async (semesters) => {
        setSemestersSaving(true);
        setSemestersError(null);

        try {
            const origMap = new Map(originalSemesters.map(s => [s.id, s]));
            const currMap = new Map(semesters.map(s => [s.id, s]));

            // Find semesters to create (have _action: 'create' flag)
            const toCreate = semesters.filter(s => s._action === 'create');

            // Find semesters to delete (in original but not in current)
            const toDelete = originalSemesters.filter(s => !currMap.has(s.id));

            // Find semesters to update (order changed)
            const toUpdate = semesters.filter(s => {
                if (s._action === 'create') return false;
                const orig = origMap.get(s.id);
                return orig && orig.order !== s.order;
            });

            // Execute creates
            for (const semester of toCreate) {
                await dispatch(SemesterInsertAsyncAction({
                    id: semester.id,
                    subjectId: item.id,
                    order: semester.order
                }, gqlClient));
            }

            // Execute deletes
            for (const semester of toDelete) {
                await dispatch(SemesterDeleteAsyncAction({
                    id: semester.id,
                    lastchange: semester.lastchange
                }, gqlClient));
            }

            // Execute updates
            for (const semester of toUpdate) {
                const orig = origMap.get(semester.id);
                await dispatch(SemesterUpdateAsyncAction({
                    id: semester.id,
                    lastchange: orig.lastchange,
                    subjectId: item.id,
                    order: semester.order
                }, gqlClient));
            }

            // Update original semesters to reflect saved state (remove _action flags)
            const savedSemesters = semesters.map(s => {
                const { _action, ...rest } = s;
                return rest;
            });
            setOriginalSemesters(savedSemesters);
            setCurrentSemesters(savedSemesters);

            return true;
        } catch (err) {
            setSemestersError(err);
            return false;
        } finally {
            setSemestersSaving(false);
        }
    }, [dispatch, gqlClient, item?.id, originalSemesters]);

    // Handle semester changes from SemestersManager
    const handleSemestersChange = useCallback((newSemesters) => {
        setCurrentSemesters(newSemesters);
        // Update draft so it has the new semesters for display
        setDraft(prev => ({ ...prev, semesters: newSemesters }));

        // In live mode, auto-save semester changes after debounce
        if (effectiveMode === "live") {
            if (semesterTimerRef.current) {
                clearTimeout(semesterTimerRef.current);
            }
            semesterTimerRef.current = setTimeout(() => {
                saveSemesterChanges(newSemesters);
            }, 600);
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
