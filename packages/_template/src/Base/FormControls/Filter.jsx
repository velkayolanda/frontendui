import { useCallback } from "react";
import { useMemo } from "react";
import { useState } from "react";
import { Row } from "../Components/Row";
import { Col } from "../Components/Col";
import { SimpleCardCapsule } from "../Components/CardCapsule";
import { Input } from "./Input";
import { createContext } from "react";
import { useContext } from "react";
import { useEffect } from "react";
import { useSearchParams } from "react-router";

const FilterDesignerContext = createContext(null);

export const useFilterDesigner = () => useContext(FilterDesignerContext);

function isPlainJoinObject(expr, join) {
    if (!expr || typeof expr !== "object" || Array.isArray(expr)) return false;
    const keys = Object.keys(expr);
    return keys.length === 1 && keys[0] === join && Array.isArray(expr[join]);
}

function combine(join, items = []) {
    const cleaned = items.filter(Boolean).filter((x) => Object.keys(x).length > 0);

    // flatten stejného joinu: _and v _and, _or v _or
    const flattened = [];
    for (const expr of cleaned) {
        if (isPlainJoinObject(expr, join)) flattened.push(...expr[join]);
        else flattened.push(expr);
    }

    if (flattened.length === 0) return {};
    if (flattened.length === 1) return flattened[0];
    return { [join]: flattened };
}

export const Filter = ({
    id,                  // relation key nebo undefined pro root
    label,
    join: joinProp = "_and",
    onChange = () => null,
    children,
}) => {
    const parent = useFilterDesigner();

    // childId -> expr[] | null
    const [currentFilter, setCurrentFilter] = useState({});
    const [join, setJoin] = useState(joinProp);

    const handleChange = useCallback((e) => {
        const { id: childId, value } = e.target;
        // value: expr[] | null
        setCurrentFilter((prev) => ({ ...prev, [childId]: value }));
    }, []);

    // místo flatten všech child arrays do jedné items[]:
    const terms = useMemo(() => {
        const arrays = Object.values(currentFilter).filter(Boolean); // (expr[])[]
        return arrays
            .map((arr) => {
                if (!Array.isArray(arr) || arr.length === 0) return null;
                if (arr.length === 1) return arr[0];
                // důležité: mezi termami je OR/AND, uvnitř termy je AND
                return { _and: arr };
            })
            .filter(Boolean);
    }, [currentFilter]);

    const showAndOr = terms.length > 1;

    // tady vzniká "lokální" výraz pro tento Filter
    const localExpr = useMemo(() => combine(join, terms), [join, terms]);

    // a tady se případně zabalí do relation name
    const wrappedExpr = useMemo(() => (id ? { [id]: localExpr } : localExpr), [id, localExpr]);

    // 1) posílej ven pro consumer
    useEffect(() => {
        onChange({ where: wrappedExpr });
    }, [wrappedExpr, onChange]);

    // 2) posílej parentu jako expr[] | null (vždy pole!)
    useEffect(() => {
        if (!parent?.handleChange) return;

        const isEmpty = !wrappedExpr || (typeof wrappedExpr === "object" && Object.keys(wrappedExpr).length === 0);
        parent.handleChange({
            target: {
                id: id ?? "__root__",     // parent potřebuje nějaký klíč; pokud root bez id, použij stabilní
                value: isEmpty ? null : [wrappedExpr],
            },
        });

        return () => {
            parent.handleChange({
                target: {
                    id: id ?? "__root__",
                    value: null,
                },
            });
        };
    }, [parent, wrappedExpr, id]);

    const handleJoinChange = useCallback((e) => {
        setJoin(e.target.value); // "_and" | "_or"
    }, []);

    const readFilter = useCallback(() => wrappedExpr, [wrappedExpr])
    
    const resetFilter = useCallback(() => {
        setCurrentFilter({});
        setJoin(joinProp);
    }, [joinProp]);

    return (
        <FilterDesignerContext.Provider value={{ handleChange, readFilter, resetFilter }}>

            <SimpleCardCapsule title={label || id || "where"}>
                {showAndOr && (
                    <Row>
                        <Col>
                            <label>
                                <input
                                    type="radio"
                                    name={`join-${id ?? "root"}`}
                                    value="_and"
                                    checked={join === "_and"}
                                    onChange={handleJoinChange}
                                />
                                _and
                            </label>
                        </Col>
                        <Col>
                            <label>
                                <input
                                    type="radio"
                                    name={`join-${id ?? "root"}`}
                                    value="_or"
                                    checked={join === "_or"}
                                    onChange={handleJoinChange}
                                />
                                _or
                            </label>
                        </Col>
                    </Row>
                )}
                {children}
            </SimpleCardCapsule>
        </FilterDesignerContext.Provider>
    );
};

