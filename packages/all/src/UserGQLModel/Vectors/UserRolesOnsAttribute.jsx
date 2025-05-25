import { createAsyncGraphQLAction, processVectorAttributeFromGraphQLResult, useAsyncAction } from "@hrbolek/uoisfrontend-gql-shared"
import { ErrorHandler, InfiniteScroll, LoadingSpinner } from "@hrbolek/uoisfrontend-shared"
import { UserLink } from "../Components";
import { GroupLink } from "../../GroupGQLModel";
import { Col, Row } from "react-bootstrap";


/**
 * Inserts a RolesonGQLModel item into a user’s rolesons array and dispatches an update.
 *
 * @param {Object} user - The current user object containing a `rolesons` array.
 * @param {Object} rolesonItem - The item to insert; must have `__typename === "RolesonGQLModel"`.
 * @param {Function} dispatch - Redux dispatch function (or similar) to call the update action.
 */
const followUpUserRolesonItemInsert = (user, rolesonItem, dispatch) => {
    const { __typename } = rolesonItem;
    if (__typename === "RolesonGQLModel") {
        const { rolesons, ...others } = user;
        const newUserRolesonItems = [...rolesons, rolesonItem];
        const newUser = { ...others, rolesons: newUserRolesonItems };
        dispatch(ItemActions.item_update(newUser));
    }
};

/**
 * Replaces an existing RolesonGQLModel item in a user’s rolesons array and dispatches an update.
 *
 * @param {Object} user - The current user object containing a `rolesons` array.
 * @param {Object} rolesonItem - The updated item; must have `__typename === "RolesonGQLModel"` and an `id` field matching an existing item.
 * @param {Function} dispatch - Redux dispatch function (or similar) to call the update action.
 */
const followUpUserRolesonItemUpdate = (user, rolesonItem, dispatch) => {
    const { __typename } = rolesonItem;
    if (__typename === "RolesonGQLModel") {
        const { rolesons, ...others } = user;
        const newUserRolesonItems = rolesons.map(item =>
            item.id === rolesonItem.id ? rolesonItem : item
        );
        const newUser = { ...others, rolesons: newUserRolesonItems };
        dispatch(ItemActions.item_update(newUser));
    }
};

/**
 * Removes a RolesonGQLModel item from a user’s rolesons array by its `id` and dispatches an update.
 *
 * @param {Object} user - The current user object containing a `rolesons` array.
 * @param {Object} rolesonItem - The item to delete; must have `__typename === "RolesonGQLModel"` and an `id` field.
 * @param {Function} dispatch - Redux dispatch function (or similar) to call the update action.
 */
const followUpUserRolesonItemDelete = (user, rolesonItem, dispatch) => {
    const { __typename } = rolesonItem;
    if (__typename === "RolesonGQLModel") {
        const { rolesons, ...others } = user;
        const newUserRolesonItems = rolesons.filter(
            item => item.id !== rolesonItem.id
        );
        const newUser = { ...others, rolesons: newUserRolesonItems };
        dispatch(ItemActions.item_update(newUser));
    }
};


/**
 * A component for displaying the `rolesons` attribute of an user entity.
 *
 * This component checks if the `rolesons` attribute exists on the `user` object. If `rolesons` is undefined,
 * the component returns `null` and renders nothing. Otherwise, it maps over the `rolesons` array and
 * displays a placeholder message and a JSON representation for each item in the `rolesons`.
 *
 * @component
 * @param {Object} props - The props for the UserRolesonsAttribute component.
 * @param {Object} props.user - The object representing the user entity.
 * @param {Array} [props.user.rolesons] - An array of rolesons items associated with the user entity.
 * Each item is expected to have a unique `id` property.
 *
 * @returns {JSX.Element|null} A JSX element displaying the `rolesons` items or `null` if the attribute is undefined.
 *
 * @example
 * // Example usage:
 * const userEntity = { 
 *   rolesons: [
 *     { id: 1, name: "Roleson Item 1" }, 
 *     { id: 2, name: "Roleson Item 2" }
 *   ] 
 * };
 *
 * <UserRolesonsAttribute user={userEntity} />
 */
export const UserRolesonsAttribute = ({user}) => {
    const { rolesons } = user
    if (typeof rolesons === 'undefined') return null
    return (
        <>
            {rolesons.map(
                roleson => <div id={roleson.id} key={roleson.id}>
                    Probably {'<RolesonMediumCard roleson=\{roleson\} />'} <br />
                    <pre>{JSON.stringify(roleson, null, 4)}</pre>
                </div>
            )}
        </>
    )
}

const UserRolesonsAttributeQuery = `
query UserQueryRead($id: UUID!) {
    userById(id: $id) {
        __typename
        id
        rolesOn {
            __typename
            id
            lastchange
            created
            createdbyId
            changedbyId
            rbacobjectId
            startdate
            enddate
            roletypeId
            userId
            user { 
                id
                fullname
                email
            }
            roletype {
                id
                name
            }
            groupId
            group {
                id
                name
            }
        }
    }
}
`

const UserRolesonsAttributeAsyncAction = createAsyncGraphQLAction(
    UserRolesonsAttributeQuery,
    processVectorAttributeFromGraphQLResult("rolesOn")
)

export const UserRolesonsAttributeInfinite = ({user}) => { 
    const {rolesons} = user

    return (
        <InfiniteScroll 
            Visualiser={'RolesonMediumCard'} 
            actionParams={{...user, skip: 0, limit: 10}}
            asyncAction={UserRolesonsAttributeAsyncAction}
        />
    )
}


export const UserRolesOnAttributeLazy = ({user, filter=Boolean}) => {
    const {loading, error, entity} = useAsyncAction(UserRolesonsAttributeAsyncAction, user)
    const values = entity?.rolesOn || []
    
    if (loading) return <LoadingSpinner />
    if (error) return <ErrorHandler errors={error} />

    const valuesToDisplay = values.filter(filter)
    return (<>
        {valuesToDisplay.map(role => <div key={role.id}>
            {/* {JSON.stringify(role.user)} */}
            {role?.user && (<>
                 <Row>
                    <Col>
                        <UserLink user={role?.user}/>
                    </Col>
                    <Col>
                        <b>{role?.roletype?.name}</b><br/>
                        {role?.group && <>[<GroupLink group={role?.group} />]</>}
                    </Col>
                 </Row>

            </>)}
        </div>)}
        {/* {JSON.stringify(valuesToDisplay)} */}
    </>)
}