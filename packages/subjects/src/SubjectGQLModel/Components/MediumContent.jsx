/** @module Components */
import { Col } from "../../../../_template/src/Base/Components/Col"
import { Row } from "../../../../_template/src/Base/Components/Row"
import { Link } from "./Link"
/**
 * Readonly zobrazení entity Subject na úrovni "medium" (bez semestrů).
 * Vykresluje jen pole, která mají hodnotu — prázdná pole se nezobrazí.
 *
 * @component
 * @param {Object} props
 * @param {Object} props.item - Entita Subject (MediumFragment nebo LargeFragment)
 * @param {React.ReactNode} [props.children] - Další obsah zobrazený za atributy
 */
// export const MediumContent = ({ item, children}) => {
//     return (
//         <MediumContent_ item={item}>
//             {children}
//         </MediumContent_>
//     )
// }

// export const MediumContent_ = ({ item, children }) => {
//     return (
//         <>
//             {Object.entries(item).map(([attribute_name, attribute_value]) => {
//                 // if (attribute_name !== "id") return null
//                 if (Array.isArray(attribute_value)) return null
//                 if (typeof attribute_value === "object" && attribute_value !== null) return null
//                 let attribute_value_result = attribute_value
//                 // let attribute_value_result = attribute_value
//                 if (Array.isArray(attribute_value))
//                     // attribute_value_result = <CardCapsule><Table data={attribute_value} /></CardCapsule>
//                     return null
//                 else if (typeof attribute_value === "object" && attribute_value !== null)
//                     // attribute_value_result = <MediumCard item={attribute_value} />
//                     return null
//                 else if (attribute_name === "__typename") {
//                     /*attribute_value_result = <Link item={attribute_value} />*/
//                     // console.log("else1", attribute_name, attribute_value)
//                 }
//                 if (attribute_name === "id")
//                     attribute_value_result = <Link item={item}>{item?.id || "Data error"}</Link>
//                 if (attribute_name === "name")
//                     attribute_value_result = <Link item={item} />
//                 // else return null
//                 if (attribute_value)
//                     return (
//                         <Row key={attribute_name}>
//                             <Col className="col-4"><b>{attribute_name}</b></Col>
//                             <Col className="col-8">{attribute_value_result}</Col>
//                         </Row>
//                     )
//                 else return null
//             })}
//             {Object.entries(item).map(([attribute_name, attribute_value]) => {
//                 if (attribute_value !== null) return null
//                 let attribute_value_result = JSON.stringify(attribute_value)
//                 if (Array.isArray(attribute_value))
//                     // attribute_value_result = <CardCapsule><Table data={attribute_value} /></CardCapsule>
//                     return null
//                 else if (typeof attribute_value === "object" && attribute_value !== null)
//                     // attribute_value_result = <MediumCard item={attribute_value} />
//                     return null
//                 else if (attribute_name === "__typename") {
//                     /*attribute_value_result = <Link item={attribute_value} />*/
//                     console.log("else2", attribute_name, attribute_value)
//                 }
//                 if (attribute_value)
//                     return null
//                 else
//                     return (
//                         <Row key={attribute_name}>
//                             <Col className="col-4"><b>{attribute_name}</b></Col>
//                             <Col className="col-8">{attribute_value_result}</Col>
//                         </Row>
//                     )
//             })}
//             {children}
//         </>
//     )
// }
import { MediumContent as MediumContent_} from "../../../../_template/src/Base/Components/MediumContent"
import {Attribute, formatDateTime} from "../../../../_template/src/Base/Components"

//export { MediumContent } from "../../../../_template/src/Base/Components/MediumContent"

export const MediumContent = ({ item, children}) => {
    console.log("item", item)
    return (
        <>
            {item?.name && (
                <Attribute label="Název">
                    <Link item={item} />
                </Attribute>
            )}
            {item?.nameEn && (
                <Attribute label="Anglický název">
                    {item.nameEn}
                </Attribute>
            )}
            {item?.description && (
                <Attribute label="Popis">
                    {item.description}
                </Attribute>
            )}
            {item?.descriptionEn && (
                <Attribute label="Anglický popis">
                    {item.descriptionEn}
                </Attribute>
            )}
            {(item?.program?.name || item?.program?.id) && (
                <Attribute label="Program">
                    <a href={`/program/ProgramGQLModel/view/${item?.program?.id}`}>
                        {item?.program?.name || item?.program?.id}
                    </a>
                </Attribute>
            )}
            {item?.rbacobject?.currentUserRoles?.length > 0 && (
                <Attribute label="Moje role">
                    {item.rbacobject.currentUserRoles.map(role => (
                        <span key={role.id} className="badge bg-secondary me-1">
                    {role.roletype?.name}
                </span>
                    ))}
                </Attribute>
            )}
            <hr />
            {item?.createdby?.fullname && (
                <Attribute label="Vytvořil">
                    {item.createdby.fullname}
                </Attribute>
            )}
            {item?.created && (
                <Attribute label="Vytvořeno">
                    {formatDateTime(item.created)}
                </Attribute>
            )}
            {item?.lastchange && (
                <Attribute label="Změněno">
                    {formatDateTime(item.lastchange)}
                </Attribute>
            )}
            {item?.changedby?.fullname && (
                <Attribute label="Změnil">
                    {item.changedby.fullname}
                </Attribute>
            )}
            {children}
        </>
    )
}