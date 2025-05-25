import { createAsyncGraphQLAction, useAsyncAction } from "@hrbolek/uoisfrontend-gql-shared"
import { ErrorHandler, LoadingSpinner } from "@hrbolek/uoisfrontend-shared"

/**
 * A component for displaying the `changedby` attribute of an membership entity.
 *
 * This component checks if the `changedby` attribute exists on the `membership` object. If `changedby` is undefined,
 * the component returns `null` and renders nothing. Otherwise, it displays a placeholder message
 * and a JSON representation of the `changedby` attribute.
 *
 * @component
 * @param {Object} props - The props for the MembershipChangedbyAttribute component.
 * @param {Object} props.membership - The object representing the membership entity.
 * @param {*} [props.membership.changedby] - The changedby attribute of the membership entity to be displayed, if defined.
 *
 * @returns {JSX.Element|null} A JSX element displaying the `changedby` attribute or `null` if the attribute is undefined.
 *
 * @example
 * // Example usage:
 * const membershipEntity = { changedby: { id: 1, name: "Sample Changedby" } };
 *
 * <MembershipChangedbyAttribute membership={membershipEntity} />
 */
export const MembershipChangedbyAttribute = ({membership}) => {
    const {changedby} = membership
    if (typeof changedby === 'undefined') return null
    return (
        <>
            {/* <ChangedbyMediumCard changedby={changedby} /> */}
            {/* <ChangedbyLink changedby={changedby} /> */}
            Probably {'<ChangedbyMediumCard changedby={changedby} />'} <br />
            <pre>{JSON.stringify(changedby, null, 4)}</pre>
        </>
    )
}

const MembershipChangedbyAttributeQuery = `
query MembershipQueryRead($id: UUID!) {
    result: membershipById(id: $id) {
        __typename
        id
        changedby {
            __typename
            id
        }
    }
}
`

const MembershipChangedbyAttributeAsyncAction = createAsyncGraphQLAction(
    MembershipChangedbyAttributeQuery
)

/**
 * A lazy-loading component for displaying filtered `changedby` from a `membership` entity.
 *
 * This component uses the `MembershipChangedbyAttributeAsyncAction` to asynchronously fetch
 * the `membership.changedby` data. It shows a loading spinner while fetching, handles errors,
 * and filters the resulting list using a custom `filter` function (defaults to `Boolean` to remove falsy values).
 *
 * Each vector item is rendered as a `<div>` with its `id` as both the `key` and the `id` attribute,
 * and displays a formatted JSON preview using `<pre>`.
 *
 * @component
 * @param {Object} props - The properties object.
 * @param {Object} props.membership - The membership entity or identifying query variables used to fetch it.
 * @param {Function} [props.filter=Boolean] - A filtering function applied to the `changedby` array before rendering.
 *
 * @returns {JSX.Element} A rendered list of filtered changedby or a loading/error placeholder.
 *
 * @example
 * <MembershipChangedbyAttributeLazy membership={{ id: "abc123" }} />
 *
 * 
 * @example
 * <MembershipChangedbyAttributeLazy
 *   membership={{ id: "abc123" }}
 *   filter={(v) => v.status === "active"}
 * />
 */
export const MembershipChangedbyAttributeLazy = ({membership}) => {
    const {loading, error, entity, fetch} = useAsyncAction(MembershipChangedbyAttributeAsyncAction, membership)

    if (loading) return <LoadingSpinner />
    if (error) return <ErrorHandler errors={error} />

    return <MembershipChangedbyAttribute membership={entity} />    
}