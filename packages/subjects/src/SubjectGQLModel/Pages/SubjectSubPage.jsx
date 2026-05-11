import { CardCapsule } from "../Components/CardCapsule"
import { Table } from "../Components/Table"
import { Attribute } from "../../../../_template/src/Base/Components"
import { Link } from "../Components/Link"

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
                    {item?.program?.id}
                </Attribute>
            </CardCapsule>
            <CardCapsule title="Semestry">
            <table className="table table-sm">
                <thead>
                <tr>
                    <th>Pořadí</th>
                    <th>ID</th>
                    <th>Last change</th>
                </tr>
                </thead>
                <tbody>
                {(item?.semesters || []).map(semester => (
                    <tr key={semester.id}>
                        <td>{semester.order}</td>
                        <td>{semester.id}</td>
                        <td>{item.lastchange}</td>
                    </tr>
                ))}
                </tbody>
            </table>
            </CardCapsule>
        </>
    )
}