import { createAsyncGraphQLAction, useAsyncAction } from "@hrbolek/uoisfrontend-gql-shared"
import { ErrorHandler, LoadingSpinner } from "@hrbolek/uoisfrontend-shared"

/**
 * A component for displaying the `group` attribute of an membership entity.
 *
 * This component checks if the `group` attribute exists on the `membership` object. If `group` is undefined,
 * the component returns `null` and renders nothing. Otherwise, it displays a placeholder message
 * and a JSON representation of the `group` attribute.
 *
 * @component
 * @param {Object} props - The props for the MembershipGroupAttribute component.
 * @param {Object} props.membership - The object representing the membership entity.
 * @param {*} [props.membership.group] - The group attribute of the membership entity to be displayed, if defined.
 *
 * @returns {JSX.Element|null} A JSX element displaying the `group` attribute or `null` if the attribute is undefined.
 *
 * @example
 * // Example usage:
 * const membershipEntity = { group: { id: 1, name: "Sample Group" } };
 *
 * <MembershipGroupAttribute membership={membershipEntity} />
 */
export const MembershipGroupAttribute = ({membership}) => {
    const {group} = membership
    if (typeof group === 'undefined') return null
    return (
        <>
            {/* <GroupMediumCard group={group} /> */}
            {/* <GroupLink group={group} /> */}
            Probably {'<GroupMediumCard group={group} />'} <br />
            <pre>{JSON.stringify(group, null, 4)}</pre>
        </>
    )
}

const MembershipGroupAttributeQuery = `
query MembershipQueryRead($id: UUID!) {
    result: membershipById(id: $id) {
        __typename
        id
        group {
            __typename
            id
        }
    }
}
`

const MembershipGroupAttributeAsyncAction = createAsyncGraphQLAction(
    MembershipGroupAttributeQuery
)

/**
 * A lazy-loading component for displaying filtered `group` from a `membership` entity.
 *
 * This component uses the `MembershipGroupAttributeAsyncAction` to asynchronously fetch
 * the `membership.group` data. It shows a loading spinner while fetching, handles errors,
 * and filters the resulting list using a custom `filter` function (defaults to `Boolean` to remove falsy values).
 *
 * Each vector item is rendered as a `<div>` with its `id` as both the `key` and the `id` attribute,
 * and displays a formatted JSON preview using `<pre>`.
 *
 * @component
 * @param {Object} props - The properties object.
 * @param {Object} props.membership - The membership entity or identifying query variables used to fetch it.
 * @param {Function} [props.filter=Boolean] - A filtering function applied to the `group` array before rendering.
 *
 * @returns {JSX.Element} A rendered list of filtered group or a loading/error placeholder.
 *
 * @example
 * <MembershipGroupAttributeLazy membership={{ id: "abc123" }} />
 *
 * 
 * @example
 * <MembershipGroupAttributeLazy
 *   membership={{ id: "abc123" }}
 *   filter={(v) => v.status === "active"}
 * />
 */
export const MembershipGroupAttributeLazy = ({membership}) => {
    const {loading, error, entity, fetch} = useAsyncAction(MembershipGroupAttributeAsyncAction, membership)

    if (loading) return <LoadingSpinner />
    if (error) return <ErrorHandler errors={error} />

    return <MembershipGroupAttribute membership={entity} />    
}