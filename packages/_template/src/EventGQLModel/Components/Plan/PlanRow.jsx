import { useCallback, useMemo, useState } from "react"
import { 
    assignEventsToWeeks, 
    buildAcademicWeeks, 
    formatDate, 
    formatWeek, 
    getContrastTextColor, 
    normalizeEvent, 
    rangesIntersect, 
    toIsoDate 
} from "./_utils"
import { applyIntervalTransition, diffEvents } from "./calendarReducer"


/**
 * Kontejner pro horizontální layout týdnů (scrollovatelný grid).
 *
 * Používá flexbox:
 * - děti jsou řazeny v řádku
 * - umožňuje horizontální scroll (`overflow-auto`)
 *
 * Vhodné pro:
 * - hlavičku týdnů (WeekHeader)
 * - řádky planneru (PlanRow)
 *
 * @param {{
 *   children: React.ReactNode
 * }} props
 *
 * @returns {JSX.Element}
 *
 * @example
 * <WeekGrid>
 *   <WeekGridItem />
 *   <WeekGridItem />
 * </WeekGrid>
 */
export const WeekGrid = ({ children }) => {
    return (
        <div
            className="d-flex gap-1 overflow-auto"
            style={{
                width: "100%",
                paddingBottom: "4px"
            }}
        >
            {children}
        </div>
    )
}

/**
 * Základní buňka gridu pro jeden týden.
 *
 * Poskytuje:
 * - pevnou minimální šířku a výšku
 * - relativní pozici (pro absolutně pozicované prvky uvnitř)
 * - tooltip s informacemi o týdnu
 *
 * Slouží jako wrapper pro:
 * - ClickableBox (interaktivní obsah)
 * - WeekHeader (popisky týdne)
 *
 * @param {{
 *   children: React.ReactNode,
 *   week: {
 *     labelFull: string,
 *     firstHalfStart: Date,
 *     firstHalfEnd: Date,
 *     secondHalfStart: Date,
 *     secondHalfEnd: Date
 *   }
 * }} props
 *
 * @returns {JSX.Element}
 *
 * @example
 * <WeekGridItem week={week}>
 *   <ClickableBox ... />
 * </WeekGridItem>
 */
export const WeekGridItem = ({ children, title, minWidth = 40, height = 69 }) => {
    return (
        <div
            className="position-relative border rounded overflow-hidden user-select-none"
            style={{
                minWidth: `${minWidth}px`,
                height: `${height}px`,
                textAlign: "center",
                flex: "1 0 auto"
            }}
            title={title}
        >
            {children}
        </div>
    )
}

const academicYear_ = {
    year: 2023,
    startWeek: 35,
    endWeek: 42
}
const GREY = "#777777";
export const WeekHeaderContent = ({ academicYear = academicYear_ }) => {
    const { year: academicStartYear, startWeek, endWeek } = academicYear
    const weeks = useMemo(
        () => buildAcademicWeeks(academicStartYear, startWeek, endWeek),
        [academicYear]
    );
    // return <div>hi</div>
    const link = () => "#"
    return (
        <>
            {weeks.map((week) => (
                <WeekGridItem
                    key={week.id}
                    title={`${week.labelFull}\n1. polovina: ${formatDate(week.firstHalfStart)} až ${formatDate(week.firstHalfEnd)}\n2. polovina: ${formatDate(week.secondHalfStart)} až ${formatDate(week.secondHalfEnd)}`}
                >
                    <div
                        className="position-absolute fw-bold"
                        style={{
                            left: "3px",
                            top: "2px",
                            zIndex: 2,
                            fontSize: "10px",
                            textAlign: "center",
                            // lineHeight: 1,
                            // color: leftTextColor,
                            // pointerEvents: "none"
                        }}
                    >
                        <a href={link(week)}>{week.label}</a><br />
                        {formatWeek(week)}
                    </div>
                </WeekGridItem>
            ))}
        </>
    )
}
export const WeekHeader = ({ academicYear = academicYear_ }) => {
    return (
        <WeekGrid>
            <WeekHeaderContent academicYear={academicYear} />
        </WeekGrid>
    )
}


