import { PermissionGate, usePermissionGateContext } from "../../../../dynamic/src/Hooks/useRoles"
import { UpdateAsyncAction } from "../Queries"
import { useEditAction } from "../../../../dynamic/src/Hooks/useEditAction"
import { LinkURI, LiveEdit, MediumEditableContent } from "../Components"
import { useCallback } from "react"
import { useGQLEntityContext } from "../../../../_template/src/Base/Helpers/GQLEntityProvider"
import { useMemo } from "react"
import { AsyncStateIndicator } from "../../../../_template/src/Base/Helpers/AsyncStateIndicator"
import { makeMutationURI } from "./helpers"
import { GeneralButton, GeneralDialog, GeneralLink } from "./General"

export const UpdateURI = makeMutationURI(LinkURI, "edit", { withId: true });

// naviguje na stranku, kde se da udelat update
// testuje opravneni 
// - oneOfRoles = ["superadmin"],
// - mode = "absolute",
// item musi obsahovat rbacobject s rolemi aktualniho uzivatele
export const UpdateLink = ({
    item,
    oneOfRoles = ["superadmin"],
    mode = "absolute",
    uriPattern = UpdateURI,
    children,
    ...props
}) => {
    const to = useMemo(() => {
        const id = item?.id ?? "";
        return uriPattern.replace(":id", String(id));
    }, [uriPattern, item?.id]);

    return (
        <GeneralLink
            rbacitem={item}
            oneOfRoles={oneOfRoles}
            mode={mode}
            uriPattern={to}
            {...props}
        >
            {children}
        </GeneralLink>
    );
};


const DefaultContent = MediumEditableContent

export const UpdateButton = ({
    children,
    item,
    mutationAsyncAction = UpdateAsyncAction,
    oneOfRoles = ["superadmin"],
    mode = "absolute",
    DefaultContent: DefaultContent_ = DefaultContent,
    Dialog = UpdateDialog,
    uriPattern,     // u editace typicky netřeba, ale nechávám možnost
    onOk,
    onCancel,
    ...props
}) => {
    return (
        <GeneralButton
            rbacitem={item}
            oneOfRoles={oneOfRoles}
            mode={mode}
            mutationAsyncAction={mutationAsyncAction}
            Dialog={Dialog}
            DefaultContent={DefaultContent_}
            item={item}
            uriPattern={uriPattern}
            onOk={onOk}
            onCancel={onCancel}
            {...props}
        >
            {children || "Editovat"}
        </GeneralButton>
    );
};

const dummyFunc = () => null
export const UpdateDialog = ({
    title = "Editace",
    oklabel = "Ok",
    cancellabel = "Zrušit",
    DefaultContent: DefaultContent_ = DefaultContent,
    item,      // ⚠️ GeneralButton předává item
    onOk,
    onCancel,
    children,
    ...props
}) => {
    return (
        <GeneralDialog
            title={title}
            oklabel={oklabel}
            cancellabel={cancellabel}
            DefaultContent={DefaultContent_}
            item={item}
            onOk={onOk}
            onCancel={onCancel}
            {...props}
        >
            {children}
        </GeneralDialog>
    );
};


export const UpdateContextDialog = ({
    title = "Editace",
    oklabel = "Ok",
    cancellabel = "Zrušit",
    onOk: handleOk = dummyFunc,
    onCancel: handleCancel = dummyFunc,
    mutationAsyncAction = UpdateAsyncAction,
    DefaultContent: DefaultContent_ = DefaultContent,
    children,
    ...props
}) => {
    const { item, onChange: contextOnChange } = useGQLEntityContext(); // ✅ požadavek

    const {
        loading: saving,
        error,
        run,
    } = useAsyncThunkAction(mutationAsyncAction, item, { deferred: true }); // stejně jako GeneralButtonBody :contentReference[oaicite:3]{index=3}

    const handleOk_ = useCallback(
        async (draft) => {
            const result = await run(draft);

            if (result) {
                // nejčistší je poslat do kontextu "result" (server truth),
                // ale pokud chceš posílat draft, stačí změnit na value: draft
                const event = { target: { value: draft } };
                await contextOnChange(event);
            }

            handleOk(result);
            return result;
        },
        [run, contextOnChange, handleOk]
    );

    const handleCancel_ = useCallback(() => {
        handleCancel();
    }, [handleCancel]);

    if (!item) return null; // nebo <></>

    return (
        <>
            <AsyncStateIndicator error={error} loading={saving} text={"Ukládám"} />
            <GeneralDialog
                title={title}
                oklabel={oklabel}
                cancellabel={cancellabel}
                onOk={handleOk_}
                onCancel={handleCancel_}
                DefaultContent={DefaultContent_}
                item={item}
                {...props}
            >
                {children}
            </GeneralDialog>
        </>
    );
};

export const UpdateBody = ({
    children,
    mutationAsyncAction = UpdateAsyncAction,
    DefaultContent: DefaultContent_ = DefaultContent,
    oneOfRoles = ["superadmin"],
    mode = "absolute"
}) => {
    const { item } = useGQLEntityContext()
    // const { can, roleNames } = useRolePermission(item, ["administrátor"])
    if (!item) return (<>No item</>)
    return (
        <PermissionGate oneOfRoles={oneOfRoles} mode={mode} item={item}>
            <UpdateBodyBody
                item={item}
                mutationAsyncAction={mutationAsyncAction}
                DefaultContent={DefaultContent_}
                children={children}
            />
        </PermissionGate>
    )
}

const UpdateBodyBody = ({
    item,
    children,
    mutationAsyncAction = UpdateAsyncAction,
    DefaultContent: DefaultContent_ = DefaultContent,
}) => {
    const { allowed } = usePermissionGateContext()
    // const { can, roleNames } = useRolePermission(item, ["administrátor"])

    if (allowed) {
        return (<>
            <LiveEdit
                item={item}
                mutationAsyncAction={mutationAsyncAction}
                DefaultContent={DefaultContent_}
            />
            {children}
        </>)
    } else {
        return (<>
            <div>Nemáte oprávnění</div>
        </>)
    }

}

const onDone_ = () => null;

export const UpdateItemConfirm = ({ onDone = onDone_, children }) => {
    const { item, onChange: contextOnChange } = useGQLEntityContext()

    const {
        draft,
        dirty,
        onChange,
        onBlur,
        onCancel,
        onConfirm,
        error,
        loading: saving
    } = useEditAction(UpdateAsyncAction, item, { mode: "confirm" })

    const handleCancel = useCallback(async () => {
        onCancel()
        onDone()
    }, [onDone, onCancel])

    const handleConfirm = useCallback(async () => {
        const result = await onConfirm();
        // console.log("ConfirmEdit handleConfirm result", result, "draft", draft)
        if (result) {
            const event = { target: { value: result } };
            // důležité: použij params z kontextu (provider si je drží jako "poslední vars")
            await contextOnChange(event);
        }
        onDone()
        return result;
    }, [onDone, onConfirm, contextOnChange]);


    return (<>
        <AsyncStateIndicator error={error} loading={saving} text="Ukládám" />
        <DefaultContent item={item} onChange={onChange} onBlur={onBlur} >
            {children}
            <hr />
            {/* <pre>{JSON.stringify(item, null, 2)}</pre> */}
            <button
                className="btn btn-warning form-control"
                onClick={handleCancel}
                disabled={!dirty || saving}
            >
                Zrušit změny
            </button>
            <button
                className="btn btn-primary form-control"
                onClick={handleConfirm}
                disabled={!dirty || saving}
            >
                Uložit změny
            </button>
        </DefaultContent>
    </>
    )
}