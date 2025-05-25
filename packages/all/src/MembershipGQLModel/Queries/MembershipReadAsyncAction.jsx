import { createAsyncGraphQLAction, createQueryStrLazy } from "@hrbolek/uoisfrontend-gql-shared";
import { MembershipLargeFragment } from "./MembershipFragments";

const MembershipReadQueryStr = `
query MembershipReadQuery($id: UUID!) {
  result: membershipById(id: $id) {
    ...MembershipLarge
  }
}
`

const MembershipReadQuery = createQueryStrLazy(`
query MembershipById($id: UUID!) {
  result: membershipById(id: $id) {
    ...MembershipLargeFragment
  }
}
`, MembershipLargeFragment)

/**
 * An async action for executing a GraphQL query to read membership entities.
 *
 * This action is created using `createAsyncGraphQLAction` with a predefined `MembershipQueryRead` query.
 * It can be dispatched with query variables to fetch data related to membership entities from the GraphQL API.
 *
 * @constant
 * @type {Function}
 *
 * @param {Object} query_variables - The variables for the GraphQL query.
 * @param {string|number} query_variables.id - The unique identifier for the membership entity to fetch.
 *
 * @returns {Function} A dispatchable async action that performs the GraphQL query, applies middleware, and dispatches the result.
 *
 * @throws {Error} If `query_variables` is not a valid JSON object.
 *
 * @example
 * // Example usage:
 * const queryVariables = { id: "12345" };
 *
 * dispatch(MembershipReadAsyncAction(queryVariables))
 *   .then((result) => {
 *     console.log("Fetched data:", result);
 *   })
 *   .catch((error) => {
 *     console.error("Error fetching data:", error);
 *   });
 */
export const MembershipReadAsyncAction = createAsyncGraphQLAction(MembershipReadQuery)