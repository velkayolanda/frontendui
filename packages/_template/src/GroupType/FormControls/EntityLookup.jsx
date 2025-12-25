import { CreateDelayer, ErrorHandler, LoadingSpinner } from "@hrbolek/uoisfrontend-shared"
import { useCallback } from "react"
import { useGQLClient } from "../../../../dynamic/src/Store"
import { useAsync } from "../../../../dynamic/src/Hooks"
import { useEffect } from "react"
import { useState } from "react"
import { Label } from "./Label"
import { Input } from "./Input"
import { AsyncStateIndicator } from "../Helpers/AsyncStateIndicator"

/**
 * Vyhledávací komponenta pro výběr entity (lookup/autocomplete).
 *
 * Zobrazí textový input a po zadání alespoň 3 znaků spustí odložené (debounced)
 * hledání přes `asyncAction`. Výsledky zobrazí jako seznam, ze kterého lze
 * vybrat položku. Po výběru zavolá `onSelect` a/nebo `onChange` ve stylu
 * normalizovaného eventu `{ target: { id, value } }`.
 *
 * Chování:
 * - Při psaní: pokud délka textu < 3, nic se nenačítá.
 * - Pokud uživatel smaže text (prázdný string), zavolá se `onChange` s `value: null`.
 * - Při výběru položky: zavolá se `onChange` s `value: item.id` a zavolá se `onSelect(item)`.
 *   `onSelect` může vrátit objekt `{ clear?: boolean }` (default `true`) pro vyčištění výsledků.
 *
 * Pozn.: `skip`/`limit` jsou v props, ale v ukázce kódu se aktuálně nepoužívají
 * v parametrech `run(...)` (můžeš je doplnit do volání, pokud je asyncAction podporuje).
 *
 * @component
 * @param {Object} props
 * @param {string} props.id
 *  Identifikátor pole pro `onChange` event (`target.id`), tj. “kam” ukládat vybranou hodnotu.
 * @param {Function} props.asyncAction
 *  Asynchronní akce pro hledání (předává se do `useAsync`). Očekává se, že `run`
 *  vrátí pole nalezených položek. Komponenta volá `run({ pattern }, gqlClient)`.
 * @param {Object} [props.value]
 *  Aktuálně vybraná položka (typicky entity objekt). Pro zobrazení se používá `value?.name`.
 * @param {(item: any) => ({clear?: boolean}|void)} [props.onSelect]
 *  Callback při výběru položky ze seznamu. Může vrátit `{ clear: boolean }`,
 *  které určuje, zda se mají po výběru vyčistit výsledky (default `true`).
 * @param {(e: {target: {id: string, value: any}}) => void} [props.onChange=null]
 *  Callback pro změnu hodnoty (např. do formuláře). Volá se:
 *  - při vymazání textu: `value: null`
 *  - při výběru položky: `value: item.id`
 * @param {number} [props.skip=0]
 *  Offset pro stránkování výsledků (aktuálně nepoužito v `run`, viz pozn.).
 * @param {number} [props.limit=10]
 *  Limit výsledků (aktuálně nepoužito v `run`, viz pozn.).
 * @param {string} [props.label="Hledaný text"]
 *  Titulek sekce (renderuje se přes {@link Label}).
 *
 * @param {Object<string, any>} [props.props]
 *  Další props předané do vnitřního {@link Input} (např. `className`, `disabled`, apod.).
 *  Pozn.: vnitřní input má natvrdo `id="__phrase"`, `placeholder` a `value={value_?.name}`.
 *
 * @returns {JSX.Element}
 *
 * @example
 * <EntityLookup
 *   id="userId"
 *   label="Uživatel"
 *   asyncAction={UserReadPageAsyncAction}
 *   value={selectedUser}
 *   onChange={({ target }) => setForm(s => ({ ...s, [target.id]: target.value }))}
 *   onSelect={(user) => ({ clear: true })}
 * />
 */
export const EntityLookup = ({ 
    id,
    asyncAction, 
    value,
    onSelect = (item) => { clear: true }, 
    onChange = null,
    skip = 0, 
    limit = 10, 
    label = "Hledaný text", 
    ...props 
}) => {
    // const dispatch = useDispatch()
    const [Delayer] = useState(() => CreateDelayer()) // useState checks for a function ;)
    const { run, loading, error } = useAsync(asyncAction, {}, { deferred: true })
    const [fetchedItems, setFetchedItems] = useState([])
    const gqlClient = useGQLClient()
    const [value_, setValue_] = useState(value)

    useEffect(()=>{
        setValue_(value)
    },[value])

    const handleChange = useCallback(async (e) => {
        const target = e?.target || {}
        const value = target?.value || ""
        if (target?.value === "") {
            if (onChange) {
                onChange({target: {id, value: null}})    
            }
        }
        if (value.length < 3) return
        const searchresult = await Delayer(async () => await run({ pattern: "%" + value + "%" }, gqlClient))
        // console.log("searchresult", searchresult)
        setFetchedItems(old => searchresult)
    }, [asyncAction, skip, limit])

    const handleSelect = useCallback((item) => {
        
        setValue_(prev => item || prev)

        if (onChange) {
            onChange({target: {id, value: item?.id}})
            setFetchedItems(() => [])
        }

        const response = onSelect(item) || {}
        const { clear = true } = response
        if (clear) {
            setFetchedItems(() => [])
        }
        
    }, [onSelect, setFetchedItems])

    // const sureValue = value || {}
    // const inputValue = sureValue?.fullname || sureValue?.name
    return (
        <>
            <AsyncStateIndicator loading={loading} error={error} text={"Hledám"} />
            {/* {JSON.stringify(value)} */}
            <Label title={label}>
                <Input {...props} 
                    id={"__phrase"} 
                    onChange={handleChange} 
                    placeholder="Napiště alespoň 3 znaky" 
                    value={value_?.name}
                />
                {fetchedItems.map(
                    item => <SearchResult key={item?.id} item={item} onSelect={handleSelect} />
                )}
            </Label>
            
        </>
    )
}

const SearchResult = ({ item, onSelect }) => {
    const text = item?.fullname || item?.name || item?.id || "(Chyba v programu, dotaz nevraci jmena)";
    return (
        <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => onSelect(item)}
            style={{ display: "block", width: "100%", textAlign: "left" }}
        >
            {text}
        </button>
    );
};