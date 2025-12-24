import { AbsolutePermissionGate, useRoles as useRolePermission } from "../../../../dynamic/src/Hooks/useRoles"
import { LinkURI, MediumEditableContent } from "../Components"
import { useState } from "react"
import { Dialog } from "@hrbolek/uoisfrontend-shared"
import { ReadItemURI } from "../Pages/PageReadItem"
import { useCreateSession } from "../../../../dynamic/src/Hooks/useCreateSession"
import { InsertAsyncAction } from "../Queries"
import { AsyncStateIndicator } from "../../Base/Helpers/AsyncStateIndicator"

export const CreateURI = LinkURI.replace('view', 'create')

export const CreateLink = (props) => (
    <AbsolutePermissionGate roles={["superadmin"]}>
        <ProxyLink to={CreateURI} {...props}>Create</ProxyLink>
    </AbsolutePermissionGate>
);

export const CreateButton = ({ children, ...props }) => {
    const [visible, setVisible] = useState(false)
    const handleClick = () => {
        setVisible(prev => !prev)
    }

    return (
        <AbsolutePermissionGate roles={["superadmin"]} >
            <button {...props} onClick={handleClick}>{children || "Vytvořit nový"}</button>
            {visible && (
                <CreateDialog 
                    onOk={handleClick} 
                    onCancel={handleClick} 
                />
            )}
        </AbsolutePermissionGate>
    )
}

export const CreateDialog = ({
    title = "Editace",
    oklabel = "Ok",
    cancellabel = "Zrušit",
    mutationAsyncAction = InsertAsyncAction,
    onOk,
    onCancel,
    children,
    ...props
}) => {
    const session = useCreateSession({
        readUri: ReadItemURI,
        mutationAsyncAction,
        onAfterConfirm: async (result) => {
            if (onOk) onOk(result);
        },
        onAfterCancel: async () => {
            if (onCancel) onCancel();
        },
    });

    return (
        <Dialog
            title={title}
            oklabel={oklabel}
            cancellabel={cancellabel}
            onCancel={session.handleCancel}
            onOk={session.handleConfirm}
            {...props}
        >
            <AsyncStateIndicator error={session.error} loading={session.saving} />
            <MediumEditableContent item={session.draft} onChange={session.onChange} onBlur={session.onBlur}>
                {children}
            </MediumEditableContent>
        </Dialog>
    );
};

export const CreateBody = ({
    children,
    mutationAsyncAction = InsertAsyncAction,
    onOk,
    onCancel,
    ...props
}) => {
    const session = useCreateSession({
        readUri: ReadItemURI,
        mutationAsyncAction,
        onAfterConfirm: async (result, draft) => {
            if (onOk) return onOk(result, draft);
            // když onOk není, session udělá default navigaci
        },
        onAfterCancel: async () => {
            if (onCancel) return onCancel();
            // když onCancel není, session udělá default navigate(-1)
        }
    });

    return (
        <MediumEditableContent
            item={session.draft}
            onChange={session.onChange}
            onBlur={session.onBlur}
            {...props}
        >
            <AsyncStateIndicator error={session.error} loading={session.saving} />
            {children}

            <button
                className="btn btn-warning form-control"
                onClick={session.handleCancel}
            // disabled={!session.dirty || session.saving}
            >
                Zrušit změny
            </button>

            <button
                className="btn btn-primary form-control"
                onClick={session.handleConfirm}
            // disabled={!session.dirty || session.saving}
            >
                Uložit změny
            </button>
        </MediumEditableContent>
    );
};

