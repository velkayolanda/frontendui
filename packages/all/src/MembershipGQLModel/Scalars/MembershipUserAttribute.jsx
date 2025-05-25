import { createAsyncGraphQLAction, useAsyncAction } from "@hrbolek/uoisfrontend-gql-shared"
import { ErrorHandler, LoadingSpinner } from "@hrbolek/uoisfrontend-shared"

/**
 * A component for displaying the `user` attribute of an membership entity.
 *
 * This component checks if the `user` attribute exists on the `membership` object. If `user` is undefined,
 * the component returns `null` and renders nothing. Otherwise, it displays a placeholder message
 * and a JSON representation of the `user` attribute.
 *
 * @component
 * @param {Object} props - The props for the MembershipUserAttribute component.
 * @param {Object} props.membership - The object representing the membership entity.
 * @param {*} [props.membership.user] - The user attribute of the membership entity to be displayed, if defined.
 *
 * @returns {JSX.Element|null} A JSX element displaying the `user` attribute or `null` if the attribute is undefined.
 *
 * @example
 * // Example usage:
 * const membershipEntity = { user: { id: 1, name: "Sample User" } };
 *
 * <MembershipUserAttribute membership={membershipEntity} />
 */
export const MembershipUserAttribute = ({membership}) => {
    const {user} = membership
    if (typeof user === 'undefined') return null
    return (
        <>
            {/* <UserMediumCard user={user} /> */}
            {/* <UserLink user={user} /> */}
            Probably {'<UserMediumCard user={user} />'} <br />
            <pre>{JSON.stringify(user, null, 4)}</pre>
        </>
    )
}

const MembershipUserAttributeQuery = `
query MembershipQueryRead($id: UUID!) {
    result: membershipById(id: $id) {
        __typename
        id
        user {
            __typename
            id
        }
    }
}
`

const MembershipUserAttributeAsyncAction = createAsyncGraphQLAction(
    MembershipUserAttributeQuery
)

/**
 * A lazy-loading component for displaying filtered `user` from a `membership` entity.
 *
 * This component uses the `MembershipUserAttributeAsyncAction` to asynchronously fetch
 * the `membership.user` data. It shows a loading spinner while fetching, handles errors,
 * and filters the resulting list using a custom `filter` function (defaults to `Boolean` to remove falsy values).
 *
 * Each vector item is rendered as a `<div>` with its `id` as both the `key` and the `id` attribute,
 * and displays a formatted JSON preview using `<pre>`.
 *
 * @component
 * @param {Object} props - The properties object.
 * @param {Object} props.membership - The membership entity or identifying query variables used to fetch it.
 * @param {Function} [props.filter=Boolean] - A filtering function applied to the `user` array before rendering.
 *
 * @returns {JSX.Element} A rendered list of filtered user or a loading/error placeholder.
 *
 * @example
 * <MembershipUserAttributeLazy membership={{ id: "abc123" }} />
 *
 * 
 * @example
 * <MembershipUserAttributeLazy
 *   membership={{ id: "abc123" }}
 *   filter={(v) => v.status === "active"}
 * />
 */
export const MembershipUserAttributeLazy = ({membership}) => {
    const {loading, error, entity, fetch} = useAsyncAction(MembershipUserAttributeAsyncAction, membership)

    if (loading) return <LoadingSpinner />
    if (error) return <ErrorHandler errors={error} />

    return <MembershipUserAttribute membership={entity} />    
}