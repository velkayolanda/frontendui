import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCallback } from "react";
import { useState } from "react";

import { Lock } from "react-bootstrap-icons"

import { useAsyncThunkAction } from "../../../../dynamic/src/Hooks";
import { MediumEditableContent } from "../Components";
import { Dialog } from "../FormControls/Dialog";
import { PermissionGate, usePermissionGateContext } from "../../../../dynamic/src/Hooks/useRoles";
import { AsyncStateIndicator } from "../Helpers/AsyncStateIndicator";
import { ProxyLink } from "../Components/ProxyLink";

const DefaultContent = (props) => <MediumEditableContent {...props} />
// const DummyAsyncAction = (vars, gqlClient) => async (dispatch, getState) => {}
const safeId = () => (
    globalThis.crypto?.randomUUID?.() ??
  `${Date.now()}-${Math.random().toString(16).slice(2)}`);


export const GeneralLink = ({
    rbacitem = {},
    oneOfRoles=["superadmin"],
    mode="absolute",
    uriPattern,
    children,
    ...props
}) => (
    <PermissionGate oneOfRoles={oneOfRoles} mode={mode} item={rbacitem}>
        <GeneralLinkBody
            uriPattern={uriPattern}
            children={children}
            {...props}
        />
    </PermissionGate>
);

const GeneralLinkBody = ({
    uriPattern,
    children,
    ...props
}) => {
    const { allowed } = usePermissionGateContext()
    if (allowed) {
        return (
            <ProxyLink to={uriPattern} {...props}>{children || "Vytvořit"}</ProxyLink>
        );
    } else {
        return (
            <ProxyLink 
                to={uriPattern} 
                disabled={true}
                {...props}
            >
                <Lock /> {children || "Vytvořit"}
            </ProxyLink>
        )
    }
}

export const GeneralButton = ({
    children,
    rbacitem,
    mutationAsyncAction,
    oneOfRoles=["superadmin"],
    mode="absolute",
    Dialog: Dialog_,
    DefaultContent: DefaultContent_=DefaultContent,
    onOk: handleOk,
    onCancel: handleCancel,
    uriPattern,
    item,
    ...props 
}) => {
    if (typeof mutationAsyncAction !== "function")
        throw Error("GeneralButton.mutationAsyncAction cannot be undefined")

    return (
        <PermissionGate oneOfRoles={oneOfRoles} mode={mode} item={rbacitem}>
            {/* {handleOk && <>O</>} */}
            {/* {JSON.stringify(item)} */}
            <GeneralButtonBody 
                children={children}
                mutationAsyncAction={mutationAsyncAction}
                Dialog={Dialog_}
                DefaultContent={DefaultContent_}
                item={item}
                uriPattern={uriPattern}
                rbacitem={rbacitem}
                onOk={handleOk}
                onCancel={handleCancel}
                title={JSON.stringify(oneOfRoles)}
                {...props}
            />
        </PermissionGate>
    )
}

export const GeneralDialog = ({
    title = "Nov(é/ý/á)",
    oklabel = "Ok",
    cancellabel = "Zrušit",
    onOk: handleOk,
    onCancel: handleCancel,
    DefaultContent: DefaultContent_ = DefaultContent,
    item,
    children,
    ...props
}) => {

    const [draftItem, setDraftItem] = useState(item);

    useEffect(() => {
        setDraftItem((prev) => {
            console.log("GeneralDialog.useEffect", item)
            const base = item ?? {};
            return { ...base, id: base.id ?? safeId() };
        })
        
    }, [item, setDraftItem])


    const handleChange = useCallback((e) => {
        const fieldId = e?.target?.id;
        const value = e?.target?.value;
        if (!fieldId) {
            console.warn("GeneralDialog.handleChange fired event has no e?.target?.id", e)
            return;
        }
        setDraftItem(prev => ({ ...(prev || {}), [fieldId]: value }))

    }, [setDraftItem])

    const handleBlur = (e) => {
        handleChange(e)
    }

    const handleOk_ = () => handleOk?.(draftItem);

    return (
        <Dialog
            title={title}
            oklabel={oklabel}
            cancellabel={cancellabel}
            onCancel={handleCancel}
            onOk={handleOk_}
            {...props}
        >
            <DefaultContent_ item={draftItem} onChange={handleChange} onBlur={handleBlur}>
                {children}
                
            </DefaultContent_>
                {/* <hr/>
                item: {JSON.stringify(item)}
                <hr/>
                draftItem: {JSON.stringify(draftItem)} */}
        </Dialog>
    );
};


export const GeneralButtonBody = ({ 
    children,
    rbacitem,
    mutationAsyncAction,
    Dialog: Dialog_,
    DefaultContent: DefaultContent_=DefaultContent,
    uriPattern,
    item,
    onOk: handleOk,
    onCancel: handleCancel,
    ...props 
}) => {

    const { allowed } = usePermissionGateContext()

    const [visible, setVisible] = useState(false)
    const handleShow = useCallback(() => setVisible(true), [])
    const handleHide = useCallback(() => setVisible(false), [])

    const {
        loading: saving,
        error,
        // entity,
        run
    } = useAsyncThunkAction(mutationAsyncAction, item, { deferred: true });
    
    const navigate = useNavigate()

    const handleOk_ = useCallback(async (item) => {
        const result = await run(item)
        if (handleOk) {
            handleOk(item)
        } else if (uriPattern) {
            navigate(`${uriPattern}`.replace(':id', item.id))
        }
        handleHide()
    }, [handleHide, handleOk, navigate, uriPattern, run])

    const handleCancel_ = useCallback((item) => {
        if (handleCancel) {
            handleCancel(item)
        }
        handleHide()
    }, [handleHide, handleCancel])

    if (allowed) {
        return (
            <>
                <AsyncStateIndicator error={error} loading={saving} text={"Ukládám"} />
                {/* {JSON.stringify(item?.id)} */}
                {/* {props?.onOk && <>O</>} */}
                <button {...props} onClick={handleShow}>{children || "Vytvořit nový"}</button>
                {visible && Dialog_ &&(
                    <Dialog_
                        onOk={handleOk_}
                        onCancel={handleCancel_}
                        mutationAsyncAction={mutationAsyncAction}
                        uriPattern={uriPattern}
                        item={item}
                    />
                )}
                {visible && !Dialog_ && (
                    <Dialog
                        onOk={handleOk_}
                        onCancel={handleCancel_}
                        mutationAsyncAction={mutationAsyncAction}
                        DefaultContent={DefaultContent_}
                        uriPattern={uriPattern}
                        item={item}
                    />
                )}
            </>
        )    
    } else {
        const {title, onClick, ...others} = props
        return (
            <button {...others} title={title} style={{ opacity: 0.5, pointerEvents: "auto" }}><Lock /> {children || "Vytvořit nový"}</button>
        )

    }
}