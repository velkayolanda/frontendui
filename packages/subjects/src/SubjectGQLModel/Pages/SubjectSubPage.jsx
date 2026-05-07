import { CardCapsule } from "../Components/CardCapsule"
import { Table } from "../Components/Table"
import { Attribute } from "../../../../_template/src/Base/Components"
import { Link } from "../Components/Link"

/**
 * Skusobna subpage pre SubjectGQLModel -> readonly
 * Zobrazuje semestry a info o programe v pravom stlpci
 *
 * @component
 * @param {Object} props
 * @param {Object} props.item - SubjectGQLModel entita
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