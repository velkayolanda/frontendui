import { ChildWrapper } from "@hrbolek/uoisfrontend-shared";

/**
 * MembershipChildren Component
 *
 * A utility React component that wraps its children with the `ChildWrapper` component, 
 * passing down an `membership` entity along with other props to all child elements.
 * This component is useful for injecting a common `membership` entity into multiple children 
 * while preserving their existing functionality.
 *
 * @component
 * @param {Object} props - The props for the MembershipChildren component.
 * @param {any} props.membership - An entity (e.g., object, string, or other data) to be passed to the children.
 * @param {React.ReactNode} props.children - The children elements to be wrapped and enhanced.
 * @param {...any} props - Additional props to be passed to each child element.
 *
 * @returns {JSX.Element} A `ChildWrapper` component containing the children with the injected `membership` entity.
 *
 * @example
 * // Example usage:
 * const membershipEntity = { id: 1, message: "No data available" };
 *
 * <MembershipChildren membership={membershipEntity}>
 *     <CustomMessage />
 *     <CustomIcon />
 * </MembershipChildren>
 *
 * // Result: Both <CustomMessage /> and <CustomIcon /> receive the 'membership' prop with the specified entity.
 */
export const MembershipChildren = ({membership, children, ...props}) => <ChildWrapper membership={membership} children={children} {...props} />