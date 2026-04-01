import { useMemo } from "react";
import {
    FlexContainer,
    FlexRow,
    WeekHeaderContent,
    WeekGridItem
} from "../Plan";
import {
    getContrastTextColor,
    toLocalDate,
    addDays
} from "../Plan";

/* =========================
   KONSTANTY
========================= */

const DAY_NAMES = ["pondělí", "úterý", "středa", "čtvrtek", "pátek"];
const ISO_DAY_INDEXES = [1, 2, 3, 4, 5]; // Po..Pá

const DAY_START_MINUTES = 8 * 60;   // 8:00
const DAY_END_MINUTES = 18 * 60;    // 18:00
const DAY_TOTAL_MINUTES = DAY_END_MINUTES - DAY_START_MINUTES;

const TIME_MARKS = [
    { label: "8:00", minutes: 8 * 60 },
    { label: "9:30", minutes: 9 * 60 + 30 },
    { label: "9:50", minutes: 9 * 60 + 50 },
    { label: "11:20", minutes: 11 * 60 + 20 },
    { label: "11:40", minutes: 11 * 60 + 40 },
    { label: "13:10", minutes: 13 * 60 + 10 },
    { label: "14:30", minutes: 14 * 60 + 30 },
    { label: "16:00", minutes: 16 * 60 + 0 },
    { label: "16:20", minutes: 16 * 60 + 20 },
    { label: "17:50", minutes: 17 * 60 + 50 }
];

/* =========================
   DATE HELPERS
========================= */

function toDateTime(value) {
    if (value instanceof Date) return new Date(value.getTime());
    return new Date(value);
}

function startOfDay(dateLike) {
    const d = toDateTime(dateLike);
    return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
}

function endOfDay(dateLike) {
    const d = toDateTime(dateLike);
    return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
}

function minutesOfDay(date) {
    return date.getHours() * 60 + date.getMinutes();
}

function rangesIntersect(aStart, aEnd, bStart, bEnd) {
    return aStart <= bEnd && bStart <= aEnd;
}

function getISOWeekday(date) {
    const jsDay = date.getDay();
    return jsDay === 0 ? 7 : jsDay;
}

function startOfISOWeek(dateLike) {
    const d = startOfDay(dateLike);
    return addDays(d, 1 - getISOWeekday(d));
}

function pad2(n) {
    return String(n).padStart(2, "0");
}

function getISOWeek(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

function buildWeeksInRange(startdate, enddate) {
    const start = startOfISOWeek(startdate);
    const end = startOfISOWeek(enddate);

    const result = [];
    let cursor = new Date(start);

    while (cursor <= end) {
        const weekStart = new Date(cursor);
        const weekEnd = addDays(weekStart, 6);

        const isoYear = (() => {
            const d = new Date(Date.UTC(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate()));
            const dayNum = d.getUTCDay() || 7;
            d.setUTCDate(d.getUTCDate() + 4 - dayNum);
            return d.getUTCFullYear();
        })();

        const isoWeek = getISOWeek(weekStart);

        result.push({
            id: `${isoYear}-W${String(isoWeek).padStart(2, "0")}`,
            isoYear,
            isoWeek,
            label: `${isoWeek}`,
            labelFull: `${isoYear}/W${isoWeek}`,
            weekStart,
            weekEnd,
            firstHalfStart: weekStart,
            firstHalfEnd: addDays(weekStart, 2),
            secondHalfStart: addDays(weekStart, 3),
            secondHalfEnd: weekEnd
        });

        cursor = addDays(cursor, 7);
    }

    return result;
}

function normalizeEvent(event) {
    const startRaw = event?.start ?? event?.startDate ?? event?.startdate;
    const endRaw = event?.end ?? event?.endDate ?? event?.enddate ?? startRaw;

    const start = toDateTime(startRaw);
    const end = toDateTime(endRaw);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
        return null;
    }

    return start <= end
        ? { ...event, startDateTimeObj: start, endDateTimeObj: end }
        : { ...event, startDateTimeObj: end, endDateTimeObj: start };
}

function getWeekDayDate(week, isoDay) {
    return addDays(week.weekStart, isoDay - 1);
}

function getEventColor(event) {
    return event?.color ?? event?.type?.color ?? "#777777";
}

function getEventLabel(event) {
    return event?.abbreviation ?? event?.type?.abbreviation ?? event?.title ?? event?.name ?? "";
}

function clipEventToDay(event, dayDate) {
    const dayStart = startOfDay(dayDate);
    const dayEnd = endOfDay(dayDate);

    if (!rangesIntersect(event.startDateTimeObj, event.endDateTimeObj, dayStart, dayEnd)) {
        return null;
    }

    const clippedStart = event.startDateTimeObj < dayStart ? dayStart : event.startDateTimeObj;
    const clippedEnd = event.endDateTimeObj > dayEnd ? dayEnd : event.endDateTimeObj;

    const startMinutes = Math.max(minutesOfDay(clippedStart), DAY_START_MINUTES);
    const endMinutes = Math.min(minutesOfDay(clippedEnd), DAY_END_MINUTES);

    if (endMinutes <= DAY_START_MINUTES || startMinutes >= DAY_END_MINUTES || endMinutes <= startMinutes) {
        return null;
    }

    return {
        ...event,
        clippedStart,
        clippedEnd,
        topPct: ((startMinutes - DAY_START_MINUTES) / DAY_TOTAL_MINUTES) * 100,
        heightPct: ((endMinutes - startMinutes) / DAY_TOTAL_MINUTES) * 100
    };
}

