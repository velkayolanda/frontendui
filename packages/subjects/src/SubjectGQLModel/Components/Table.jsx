import { useMemo, useState } from "react"
import { KebabMenu, TableRow, TableBody } from "../../../../_template/src/Base/Components/Table"
import { Link } from "./Link"
import { UpdateLink, UpdateButton } from "../Mutations/Update"
import { DeleteButton } from "../Mutations/Delete"

/**
 * Sort button component that shows the current sort state
 * and toggles between: none -> asc -> desc -> none
 */
const SortButton = ({ column, sortConfig, onSort }) => {
    const isActive = sortConfig.column === column
    const direction = isActive ? sortConfig.direction : null

    const getIcon = () => {
        if (!isActive || direction === null) return "↕"
        if (direction === "asc") return "↑"
        return "↓"
    }

    const getTitle = () => {
        if (!isActive || direction === null) return "Seřadit vzestupně"
        if (direction === "asc") return "Seřadit sestupně"
        return "Zrušit řazení"
    }

    return (
        <button
            type="button"
            className={`btn btn-sm ${isActive ? 'btn-primary' : 'btn-outline-secondary'} ms-1`}
            onClick={() => onSort(column)}
            title={getTitle()}
            style={{ padding: '0.1rem 0.3rem', fontSize: '0.75rem' }}
        >
            {getIcon()}
        </button>
    )
}

/**
 * Custom table header with sort buttons
 */
const SortableTableHeader = ({ tableDef, sortConfig, onSort }) => {
    const sortableColumns = ['name', 'nameEn', 'program', 'semesters', 'lastchange']

    return (
        <thead>
            <tr>
                {Object.entries(tableDef).map(([key, { label }]) => (
                    <th key={key}>
                        {label}
                        {sortableColumns.includes(key) && (
                            <SortButton
                                column={key}
                                sortConfig={sortConfig}
                                onSort={onSort}
                            />
                        )}
                    </th>
                ))}
            </tr>
        </thead>
    )
}

/**
 * Get sortable value from a row based on column key
 */
const getSortValue = (row, column) => {
    switch (column) {
        case 'name':
            return row?.name || ""
        case 'nameEn':
            return row?.nameEn || ""
        case 'program':
            return row?.program?.name || row?.programId || ""
        case 'semesters':
            return row?.semesters?.length || 0
        case 'lastchange':
            return row?.lastchange || ""
        default:
            return ""
    }
}

/**
 * Compare function for sorting - handles both strings and numbers
 */
const compareValues = (a, b, direction) => {
    // Handle numbers
    if (typeof a === 'number' && typeof b === 'number') {
        return direction === 'asc' ? a - b : b - a
    }

    // Convert to strings for comparison
    const strA = String(a).toLowerCase()
    const strB = String(b).toLowerCase()

    // Check if both values are numeric strings
    const numA = parseFloat(strA)
    const numB = parseFloat(strB)
    if (!isNaN(numA) && !isNaN(numB)) {
        return direction === 'asc' ? numA - numB : numB - numA
    }

    // String comparison
    if (direction === 'asc') {
        return strA.localeCompare(strB, 'cs')
    }
    return strB.localeCompare(strA, 'cs')
}

/**
 * Vytvoří definici sloupců pro tabulku Subject.
 * Tato definice určuje:
 * - Které sloupce se zobrazí
 * - Pořadí sloupců
 * - Jak se vykreslí každá buňka
 * - Nástroje (Detail, Editovat, Smazat)
 */
const buildSubjectTableDef = (data) => {
    if (!data || data.length === 0) return {}

    return {
        name: {
            label: "Název",
            component: ({ row }) => (
                <td>
                    <Link item={row}>{row?.name || "Bez názvu"}</Link>
                </td>
            )
        },
        nameEn: {
            label: "Anglický název",
            component: ({ row }) => (
                <td>{row?.nameEn || ""}</td>
            )
        },
        program: {
            label: "Program",
            component: ({ row }) => (
                <td>{row?.program?.name || row?.programId || ""}</td>
            )
        },
        semesters: {
            label: "Semestrů",
            component: ({ row }) => (
                <td>{row?.semesters?.length || 0}</td>
            )
        },
        lastchange:{
            label: "Změněno",
            component: ({ row }) => (
                <td>{row?.lastchange}</td>
            )
        },
        tools: {
            label: "Nástroje",
            component: ({ row }) => (
                <td>
                    <KebabMenu actions={[
                        {
                            children: (
                                <Link
                                    className="btn btn-sm btn-outline-secondary border-0 text-start w-100"
                                    item={row}
                                >
                                    Detail
                                </Link>
                            )
                        },
                        {
                            children: (
                                <UpdateLink
                                    className="btn btn-sm btn-outline-secondary border-0 text-start w-100"
                                    item={row}
                                    action="edit"
                                >
                                    Editovat
                                </UpdateLink>
                            )
                        },
                        {
                            children: (
                                <DeleteButton
                                    className="btn btn-sm btn-outline-danger border-0 text-start w-100"
                                    item={row}
                                    rbacitem={row?.rbacobject}
                                >
                                    Smazat
                                </DeleteButton>
                            )
                        },
                    ]} />
                </td>
            )
        }
    }
}

export const Table = ({ data, onSortActivate }) => {
    const [sortConfig, setSortConfig] = useState({ column: null, direction: null })
    const tableDef = useMemo(() => buildSubjectTableDef(data), [data])

    const handleSort = (column) => {
        if (sortConfig.column !== column) {
            // New column: start with ascending
            if (sortConfig.column === null) {
                // Sort was off — signal to load all data before sorting
                onSortActivate?.()
            }
            setSortConfig({ column, direction: 'asc' })
            return
        }
        if (sortConfig.direction === 'asc') {
            // Was ascending: switch to descending
            setSortConfig({ column, direction: 'desc' })
            return
        }
        // Was descending: remove sort; keep loaded items, don't restart pagination
        setSortConfig({ column: null, direction: null })
    }

    const sortedData = useMemo(() => {
        if (!data || !sortConfig.column || !sortConfig.direction) {
            return data
        }

        return [...data].sort((a, b) => {
            const valueA = getSortValue(a, sortConfig.column)
            const valueB = getSortValue(b, sortConfig.column)
            return compareValues(valueA, valueB, sortConfig.direction)
        })
    }, [data, sortConfig])

    if (!data || data.length === 0) return null

    return (
        <div className="table-responsive">
            <table className="table table-stripped">
                <SortableTableHeader
                    tableDef={tableDef}
                    sortConfig={sortConfig}
                    onSort={handleSort}
                />
                <TableBody data={sortedData} table_def={tableDef} />
            </table>
        </div>
    )
}