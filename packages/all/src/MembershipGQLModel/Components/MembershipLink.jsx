import { ProxyLink } from "@hrbolek/uoisfrontend-shared"
import { URIRoot } from "../../uriroot";

export const MembershipURI = `${URIRoot}/membership/view/`;

/**
 * A React component that renders a `ProxyLink` to an "membership" entity's view page.
 *
 * The target URL is dynamically constructed using the `membership` object's `id`, and the link displays
 * the `membership` object's `name` as its clickable content.
 *
 * @function MembershipLink
 * @param {Object} props - The properties for the `MembershipLink` component.
 * @param {Object} props.membership - The object representing the "membership" entity.
 * @param {string|number} props.membership.id - The unique identifier for the "membership" entity. Used to construct the target URL.
 * @param {string} props.membership.name - The display name for the "membership" entity. Used as the link text.
 *
 * @returns {JSX.Element} A `ProxyLink` component linking to the specified "membership" entity's view page.
 *
 * @example
 * // Example usage with a sample membership entity:
 * const membershipEntity = { id: 123, name: "Example Membership Entity" };
 * 
 * <MembershipLink membership={membershipEntity} />
 * // Renders: <ProxyLink to="/membership/membership/view/123">Example Membership Entity</ProxyLink>
 *
 * @remarks
 * - This component utilizes `ProxyLink` to ensure consistent link behavior, including parameter preservation and conditional reloads.
 * - The URL format `/membership/membership/view/:id` must be supported by the application routing.
 *
 * @see ProxyLink - The base component used for rendering the link.
 */
export const MembershipLink = ({membership, ...props}) => {
    return <ProxyLink to={MembershipURI + membership.id} {...props}>{membership.name}</ProxyLink>
}