function isEmptyWhere(where) {
    if (!where) return true;
    if (typeof where !== "object") return true;
    if (Array.isArray(where)) return where.length === 0;
    return Object.keys(where).length === 0;
}

function encodeWhere(where) {
    return JSON.stringify(where);
}

export const ResetFilterButton = ({onClick,
    paramName = "where",
    replace = true,
    ...props
}) => {
    const filterContext = useFilterDesigner();
    const [searchParams, setSearchParams] = useSearchParams();

    const handleClick = useCallback(() => {
        if (!filterContext?.readFilter) {
            throw Error("<FilterButton /> must be placed inside <Filter />");
        }

        const next = new URLSearchParams(searchParams);
        next.delete(paramName);

        if (onClick) onClick({ where: {} });
        if (filterContext.resetFilter) filterContext.resetFilter();
        setSearchParams(next, { replace });
    }, [filterContext, onClick, searchParams, setSearchParams, paramName, replace]);

    return <button {...props} onClick={handleClick} />;
};

export const FilterButton = ({
    onClick,
    paramName = "where",
    replace = true,
    ...props
}) => {
    const filterContext = useFilterDesigner();
    const [searchParams, setSearchParams] = useSearchParams();

    const handleClick = useCallback(() => {
        if (!filterContext?.readFilter) {
            throw Error("<FilterButton /> must be placed inside <Filter />");
        }

        const where = filterContext.readFilter(); // HOTOVÉ where
        const extendedWhere = {where}
        if (onClick) return onClick(extendedWhere);

        const next = new URLSearchParams(searchParams);

        if (isEmptyWhere(where)) {
            next.delete(paramName);
        } else {
            next.set(paramName, encodeWhere(where));
        }

        setSearchParams(next, { replace });
    }, [filterContext, onClick, searchParams, setSearchParams, paramName, replace]);

    return <button {...props} onClick={handleClick} />;
};