const WeekTop = ({ textColor, backgroundColor, text, onClick }) => {
    return (<>
        <div
            className="position-absolute"
            onClick={onClick}
            style={{
                inset: 0,
                backgroundColor: backgroundColor,
                clipPath: "polygon(0 0, 100% 0, 0 100%)",
                cursor: "pointer"
            }}
        />
        <div
            className="position-absolute fw-bold"
            style={{
                left: "3px",
                top: "2px",
                zIndex: 2,
                fontSize: "10px",
                lineHeight: 1,
                color: textColor,
                pointerEvents: "none"
            }}
        >
            {text}
        </div>
    </>)
}

const WeekBottom = ({ textColor, backgroundColor, text, onClick }) => {
    return (<>
        <div
            className="position-absolute"
            onClick={onClick}
            style={{
                inset: 0,
                backgroundColor: backgroundColor,
                clipPath: "polygon(100% 0, 100% 100%, 0 100%)",
                cursor: "pointer"
            }}
        />

        <div
            className="position-absolute fw-bold text-end"
            style={{
                right: "3px",
                bottom: "2px",
                zIndex: 2,
                fontSize: "10px",
                lineHeight: 1,
                color: textColor,
                pointerEvents: "none"
            }}
        >
            {text}
        </div>
    </>)
}

const ClickableBox = ({ week, height = 46, onClick = () => null }) => {
    const weekEvents = [...week.firstHalfEvents, ...week.secondHalfEvents];

    const topEvent = weekEvents.find(
        event => rangesIntersect(
            week.firstHalfStart,
            week.firstHalfEnd,
            event.startDateObj,
            event.endDateObj
        )
    );

    const bottomEvent = weekEvents.find(
        event => rangesIntersect(
            week.secondHalfStart,
            week.secondHalfEnd,
            event.startDateObj,
            event.endDateObj
        )
    );

    const topColor = topEvent?.type?.color || GREY;
    const bottomColor = bottomEvent?.type?.color || GREY;
    const topText = topEvent?.type?.abbreviation || "";
    const bottomText = bottomEvent?.type?.abbreviation || "";

    const topTextColor = getContrastTextColor(topColor);
    const bottomTextColor = getContrastTextColor(bottomColor);

    const handleHalfClick = (half) => {
        const isTop = half === "top";

        onClick({
            half,
            weekId: week.id,
            startDate: toIsoDate(isTop ? week.firstHalfStart : week.secondHalfStart),
            endDate: toIsoDate(isTop ? week.firstHalfEnd : week.secondHalfEnd),
            event: isTop ? topEvent : bottomEvent
        });
    };

    return (
        <WeekGridItem
            height={height}
            key={week.id}
            title={`${week.labelFull}\n1. polovina: ${formatDate(week.firstHalfStart)} až ${formatDate(week.firstHalfEnd)}\n2. polovina: ${formatDate(week.secondHalfStart)} až ${formatDate(week.secondHalfEnd)}`}
        >
            <FlexContainer>
                <FlexRow>
                    <WeekTop
                        textColor={topTextColor}
                        backgroundColor={topColor}
                        text={topText}
                        onClick={() => handleHalfClick("top")}
                    />
                    <WeekBottom
                        textColor={bottomTextColor}
                        backgroundColor={bottomColor}
                        text={bottomText}
                        onClick={() => handleHalfClick("bottom")}
                    />
                </FlexRow>
            </FlexContainer>
        </WeekGridItem>
    );
};

