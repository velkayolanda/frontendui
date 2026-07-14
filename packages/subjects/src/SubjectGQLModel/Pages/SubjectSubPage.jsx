/** @module Pages */
import { CardCapsule } from "../Components/CardCapsule"
import { Table } from "../Components/Table"
import { Attribute } from "../../../../_template/src/Base/Components"
import { Link } from "../Components/Link"

/**
 * Generuje název semestru podle pořadí.
 * Lichá čísla = zimní semestr, sudá čísla = letní semestr.
 * @param {number} order - Pořadí semestru (1, 2, 3, ...)
 * @returns {string} Název semestru, např. "1. ročník zimní"
 */
const getSemesterName = (order) => {
    const orderNum = parseInt(order, 10) || 0
    const year = Math.ceil(orderNum / 2)
    const isWinter = orderNum % 2 === 1
    return `${year}. ročník ${isWinter ? "zimní" : "letní"}`
}

/**
 * SubjectSubPage - detailní zobrazení entity Subject (readonly).
 *
 * Zobrazuje dvě sekce v CardCapsule komponentách:
 *
 * 1. Program - informace o přiřazeném programu:
 *    - Název programu
 *    - ID programu
 *
 * 2. Semestry - tabulka semestrů přiřazených k předmětu:
 *    - Pořadí semestru
 *    - ID semestru
 *    - Datum poslední změny
 *
 * @component
 * @param {Object} props
 * @param {Object} props.item - Entita Subject s vlastnostmi:
 *   @param {Object} props.item.program - Přiřazený program (id, name)
 *   @param {Array} props.item.semesters - Pole semestrů (id, order)
 *   @param {string} props.item.lastchange - Datum poslední změny
 *
 * @example
 * <SubjectSubPage item={subjectEntity} />
 */
export const SubjectSubPage = ({ item }) => {
    return (
        <>
            <CardCapsule item={item} title="Program">
                <Attribute label="Název">
                    {item?.program?.name}
                </Attribute>
                <Attribute label="ID">
                    <a href={`/program/ProgramGQLModel/${item?.program?.id}`}>{item?.program?.id}</a>
                </Attribute>
            </CardCapsule>
            <CardCapsule title="Semestry">
            <table className="table table-sm">
                <thead>
                <tr>
                    <th>Pořadí</th>
                    <th>Název</th>
                    <th>ID</th>
                    <th>Last change</th>
                </tr>
                </thead>
                <tbody>
                {[...item.semesters]
                    .sort((a, b) => (parseInt(a.order, 10) || 0) - (parseInt(b.order, 10) || 0))
                    .map(semester => (
                    <tr key={semester.id}>
                        <td>{semester.order}</td>
                        <td>{getSemesterName(semester.order)}</td>
                        <td><a href={`/semestr/SemesterGQLModel/${semester.id}`}>{semester.id}</a></td>
                        <td>{item.lastchange}</td>
                    </tr>
                ))}
                </tbody>
            </table>
            </CardCapsule>
        </>
    )
}