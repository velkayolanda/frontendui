import { MembershipLargeCard } from "../Components"
import { MembershipPageNavbar } from "./MembershipPageNavbar"

/**
 * Renders a page layout for a single membership entity, including navigation and detailed view.
 *
 * This component wraps `MembershipPageNavbar` and `MembershipLargeCard` to provide a consistent
 * interface for displaying an individual membership. It also supports rendering children as 
 * nested content inside the card.
 *
 * @component
 * @param {Object} props - Component props.
 * @param {{ id: string|number, name: string }} props.membership - The membership entity to display.
 * @param {React.ReactNode} [props.children] - Optional nested content rendered inside the card.
 * @returns {JSX.Element} Rendered page layout for a membership.
 *
 * @example
 * const membership = { id: 1, name: "Example Membership" };
 * <MembershipPageContent membership={membership}>
 *   <p>Additional info here.</p>
 * </MembershipPageContent>
 */
export const MembershipPageContent = ({membership, children, ...props}) => {
    return (<>
        <MembershipPageNavbar membership={membership} />
        <MembershipLargeCard membership={membership} {...props} >
            Membership {JSON.stringify(membership)}
            {children}
        </MembershipLargeCard>
    </>)
}