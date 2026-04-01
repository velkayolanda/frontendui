import { createQueryStrLazy } from "@hrbolek/uoisfrontend-gql-shared";
import { SubEventsFragment } from "./Fragments";
import { createAsyncGraphQLAction2 } from "../../../../dynamic/src/Core/createAsyncGraphQLAction2";

const ReadQueryStr = `
query eventById($id: UUID!, $limit: Int=1000, $skip: Int, $orderby: String, $where: EventInputFilter) {
  eventById(id: $id) {
    ...SubEvents
  }
}
`

const ReadQuery = createQueryStrLazy(`${ReadQueryStr}`, SubEventsFragment)

/**
 * An async action for executing a GraphQL query to read  entities.
 *
 * This action is created using `createAsyncGraphQLAction` with a predefined `QueryRead` query.
 * It can be dispatched with query variables to fetch data related to  entities from the GraphQL API.
 *
 * @constant
 * @type {Function}
 *
 * @param {Object} query_variables - The variables for the GraphQL query.
 * @param {string|number} query_variables.id - The unique identifier for the  entity to fetch.
 *
 * @returns {Function} A dispatchable async action that performs the GraphQL query, applies middleware, and dispatches the result.
 *
 * @throws {Error} If `query_variables` is not a valid JSON object.
 *
 * @example
 * // Example usage:
 * const queryVariables = { id: "12345" };
 *
 * dispatch(ReadAsyncAction(queryVariables))
 *   .then((result) => {
 *     console.log("Fetched data:", result);
 *   })
 *   .catch((error) => {
 *     console.error("Error fetching data:", error);
 *   });
 */
// export const ReadAsyncAction = createAsyncGraphQLAction2(ReadQuery, reduceToFirstEntity("result"))
export const ReadSubEventsAsyncAction = createAsyncGraphQLAction2(ReadQuery)