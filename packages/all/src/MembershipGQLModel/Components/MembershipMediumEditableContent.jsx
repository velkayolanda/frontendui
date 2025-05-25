import { Input } from "@hrbolek/uoisfrontend-shared"

/**
 * A component that displays medium-level content for an membership entity.
 *
 * This component renders a label "MembershipMediumContent" followed by a serialized representation of the `membership` object
 * and any additional child content. It is designed to handle and display information about an membership entity object.
 *
 * @component
 * @param {Object} props - The properties for the MembershipMediumContent component.
 * @param {Object} props.membership - The object representing the membership entity.
 * @param {string|number} props.membership.id - The unique identifier for the membership entity.
 * @param {string} props.membership.name - The name or label of the membership entity.
 * @param {React.ReactNode} [props.children=null] - Additional content to render after the serialized `membership` object.
 *
 * @returns {JSX.Element} A JSX element displaying the entity's details and optional content.
 *
 * @example
 * // Example usage:
 * const membershipEntity = { id: 123, name: "Sample Entity" };
 * 
 * <MembershipMediumContent membership={membershipEntity}>
 *   <p>Additional information about the entity.</p>
 * </MembershipMediumContent>
 */
export const MembershipMediumEditableContent = ({membership, onChange=(e)=>null, onBlur=(e)=>null, children}) => {
    return (
        <>           
            <Input id={"name"} label={"Název"} className="form-control" defaultValue={membership?.name|| "Název"} onChange={onChange} onBlur={onBlur} />
            <Input id={"name_en"} label={"Anglický název"} className="form-control" defaultValue={membership?.name_en|| "Anglický název"} onChange={onChange} onBlur={onBlur} />
            {children}
        </>
    )
}