export const StringFilter = ({
    id,
    label,
    initialValue = "",
    initialOp = "_ilike",
}) => {
    const filterContext = useFilterDesigner();
    if (!filterContext) throw Error("<StringFilter /> must be placed inside <Filter />");
    //TODO when filter loads or resets this must accept the values also
    const [op, setOp] = useState(initialOp);

    // single
    const [text, setText] = useState(initialValue);

    // between
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");

    const emitArrayOrNull = useCallback(
        (arrOrNull) => {
            filterContext.handleChange({ target: { id, value: arrOrNull } });
        },
        [filterContext, id]
    );

    const buildSingle = useCallback(
        (nextOp, nextText) => {
            if (!nextText) return null;

            let v = nextText;
            if (nextOp === "_ilike") v = nextText.includes("%") ? nextText : `%${nextText}%`;

            return [
                {
                    [id]: {
                        [nextOp]: v,
                    },
                },
            ];
        },
        [id]
    );

    const buildBetween = useCallback(
        (nextFrom, nextTo) => {
            const out = [];
            if (nextFrom) {
                out.push({
                    [id]: {
                        _gt: nextFrom, // nebo _gte pokud chceš
                    },
                });
            }
            if (nextTo) {
                out.push({
                    [id]: {
                        _lt: nextTo, // nebo _lte pokud chceš
                    },
                });
            }
            return out.length ? out : null;
        },
        [id]
    );

    const emit = useCallback(
        ({ nextOp = op, nextText = text, nextFrom = from, nextTo = to }) => {
            if (nextOp === "_between") {
                emitArrayOrNull(buildBetween(nextFrom, nextTo));
            } else {
                emitArrayOrNull(buildSingle(nextOp, nextText));
            }
        },
        [op, text, from, to, emitArrayOrNull, buildSingle, buildBetween]
    );

    const handleChangeOp = useCallback(
        (e) => {
            const next = e.target.value;
            if (next === op) return;
            setOp(next);

            // při přepnutí režimu přepočti emit
            if (next === "_between") {
                // můžeš si rozhodnout, jestli chceš single text přenést do from apod.; teď nic
                emit({ nextOp: next });
            } else {
                emit({ nextOp: next });
            }
        },
        [op, emit]
    );

    const handleChangeText = useCallback(
        (e) => {
            const next = e.target.value;
            if (next === text) return;
            setText(next);
            if (op !== "_between") emit({ nextText: next });
        },
        [op, text, emit]
    );

    const handleChangeFrom = useCallback(
        (e) => {
            const next = e.target.value;
            if (next === from) return;
            setFrom(next);
            if (op === "_between") emit({ nextFrom: next });
        },
        [op, from, emit]
    );

    const handleChangeTo = useCallback(
        (e) => {
            const next = e.target.value;
            if (next === to) return;
            setTo(next);
            if (op === "_between") emit({ nextTo: next });
        },
        [op, to, emit]
    );

    const showBetween = op === "_between";

    return (
        <SimpleCardCapsule title={label || id}>
            <Row>
                <Col>
                    <select className="form-control" value={op} onChange={handleChangeOp}>
                        <option value="_ilike">_ilike</option>
                        <option value="_startswith">_startswith</option>
                        <option value="_endswith">_endswith</option>
                        <option value="_eq">_eq</option>
                        <option value="_gt">_gt</option>
                        <option value="_lt">_lt</option>
                        <option value="_between">_between</option>
                    </select>
                </Col>

                {!showBetween ? (
                    <Col>
                        <Input className="form-control" value={text} onChange={handleChangeText} />
                    </Col>
                ) : (
                    <>
                        <Col>
                            <Input
                                className="form-control"
                                value={from}
                                onChange={handleChangeFrom}
                                placeholder="from…"
                            />
                        </Col>
                        <Col>
                            {(op === "_between") && <Input
                                className="form-control"
                                value={to}
                                onChange={handleChangeTo}
                                placeholder="to…"
                            />
                            }
                        </Col>
                    </>
                )}
            </Row>
        </SimpleCardCapsule>
    );
};

function toUtcIsoFromDatetimeLocal(value) {
    // value: "YYYY-MM-DDTHH:mm" (nebo s vteřinami)
    const d = new Date(value); // bere jako lokální čas
    if (Number.isNaN(d.getTime())) return null;
    return d.toISOString();
}

