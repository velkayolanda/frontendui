import { useParams } from "react-router"
import { MembershipPageContentLazy } from "./MembershipPageContentLazy"

/**
 * A page component for displaying lazy-loaded content of a membership entity.
 *
 * This component extracts the `id` parameter from the route using `useParams`,
 * constructs a `membership` object, and passes it to the `MembershipPageContentLazy` component.
 * The `MembershipPageContentLazy` handles fetching and rendering of the entity's data.
 *
 * The `children` prop can be a render function that receives:
 * - `membership`: the fetched membership entity,
 * - `onChange`: a callback for change events,
 * - `onBlur`: a callback for blur events.
 *
 * @component
 * @param {Object} props - Component props.
 * @param {(params: { membership: Object, onChange: function, onBlur: function }) => React.ReactNode} [props.children] -
 *   Optional render function that will be passed to `MembershipPageContentLazy`.
 *
 * @returns {JSX.Element} The rendered page component displaying the lazy-loaded content for the membership entity.
 *
 * @example
 * // Example route setup:
 * <Route path="/membership/:id" element={<MembershipPage />} />
 *
 * // Or using children as a render function:
 * <Route
 *   path="/membership/:id"
 *   element={
 *     <MembershipPage>
 *       {({ membership, onChange, onBlur }) => (
 *         <input value={membership.name} onChange={onChange} onBlur={onBlur} />
 *       )}
 *     </MembershipPage>
 *   }
 * />
 */

export const MembershipPage = ({children}) => {
    const {id} = useParams()
    const membership = {id}
    return (
        <MembershipPageContentLazy membership={membership}>
            {children}
        </MembershipPageContentLazy>
    )
}