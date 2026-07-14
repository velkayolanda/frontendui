/** @module Mutations */
import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { DeleteItemURI, ListURI, MediumContent, VectorItemsURI } from "../Components";
import { DeleteAsyncAction, SemesterDeleteAsyncAction } from "../Queries";
import {
    DeleteBody as BaseDeleteBody,
    DeleteButton as BaseDeleteButton,
    DeleteDialog as BaseDeleteDialog,
    DeleteLink as BaseDeleteLink
} from "../../../../_template/src/Base/Mutations/Delete";
import { PermissionGate } from "../../../../dynamic/src/Hooks/useRoles";
import { useGQLClient } from "../../../../dynamic/src/Store/RootProviders";
import { Dialog } from "../../../../_template/src/Base/FormControls/Dialog";

const DefaultContent = MediumContent
const MutationAsyncAction = DeleteAsyncAction

const permissions = {
    oneOfRoles: ["administrátor"], // odemčeno pro všechny uživatele
    mode: "absolute",
}

/**
 * Link na delete route pro konkrétní entitu.
 *
 * Wrapper nad `BaseDeleteLink`. Nastavuje výchozí `uriPattern` pro delete route a aplikuje RBAC
 * přes `permissions`. Ostatní props přeposílá do Base komponenty.
 *
 * @param {Object} params
 * @param {string} [params.uriPattern=DeleteItemURI]
 *   URI pattern pro delete route (typicky obsahuje `:id` nebo odpovídá routování aplikace).
 * @param {Object} params.props
 *   Další props přeposílané do `BaseDeleteLink` (např. `children`, `className`,
 *   `preserveSearch`, `preserveHash`, atd.).
 *
 * @returns {JSX.Element}
 */
export const DeleteLink = ({ 
    uriPattern=DeleteItemURI,
    ...props
 }) => {
    return (
        <BaseDeleteLink 
            {...props} 
            uriPattern={uriPattern} 
            {...permissions}
        />
    )
};

/**
 * Tlačítko pro smazání entity Subject včetně všech semestrů.
 *
 * DŮLEŽITÉ: Tato komponenta nejdřív smaže všechny semestry subjektu
 * a pak smaže samotný subjekt, aby se vyhnula foreign key chybám.
 *
 * @param {Object} params
 * @param {string} [params.vectorItemsURI=ListURI]
 *   URI pro návrat po úspěšném smazání.
 * @param {Object} params.item
 *   Subjekt ke smazání (musí obsahovat id, lastchange a semesters).
 * @param {Object} params.rbacitem
 *   RBAC item pro permission check.
 * @param {Function} [params.onOk]
 *   Callback po úspěšném smazání.
 * @param {React.ReactNode} [params.children]
 *   Obsah tlačítka.
 */
export const DeleteButton = ({
    vectorItemsURI = ListURI,
    item,
    rbacitem,
    onOk,
    children,
    ...props
}) => {
    const [visible, setVisible] = useState(false);
    const navigate = useNavigate();

    const handleShow = useCallback(() => setVisible(true), []);
    const handleHide = useCallback(() => setVisible(false), []);

    const handleOk = useCallback(() => {
        handleHide();
        if (onOk) {
            onOk();
        } else if (vectorItemsURI) {
            navigate(vectorItemsURI);
        }
    }, [handleHide, navigate, onOk, vectorItemsURI]);

    const handleCancel = useCallback(() => {
        handleHide();
    }, [handleHide]);

    return (
        <PermissionGate oneOfRoles={permissions.oneOfRoles} mode={permissions.mode} item={rbacitem}>
            <button {...props} onClick={handleShow}>
                {children || "Smazat"}
            </button>
            {visible && (
                <DeleteDialog
                    item={item}
                    onOk={handleOk}
                    onCancel={handleCancel}
                    vectorItemsURI={vectorItemsURI}
                />
            )}
        </PermissionGate>
    );
}

/**
 * Confirm dialog pro smazání entity Subject včetně všech semestrů.
 *
 * DŮLEŽITÉ: Tento dialog nejdřív smaže všechny semestry a pak subjekt.
 *
 * @param {Object} params
 * @param {Object} params.item - Subjekt ke smazání (musí obsahovat id, lastchange a semesters)
 * @param {Function} params.onOk - Callback po úspěšném smazání
 * @param {Function} params.onCancel - Callback pro zrušení
 */