export const DateTimeFilter = ({
    id,
    label,
    initialOp = "_gte",
    initialValue = "",       // "2025-12-23T10:30"
    emitUtcIso = true,       // true => ISO se Z
}) => {
    const filterContext = useFilterDesigner();
    if (!filterContext) throw Error("<DateTimeFilter /> must be placed inside <Filter />");

    const [op, setOp] = useState(initialOp);

    // single
    const [text, setText] = useState(initialValue);

    // between
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");

    const normalize = useCallback(
        (raw) => {
            if (!raw) return null;
            return emitUtcIso ? toUtcIsoFromDatetimeLocal(raw) : raw;
        },
        [emitUtcIso]
    );

    const emitArrayOrNull = useCallback(
        (arrOrNull) => {
            filterContext.handleChange({ target: { id, value: arrOrNull } });
        },
        [filterContext, id]
    );

    const buildSingle = useCallback(
        (nextOp, nextText) => {
            const v = normalize(nextText);
            if (!v) return null;

            return [
                {
                    [id]: {
                        [nextOp]: v,
                    },
                },
            ];
        },
        [id, normalize]
    );

    const buildBetween = useCallback(
        (nextFrom, nextTo) => {
            const out = [];

            const vf = normalize(nextFrom);
            const vt = normalize(nextTo);

            // stejné chování jako u StringFilter: když je vyplněna jen jedna strana, vrátí se 1 prvek
            if (vf) {
                out.push({
                    [id]: { _gt: vf }, // nebo _gte, pokud chceš inclusive
                });
            }
            if (vt) {
                out.push({
                    [id]: { _lt: vt }, // nebo _lte
                });
            }

            return out.length ? out : null;
        },
        [id, normalize]
    );

    const emit = useCallback(
        ({ nextOp = op, nextText = text, nextFrom = from, nextTo = to }) => {
            if (nextOp === "_between") emitArrayOrNull(buildBetween(nextFrom, nextTo));
            else emitArrayOrNull(buildSingle(nextOp, nextText));
        },
        [op, text, from, to, emitArrayOrNull, buildSingle, buildBetween]
    );

    const handleChangeOp = useCallback(
        (e) => {
            const next = e.target.value;
            if (next === op) return;
            setOp(next);
            emit({ nextOp: next });
        },
        [op, emit]
    );

    const handleChangeText = useCallback(
        (e) => {
            const next = e.target.value;
            if (next === text) return;
            setText(next);
            if (op !== "_between") emit({ nextText: next });
        },
        [op, text, emit]
    );

    const handleChangeFrom = useCallback(
        (e) => {
            const next = e.target.value;
            if (next === from) return;
            setFrom(next);
            if (op === "_between") emit({ nextFrom: next });
        },
        [op, from, emit]
    );

    const handleChangeTo = useCallback(
        (e) => {
            const next = e.target.value;
            if (next === to) return;
            setTo(next);
            if (op === "_between") emit({ nextTo: next });
        },
        [op, to, emit]
    );

    const showBetween = op === "_between";

    return (
        <SimpleCardCapsule title={label || id}>
            <Row>
                <Col>
                    <select className="form-control" value={op} onChange={handleChangeOp}>
                        <option value="_eq">_eq</option>
                        <option value="_gt">_gt</option>
                        <option value="_gte">_gte</option>
                        <option value="_lt">_lt</option>
                        <option value="_lte">_lte</option>
                        <option value="_between">_between</option>
                    </select>
                </Col>

                {!showBetween ? (
                    <Col>
                        <Input
                            className="form-control"
                            type="datetime-local"
                            value={text}
                            onChange={handleChangeText}
                        />
                    </Col>
                ) : (
                    <>
                        <Col>
                            <Input
                                className="form-control"
                                type="datetime-local"
                                value={from}
                                onChange={handleChangeFrom}
                                placeholder="from…"
                            />
                        </Col>
                        <Col>
                            <Input
                                className="form-control"
                                type="datetime-local"
                                value={to}
                                onChange={handleChangeTo}
                                placeholder="to…"
                            />
                        </Col>
                    </>
                )}
            </Row>
        </SimpleCardCapsule>
    );
};

function parseFloatOrNull(raw) {
    if (raw == null) return null;
    const s = String(raw).trim();
    if (!s) return null;

    // podporuj i desetinnou čárku
    const normalized = s.replace(",", ".");
    const n = Number(normalized);
    return Number.isFinite(n) ? n : null;
}

