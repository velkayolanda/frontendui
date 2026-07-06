import { useState, useCallback } from "react"
import { DateTimeFilter, Filter as BaseFilter, UUIDFilter, useFilterDesigner, Input, SimpleCardCapsule, Row, Col } from "../../../../_template/src/Base"

/**
 * Textový filtr pro použití uvnitř bloku {@link Filter}.
 *
 * Lokální náhrada za `StringFilter` ze šablony. Verze v šabloně má prohozené
 * atributy `value` a zobrazovaný text v `<option>` prvcích — stav `op` tak
 * obsahuje český popisek ("Obsahuje") místo platného GQL operátoru ("_ilike"),
 * což produkuje nefunkční filtrovací objekty jako `{ name: { "Obsahuje": "…" } }`.
 * Tato verze správně ukládá GQL operátor do `value` a zobrazuje český popisek
 * jako viditelný text.
 *
 * Podporované operátory: `_ilike`, `_startswith`, `_endswith`, `_eq`, `_gt`,
 * `_lt`, `_between`. V režimu `_ilike` je hodnota automaticky obalena
 * zástupnými znaky `%…%`, pokud žádné neobsahuje. V režimu `_between` se
 * zobrazí dvě samostatná pole (`_gt` / `_lt`).
 *
 * @component
 * @param {Object}  props
 * @param {string}  props.id                   - Název GQL pole použitého jako klíč filtru (např. `"name"`, `"nameEn"`).
 * @param {string}  [props.label]              - Titulek kapsle; pokud není uveden, použije se `props.id`.
 * @param {string}  [props.initialValue=""]    - Předvyplněná hodnota jednoduchého vstupního pole.
 * @param {string}  [props.initialOp="_ilike"] - Předvolený GQL operátor.
 *
 * @returns {JSX.Element}
 *
 * @example
 * // Použití uvnitř <Filter> pro filtrování pole `name`:
 * <StringFilter id="name" label="Název" />
 */
const StringFilter = ({ id, label, initialValue = "", initialOp = "_ilike" }) => {
    const filterContext = useFilterDesigner()
    if (!filterContext) throw Error("<StringFilter /> must be placed inside <Filter />")

    const [op, setOp] = useState(initialOp)
    const [text, setText] = useState(initialValue)

    // Samostatný stav pro vstupní pole v režimu _between
    const [from, setFrom] = useState("")
    const [to, setTo] = useState("")

    /** Předá výsledné pole výrazů (nebo null pro vymazání) nadřazenému Filter. */
    const emitArrayOrNull = useCallback(
        (arrOrNull) => {
            filterContext.handleChange({ target: { id, value: arrOrNull } })
        },
        [filterContext, id]
    )

    /**
     * Sestaví pole s jedním výrazem pro všechny operátory mimo _between.
     * Pro operátor `_ilike` automaticky obalí hodnotu zástupnými znaky `%…%`.
     *
     * @param {string} nextOp   - GQL operátor.
     * @param {string} nextText - Nezpracovaná vstupní hodnota.
     * @returns {Array|null}
     */
    const buildSingle = useCallback(
        (nextOp, nextText) => {
            if (!nextText) return null
            let v = nextText
            if (nextOp === "_ilike") v = nextText.includes("%") ? nextText : `%${nextText}%`
            return [{ [id]: { [nextOp]: v } }]
        },
        [id]
    )

    /**
     * Sestaví pole se dvěma výrazy pro operátor `_between`.
     * Každá neprázdná mez tvoří vlastní člen (`_gt` / `_lt`), takže
     * částečně vyplněný rozsah stále vytvoří platný filtr.
     *
     * @param {string} nextFrom - Dolní mez.
     * @param {string} nextTo   - Horní mez.
     * @returns {Array|null}
     */
    const buildBetween = useCallback(
        (nextFrom, nextTo) => {
            const out = []
            if (nextFrom) out.push({ [id]: { _gt: nextFrom } })
            if (nextTo) out.push({ [id]: { _lt: nextTo } })
            return out.length ? out : null
        },
        [id]
    )

    /**
     * Centrální pomocná funkce pro odeslání výrazu. Přijímá přepisy libovolné
     * části stavu, aby volající mohl odeslat s *novou* hodnotou ještě před
     * tím, než React provede překreslení.
     *
     * @param {Object} prepisStavu
     * @param {string} [prepisStavu.nextOp]
     * @param {string} [prepisStavu.nextText]
     * @param {string} [prepisStavu.nextFrom]
     * @param {string} [prepisStavu.nextTo]
     */
    const emit = useCallback(
        ({ nextOp = op, nextText = text, nextFrom = from, nextTo = to }) => {
            if (nextOp === "_between") emitArrayOrNull(buildBetween(nextFrom, nextTo))
            else emitArrayOrNull(buildSingle(nextOp, nextText))
        },
        [op, text, from, to, emitArrayOrNull, buildSingle, buildBetween]
    )

    const handleChangeOp = useCallback(
        (e) => {
            const next = e.target.value
            if (next === op) return
            setOp(next)
            emit({ nextOp: next })
        },
        [op, emit]
    )

    const handleChangeText = useCallback(
        (e) => {
            const next = e.target.value
            if (next === text) return
            setText(next)
            if (op !== "_between") emit({ nextText: next })
        },
        [op, text, emit]
    )

    const handleChangeFrom = useCallback(
        (e) => {
            const next = e.target.value
            if (next === from) return
            setFrom(next)
            if (op === "_between") emit({ nextFrom: next })
        },
        [op, from, emit]
    )

    const handleChangeTo = useCallback(
        (e) => {
            const next = e.target.value
            if (next === to) return
            setTo(next)
            if (op === "_between") emit({ nextTo: next })
        },
        [op, to, emit]
    )

    const showBetween = op === "_between"

    return (
        <SimpleCardCapsule title={label || id}>
            <Row>
                <Col>
                    {/* value={operátor} — zobrazovaný text je český popisek, NE naopak */}
                    <select className="form-control" value={op} onChange={handleChangeOp}>
                        <option value="_ilike">Obsahuje</option>
                        <option value="_startswith">Začíná na</option>
                        <option value="_endswith">Končí na</option>
                        <option value="_eq">Je rovno</option>
                        <option value="_gt">Je větší než</option>
                        <option value="_lt">Je menší než</option>
                        <option value="_between">Mezi</option>
                    </select>
                </Col>
                {!showBetween ? (
                    <Col>
                        <Input className="form-control" value={text} onChange={handleChangeText} />
                    </Col>
                ) : (
                    <>
                        <Col>
                            <Input className="form-control" value={from} onChange={handleChangeFrom} placeholder="od…" />
                        </Col>
                        <Col>
                            <Input className="form-control" value={to} onChange={handleChangeTo} placeholder="do…" />
                        </Col>
                    </>
                )}
            </Row>
        </SimpleCardCapsule>
    )
}

