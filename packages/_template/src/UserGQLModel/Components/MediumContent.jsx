import { Attribute } from "../../../../_template/src/Base/Components/Attribute"
// import { Col as Col_ } from "../../../../_template/src/Base/Components/Col"
// import { Row } from "../../../../_template/src/Base/Components/Row"
import { Roles } from "../Vectors/Roles"
// import { UserRoles } from "../Vectors/UserRoles"

/**
 * A component that displays medium-level content for an template entity.
 *
 * This component renders a label "TemplateMediumContent" followed by a serialized representation of the `template` object
 * and any additional child content. It is designed to handle and display information about an template entity object.
 *
 * @component
 * @param {Object} props - The properties for the TemplateMediumContent component.
 * @param {Object} props.template - The object representing the template entity.
 * @param {string|number} props.template.id - The unique identifier for the template entity.
 * @param {string} props.template.name - The name or label of the template entity.
 * @param {React.ReactNode} [props.children=null] - Additional content to render after the serialized `template` object.
 *
 * @returns {JSX.Element} A JSX element displaying the entity's details and optional content.
 *
 * @example
 * // Example usage:
 * const templateEntity = { id: 123, name: "Sample Entity" };
 * 
 * <TemplateMediumContent template={templateEntity}>
 *   <p>Additional information about the entity.</p>
 * </TemplateMediumContent>
 */
export const MediumContent = ({ item, children}) => {
    return (
        <div>
            <Attribute attribute_name="id" label="ID" item={item} />
            <Attribute attribute_name="name" label="Jméno" item={item} />
            <Attribute attribute_name="surname" label="Příjmení" item={item} />
            <Attribute attribute_name="fullname" label="Celé jméno" item={item} />
            <Attribute attribute_name="email" label="Email" item={item} />
            <Attribute attribute_name="email" label="Email" item={item}>
                <a href={`mailto:${item?.email}`}>{item?.email}</a>
            </Attribute>
            <Attribute label="Telefon" item={item}>
                <a href={`tel:+420800101202`}>800 101 202</a>
            </Attribute>
            {children}
        </div>
        
    )
}

