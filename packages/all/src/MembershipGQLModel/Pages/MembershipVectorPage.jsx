import { useLocation } from "react-router"
import { InfiniteScroll, MyNavbar } from "@hrbolek/uoisfrontend-shared"
import { MembershipReadPageAsyncAction } from "../Queries"
import { MembershipMediumCard } from "../Components"

/**
 * Visualizes a list of membership entities using MembershipMediumCard.
 *
 * This component receives an array of membership objects via the `items` prop
 * and renders a `MembershipMediumCard` for each item. Each card is keyed by the membership's `id`.
 *
 * @component
 * @param {Object} props - Component properties.
 * @param {Array<Object>} props.items - Array of membership entities to visualize. Each object should have a unique `id` property.
 * @returns {JSX.Element} A fragment containing a list of MembershipMediumCard components.
 *
 * @example
 * const memberships = [
 *   { id: 1, name: "Membership 1", ... },
 *   { id: 2, name: "Membership 2", ... }
 * ];
 *
 * <MembershipVisualiser items={memberships} />
 */
const MembershipVisualiser = ({items}) => {
    return (
        <>
            {items.map(membership => (
                <MembershipMediumCard key={membership.id} membership={membership} />
            ))}
        </>
    )
}

/**
 * Page component for displaying a (potentially filtered) list of membership entities with infinite scrolling.
 *
 * This component parses the `where` query parameter from the URL (if present), 
 * passes it as a filter to the `InfiniteScroll` component, and visualizes the resulting memberships using the specified `Visualiser`.
 * 
 * You can optionally provide custom children or a custom Visualiser component.
 *
 * @component
 * @param {Object} props - Component props.
 * @param {function} [props.Visualiser=MembershipVisualiser] - 
 *   Optional component used to visualize the loaded memberships. Receives `items` as prop.
 * @param {React.ReactNode} [props.children] - Optional child elements to render below the visualized memberships.
 *
 * @returns {JSX.Element} The rendered page with infinite scroll and optional children.
 *
 * @example
 * // Will fetch and display memberships filtered by a `where` clause passed in the URL, e.g.:
 * //   /membership?where={"name":"Example"}
 * <MembershipVectorPage />
 *
 * @example
 * // With a custom visualizer and children:
 * <MembershipVectorPage Visualiser={CustomMembershipList}>
 *   <Footer />
 * </MembershipVectorPage>
 */
export const MembershipVectorPage = ({children, Visualiser=MembershipVisualiser}) => {
    const { search } = useLocation();
    let actionParams = { skip: 0, limit: 10};
    try {
        const params = new URLSearchParams(search);
        const where = params.get('where');        
        actionParams.where = where ? JSON.parse(where) : undefined;
    } catch (e) {
        console.warn("Invalid 'where' query parameter!", e);
    }
    return (<>
        <MyNavbar onSearchChange={onSearchChange} />
        <InfiniteScroll
            preloadedItems={[]} // No preloaded items for membership
            actionParams={actionParams} 
            asyncAction={MembershipReadPageAsyncAction}
            Visualiser={Visualiser}
        />
        {children}
    </>)
}