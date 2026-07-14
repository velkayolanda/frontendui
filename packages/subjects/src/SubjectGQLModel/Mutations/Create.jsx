/** @module Mutations */
import { useState, useCallback, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { useDispatch } from "react-redux"
import { CreateURI, MediumEditableContent, ReadItemURI } from "../Components"
import { InsertAsyncAction, SemesterInsertAsyncAction } from "../Queries"
import {
    CreateBody as BaseCreateBody,
    CreateButton as BaseCreateButton,
    CreateDialog as BaseCreateDialog,
    CreateLink  as BaseCreateLink
} from "../../../../_template/src/Base/Mutations/Create"
import { PermissionGate } from "../../../../dynamic/src/Hooks/useRoles"
import { useGQLClient } from "../../../../dynamic/src/Store/RootProviders"
import { AsyncStateIndicator } from "../../../../_template/src/Base/Helpers/AsyncStateIndicator"
import { Dialog } from "../../../../_template/src/Base/FormControls/Dialog"

const DefaultContent = (props) => <MediumEditableContent {...props} />
const MutationAsyncAction = InsertAsyncAction

const permissions = {
    oneOfRoles: ["administrátor"], // odemčeno pro všechny uživatele
    mode: "absolute",
}

const defaultitem = { name: "Nový" };

/**
 * Wrapper nad `BaseCreateLink` (alias importu `CreateLink` z Base/Mutations/Create),
 * který je odvozený z obecných `General*` komponent.
 *
 * Účel wrapperu:
 * - nastaví výchozí `uriPattern` pro create route
 * - aplikuje výchozí RBAC nastavení přes `permissions` (např. `oneOfRoles`, `mode`)
 * - všechny ostatní props pouze přeposílá do Base komponenty
 * 
 * Vizuálně vyrenderuje link pro kliknutí
 *
 * @param {Object} params
 * @param {string} [params.uriPattern=CreateURI]
 *   Cílová URI/pattern pro link na create stránku nebo create akci (dle routování aplikace).
 *
 * @param {Object} params.props
 *   Další props přeposílané do `BaseCreateLink` (např. `children`, `className`,
 *   `preserveSearch`, `preserveHash`, atd.).
 *
 * @returns {JSX.Element} Vykreslí `BaseCreateLink` s přednastaveným `uriPattern` a RBAC oprávněními.
 */
export const CreateLink = ({
    uriPattern=CreateURI,
    ...props
}) => (
    <BaseCreateLink {...props} uriPattern={uriPattern} {...permissions} />
);

/**
 * Wrapper nad `BaseCreateButton` (alias importu `CreateButton` z Base/Mutations/Create),
 * který je odvozený z obecných `General*` komponent.
 *
 * Účel wrapperu:
 * - nastaví výchozí oprávnění (RBAC) přes `permissions` (`oneOfRoles`, `mode`)
 * - nastaví výchozí mutaci pro vytvoření entity (`mutationAsyncAction`)
 * - umožní vyměnit dialog a obsah formuláře (`CreateDialog`, `DefaultContent`)
 * - určí kam se má po úspěšném vytvoření navigovat (`readItemURI`)
 * - předá výchozí `item` pro nový záznam
 *
 * Zobrazí tlačítko a po jeho stisku otevře dialog, při volbě OK dochází k odeslání mutace na backend
 *
 * @param {Object} params
 * @param {Function} [params.mutationAsyncAction=MutationAsyncAction]
 *   Async action (thunk) pro vytvoření entity (např. InsertAsyncAction). Používá ho Base/General logika.
 *
 * @param {React.ComponentType<Object>} [params.CreateDialog=CreateDialog]
 *   Komponenta dialogu použitá pro vytvoření (renderuje formulář a volá `onOk(draft)` / `onCancel()`).
 *
 * @param {React.ComponentType<Object>} [params.DefaultContent=DefaultContent]
 *   Komponenta, která vykreslí editable obsah formuláře (typicky MediumEditableContent).
 *
 * @param {string} [params.readItemURI=ReadItemURI]
 *   URI pattern pro navigaci na detail nově vytvořené entity (obvykle obsahuje `:id`).
 *
 * @param {Object} [params.rbacitem]
 *   RBAC item pro PermissionGate/Permission check (pokud se liší od entity, která se vytváří).
 *
 * @param {Object} [params.item=defaultitem]
 *   Výchozí objekt (draft) pro nový záznam. Posílá se do dialogu jako `item`.
 *
 * @param {Object} params.props
 *   Všechny další props jsou přeposlány přímo do `BaseCreateButton`
 *   (typicky `children`, `className`, `disabled`, `title`, atd.).
 *
 * @returns {JSX.Element} Vykreslí `BaseCreateButton` s přednastavenými defaulty a RBAC oprávněními.
 */
export const CreateButton = ({
    readItemURI=ReadItemURI,
    rbacitem,
    item=defaultitem,
    children,
    ...props
}) => {
    const [visible, setVisible] = useState(false);
    const navigate = useNavigate();

    const handleShow = useCallback(() => setVisible(true), []);
    const handleHide = useCallback(() => setVisible(false), []);

    const handleOk = useCallback((createdItem) => {
        handleHide();
        // Navigate to the created subject
        if (readItemURI && createdItem?.id) {
            navigate(readItemURI.replace(':id', createdItem.id));
        }
    }, [handleHide, navigate, readItemURI]);

    const handleCancel = useCallback(() => {
        handleHide();
    }, [handleHide]);

    return (
        <PermissionGate oneOfRoles={permissions.oneOfRoles} mode={permissions.mode} item={rbacitem}>
            <button {...props} onClick={handleShow}>
                {children || "Vytvořit nový"}
            </button>
            {visible && (
                <CreateDialog
                    onOk={handleOk}
                    onCancel={handleCancel}
                    item={item}
                />
            )}
        </PermissionGate>
    );
}

/**
 * Vlastní CreateDialog pro Subject s podporou semestrů.
 *
 * DŮLEŽITÉ: Tato komponenta má vlastní implementaci pro správu semestrů.
 * - Podporuje přidávání/odebírání semestrů v dialogu
 * - Validuje, že je vybrán program před uložením
 * - Po vytvoření subjektu automaticky vytvoří všechny přidané semestry
 *
 * @param {Object} params
 * @param {string} [params.title="Nový předmět"]
 * @param {Function} params.onOk - Callback volaný po úspěšném vytvoření (dostane hotový item se semestry)
 * @param {Function} params.onCancel - Callback pro zrušení dialogu
 * @param {Object} [params.item] - Výchozí objekt pro nový záznam
 */
export const CreateDialog = ({
    title = "Nový předmět",
    onOk,
    onCancel,
    item,
    ...props
}) => {
    const dispatch = useDispatch();
    const gqlClient = useGQLClient();

    // Initialize draft with ID and empty semesters
    const [draftItem, setDraftItem] = useState(() => ({
        id: crypto.randomUUID(),
        name: "Nový",
        semesters: [],
        ...item
    }));

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    // Handle field changes
    const handleChange = useCallback((e) => {
        const fieldId = e?.target?.id || e?.target?.name;
        const value = e?.target?.value;
        if (!fieldId) {
            console.warn("CreateDialog.handleChange: no field id", e);
            return;
        }
        setDraftItem(prev => ({ ...prev, [fieldId]: value }));
    }, []);

    const handleBlur = useCallback((e) => {
        handleChange(e);
    }, [handleChange]);

    // Handle semester changes
    const handleSemestersChange = useCallback((newSemesters) => {
        setDraftItem(prev => ({ ...prev, semesters: newSemesters }));
    }, []);

    // Handle OK - create subject and semesters
    const handleOk_ = useCallback(async () => {
        // Validate programId
        if (!draftItem.programId) {
            setError(new Error('Musíte vybrat program'));
            return;
        }

        setSaving(true);
        setError(null);

        try {
            // 1. Create the subject first
            const subjectResponse = await dispatch(InsertAsyncAction(draftItem, gqlClient));
            const subjectResult = subjectResponse?.data?.subjectInsert || subjectResponse?.subjectInsert || subjectResponse;

            // Check for error
            if (subjectResult?.failed === true || subjectResult?.__typename?.includes('Error')) {
                throw new Error(subjectResult?.msg || 'Nepodařilo se vytvořit předmět');
            }

            const subjectId = subjectResult?.id || draftItem.id;

            // 2. Create all semesters that have _action: 'create'
            const semestersToCreate = (draftItem.semesters || []).filter(s => s._action === 'create');

            for (const semester of semestersToCreate) {
                const semesterResponse = await dispatch(SemesterInsertAsyncAction({
                    id: semester.id,
                    subjectId: subjectId,
                    order: semester.order
                }, gqlClient));

                const semesterResult = semesterResponse?.data?.semesterInsert || semesterResponse?.semesterInsert || semesterResponse;

                if (semesterResult?.failed === true || semesterResult?.__typename?.includes('Error')) {
                    console.error('Failed to create semester:', semesterResult?.msg);
                }
            }

            // 3. Call onOk with the result
            if (onOk) {
                onOk({ ...draftItem, id: subjectId });
            }
        } catch (err) {
            setError(err);
        } finally {
            setSaving(false);
        }
    }, [draftItem, dispatch, gqlClient, onOk]);

    // Check if OK button should be disabled
    const isOkDisabled = saving || !draftItem.programId;

    return (
        <Dialog
            title={title}
            oklabel={saving ? "Ukládám..." : "Ok"}
            cancellabel="Zrušit"
            onCancel={onCancel}
            onOk={handleOk_}
            okDisabled={isOkDisabled}
            {...props}
        >
            <DefaultContent
                item={draftItem}
                onChange={handleChange}
                onBlur={handleBlur}
                onSemestersChange={handleSemestersChange}
            />
            {!draftItem.programId && (
                <div className="alert alert-warning mt-2">
                    Pro vytvoření předmětu musíte vybrat program.
                </div>
            )}
            {error && (
                <div className="alert alert-danger mt-2">
                    {error?.message || "Chyba při ukládání"}
                </div>
            )}
        </Dialog>
    );
};

/**
 * Wrapper nad `BaseCreateBody` (alias importu `CreateBody` z Base/Mutations/Create),
 * který je odvozený z obecných `General*` komponent.
 *
 * `CreateBody` typicky reprezentuje "page-level" create workflow (ne jen tlačítko + modal):
 * - vykreslí create formulář pomocí `DefaultContent`
 * - zajistí uložení přes `mutationAsyncAction` (dle Base/General implementace)
 * - po úspěchu může navigovat na detail vytvořené entity přes `readItemURI` (pokud Base/General takto funguje)
 *
 * Wrapper pouze nastavuje defaulty a přeposílá props do `BaseCreateBody`.
 *
 * Vizualizuje <DefaultContent />, sbira zmeny a umoznuje volani backendu pro ulozeni dat
 *
 * DŮLEŽITÉ: Tato komponenta má vlastní implementaci pro správu semestrů.
 * Po vytvoření subjektu automaticky vytvoří všechny přidané semestry.
 *
 * @param {Object} params
 * @param {Function} [params.mutationAsyncAction=MutationAsyncAction]
 *   Async action (thunk) pro vytvoření entity (např. InsertAsyncAction). Používá ho Base/General logika.
 *
 * @param {React.ComponentType<Object>} [params.DefaultContent=DefaultContent]
 *   Komponenta, která vykreslí editable obsah formuláře (typicky MediumEditableContent).
 *
 * @param {string} [params.readItemURI=ReadItemURI]
 *   URI pattern pro navigaci na detail nově vytvořené entity (obvykle obsahuje `:id`).
 *
 * @param {Object} params.props
 *   Všechny další props jsou přeposlány přímo do `BaseCreateBody`
 *   (typicky `title`, `oklabel`, `cancellabel`, `onOk`, `onCancel`, `className`, atd.).
 *
 * @returns {JSX.Element} Vykreslí vlastní CreateBody s podporou semestrů.
 */
export const CreateBody = ({
    mutationAsyncAction=MutationAsyncAction,
    DefaultContent:DefaultContent_=DefaultContent,
    readItemURI=ReadItemURI,
    rbacitem,
    onOk,
    onCancel,
    ...props
}) => {
    return (
        <PermissionGate oneOfRoles={permissions.oneOfRoles} mode={permissions.mode} item={rbacitem}>
            <CreateBodyWithSemesters
                mutationAsyncAction={mutationAsyncAction}
                DefaultContent={DefaultContent_}
                readItemURI={readItemURI}
                onOk={onOk}
                onCancel={onCancel}
                {...props}
            />
        </PermissionGate>
    );
};

/**
 * Interní komponenta pro vytváření subjektu s podporou semestrů.
 */
const CreateBodyWithSemesters = ({
    mutationAsyncAction=MutationAsyncAction,
    DefaultContent: DefaultContent_=DefaultContent,
    readItemURI=ReadItemURI,
    onOk,
    onCancel,
    ...props
}) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const gqlClient = useGQLClient();

    // Initial draft state with generated ID
    const initialDraft = useMemo(() => ({
        id: crypto.randomUUID(),
        name: "Nový",
        semesters: []
    }), []);

    const [draft, setDraft] = useState(initialDraft);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    // Handle field changes
    const handleChange = useCallback((e) => {
        // Support both 'name' and 'id' attributes (ProgramSelect uses 'id')
        const fieldName = e.target.name || e.target.id;
        const value = e.target.value;
        setDraft(prev => ({ ...prev, [fieldName]: value }));
    }, []);

    // Handle blur (for compatibility)
    const handleBlur = useCallback(() => {
        // No-op in create mode
    }, []);

    // Handle semester changes
    const handleSemestersChange = useCallback((newSemesters) => {
        setDraft(prev => ({ ...prev, semesters: newSemesters }));
    }, []);

    // Handle cancel
    const handleCancel = useCallback(async () => {
        if (onCancel) {
            await onCancel();
            return;
        }
        navigate(-1);
    }, [navigate, onCancel]);

    // Handle confirm - create subject and then semesters
    const handleConfirm = useCallback(async () => {
        setSaving(true);
        setError(null);

        console.log('CreateBodyWithSemesters: handleConfirm called');
        console.log('CreateBodyWithSemesters: draft =', draft);
        console.log('CreateBodyWithSemesters: draft.semesters =', draft.semesters);

        try {
            // 1. Create the subject first
            const subjectResponse = await dispatch(mutationAsyncAction(draft, gqlClient));
            const subjectResult = subjectResponse?.data?.subjectInsert || subjectResponse?.subjectInsert || subjectResponse;

            console.log('CreateBodyWithSemesters: subjectResponse =', subjectResponse);
            console.log('CreateBodyWithSemesters: subjectResult =', subjectResult);

            // Check for error
            if (subjectResult?.failed === true || subjectResult?.__typename?.includes('Error')) {
                throw new Error(subjectResult?.msg || 'Nepodařilo se vytvořit předmět');
            }

            const subjectId = subjectResult?.id || draft.id;
            console.log('CreateBodyWithSemesters: subjectId =', subjectId);

            // 2. Create all semesters that have _action: 'create'
            const semestersToCreate = (draft.semesters || []).filter(s => s._action === 'create');
            console.log('CreateBodyWithSemesters: semestersToCreate =', semestersToCreate);

            for (const semester of semestersToCreate) {
                console.log('CreateBodyWithSemesters: Creating semester =', semester);
                const semesterResponse = await dispatch(SemesterInsertAsyncAction({
                    id: semester.id,
                    subjectId: subjectId,
                    order: semester.order
                }, gqlClient));

                console.log('CreateBodyWithSemesters: semesterResponse =', semesterResponse);
                const semesterResult = semesterResponse?.data?.semesterInsert || semesterResponse?.semesterInsert || semesterResponse;

                // Check for error (but don't fail the whole operation)
                if (semesterResult?.failed === true || semesterResult?.__typename?.includes('Error')) {
                    console.error('Failed to create semester:', semesterResult?.msg);
                }
            }

            // 3. Navigate to the created subject or call onOk
            if (onOk) {
                await onOk(subjectResult, draft);
            } else if (readItemURI && navigate) {
                navigate(readItemURI.replace(":id", subjectId), { replace: true });
            }

            return subjectResult;
        } catch (err) {
            setError(err);
            return null;
        } finally {
            setSaving(false);
        }
    }, [dispatch, draft, gqlClient, mutationAsyncAction, navigate, onOk, readItemURI]);

    return (
        <>
            <DefaultContent_
                item={draft}
                onChange={handleChange}
                onBlur={handleBlur}
                onSemestersChange={handleSemestersChange}
                {...props}
            >
                <AsyncStateIndicator error={error} loading={saving} />

                <button
                    className="btn btn-warning form-control"
                    onClick={handleCancel}
                    disabled={saving}
                >
                    Zrušit změny
                </button>

                <button
                    className="btn btn-primary form-control"
                    onClick={handleConfirm}
                    disabled={saving}
                >
                    {saving ? (
                        <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                            Ukládám...
                        </>
                    ) : "Uložit změny"}
                </button>
            </DefaultContent_>
        </>
    );
};