const eventTypes = [
    { id: "69ec2b0b-a39d-40df-9cea-e295b36749c9", name: "Semestr", abbreviation: "S", color: "#7f7f7f" },

    { id: "ac3238a2-a3ca-4f4b-a56b-8ac7c3953aff", name: "výuka - zimní semestr", abbreviation: "V-ZS", color: "#ffffff" },
    { id: "78a6f015-b8f4-49c8-b218-7861454cb8e9", name: "výuka - letní semestr", abbreviation: "V-LS", color: "#ffffff" },

    { id: "6fef77f1-a580-4e13-a088-30368a95af2f", name: "řádná dovolená", abbreviation: "ŘD", color: "#d9a441" },
    { id: "7e4187e5-b219-4332-b50e-54411541bba6", name: "zkouškové období", abbreviation: "Z", color: "#f28c28" },
    { id: "79c71457-b926-449a-b227-a3461bf1df4c", name: "příprava v poli - teorie", abbreviation: "PT", color: "#8bc34a" },
    { id: "539c45b2-629c-43ca-87cb-db753e7bbab9", name: "příprava v poli - praxe", abbreviation: "PP", color: "#7cb342" },
    { id: "83d0a942-6456-4f35-bce8-37c9a08cb966", name: "rezerva", abbreviation: "R", color: "#ff1f1f" },

    { id: "5f147c3c-b307-4334-a339-6f4c83f1dad7", name: "intenzivní kurz AJ", abbreviation: "AJ", color: "#ffff33" },
    { id: "48ff1e53-83c8-48d6-84e6-b63e4f5fa60d", name: "kurz TV", abbreviation: "TV", color: "#7a6000" },
    { id: "1af8ea7e-b280-4202-8efe-1df22763081e", name: "odborná praxe", abbreviation: "OP", color: "#bdbdbd" },
    { id: "0b624b6c-ed72-4316-b070-8e09f73e531c", name: "stáž na systematizovaném místě", abbreviation: "SSM", color: "#d9d9d9" },
    { id: "cd309340-cae0-4ec2-8adc-f4c61dc5f023", name: "letecká AJ", abbreviation: "LA", color: "#ffff66" },
    { id: "0f5713ca-7134-4c6a-99a0-7166c689dbfb", name: "vyřazení", abbreviation: "V", color: "#ff1f1f" },
    { id: "7edccbad-3c70-49ec-b5ca-b744bec8d234", name: "aplikované vojenské technologie", abbreviation: "AVT", color: "#00b0f0" },

    { id: "d9494b47-b46c-4ba4-a900-1443751cabce", name: "příprava na SZZ", abbreviation: "PSZZ", color: "#a64ac9" },
    { id: "eb86a21b-04e2-419c-a3a3-5f21603d349b", name: "SZZ", abbreviation: "SZZ", color: "#8e24aa" },
    { id: "4d0d3e3f-4d45-4fc4-95f5-612905cf5823", name: "kurz SERE, případně LV, CANI, PARA", abbreviation: "SERE", color: "#9fd3f2" },
    { id: "4560fca2-533b-45c1-945c-16dcf0935126", name: "zkouškové období / letecký výcvik", abbreviation: "ŘD/LV", color: "#d4af37" },
    { id: "3d5c8255-9abc-4d3e-aa25-b3984e5ce1a1", name: "diplomový projekt", abbreviation: "DP", color: "#d9d9d9" }
];

const events_ = [
    { id: "8969d826-bb56-4a26-b3cd-82554cee8897", startDate: "2025-08-25", endDate: "2025-12-21", typeId: "ac3238a2-a3ca-4f4b-a56b-8ac7c3953aff" },
    { id: "d6ad5dad-43d8-4ccf-b4bc-35fe30357f1e", startDate: "2025-12-22", endDate: "2026-01-04", typeId: "6fef77f1-a580-4e13-a088-30368a95af2f" },
    { id: "e3e44b78-aa94-49a8-a0e9-a0cb73a3f871", startDate: "2026-01-05", endDate: "2026-01-25", typeId: "7e4187e5-b219-4332-b50e-54411541bba6" },
    { id: "c689f2bd-0703-42f7-a456-1f5eaa6dc968", startDate: "2026-02-02", endDate: "2026-03-01", typeId: "78a6f015-b8f4-49c8-b218-7861454cb8e9" },
    { id: "f95385c6-c89e-4a1b-8c45-c039f6ae7253", startDate: "2026-03-02", endDate: "2026-03-22", typeId: "79c71457-b926-449a-b227-a3461bf1df4c" },
    { id: "ede4e6a5-742c-4848-8238-e0de940c6b52", startDate: "2026-03-23", endDate: "2026-04-12", typeId: "539c45b2-629c-43ca-87cb-db753e7bbab9" },
    { id: "ca98c5bd-657c-474a-a1d8-334189fce221", startDate: "2026-04-13", endDate: "2026-05-17", typeId: "d9494b47-b46c-4ba4-a900-1443751cabce" },
    { id: "1d96403b-c421-4d3b-9123-54368789273a", startDate: "2026-05-18", endDate: "2026-05-31", typeId: "eb86a21b-04e2-419c-a3a3-5f21603d349b" },
    { id: "ac437892-86d5-495d-bd0d-7e511c777c5d", startDate: "2026-06-01", endDate: "2026-06-21", typeId: "4d0d3e3f-4d45-4fc4-95f5-612905cf5823" },
    { id: "b6b0288d-ddbf-48a7-8aa7-060215cf9dd2", startDate: "2026-06-22", endDate: "2026-09-20", typeId: "3d5c8255-9abc-4d3e-aa25-b3984e5ce1a1" }
];

