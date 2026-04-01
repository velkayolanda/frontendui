/**
 * calendarReducer.js
 * Minimalistický reducer pro klikací rozvrh nad intervaly v celých dnech
 */

/**
 * @typedef {Object} Event
 * @property {string} id
 * @property {string} startDate - YYYY-MM-DD
 * @property {string} endDate - YYYY-MM-DD
 * @property {string} typeId
 */

/**
 * @typedef {Object} SelectedType
 * @property {string} id
 */

/**
 * @typedef {Object} State
 * @property {Event[]} events
 * @property {SelectedType|null} selectedType
 */

/**
 * Vrátí datum posunuté o zadaný počet dní.
 * @param {string} dayStr - Datum ve formátu YYYY-MM-DD.
 * @param {number} amount - Počet dní k posunutí.
 * @returns {string}
 */
const addDays = (dayStr, amount) => {
    const d = new Date(dayStr + "T00:00:00");
    d.setDate(d.getDate() + amount);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
};

/**
 * Vrátí interval ve správném pořadí od menšího do většího data.
 * @param {string} startDate
 * @param {string} endDate
 * @returns {{startDate: string, endDate: string}}
 */
export const normalizeRange = (startDate, endDate) => {
    return startDate <= endDate
        ? { startDate, endDate }
        : { startDate: endDate, endDate: startDate };
};

/**
 * Zjistí, zda se event překrývá s intervalem.
 * @param {Event} event
 * @param {string} startDate
 * @param {string} endDate
 * @returns {boolean}
 */
export const overlapsRange = (event, startDate, endDate) => {
    return event.startDate <= endDate && startDate <= event.endDate;
};

/**
 * Zjistí, zda event plně obsahuje interval.
 * @param {Event} event
 * @param {string} startDate
 * @param {string} endDate
 * @returns {boolean}
 */
export const containsRange = (event, startDate, endDate) => {
    return event.startDate <= startDate && endDate <= event.endDate;
};

/**
 * Vytvoří nové unikátní ID.
 * @returns {string}
 */
export const makeId = () => crypto.randomUUID();

/**
 * Seřadí eventy podle začátku a konce.
 * @param {Event[]} events
 * @returns {Event[]}
 */
export const sortEvents = (events) => {
    return [...events].sort((a, b) => {
        if (a.startDate !== b.startDate) {
            return a.startDate.localeCompare(b.startDate);
        }
        return a.endDate.localeCompare(b.endDate);
    });
};

/**
 * Odebere z eventu zadaný interval.
 * Může vrátit:
 * - []
 * - [event]
 * - [leftPart, rightPart]
 *
 * @param {Event} event
 * @param {string} startDate
 * @param {string} endDate
 * @returns {Event[]}
 */
export const removeRangeFromEvent = (event, startDate, endDate) => {
    if (!overlapsRange(event, startDate, endDate)) {
        return [event];
    }

    const cutsLeft = startDate <= event.startDate;
    const cutsRight = endDate >= event.endDate;

    // interval smaže celý event
    if (cutsLeft && cutsRight) {
        return [];
    }

    // ukrojí levou část eventu
    if (cutsLeft) {
        return [
            {
                ...event,
                startDate: addDays(endDate, 1)
            }
        ];
    }

    // ukrojí pravou část eventu
    if (cutsRight) {
        return [
            {
                ...event,
                endDate: addDays(startDate, -1)
            }
        ];
    }

    // interval je uvnitř eventu => rozdělení na dva eventy
    return [
        {
            ...event,
            endDate: addDays(startDate, -1)
        },
        {
            ...event,
            id: makeId(),
            startDate: addDays(endDate, 1)
        }
    ];
};

/**
 * Sloučí sousední nebo překrývající se eventy stejného typu
 * a zachová stabilní identitu původních eventů.
 *
 * Pokud se spojuje původní event a synteticky vytvořený event,
 * přednost dostane ID původního eventu.
 *
 * Neměněné eventy vrací ve stejné referenci.
 *
 * @param {Event[]} events
 * @returns {Event[]}
 */