/**
 * Filtrační panel pro entitu Subject.
 *
 * Skládá filtrovací ovládací prvky pro `SubjectGQLModel`. Každý podřízený prvek
 * se zaregistruje v nadřazeném {@link BaseFilter} přes `FilterDesignerContext`
 * a přispívá svou klauzulí do kombinovaného výrazu `where`.
 *
 * Výraz je buď předán do `onChange` (pro programové konzumenty), nebo zapsán
 * do URL parametru po kliknutí na {@link FilterButton} předaný jako `children`.
 *
 * **Dostupná filtrační pole:**
 * | Pole      | Ovládací prvek  | Poznámka                                        |
 * |-----------|-----------------|--------------------------------------------------|
 * | `id`      | `UUIDFilter`    | Přesná shoda UUID (`_eq`).                       |
 * | `name`    | `StringFilter`  | Český název; podporuje všechny řetězcové operátory. |
 * | `nameEn`  | `StringFilter`  | Anglický název; podporuje všechny řetězcové operátory. |
 * | `created` | `DateTimeFilter`| Datum vytvoření; odesílá lokální čas bez konverze na UTC. |
 *
 * @component
 * @param {Object}          props
 * @param {string}          [props.id]       - Klíč relace; je-li uveden, výsledný výraz se zabalí
 *   jako `{ [id]: výraz }`, aby bylo možné tento filtr vnořit do nadřazeného {@link Filter}.
 * @param {function}        [props.onChange] - Voláno s `{ where }` při každé změně filtru.
 * @param {React.ReactNode} [props.children] - Další filtrovací prvky nebo akční tlačítka
 *   (např. {@link FilterButton}, {@link ResetFilterButton}) vykreslené uvnitř bloku.
 *
 * @returns {JSX.Element}
 *
 * @example
 * // Typické použití v PageVector — tlačítka se předají jako children:
 * <Filter>
 *   <FilterButton paramName="gr_where">Filtrovat</FilterButton>
 *   <ResetFilterButton paramName="gr_where">Vymazat filtr</ResetFilterButton>
 * </Filter>
 */
export const Filter = ({ id, onChange: handleChange, children }) => {
    return (
        <BaseFilter id={id} onChange={handleChange}>
            <UUIDFilter id="id" />
            <StringFilter id="name" label="Název" />
            <StringFilter id="nameEn" label="Anglický název" />
            {/* emitUtcIso={false} — backend přijímá řetězec datetime-local přímo */}
            <DateTimeFilter id="created" emitUtcIso={false} />
            {children}
        </BaseFilter>
    )
}