/* =========================
   UI
========================= */

const DayLabelCell = ({ label, height = 180 }) => {
    return (
        <div
            className="border rounded overflow-hidden d-flex align-items-center justify-content-center user-select-none"
            style={{
                width: "40px",
                minWidth: "40px",
                height: `${height}px`,
                writingMode: "vertical-rl",
                transform: "rotate(180deg)",
                textAlign: "center",
                fontSize: "14px",
                flex: "0 0 auto"
            }}
        >
            {label}
            {/* <TimeMarksLayer /> */}
        </div>
    );
};

const TimeMarksLayer = () => {
    return (
        <>
            {TIME_MARKS.map((mark) => {
                const topPct = ((mark.minutes - DAY_START_MINUTES) / DAY_TOTAL_MINUTES) * 100;

                return (
                    <div
                        key={mark.label}
                        className="position-absolute"
                        style={{
                            left: 0,
                            right: 0,
                            top: `${topPct}%`,
                            borderTop: "1px solid #a72727"
                        }}
                    />
                );
            })}
        </>
    );
};

const DayEventsLayer = ({ events }) => {
    return (
        <>
            {events.map((event, index) => {
                const backgroundColor = getEventColor(event);
                const color = getContrastTextColor(backgroundColor);

                return (
                    <div
                        key={event.id ?? `${index}-${event.topPct}`}
                        className="position-absolute border rounded overflow-hidden"
                        title={getEventLabel(event)}
                        style={{
                            left: "2px",
                            right: "2px",
                            top: `${event.topPct}%`,
                            height: `${event.heightPct}%`,
                            minHeight: "8px",
                            backgroundColor,
                            color,
                            fontSize: "9px",
                            lineHeight: 1.1,
                            padding: "1px 2px",
                            boxSizing: "border-box"
                        }}
                    >
                        {getEventLabel(event)}
                    </div>
                );
            })}
        </>
    );
};

/**
 * Náhrada za ClickableBox:
 * jedna buňka = jeden týden + jeden konkrétní den v týdnu
 */
const DayWeekCell = ({ week, dayIndex, events, height = 240 }) => {
    const dayDate = useMemo(() => getWeekDayDate(week, dayIndex), [week, dayIndex]);

    const dayEvents = useMemo(() => {
        return events
            .map((event) => clipEventToDay(event, dayDate))
            .filter(Boolean);
    }, [events, dayDate]);

    return (
        <WeekGridItem
            height={height}
            title={`${DAY_NAMES[dayIndex - 1]} ${dayDate.getDate()}.${dayDate.getMonth() + 1}.${dayDate.getFullYear()}`}
        >
            <div
                className="position-relative"
                style={{
                    width: "100%",
                    height: "100%",
                    backgroundColor: "#fff"
                }}
            >
                <TimeMarksLayer />
                <DayEventsLayer events={dayEvents} />
                
            </div>
        </WeekGridItem>
    );
};

const A4PlanDayRow = ({ dayName, dayIndex, weeks, events, rowHeight = 240 }) => {
    return (
        <FlexRow>
            <DayLabelCell label={dayName} height={rowHeight} />
            {weeks.slice(1).map((week) => (
                <DayWeekCell
                    key={`${week.id}-${dayIndex}`}
                    week={week}
                    dayIndex={dayIndex}
                    events={events}
                    height={rowHeight}
                />
            ))}
        </FlexRow>
    );
};

export const A4Plan = ({ item, startdate, enddate }) => {
    const { subevents:events=[] } = item || {}
    const weeks = useMemo(
        () => buildWeeksInRange(startdate, enddate),
        [startdate, enddate]
    );

    const normalizedEvents = useMemo(
        () => events.map(normalizeEvent).filter(Boolean),
        [events]
    );

    const academicYear = useMemo(() => {
        const firstWeek = weeks[0];
        const lastWeek = weeks[weeks.length - 1];

        if (!firstWeek || !lastWeek) {
            return {
                year: new Date().getFullYear(),
                startWeek: 1,
                endWeek: 1
            };
        }

        return {
            year: firstWeek.isoYear,
            startWeek: firstWeek.isoWeek,
            endWeek: lastWeek.isoWeek
        };
    }, [weeks]);

    return (
        <FlexContainer>
            <FlexRow>
                <WeekHeaderContent academicYear={academicYear} />
            </FlexRow>

            {DAY_NAMES.map((dayName, index) => (
                <A4PlanDayRow
                    key={dayName}
                    dayName={dayName}
                    dayIndex={ISO_DAY_INDEXES[index]}
                    weeks={weeks}
                    events={normalizedEvents}
                />
            ))}
        </FlexContainer>
    );
};