export const normalizeEvents = (events) => {
    const sorted = sortEvents(events);
    const result = [];

    for (const event of sorted) {
        const last = result[result.length - 1];

        if (
            last &&
            last.typeId === event.typeId &&
            addDays(last.endDate, 1) >= event.startDate
        ) {
            const lastSynthetic = !!last._isSynthetic;
            const eventSynthetic = !!event._isSynthetic;

            const nextId =
                lastSynthetic && !eventSynthetic
                    ? event.id
                    : last.id;

            const nextSynthetic =
                lastSynthetic && !eventSynthetic
                    ? event._isSynthetic
                    : last._isSynthetic;

            const nextStartDate =
                event.startDate < last.startDate
                    ? event.startDate
                    : last.startDate;

            const nextEndDate =
                event.endDate > last.endDate
                    ? event.endDate
                    : last.endDate;

            const changed =
                nextId !== last.id ||
                nextSynthetic !== last._isSynthetic ||
                nextStartDate !== last.startDate ||
                nextEndDate !== last.endDate;

            if (changed) {
                result[result.length - 1] = {
                    ...last,
                    id: nextId,
                    startDate: nextStartDate,
                    endDate: nextEndDate,
                    _isSynthetic: nextSynthetic
                };
            }
        } else {
            result.push(event);
        }
    }

    let hasSynthetic = false;
    for (const event of result) {
        if (event._isSynthetic !== undefined) {
            hasSynthetic = true;
            break;
        }
    }

    if (!hasSynthetic) {
        return result;
    }

    return result.map((event) => {
        if (event._isSynthetic === undefined) {
            return event;
        }

        const { _isSynthetic, ...cleanEvent } = event;
        return cleanEvent;
    });
};

/**
 * Vrátí průnik dvou intervalů.
 *
 * @param {{startDate: string, endDate: string}} a
 * @param {{startDate: string, endDate: string}} b
 * @returns {{startDate: string, endDate: string} | null}
 */
export const intersectRanges = (a, b) => {
    const startDate = a.startDate > b.startDate ? a.startDate : b.startDate;
    const endDate = a.endDate < b.endDate ? a.endDate : b.endDate;

    if (startDate > endDate) {
        return null;
    }

    return { startDate, endDate };
};

/**
 * Odečte jeden interval od jednoho segmentu.
 *
 * @param {{startDate: string, endDate: string}} segment
 * @param {{startDate: string, endDate: string}} cut
 * @returns {{startDate: string, endDate: string}[]}
 */
export const subtractRange = (segment, cut) => {
    const intersection = intersectRanges(segment, cut);

    if (!intersection) {
        return [segment];
    }

    const result = [];

    if (segment.startDate < intersection.startDate) {
        result.push({
            startDate: segment.startDate,
            endDate: addDays(intersection.startDate, -1)
        });
    }

    if (intersection.endDate < segment.endDate) {
        result.push({
            startDate: addDays(intersection.endDate, 1),
            endDate: segment.endDate
        });
    }

    return result;
};

/**
 * Odečte více intervalů od jednoho základního intervalu.
 *
 * @param {{startDate: string, endDate: string}} baseRange
 * @param {{startDate: string, endDate: string}[]} cuts
 * @returns {{startDate: string, endDate: string}[]}
 */
export const subtractRanges = (baseRange, cuts) => {
    let segments = [baseRange];

    for (const cut of cuts) {
        segments = segments.flatMap((segment) => subtractRange(segment, cut));
    }

    return segments;
};

/**
 * Aplikuje vybraný typ na interval.
 *
 * Chování:
 * - v částech intervalu, kde už je selectedType, se tento typ odebere
 * - v ostatních částech intervalu se selectedType přidá
 *
 * Nově vytvořené segmenty označuje jako syntetické, aby při merge
 * šlo zachovat ID původních eventů.
 *
 * Neměněné eventy ponechává ve stejné referenci.
 *
 * @param {Event[]} events
 * @param {string} startDate
 * @param {string} endDate
 * @param {{id: string}|null} selectedType
 * @returns {Event[]}
 */
