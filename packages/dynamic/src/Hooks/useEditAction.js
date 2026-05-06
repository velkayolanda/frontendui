import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAsyncThunkAction } from "./useAsyncThunkAction";

// jednoduchý shallowEqual (stejný jako u vás)
const shallowEqual = (a, b) => {
    if (a === b) return true;
    if (!a || !b) return false;
    const ak = Object.keys(a);
    const bk = Object.keys(b);
    if (ak.length !== bk.length) return false;
    for (const k of ak) if (a[k] !== b[k]) return false;
    return true;
};

/**
 * useEditAction
 *
 * @param {Function} AsyncAction - thunk z createAsyncGraphQLAction2(...) (mutation/query)
 * @param {object} vars          - typicky {id} nebo cokoliv, co potřebuje useAsyncThunkAction k entity
 * @param {object} options
 *  - mode: "live" | "confirm"
 *  - delayMs: number (jen pro live)
 *  - deferred, network: předáno do useAsyncThunkAction
 *  - mapDraftToVars: (draft, ctx) => object   // jak převést draft na vars pro run()
 *  - commitOnBlur: boolean (jen pro live; default true)
 */
export const useEditAction = (
    AsyncAction,
    item,
    options = {}
) => {
    const {
        mode = "confirm",
        delayMs = 600,
        // deferred = true,
        // network = true,
        mapDraftToVars,
        commitOnBlur = true,
        onCommit=()=>null,
    } = options;

    if (typeof AsyncAction !== "function") {
        throw new Error("useEditAction: AsyncAction musí být funkce (thunk factory)");
    }

    const { entity, run, loading, error, data } = useAsyncThunkAction(
        AsyncAction,
        item,
        { deferred: true, network: true }
    );

    // baseline = poslední "uložený" stav (primárně z entity)
    const [baseline, setBaseline] = useState(item || {});
    const [draft, setDraft] = useState(item || {});


    // reset lokálního stavu při změně entity (jiné id / refetch / update ze store)
    useEffect(() => {
        const next = item || {};
        setBaseline(next);
        setDraft(next);
    }, [entity]);

    const dirty = useMemo(() => !shallowEqual(draft, baseline), [draft, baseline]);

    // debouncing pro live
    const timerRef = useRef(null);
    const clearTimer = () => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
    };

    useEffect(() => () => clearTimer(), []);

    const toVars = useCallback(
        (d) => {
            if (typeof mapDraftToVars === "function") {
                return mapDraftToVars(d, { entity, item });
            }
            // default: pošli draft jako vars (často stačí, ale můžeš přepsat mapDraftToVars)
            return d;
        },
        [mapDraftToVars, entity, item]
    );

    const commitNow = useCallback(
        async (nextDraft) => {
            console.log("useEditAction commitNow", dirty, nextDraft);
            // posíláme přes run() -> thunk -> gqlClient.request(...)
            const result = await run(toVars(nextDraft));
            // po úspěchu nastav baseline; entity se stejně typicky aktualizuje přes middleware do store
            // setBaseline(nextDraft);
            onCommit(nextDraft, result);
            // setDraft(nextDraft)
            return result;
        },
        [run, toVars]
    );

    const scheduleCommit = useCallback(
        (nextDraft) => {
            // console.log("useEditAction scheduleCommit delayMs", nextDraft, delayMs);
            clearTimer();
            timerRef.current = setTimeout(() => {
                commitNow(nextDraft).catch(() => {
                    // error už je v hook state; nic dalšího tady nedělej
                });
            }, delayMs);
        },
        [commitNow, delayMs]
    );

    // onChange kompatibilní s vaším stylem (input event / nebo celý objekt v target.value)
    const onChange = useCallback(
        (e) => {
            const fieldId = e?.target?.id;
            const value = e?.target?.value;

            let nextDraft;
            if (fieldId) {
                nextDraft = { ...(draft || {}), [fieldId]: value };
            } else if (value && typeof value === "object") {
                nextDraft = value;
            } else {
                nextDraft = draft;
            }

            setDraft(nextDraft);

            if (mode === "live") {
                scheduleCommit(nextDraft);
            }
        },
        [draft, mode, scheduleCommit]
    );

    const onBlur = useCallback(async () => {
        if (mode !== "live" || !commitOnBlur) return null;
        clearTimer();
        if (!dirty) return null;
        return commitNow(draft);
    }, [mode, commitOnBlur, dirty, draft, commitNow]);

    const onCancel = useCallback(() => {
        clearTimer();
        setDraft(baseline || {});
    }, [baseline]);

    const onConfirm = useCallback(async () => {
        clearTimer();
        if (!dirty) return null;
        return commitNow(draft);
    }, [dirty, draft, commitNow]);

    return {
        // data
        entity, // the latest entity from useAsyncThunkAction
        baseline, // last saved state
        draft, // current edited state
        setDraft, // direct draft setter

        // state
        dirty,
        loading,
        error,
        data,

        // handlers
        onChange,
        onBlur,
        onCancel,
        onConfirm,

        // low-level
        run,        // kdybys chtěl ruční override
        commitNow,  // immediate commit draft
    };
};