import { CardCapsule } from "@hrbolek/uoisfrontend-shared"
import { PersonFill } from "react-bootstrap-icons"
import { MembershipLink } from "./MembershipLink"

/**
 * A specialized card component that displays an `MembershipLink` as its title and encapsulates additional content.
 *
 * This component extends the `CardCapsule` component by using a combination of a `PersonFill` icon and 
 * an `MembershipLink` component in the card's header. The `children` prop is used to render any content 
 * inside the card body. It is designed for use with entities represented by the `membership` object.
 *
 * @component
 * @param {Object} props - The props for the MembershipCardCapsule component.
 * @param {Object} props.membership - The object representing the membership entity.
 * @param {string|number} props.membership.id - The unique identifier for the membership entity.
 * @param {string} props.membership.name - The display name for the membership entity.
 * @param {React.ReactNode} [props.children=null] - The content to render inside the card's body.
 *
 * @returns {JSX.Element} The rendered card component with a dynamic title and body content.
 *
 * @example
 * // Example usage:
 * import { MembershipCardCapsule } from './MembershipCardCapsule';
 * import { Button } from 'react-bootstrap';
 *
 * const membershipEntity = { id: 123, name: "Example Entity" };
 *
 * <MembershipCardCapsule membership={membershipEntity}>
 *   <Button variant="primary">Click Me</Button>
 * </MembershipCardCapsule>
 */
export const MembershipCardCapsule = ({membership, children, title=<><PersonFill /> <MembershipLink membership={membership} /></>}) => {
    return (
        <CardCapsule title={title}>
            {children}
        </CardCapsule>
    )
}
