import { createAsyncGraphQLAction, useAsyncAction } from "@hrbolek/uoisfrontend-gql-shared"
import { ErrorHandler, LoadingSpinner } from "@hrbolek/uoisfrontend-shared"

/**
 * A component for displaying the `createdby` attribute of an membership entity.
 *
 * This component checks if the `createdby` attribute exists on the `membership` object. If `createdby` is undefined,
 * the component returns `null` and renders nothing. Otherwise, it displays a placeholder message
 * and a JSON representation of the `createdby` attribute.
 *
 * @component
 * @param {Object} props - The props for the MembershipCreatedbyAttribute component.
 * @param {Object} props.membership - The object representing the membership entity.
 * @param {*} [props.membership.createdby] - The createdby attribute of the membership entity to be displayed, if defined.
 *
 * @returns {JSX.Element|null} A JSX element displaying the `createdby` attribute or `null` if the attribute is undefined.
 *
 * @example
 * // Example usage:
 * const membershipEntity = { createdby: { id: 1, name: "Sample Createdby" } };
 *
 * <MembershipCreatedbyAttribute membership={membershipEntity} />
 */
export const MembershipCreatedbyAttribute = ({membership}) => {
    const {createdby} = membership
    if (typeof createdby === 'undefined') return null
    return (
        <>
            {/* <CreatedbyMediumCard createdby={createdby} /> */}
            {/* <CreatedbyLink createdby={createdby} /> */}
            Probably {'<CreatedbyMediumCard createdby={createdby} />'} <br />
            <pre>{JSON.stringify(createdby, null, 4)}</pre>
        </>
    )
}

const MembershipCreatedbyAttributeQuery = `
query MembershipQueryRead($id: UUID!) {
    result: membershipById(id: $id) {
        __typename
        id
        createdby {
            __typename
            id
        }
    }
}
`

const MembershipCreatedbyAttributeAsyncAction = createAsyncGraphQLAction(
    MembershipCreatedbyAttributeQuery
)

/**
 * A lazy-loading component for displaying filtered `createdby` from a `membership` entity.
 *
 * This component uses the `MembershipCreatedbyAttributeAsyncAction` to asynchronously fetch
 * the `membership.createdby` data. It shows a loading spinner while fetching, handles errors,
 * and filters the resulting list using a custom `filter` function (defaults to `Boolean` to remove falsy values).
 *
 * Each vector item is rendered as a `<div>` with its `id` as both the `key` and the `id` attribute,
 * and displays a formatted JSON preview using `<pre>`.
 *
 * @component
 * @param {Object} props - The properties object.
 * @param {Object} props.membership - The membership entity or identifying query variables used to fetch it.
 * @param {Function} [props.filter=Boolean] - A filtering function applied to the `createdby` array before rendering.
 *
 * @returns {JSX.Element} A rendered list of filtered createdby or a loading/error placeholder.
 *
 * @example
 * <MembershipCreatedbyAttributeLazy membership={{ id: "abc123" }} />
 *
 * 
 * @example
 * <MembershipCreatedbyAttributeLazy
 *   membership={{ id: "abc123" }}
 *   filter={(v) => v.status === "active"}
 * />
 */
export const MembershipCreatedbyAttributeLazy = ({membership}) => {
    const {loading, error, entity, fetch} = useAsyncAction(MembershipCreatedbyAttributeAsyncAction, membership)

    if (loading) return <LoadingSpinner />
    if (error) return <ErrorHandler errors={error} />

    return <MembershipCreatedbyAttribute membership={entity} />    
}