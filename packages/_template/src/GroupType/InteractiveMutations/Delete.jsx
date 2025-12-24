import { useNavigate } from "react-router";
import { useGQLEntityContext } from "../../Base/Helpers/GQLEntityProvider";
import { AbsolutePermissionGate, useRoles as useRolePermission } from "../../../../dynamic/src/Hooks/useRoles"
import { useEditAction } from "../../../../dynamic/src/Hooks/useEditAction";
import { LinkURI, MediumEditableContent } from "../Components";
import { Row } from "../../Base/Components/Row";
import { Col } from "../../Base/Components/Col";
import { Dialog, LoadingSpinner } from "@hrbolek/uoisfrontend-shared";
import { DeleteAsyncAction } from "../Queries";
import { AsyncStateIndicator } from "../../Base/Helpers/AsyncStateIndicator";
import { useState } from "react";
import { useCallback } from "react";
import { VectorItemsURI } from "../Pages";

export const DeleteURI = LinkURI.replace('view', 'delete')


export const DeleteLink = ({ item, preserveHash = true, preserveSearch = true, ...props }) => {
    const to = useMemo(() => {
        const id = item?.id ?? "";
        return DeleteURI.replace(":id", String(id));
    }, [item?.id]);

    return (
        <AbsolutePermissionGate roles={["superadmin"]}>
            <ProxyLink
                to={to}
                preserveHash={preserveHash}
                preserveSearch={preserveSearch}
                {...props}
            />
        </AbsolutePermissionGate>
    );
};

export const DeleteBody = ({ children, mutationAsyncAction = DeleteAsyncAction }) => {
    const navigate = useNavigate();
    const { item } = useGQLEntityContext()
    // const { can, roleNames } = useRolePermission(item, ["administrátor"])
    const { loading, allowed, error } = useAbsoluteRoles(["superadmin"]);
    const {
        draft,
        dirty,
        loading: saving,
        error: savingError,
        onChange,
        onBlur,
        commitNow
    } = useEditAction(mutationAsyncAction, item, {
        mode: "confirm",
        // onCommit: contextOnChange
    })

    const handleConfirm = async () => {
        const result = await commitNow(draft)
        console.log("handleConfirm", result)

        if (navigate) {
            const link = VectorItemsURI
            navigate(link, { replace: true })
        }
    }

    const handleCancel = () => {
        navigate(-1)
    }

    if (!item) return null

    return (
        <div>
            <AsyncStateIndicator error={error} loading={loading} text="Ověřuji oprávnění..." />
            {!allowed && (
                <div>
                    <h1>
                        Nemáte oprávnění
                    </h1>
                    {/* <pre>{JSON.stringify(roleNames)}</pre> */}
                </div>
            )}
            {allowed && (
                <Row>
                    <Col></Col>
                    <Col>
                        <MediumEditableContent item={draft} onChange={onChange} onBlur={onBlur} >
                            <AsyncStateIndicator error={savingError} loading={saving} text={"Ukládám"} />
                            {children}
                            <button
                                className="btn btn-warning form-control"
                                onClick={handleCancel}
                            // disabled={!dirty || saving}
                            >
                                Zrušit
                            </button>
                            <button
                                className="btn btn-primary form-control"
                                onClick={handleConfirm}
                            // disabled={!dirty || saving}
                            >
                                Smazat
                            </button>

                        </MediumEditableContent>
                    </Col>
                    <Col></Col>
                </Row>
            )}
        </div>

    )
}

export const DeleteButton = ({ children, ...props }) => {
    // const { can, roleNames } = useRoles(item, ["superadmin"])
    // const { follow } = useLink({to: VectorItemsURI})
    const [visible, setVisible] = useState(false)
    const handleOkClick = () => {
        setVisible(false)
        // follow()
    }
    const handleCancelClick = () => {
        setVisible(false)
    }

    return (
        <AbsolutePermissionGate roles={["superadmin"]} >
            <button {...props} onClick={handleOkClick}>{children || "Editovat"}</button>
            {visible && <DeleteDialog onOk={handleOkClick} onCancel={handleCancelClick} />}
        </AbsolutePermissionGate>
    )
}

export const DeleteDialog = ({
    title = "Odstranit",
   
    oklabel = "Odstranit",
    cancellabel = "Zrušit",
    onOk: handleOk,
    onCancel: handleCancel,
}) => {
    const { item, onChange: contextOnChange } = useGQLEntityContext()
    const {
        onCancel,
        commitNow,
        error,
        loading: saving
    } = useEditAction(DeleteAsyncAction, item, { mode: "confirm" })

    const handleCancel_ = useCallback(async () => {
        onCancel()
        handleCancel()
    }, [onCancel, handleCancel])

    const handleConfirm = useCallback(async () => {
        const result = await commitNow();
        handleOk()
        return result;
    }, [commitNow, contextOnChange]);
    
    return (
        <Dialog
            title={title}
            oklabel={oklabel}
            cancellabel={cancellabel}
            onCancel={handleCancel_}
            onOk={handleConfirm}
        >
            <AsyncStateIndicator error={error} loading={saving} text={"Odstraňuji"} />
            <MediumEditableContent item={item} onChange={onChange} onBlur={onBlur} />
        </Dialog>
    )
}