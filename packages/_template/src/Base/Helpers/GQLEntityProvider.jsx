import { useContext } from "react";
import { createContext } from "react";
import { useAsyncThunkAction } from "../../../../dynamic/src/Hooks";
import { useState } from "react";
import { CreateDelayer } from "@hrbolek/uoisfrontend-shared";
import { AsyncStateIndicator } from "./AsyncStateIndicator";

const GQLEntityContext = createContext(null);
export const useGQLEntityContext = () => {
    const result = useContext(GQLEntityContext)
    if (result == null) {
        throw new Error("useGQLEntityContext must be used within a GQLEntityProvider")
    }
    return result
}
       

/**
 * Provider, který nad daným `item` spouští asynchronní thunk akci (`queryAsyncAction`)
 * přes `useAsyncThunkAction` a zpřístupňuje stav + handlery potomkům přes `GQLEntityContext`.
 *
 * Kontextová hodnota obsahuje:
 * - `loading`   {boolean}  stav načítání
 * - `error`     {any|null} chyba z posledního volání (pokud nastala)
 * - `reRead`    {Function} funkce pro znovunačtení (alias na `run`)
 * - `item`      {any|null} entita ze storu (typicky `entity` z `useAsyncThunkAction`)
 * - `data`      {any|null} návratová data z thunk akce (typicky `data` z `useAsyncThunkAction`)
 * - `onChange`  {Function} debounced handler pro změnu (volá `run`)
 * - `onBlur`    {Function} alias na `onChange`
 *
 * @component
 *
 * @param {Object} props
 * @param {any} props.item
 *        Vstupní item/vars pro `queryAsyncAction`. Typicky objekt s `{ id }` nebo rovnou entita,
 *        podle toho, jak máš `useAsyncThunkAction`/`queryAsyncAction` postavené.
 *
 * @param {Function} props.queryAsyncAction
 *        Factory pro thunk async akci. Musí být kompatibilní s `useAsyncThunkAction`,
 *        tj. typicky funkce, kterou lze volat jako `queryAsyncAction(vars, client?)`
 *        a která vrací thunk `(dispatch, getState, extra?) => Promise<any>`.
 *
 * @param {Object} [props.options]
 * @param {boolean} [props.options.deferred=false]
 *        Pokud je `false`, hook může spustit první načtení automaticky (podle implementace `useAsyncThunkAction`).
 * @param {boolean} [props.options.network=true]
 *        Pokud je `false`, `run` se nebude provádět (offline režim / vypnutí síťových volání).
 *
 * @param {import('react').ReactNode} props.children
 *        Potomci, kteří budou mít přístup ke kontextu.
 *
 * @returns {import('react').JSX.Element}
 */
export const AsyncActionProvider = ({ 
    item, 
    queryAsyncAction, 
    options={ deferred: false, network: true }, 

    onChange=()=>null,
    onBlur=()=>null,

    children, 
}) => {
    if (queryAsyncAction == null) {
        throw new Error("AsyncActionProvider: queryAsyncAction is required");
    }

    const [contextid] = useState(crypto.randomUUID() || null)
    const { run , error, loading, entity, data } = useAsyncThunkAction(queryAsyncAction, item, options)
    const [delayer] = useState(() => CreateDelayer())
    const [varsState, setVarsState] = useState(item || {});
    const onEvent = (masterEvent) => async (e) => {
        // console.log("AsyncAcionProvider onChange e", contextid, e)
        const value = e?.target?.value
        setVarsState(old => value)
        const newState = await delayer(() => run(value))
        // console.log("AsyncAcionProvider newState e", contextid, newState)
        const newE = {target: { value: newState}}
        return await masterEvent(newE)
    }
    
    // console.log("GQLEntityProvider", item, "entity", entity, "data", data)
    const contextValue = { 
        loading, 
        error, 
        reRead: run, 
        params: varsState, 
        item: entity, 
        data, 
        onChange: onEvent(onChange), 
        onBlur: onEvent(onBlur) 
    }
    // console.log("GQLEntityProvider item", contextid, entity, data)
    // console.log("GQLEntityProvider contextValue", contextid, contextValue)
    // if (!item) return null;
    return (
        <GQLEntityContext.Provider value={contextValue}>
            {/* <h1>{contextid}</h1> */}
            <AsyncStateIndicator error={error} loading={loading} />
            
            {/* {(!loading && !error) && children} */}
            {contextValue.item && children}
            {/* {!contextValue.item && <pre>{JSON.stringify(contextValue)}</pre>} */}
            {/* <pre>{JSON.stringify(contextValue, null, 2)}</pre> */}
        </GQLEntityContext.Provider>
    );
};