export const DeleteDialog = ({
    item,
    onOk,
    onCancel,
    ...props
}) => {
    const dispatch = useDispatch();
    const gqlClient = useGQLClient();

    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState(null);

    const semesterCount = item?.semesters?.length || 0;

    const handleDelete = useCallback(async () => {
        setDeleting(true);
        setError(null);

        try {
            // 1. Delete all semesters first
            const semesters = item?.semesters || [];
            for (const semester of semesters) {
                if (!semester.lastchange) {
                    console.warn('Semester missing lastchange, skipping:', semester.id);
                    continue;
                }

                const semesterResponse = await dispatch(SemesterDeleteAsyncAction({
                    id: semester.id,
                    lastchange: semester.lastchange
                }, gqlClient));

                const semesterResult = semesterResponse?.data?.semesterDelete || semesterResponse?.semesterDelete || semesterResponse;

                // Check for foreign key error (semester has classifications)
                if (semesterResult?.failed === true) {
                    if (semesterResult?.msg?.includes('ForeignKey') ||
                        semesterResult?.msg?.includes('foreign key') ||
                        semesterResult?.msg?.includes('still referenced')) {
                        throw new Error(`Nelze smazat semestr #${semester.order} - obsahuje klasifikace nebo jiná data. Nejdříve odstraňte všechna data ze semestru.`);
                    }
                    throw new Error(semesterResult?.msg || 'Nepodařilo se smazat semestr');
                }
            }

            // 2. Delete the subject
            const subjectResponse = await dispatch(DeleteAsyncAction({
                id: item.id,
                lastchange: item.lastchange
            }, gqlClient));

            const subjectResult = subjectResponse?.data?.subjectDelete || subjectResponse?.subjectDelete || subjectResponse;

            // Check for error
            if (subjectResult?.failed === true) {
                throw new Error(subjectResult?.msg || 'Nepodařilo se smazat předmět');
            }

            // Success - call onOk
            if (onOk) {
                onOk();
            }
        } catch (err) {
            setError(err);
        } finally {
            setDeleting(false);
        }
    }, [dispatch, gqlClient, item, onOk]);

    return (
        <Dialog
            title="Smazat předmět"
            oklabel={deleting ? "Mažu..." : "Smazat"}
            cancellabel="Zrušit"
            onOk={handleDelete}
            onCancel={onCancel}
            okDisabled={deleting}
            {...props}
        >
            <div className="mb-3">
                <p>Opravdu chcete smazat předmět <strong>{item?.name}</strong>?</p>

                {semesterCount > 0 && (
                    <div className="alert alert-warning">
                        <strong>Upozornění:</strong> Tento předmět obsahuje {semesterCount} {semesterCount === 1 ? 'semestr' : semesterCount < 5 ? 'semestry' : 'semestrů'}.
                        {' '}Všechny semestry budou také smazány.

                        <div className="mt-2 small">
                            Pokud některý semestr obsahuje klasifikace nebo jiná data, smazání se nepodaří.
                        </div>
                    </div>
                )}
            </div>

            {error && (
                <div className="alert alert-danger">
                    {error?.message || "Chyba při mazání"}
                </div>
            )}
        </Dialog>
    );
}

/**
 * “Page-level” delete workflow (mazání na celé stránce / v těle stránky).
 *
 * Wrapper nad `BaseDeleteBody`. Dodává výchozí `DefaultContent`, `mutationAsyncAction`
 * a `vectorItemsURI` a aplikuje RBAC přes `permissions`.
 *
 * @param {Object} params
 * @param {Function} [params.mutationAsyncAction=MutationAsyncAction]
 *   Async action (thunk) pro delete operaci (např. DeleteAsyncAction).
 *
 * @param {React.ComponentType<Object>} [params.DefaultContent=MediumContent]
 *   Komponenta pro zobrazení mazáné entity (read-only).
 *
 * @param {string} [params.vectorItemsURI=ListURI]
 *   URI pro návrat po úspěšném smazání (typicky list stránka / kolekce).
 *
 * @param {Object}} params.props
 *   Další props přeposílané do `BaseDeleteBody` (např. `title`, `oklabel`, `cancellabel`,
 *   `item`, `onOk`, `onCancel`, atd.).
 *
 * @returns {JSX.Element}
 */
export const DeleteBody = ({ 
    mutationAsyncAction=MutationAsyncAction,
    DefaultContent:DefaultContent_=DefaultContent,
    vectorItemsURI=ListURI,
    ...props
}) => {
    return (
        <BaseDeleteBody 
            {...props} 
            DefaultContent={DefaultContent_} 
            mutationAsyncAction={mutationAsyncAction}
            vectorItemsURI={vectorItemsURI}
            {...permissions}
        />
    )
}