const enrichEvent = (event) => {
    return {
        ...event,
        "type": {
            ...eventTypes.find(t => t.id === event.typeId)
        }
    }
}

export const FlexRow = ({ children }) => {
    return (
        <div
            className="d-flex gap-1 align-items-center"
            style={{ flexWrap: "nowrap" }}
        >
            {children}
        </div>
    )
}

export const FlexContainer = ({ children }) => {
    return (
        <div
            style={{
                overflowX: "auto",
                overflowY: "hidden",
                width: "100%",
            }}
        >
            <div
                style={{
                    display: "inline-flex",
                    flexDirection: "column",
                    gap: "4px",
                    minWidth: "max-content",
                }}
            >
                {children}
            </div>
        </div>
    )
}

export const Tools = ({ selected, onSelect }) => {
    return (<>
        {eventTypes.map(current_tool => (
            <button
                key={current_tool.id}
                style={{
                    backgroundColor: current_tool?.color,
                    border: current_tool == selected ? "3px solid black" : null
                }}
                className="btn btn-sm"
                onClick={() => onSelect(current_tool)}
            >
                {current_tool.name}
            </button>
        ))}
    </>)
}

export const PlanRow = ({ item, academicYear = academicYear_ }) => {
    //predpoklada se, ze item ma subevents, pokud ne, tak se pouziji demodata, nevhodne pro produkci
    const { subevents = events_ } = item
    // const subevents=events_
    //dekompozice akademickeho roku,
    // const { year: academicStartYear, startWeek, endWeek } = academicYear;
    const { year: academicStartYear, startWeek, endWeek } = {
        year: 2025,
        startWeek: 35,
        endWeek: 42
    }

    //tydny dopocitane z akademickeho roku, automaticky se porepocitaji pri zmene pouzitych parametru
    const weeks = useMemo(
        () => buildAcademicWeeks(academicStartYear, startWeek, endWeek),
        [academicStartYear, startWeek, endWeek]
    );

    //aktualni nastroj pro klikani
    const [tool, setTool] = useState(eventTypes.find(t => t?.id === "7e4187e5-b219-4332-b50e-54411541bba6"))
    //poznamenani si udalosti, jejich datove osetreni, toto je lokalni cache
    const [events, setEvents] = useState(subevents.map(normalizeEvent));

    //prirazeni udalosti tydnum, pozor na multiplicity
    const weeksWithEvents = useMemo(
        () => assignEventsToWeeks(weeks, events.map(normalizeEvent).map(enrichEvent)),
        [weeks, events]
    );

    const handleIntervalClick = ({ startDate, endDate }) =>
        setEvents(prev => applyIntervalTransition(prev, startDate, endDate, tool));

    // poznamenani si udalosti, jejich datove osetreni
    // diff(old, events) je definice neulozenych zmen
    // lze proves debounced synchronizaci s backendem, tj. bezpecne ulozeni dat na server
    // po ulozeni se nactena data pomoci setOld tady aktualizuji, 
    // zmeny udelane behem teto aktualizace je mozne opet ulozit
    const [old, setOld] = useState([...events])
    const { added, updated, deleted } = diffEvents(old, events)

    return (<>
        <FlexContainer>
            <FlexRow>
                <Tools selected={tool} onSelect={setTool} />
            </FlexRow>
            <FlexRow>
                <WeekHeaderContent academicYear={academicYear} />
            </FlexRow>

            <FlexRow>
                {weeksWithEvents.map((week) => (
                    <ClickableBox
                        key={week.id}
                        week={week}
                        onClick={handleIntervalClick}
                    />
                ))}
            </FlexRow>

        </FlexContainer>

        <pre>
            <b>inserted</b><br />
            {JSON.stringify(added, null, 2)}
        </pre>

        <pre>
            <b>updated</b><br />
            {JSON.stringify(updated, null, 2)}
        </pre>

        <pre>
            <b>removed</b><br />
            {JSON.stringify(deleted, null, 2)}
        </pre>

        {/* <Row>
            <Col>
                <pre>
                    <b>Old list</b><br />
                    {JSON.stringify(old.map(enrichEvent), null, 2)}
                </pre>
            </Col>
            <Col>
                <pre>
                    <b>New list</b><br />
                    {JSON.stringify(events.map(enrichEvent), null, 2)}
                </pre>
            </Col>
        </Row> */}

    </>
    );
};