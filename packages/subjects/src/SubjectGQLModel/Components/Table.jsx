import { useMemo } from "react"
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

    const getIcon = () => isActive ? "↓" : "↕"
    const getTitle = () => isActive ? "Zrušit řazení" : "Seřadit vzestupně"

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
    const sortableColumns = ['name', 'nameEn', 'program', 'lastchange']

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

export const Table = ({ data, sortConfig = { column: null, direction: null }, onSort }) => {
    const tableDef = useMemo(() => buildSubjectTableDef(data), [data])

    if (!data || data.length === 0) return null

    return (
        <div className="table-responsive">
            <table className="table table-stripped">
                <SortableTableHeader
                    tableDef={tableDef}
                    sortConfig={sortConfig}
                    onSort={onSort}
                />
                <TableBody data={data} table_def={tableDef} />
            </table>
        </div>
    )
}