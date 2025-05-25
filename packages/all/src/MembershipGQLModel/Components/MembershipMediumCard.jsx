import { PersonFill } from "react-bootstrap-icons"
import { MembershipLink } from "./MembershipLink"
import { MembershipCardCapsule } from "./MembershipCardCapsule"
import { MembershipMediumContent } from "./MembershipMediumContent"

/**
 * A card component that displays detailed content for an membership entity.
 *
 * This component combines `MembershipCardCapsule` and `MembershipMediumContent` to create a card layout
 * with a title and medium-level content. The title includes a `PersonFill` icon and a link to
 * the membership entity's details, while the body displays serialized details of the entity along
 * with any additional children passed to the component.
 *
 * @component
 * @param {Object} props - The properties for the MembershipMediumCard component.
 * @param {Object} props.membership - The object representing the membership entity.
 * @param {string|number} props.membership.id - The unique identifier for the membership entity.
 * @param {string} props.membership.name - The name or label of the membership entity.
 * @param {React.ReactNode} [props.children=null] - Additional content to render inside the card body.
 *
 * @returns {JSX.Element} A JSX element combining a card with a title and detailed content.
 *
 * @example
 * // Example usage:
 * const membershipEntity = { id: 123, name: "Sample Entity" };
 * 
 * <MembershipMediumCard membership={membershipEntity}>
 *   <p>Additional details or actions for the entity.</p>
 * </MembershipMediumCard>
 */
export const MembershipMediumCard = ({membership, children}) => {
    return (
        <MembershipCardCapsule title={<><PersonFill /> <MembershipLink membership={membership} /></>}>
            <MembershipMediumContent membership={membership}>
                {children}
            </MembershipMediumContent>
        </MembershipCardCapsule>
    )
}
