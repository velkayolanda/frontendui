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

            <CardCapsule item={item} title="Semestry">
                <Table data={item?.semesters || []} />
            </CardCapsule>
        </>
    )
}