import Row from "react-bootstrap/Row"
import { LeftColumn, MiddleColumn } from "@hrbolek/uoisfrontend-shared"
import { MembershipCardCapsule } from "./MembershipCardCapsule"
import { MembershipMediumCard } from "./MembershipMediumCard"

/**
 * A large card component for displaying detailed content and layout for an membership entity.
 *
 * This component wraps an `MembershipCardCapsule` with a flexible layout that includes multiple
 * columns. It uses a `Row` layout with a `LeftColumn` for displaying an `MembershipMediumCard`
 * and a `MiddleColumn` for rendering additional children.
 *
 * @component
 * @param {Object} props - The properties for the MembershipLargeCard component.
 * @param {Object} props.membership - The object representing the membership entity.
 * @param {string|number} props.membership.id - The unique identifier for the membership entity.
 * @param {string} props.membership.name - The name or label of the membership entity.
 * @param {React.ReactNode} [props.children=null] - Additional content to render in the middle column.
 *
 * @returns {JSX.Element} A JSX element combining a large card layout with dynamic content.
 *
 * @example
 * // Example usage:
 * const membershipEntity = { id: 123, name: "Sample Entity" };
 * 
 * <MembershipLargeCard membership={membershipEntity}>
 *   <p>Additional content for the middle column.</p>
 * </MembershipLargeCard>
 */
export const MembershipLargeCard = ({membership, children}) => {
    return (
        <MembershipCardCapsule membership={membership} >
            <Row>
                <LeftColumn>
                    <MembershipMediumCard membership={membership}/>
                </LeftColumn>
                <MiddleColumn>
                    {children}
                </MiddleColumn>
            </Row>
        </MembershipCardCapsule>
    )
}