export const FloatFilter = ({
    id,
    label,
    initialOp = "_gte",
    initialValue = "",
}) => {
    const filterContext = useFilterDesigner();
    if (!filterContext) throw Error("<FloatFilter /> must be placed inside <Filter />");

    const [op, setOp] = useState(initialOp);

    // single
    const [text, setText] = useState(initialValue);

    // between
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");

    const emitArrayOrNull = useCallback(
        (arrOrNull) => {
            filterContext.handleChange({ target: { id, value: arrOrNull } });
        },
        [filterContext, id]
    );

    const buildSingle = useCallback(
        (nextOp, nextText) => {
            const v = parseFloatOrNull(nextText);
            if (v == null) return null;

            return [
                {
                    [id]: {
                        [nextOp]: v,
                    },
                },
            ];
        },
        [id]
    );

    const buildBetween = useCallback(
        (nextFrom, nextTo) => {
            const out = [];
            const vf = parseFloatOrNull(nextFrom);
            const vt = parseFloatOrNull(nextTo);

            if (vf != null) {
                out.push({
                    [id]: { _gt: vf }, // nebo _gte
                });
            }
            if (vt != null) {
                out.push({
                    [id]: { _lt: vt }, // nebo _lte
                });
            }
            return out.length ? out : null;
        },
        [id]
    );

    const emit = useCallback(
        ({ nextOp = op, nextText = text, nextFrom = from, nextTo = to }) => {
            if (nextOp === "_between") emitArrayOrNull(buildBetween(nextFrom, nextTo));
            else emitArrayOrNull(buildSingle(nextOp, nextText));
        },
        [op, text, from, to, emitArrayOrNull, buildSingle, buildBetween]
    );

    const handleChangeOp = useCallback(
        (e) => {
            const next = e.target.value;
            if (next === op) return;
            setOp(next);
            emit({ nextOp: next });
        },
        [op, emit]
    );

    const handleChangeText = useCallback(
        (e) => {
            const next = e.target.value;
            if (next === text) return;
            setText(next);
            if (op !== "_between") emit({ nextText: next });
        },
        [op, text, emit]
    );

    const handleChangeFrom = useCallback(
        (e) => {
            const next = e.target.value;
            if (next === from) return;
            setFrom(next);
            if (op === "_between") emit({ nextFrom: next });
        },
        [op, from, emit]
    );

    const handleChangeTo = useCallback(
        (e) => {
            const next = e.target.value;
            if (next === to) return;
            setTo(next);
            if (op === "_between") emit({ nextTo: next });
        },
        [op, to, emit]
    );

    const showBetween = op === "_between";

    return (
        <SimpleCardCapsule title={label || id}>
            <Row>
                <Col>
                    <select className="form-control" value={op} onChange={handleChangeOp}>
                        <option value="_eq">_eq</option>
                        <option value="_gt">_gt</option>
                        <option value="_gte">_gte</option>
                        <option value="_lt">_lt</option>
                        <option value="_lte">_lte</option>
                        <option value="_between">_between</option>
                    </select>
                </Col>

                {!showBetween ? (
                    <Col>
                        <Input
                            className="form-control"
                            type="number"
                            inputMode="decimal"
                            value={text}
                            onChange={handleChangeText}
                            placeholder="0.0"
                        />
                    </Col>
                ) : (
                    <>
                        <Col>
                            <Input
                                className="form-control"
                                type="number"
                                inputMode="decimal"
                                value={from}
                                onChange={handleChangeFrom}
                                placeholder="from…"
                            />
                        </Col>
                        <Col>
                            <Input
                                className="form-control"
                                type="number"
                                inputMode="decimal"
                                value={to}
                                onChange={handleChangeTo}
                                placeholder="to…"
                            />
                        </Col>
                    </>
                )}
            </Row>
        </SimpleCardCapsule>
    );
};

const UUID_RE =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const UUIDFilter = ({
    id,
    label,
    initialValue = "",
}) => {
    const filterContext = useFilterDesigner();
    if (!filterContext) throw Error("<UUIDFilter /> must be placed inside <Filter />");

    const [text, setText] = useState(initialValue);
    const trimmed = useMemo(() => (text ?? "").trim(), [text]);

    const isEmpty = trimmed.length === 0;
    const isValid = isEmpty ? true : UUID_RE.test(trimmed);

    const emitArrayOrNull = useCallback(
        (arrOrNull) => {
            filterContext.handleChange({ target: { id, value: arrOrNull } });
        },
        [filterContext, id]
    );

    const emit = useCallback(
        (nextText) => {
            const v = (nextText ?? "").trim();

            // prázdné = vypnout filtr
            if (!v) {
                emitArrayOrNull(null);
                return;
            }

            // nevalidní = také vypnout filtr (a UI ukáže chybu)
            if (!UUID_RE.test(v)) {
                emitArrayOrNull(null);
                return;
            }

            emitArrayOrNull([
                {
                    [id]: { _eq: v },
                },
            ]);
        },
        [id, emitArrayOrNull]
    );

    const handleChangeText = useCallback(
        (e) => {
            const next = e.target.value;
            if (next === text) return;
            setText(next);
            emit(next);
        },
        [text, emit]
    );

    return (
        <SimpleCardCapsule title={label || id}>
            <Row>
                <Col style={{ minWidth: 80 }}>
                    <span style={{ opacity: 0.7 }}>(_eq)</span>
                </Col>
                <Col>
                    <Input
                        className={`form-control ${!isValid ? "is-invalid" : ""}`}
                        value={text}
                        onChange={handleChangeText}
                        placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                    />
                    {!isValid && (
                        <div className="invalid-feedback" style={{ display: "block" }}>
                            Neplatné UUID. Očekávám formát 8-4-4-4-12 hex (např. 550e8400-e29b-41d4-a716-446655440000).
                        </div>
                    )}
                </Col>
            </Row>
        </SimpleCardCapsule>
    );
};
