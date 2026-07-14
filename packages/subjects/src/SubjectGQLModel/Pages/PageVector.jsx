/** @module Pages */
/**
 * @fileoverview Stránka se seznamem předmětů s infinite scroll a řazením.
 *
 * Podporuje dva typy řazení:
 * 1. Backend řazení - pro sloupce name, nameEn, program, lastchange
 *    (posílá orderby parametr na server, restartuje načítání)
 * 2. Client-side řazení - pro sloupce které backend nepodporuje (semesters)
 *    (řadí pouze lokálně načtená data bez restartu)
 */

import { ReadPageAsyncAction } from "../Queries"
import { useInfiniteScroll } from "../../../../dynamic/src/Hooks/useInfiniteScroll"
import { PageBase } from "./PageBase"
import { Table } from "../Components/Table"
import { Filter } from "../Components/Filter"
import { FilterButton, ResetFilterButton } from "../../../../_template/src/Base/FormControls/Filter"
import { useSearchParams } from "react-router"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { AsyncStateIndicator } from "../../../../_template/src/Base/Helpers/AsyncStateIndicator"
import { Collapsible } from "../../../../_template/src/Base/FormControls/Collapsible"
import { CreateButton } from "../Mutations/Create"
import { GenerateButton } from "../Components/GenerateForm"

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNKCE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Bezpečně parsuje JSON where parametr z URL.
 *
 * @param {URLSearchParams} sp - Search params z URL
 * @param {string} paramName - Název parametru (default "where")
 * @returns {Object|null} Parsovaný objekt nebo null při chybě/prázdném vstupu
 */
