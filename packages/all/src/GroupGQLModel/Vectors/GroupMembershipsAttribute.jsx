import { createAsyncGraphQLAction, createQueryStrLazy, processVectorAttributeFromGraphQLResult } from "@hrbolek/uoisfrontend-gql-shared"
import { InfiniteScroll } from "@hrbolek/uoisfrontend-shared"
import { UserLink, UserMediumCard } from "../../UserGQLModel";
import { Col, Row } from "react-bootstrap";


/**
 * Inserts a MembershipGQLModel item into a group’s memberships array and dispatches an update.
 *
 * @param {Object} group - The current group object containing a `memberships` array.
 * @param {Object} membershipItem - The item to insert; must have `__typename === "MembershipGQLModel"`.
 * @param {Function} dispatch - Redux dispatch function (or similar) to call the update action.
 */
const followUpGroupMembershipItemInsert = (group, membershipItem, dispatch) => {
    const { __typename } = membershipItem;
    if (__typename === "MembershipGQLModel") {
        const { memberships, ...others } = group;
        const newGroupMembershipItems = [...memberships, membershipItem];
        const newGroup = { ...others, memberships: newGroupMembershipItems };
        dispatch(ItemActions.item_update(newGroup));
    }
};

/**
 * Replaces an existing MembershipGQLModel item in a group’s memberships array and dispatches an update.
 *
 * @param {Object} group - The current group object containing a `memberships` array.
 * @param {Object} membershipItem - The updated item; must have `__typename === "MembershipGQLModel"` and an `id` field matching an existing item.
 * @param {Function} dispatch - Redux dispatch function (or similar) to call the update action.
 */
const followUpGroupMembershipItemUpdate = (group, membershipItem, dispatch) => {
    const { __typename } = membershipItem;
    if (__typename === "MembershipGQLModel") {
        const { memberships, ...others } = group;
        const newGroupMembershipItems = memberships.map(item =>
            item.id === membershipItem.id ? membershipItem : item
        );
        const newGroup = { ...others, memberships: newGroupMembershipItems };
        dispatch(ItemActions.item_update(newGroup));
    }
};

/**
 * Removes a MembershipGQLModel item from a group’s memberships array by its `id` and dispatches an update.
 *
 * @param {Object} group - The current group object containing a `memberships` array.
 * @param {Object} membershipItem - The item to delete; must have `__typename === "MembershipGQLModel"` and an `id` field.
 * @param {Function} dispatch - Redux dispatch function (or similar) to call the update action.
 */
const followUpGroupMembershipItemDelete = (group, membershipItem, dispatch) => {
    const { __typename } = membershipItem;
    if (__typename === "MembershipGQLModel") {
        const { memberships, ...others } = group;
        const newGroupMembershipItems = memberships.filter(
            item => item.id !== membershipItem.id
        );
        const newGroup = { ...others, memberships: newGroupMembershipItems };
        dispatch(ItemActions.item_update(newGroup));
    }
};


const GroupMembershipsAttributeQuery = `
query GroupQueryRead($id: UUID!, $where: MembershipInputWhereFilter, $skip: Int, $limit: Int) {
    result: groupById(id: $id) {
        __typename
        id
        memberships(skip: $skip, limit: $limit, where: $where) {
            __typename
            id
            lastchange
            created
            createdbyId
            changedbyId
            rbacobjectId
            userId
            user {
                __typename
                id
                fullname
                email
                rolesOn {
                    user {
                        id
                        fullname
                        email
                    }
                }
                roles {
                    id
                }
            }
            groupId
            startdate
            enddate
        }
    }
}
`

const GroupMembershipsAttributeAsyncAction = createAsyncGraphQLAction(
    createQueryStrLazy(GroupMembershipsAttributeQuery),
    processVectorAttributeFromGraphQLResult("memberships")
)

/**
 * A component for displaying the `memberships` attribute of an group entity.
 *
 * This component checks if the `memberships` attribute exists on the `group` object. If `memberships` is undefined,
 * the component returns `null` and renders nothing. Otherwise, it maps over the `memberships` array and
 * displays a placeholder message and a JSON representation for each item in the `memberships`.
 *
 * @component
 * @param {Object} props - The props for the GroupMembershipsAttribute component.
 * @param {Object} props.group - The object representing the group entity.
 * @param {Array} [props.group.memberships] - An array of memberships items associated with the group entity.
 * Each item is expected to have a unique `id` property.
 *
 * @returns {JSX.Element|null} A JSX element displaying the `memberships` items or `null` if the attribute is undefined.
 *
 * @example
 * // Example usage:
 * const groupEntity = { 
 *   memberships: [
 *     { id: 1, name: "Membership Item 1" }, 
 *     { id: 2, name: "Membership Item 2" }
 *   ] 
 * };
 *
 * <GroupMembershipsAttribute group={groupEntity} />
 */
export const GroupMembershipsAttribute = ({group, Visualiser=UserLink}) => {
    const { memberships } = group
    // console.log('GroupMembershipsAttribute', memberships)
    if (typeof memberships === 'undefined') return null
    return (
        <>
            {memberships.map(
                membership => <div id={membership.id} key={membership.id}>
                    {membership?.user && <Visualiser user={membership?.user} />}
                </div>
            )}
        </>
    )
}

export const GroupMembershipsAttributeCards = ({group, Visualiser=UserMediumCard}) => {
    const { memberships } = group
    // console.log('GroupMembershipsAttributeCards', memberships)
    if (typeof memberships === 'undefined') return null
    return (
        <Row>
            {memberships.map(
                membership => <Col id={membership.id} key={membership.id}>
                    {membership?.user && <Visualiser user={membership?.user} />}
                </Col>
            )}
        </Row>
    )
}

const Visualiser = ({items}) => <GroupMembershipsAttribute group={{memberships: items}} />
const VisualiserCards = ({items}) => <GroupMembershipsAttributeCards group={{memberships: items}} />

export const GroupMembershipsAttributeInfinite = ({group}) => { 
    const {memberships=[]} = group

    return (
        <InfiniteScroll 
            Visualiser={Visualiser} 
            preloadedItems={memberships}
            actionParams={{...group, skip: 0, limit: 10}}
            asyncAction={GroupMembershipsAttributeAsyncAction}
        />
    )
}

export const GroupMembershipsAttributeCardsInfinite = ({group}) => { 
    const {memberships=[]} = group

    return (
        <InfiniteScroll 
            Visualiser={VisualiserCards} 
            preloadedItems={memberships}
            actionParams={{...group, skip: 0, limit: 10}}
            asyncAction={GroupMembershipsAttributeAsyncAction}
        />
    )
}