export const applyIntervalTransition = (
    events,
    startDate,
    endDate,
    selectedType
) => {
    if (!selectedType) return events;

    const range = normalizeRange(startDate, endDate);

    const selectedTypeOverlaps = events
        .filter(
            (event) =>
                event.typeId === selectedType.id &&
                overlapsRange(event, range.startDate, range.endDate)
        )
        .map((event) =>
            intersectRanges(
                { startDate: event.startDate, endDate: event.endDate },
                range
            )
        )
        .filter(Boolean);

    const rangesToAdd = subtractRanges(range, selectedTypeOverlaps);

    const withoutClickedRange = events.flatMap((event) => {
        const parts = removeRangeFromEvent(
            event,
            range.startDate,
            range.endDate
        );

        if (parts.length === 1 && parts[0] === event) {
            return parts;
        }

        if (event._isSynthetic === undefined) {
            return parts;
        }

        return parts.map((part) => {
            if (part._isSynthetic === event._isSynthetic) {
                return part;
            }

            return {
                ...part,
                _isSynthetic: event._isSynthetic
            };
        });
    });

    if (rangesToAdd.length === 0 && withoutClickedRange.length === events.length) {
        let same = true;
        for (let i = 0; i < events.length; i++) {
            if (events[i] !== withoutClickedRange[i]) {
                same = false;
                break;
            }
        }
        if (same) {
            return events;
        }
    }

    const next = [
        ...withoutClickedRange,
        ...rangesToAdd.map((rangeToAdd) => ({
            id: makeId(),
            startDate: rangeToAdd.startDate,
            endDate: rangeToAdd.endDate,
            typeId: selectedType.id,
            _isSynthetic: true
        }))
    ];

    return normalizeEvents(next);
};

/**
 * Výchozí stav reduceru.
 * @type {State}
 */
export const initialState = {
    events: [],
    selectedType: null
};

/**
 * Reducer kompatibilní s Redux i React useReducer.
 * 
 * Akce:
 * - SET_SELECTED_TYPE
 * - SET_EVENTS
 * - APPLY_INTERVAL
 *
 * @param {State} state
 * @param {{type: string, payload?: any}} action
 * @returns {State}
 */
export const calendarReducer = (state = initialState, action) => {
    switch (action.type) {
        case "SET_SELECTED_TYPE":
            return {
                ...state,
                selectedType: action.payload
            };

        case "SET_EVENTS":
            return {
                ...state,
                events: normalizeEvents(action.payload)
            };

        case "APPLY_INTERVAL":
            return {
                ...state,
                events: applyIntervalTransition(
                    state.events,
                    action.payload.startDate,
                    action.payload.endDate,
                    state.selectedType
                )
            };

        default:
            return state;
    }
};

/**
 * @typedef {Object} Event
 * @property {string} id
 * @property {string} startDate - Datum začátku ve formátu YYYY-MM-DD
 * @property {string} endDate - Datum konce ve formátu YYYY-MM-DD
 * @property {string} typeId - Identifikátor typu eventu
 */

/**
 * @typedef {Object} UpdatedEvent
 * @property {Event} before - Původní verze eventu
 * @property {Event} after - Nová verze eventu
 */

/**
 * @typedef {Object} EventsDiff
 * @property {Event[]} added - Eventy, které jsou nové (existují pouze v nextEvents)
 * @property {UpdatedEvent[]} updated - Eventy, které existují v obou stavech,
 * ale změnily některé vlastnosti (startDate, endDate, typeId)
 * @property {Event[]} deleted - Eventy, které byly odstraněny (existují pouze v prevEvents)
 */

/**
 * Porovná dva seznamy eventů a vrátí rozdíly ve formě přidaných,
 * upravených a smazaných eventů.
 *
 * Porovnání probíhá podle `id`:
 * - pokud `id` existuje pouze v `nextEvents` → event je přidaný (`added`)
 * - pokud `id` existuje pouze v `prevEvents` → event je smazaný (`deleted`)
 * - pokud `id` existuje v obou, ale změnily se hodnoty
 *   (`startDate`, `endDate`, `typeId`) → event je upravený (`updated`)
 *
 * Funkce NEPOROVNÁVÁ jiné vlastnosti než:
 * - startDate
 * - endDate
 * - typeId
 *
 * @param {Event[]} prevEvents - Předchozí stav eventů
 * @param {Event[]} nextEvents - Nový stav eventů
 * @returns {EventsDiff} Objekt obsahující seznam přidaných, upravených a smazaných eventů
 */
export const diffEvents = (prevEvents, nextEvents) => {
    const prevMap = new Map(prevEvents.map(e => [e.id, e]));
    const nextMap = new Map(nextEvents.map(e => [e.id, e]));

    const added = [];
    const updated = [];
    const deleted = [];

    for (const [id, prev] of prevMap) {
        const next = nextMap.get(id);

        if (!next) {
            deleted.push(prev);
            continue;
        }

        if (
            prev.startDate !== next.startDate ||
            prev.endDate !== next.endDate ||
            prev.typeId !== next.typeId
        ) {
            updated.push({
                before: prev,
                after: next
            });
        }
    }

    for (const [id, next] of nextMap) {
        if (!prevMap.has(id)) {
            added.push(next);
        }
    }

    return { added, updated, deleted };
};