function safeParseWhere(sp, paramName = "where") {
    const raw = sp.get(paramName);
    if (!raw) return null;
    try {
        const obj = JSON.parse(raw);
        return obj && typeof obj === "object" ? obj : null;
    } catch {
        return null;
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// KONFIGURACE ŘAZENÍ
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Mapování názvů sloupců UI na názvy polí v databázi.
 * Používá se pro backend řazení (orderby parametr v GraphQL).
 */
const COLUMN_TO_DB_FIELD = {
    name: "name",
    nameEn: "name_en",
    lastchange: "lastchange",
    program: "program_id",
}

/**
 * Sloupce které se řadí lokálně (client-side).
 * Backend nepodporuje řazení podle těchto sloupců (např. počet semestrů
 * je odvozená hodnota z relace, ne přímý sloupec v DB).
 *
 * Pro tyto sloupce:
 * - Nevolá se restart() při změně řazení
 * - Řadí se pouze již načtená data v paměti
 */
const CLIENT_SIDE_SORT_COLUMNS = ['semesters']

/**
 * Vrací orderby parametr pro backend na základě aktuálního nastavení řazení.
 *
 * @param {Object} sortConfig - Konfigurace řazení
 * @param {string|null} sortConfig.column - Název sloupce nebo null
 * @param {string|null} sortConfig.direction - 'asc' nebo null
 * @returns {string|undefined} Název DB pole pro orderby nebo undefined
 */
const computeOrderby = (sortConfig) => {
    if (!sortConfig.column || !sortConfig.direction) return undefined
    // Pro client-side sloupce nevracíme orderby - backend je neumí řadit
    if (CLIENT_SIDE_SORT_COLUMNS.includes(sortConfig.column)) return undefined
    return COLUMN_TO_DB_FIELD[sortConfig.column] || undefined
}

/**
 * Lokálně seřadí položky pro client-side sloupce.
 * Pro backend sloupce vrací data beze změny (řadí server).
 *
 * @param {Array} items - Pole předmětů k seřazení
 * @param {Object} sortConfig - Konfigurace řazení
 * @param {string|null} sortConfig.column - Název sloupce
 * @param {string|null} sortConfig.direction - 'asc' nebo null
 * @returns {Array} Seřazené pole (nová instance) nebo původní pole
 */
const sortItemsClientSide = (items, sortConfig) => {
    // Bez aktivního řazení vrať původní data
    if (!sortConfig.column || !sortConfig.direction) return items
    // Pro backend sloupce vrať původní data (řadí server)
    if (!CLIENT_SIDE_SORT_COLUMNS.includes(sortConfig.column)) return items

    // Lokální řazení podle počtu semestrů
    return [...items].sort((a, b) => {
        if (sortConfig.column === 'semesters') {
            const aCount = a?.semesters?.length || 0
            const bCount = b?.semesters?.length || 0
            return sortConfig.direction === 'asc' ? aCount - bCount : bCount - aCount
        }
        return 0
    })
}

// ═══════════════════════════════════════════════════════════════════════════
// KOMPONENTA
// ═══════════════════════════════════════════════════════════════════════════

/** Název URL parametru pro filtr */
const filterParameterName = "gr_where"

/**
 * PageVector - Stránka se seznamem předmětů.
 *
 * Funkce:
 * - Infinite scroll pro postupné načítání dat
 * - Filtrování podle URL parametrů
 * - Řazení (backend i client-side)
 * - Tlačítka pro vytvoření a generování předmětů
 *
 * @component
 * @param {Object} props
 * @param {React.ReactNode} [props.children] - Volitelný obsah
 * @param {Function} [props.queryAsyncAction=ReadPageAsyncAction] - Async akce pro načítání dat
 */
export const PageVector = ({ children, queryAsyncAction = ReadPageAsyncAction }) => {

    const [sp] = useSearchParams();

    /** Aktuální konfigurace řazení: { column: string|null, direction: 'asc'|null } */
    const [sortConfig, setSortConfig] = useState({ column: null, direction: null })

    /** Parsovaný where filtr z URL */
    const whereFromUrl = useMemo(() => safeParseWhere(sp, filterParameterName), [sp.toString()]);

    /** Infinite scroll hook - poskytuje data, stav načítání a ovládací funkce */
    const { items, loading, error, hasMore, sentinelRef, loadMore, restart } = useInfiniteScroll(
        {
            asyncAction: queryAsyncAction,
            actionParams: { skip: 0, limit: 25, where: whereFromUrl },
        }
    )

    /**
     * Ref pro sledování předchozího sloupce řazení.
     * Potřebné pro detekci přechodu z client-side řazení na žádné řazení,
     * abychom zbytečně nevolali restart() a neztráceli načtená data.
     */
    const prevSortColumnRef = useRef(null)

    /**
     * Effect pro restart načítání při změně řazení nebo filtru.
     *
     * Logika:
     * 1. Pro client-side sloupce (semesters) - nerestartuji, jen měním sortConfig
     * 2. Pro přechod z client-side na žádný sort - nerestartuji (zachovám data)
     * 3. Pro backend sloupce - restartuji s novým orderby parametrem
     */
    useEffect(() => {
        const prevColumn = prevSortColumnRef.current
        prevSortColumnRef.current = sortConfig.column

        // Client-side sloupec aktivní - data již máme, jen lokálně seřadíme
        if (CLIENT_SIDE_SORT_COLUMNS.includes(sortConfig.column)) return

        // Přechod z client-side sloupce na vypnutý sort - data máme, nerestartuj
        if (sortConfig.column === null && CLIENT_SIDE_SORT_COLUMNS.includes(prevColumn)) return

        // Backend řazení nebo změna filtru - restartuj načítání od začátku
        const orderby = computeOrderby(sortConfig)
        const params = { skip: 0, limit: 25, where: whereFromUrl, ...(orderby && { orderby }) }
        restart(params)
    }, [whereFromUrl, sortConfig]);

    /**
     * Lokálně seřazená data pro zobrazení v tabulce.
     * Pro backend sloupce vrací data beze změny (již seřazená serverem).
     * Pro client-side sloupce aplikuje lokální řazení.
     */
    const sortedItems = useMemo(() => sortItemsClientSide(items, sortConfig), [items, sortConfig])

    /**
     * Handler pro kliknutí na tlačítko řazení ve sloupci.
     * Toggle logika: none -> asc -> none
     */
    const handleSort = useCallback((column) => {
        setSortConfig(prev => {
            // Klik na aktivní sloupec -> vypni řazení
            if (prev.column === column && prev.direction !== null) return { column: null, direction: null }
            // Klik na jiný sloupec -> zapni vzestupné řazení
            return { column, direction: 'asc' }
        })
    }, [])

    return (
        <PageBase>
            <Collapsible
                className="form-control btn btn-outline-primary"
                buttonLabelCollapsed="Zobrazit filtr"
                buttonLabelExpanded="Skrýt filtr"
            >
                <Filter>
                    <FilterButton
                        className="form-control btn btn-outline-success"
                        paramName={filterParameterName}
                    >
                        Filtrovat
                    </FilterButton>
                    <ResetFilterButton
                        className="form-control btn btn-warning"
                        paramName={filterParameterName}
                    >
                        Vymazat filtr
                    </ResetFilterButton>
                </Filter>
            </Collapsible>

            <div className="d-flex justify-content-center gap-5 mb-4 mt-4">
                <CreateButton className="btn btn-outline-success" rbacitem={{}}>Přidat předmět</CreateButton>
                <GenerateButton className="btn btn-outline-primary" rbacitem={{}} type="button" onSuccess={() => restart({ skip: 0, limit: 25, where: whereFromUrl })}>
                    Generovat předměty
                </GenerateButton>
            </div>

            {/* Tabulka předmětů s podporou řazení */}
            <Table data={sortedItems} sortConfig={sortConfig} onSort={handleSort} />

            {/* Indikátor načítání a chyb */}
            <AsyncStateIndicator error={error}  loading={loading} text="Nahrávám další..." />

            {/* Sentinel element pro IntersectionObserver - spouští načítání dalších dat */}
            {hasMore && <div ref={sentinelRef} style={{ height: 80, backgroundColor: "lightgray" }} />}
            {/* Záložní tlačítko pro ruční načtení dalších dat */}
            {hasMore && <button className="btn btn-success form-control" onClick={() => loadMore()}>Více</button>}
        </PageBase>
    )
}
