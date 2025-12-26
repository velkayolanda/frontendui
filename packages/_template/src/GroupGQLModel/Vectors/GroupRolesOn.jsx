import { CardCapsule } from "../Components/CardCapsule"
import { Table } from "../Components/Table"


export const GroupRolesOn = ({ item, children }) => {
    const attribute_value = item?.rolesOn || []
    return (
        <>
            <CardCapsule item={item} title={"Role "}>
                <Table data={attribute_value} />
            </CardCapsule>
            {children}
        </>
        
    )
}

