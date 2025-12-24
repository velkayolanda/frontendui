import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEditAction } from "./useEditAction";

/**
 * @param {{
 *  mutationAsyncAction: any,
 *  initialItem?: object,
 *  onAfterConfirm?: (result: any, draft: any) => (void|Promise<void>),
 *  onAfterCancel?: () => (void|Promise<void>),
 *  readUri?: string,
 *  defaultName?: string
 * }} args
 */
export function useCreateSession({
    mutationAsyncAction,
    initialItem,
    onAfterConfirm,
    onAfterCancel,
    readUri,
    defaultName = "Nový typ",
}) {
    if (!readUri) {
        throw Error("readUri with ':id' must be defined")
    }

    const navigate = useNavigate();

    const baseItem = useMemo(() => {
        return (
            initialItem ?? {
                id: crypto.randomUUID(),
                name: defaultName,
            }
        );
    }, [initialItem, defaultName]);

    const [newItem, setNewItem] = useState(baseItem);

    const {
        draft,
        dirty,
        loading: saving,
        error,
        onChange,
        onBlur,
        onCancel,     // z useEditAction
        commitNow,
    } = useEditAction(mutationAsyncAction, newItem, { mode: "confirm" });

    const handleConfirm = useCallback(async () => {
        const result = await commitNow(draft);

        // připrav další "nový" item (když by uživatel chtěl pokračovat v tvorbě)
        setNewItem((prev) => ({ ...prev, id: crypto.randomUUID() }));

        if (onAfterConfirm) {
            await onAfterConfirm(result, draft);
            // return result;
        }

        // default: navigace na read
        // console.log("going to navigate", readUri, navigate)
        if (readUri && navigate) {
            const newId = result?.id ?? draft?.id;
            if (newId != null) {
                navigate(readUri.replace(":id", `${newId}`), { replace: true });
            }
        }
        return result;
    }, [commitNow, draft, navigate, onAfterConfirm, readUri]);

    const handleCancel = useCallback(async () => {
        onCancel?.();
        if (onAfterCancel) {
            await onAfterCancel();
            // return;
        }
        navigate?.(-1);
    }, [navigate, onAfterCancel, onCancel]);

    return {
        draft,
        dirty,
        saving,
        error,
        onChange,
        onBlur,
        handleConfirm,
        handleCancel,
    };
}
