import { Table } from "../../../../_template/src/Base/Components/Table"
import { CardCapsule } from "../Components/CardCapsule"

import { Table as BaseTable, KebabMenu } from "../../../../_template/src/Base/Components/Table" 
import { Link as BaseLink } from "../../../../_template/src/Base/Components/Link" 
import { useNavigate } from "react-router"
import { UpdateLink } from "../Mutations/Update"
import { LinkURI } from "../Components"

import { Attribute } from "../../../../_template/src/Base/Components/Attribute"
import { SimpleCardCapsuleRightCorner } from "../../../../_template/src/Base/Components"
import { CreateGroupInserMembershipButton } from "../Mutations/AddMembership"
import { PlusLg } from "react-bootstrap-icons"

const CellName = ({ row, name }) => (
    <td key={name}>
        <BaseLink item={row} />
    </td>
)

const CellType = ({ row, name }) => (
    <td key={name}>
        <BaseLink item={row?.grouptype || {}} />
    </td>
)

const CellValid = ({ row, name }) => (
    <td key={name}>
        <Attribute attribute_value={row?.valid} />
        {/* {row?.valid?"ano":"ne"} */}
    </td>
)

const CellValidTill = ({ row, name }) => (
    <td key={name}>
        <Attribute attribute_value={row?.enddate} />
        {/* {row?.valid?"ano":"ne"} */}
    </td>
)

const CellTools = ({ row, name }) => {
    const navigate = useNavigate()
    const {id, name: name_}  = row || {}
    return (
        <td>
            <KebabMenu actions={[
                { 
                    // label: "Editovat", 
                    label: "Editovat " + name_, 
                    onClick: () => navigate(`${LinkURI.replace("view", "edit")}${id}`),
                    children: (<UpdateLink item={row} className="form-control btn btn-outline-secondary">Upravit</UpdateLink>)
                    // children: (<UpdateLink item={row} className="btn btn-outline-secondary">{name}</UpdateLink>)
                },
                { 
                    // label: "Editovat", 
                    label: "Smazat " + name_, 
                    onClick: () => navigate(`${LinkURI.replace("view", "edit")}${id}`),
                    children: (<UpdateLink item={row} className="form-control btn btn-outline-secondary">Odstranit</UpdateLink>)
                    // children: (<UpdateLink item={row} className="btn btn-outline-secondary">{name}</UpdateLink>)
                }
            ]} />
        </td>
    )
}

const table_def = {
    "name": {
        label: "Název",
        component: CellName
    },
    "grouptype": {
        label: "Typ",
        component: CellType
    },
    "valid": {
        label: "Platná",
        component: CellValid
    },
    "enddate": {
        label: "Platná do",
        component: CellValidTill
    },
    "tools": {
        label: "Nástroje",
        component: CellTools
    }
}

export const GroupMemberships = ({ item, children }) => {
    const attribute_value = item?.subgroups || []
    const isoNow = new Date().toISOString()
    const isoNowZ = isoNow.slice(0, isoNow.length - 1)

    const newItem = {
        groupId: item?.id,
        group: item,
        startdate: isoNowZ
    }
    return (
        <CardCapsule item={item} title={"Podřízené prvky"}>
            <SimpleCardCapsuleRightCorner>
                <CreateGroupInserMembershipButton 
                    className="btn btn-sm btn-link" 
                    item={newItem}
                    // item={item}
                >
                    <PlusLg />
                </CreateGroupInserMembershipButton>
            </SimpleCardCapsuleRightCorner>
            {children}
            <BaseTable data={attribute_value} _table_def={table_def}/>
        </CardCapsule>            
    )
}

