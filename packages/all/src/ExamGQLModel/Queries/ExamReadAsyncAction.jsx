import { createAsyncGraphQLAction, createQueryStrLazy } from "@hrbolek/uoisfrontend-gql-shared";
import { ExamLargeFragment } from "./ExamFragments";

const ExamReadQueryStr = `
query ExamReadQuery($id: UUID!) {
  result: examById(id: $id) {
    ...ExamLarge
  }
}
`

const ExamReadQuery = createQueryStrLazy(`
query ExamById($id: UUID!) {
  result: examById(id: $id) {
    ...ExamLargeFragment
  }
}
`, ExamLargeFragment)

/**
 * An async action for executing a GraphQL query to read exam entities.
 *
 * This action is created using `createAsyncGraphQLAction` with a predefined `ExamQueryRead` query.
 * It can be dispatched with query variables to fetch data related to exam entities from the GraphQL API.
 *
 * @constant
 * @type {Function}
 *
 * @param {Object} query_variables - The variables for the GraphQL query.
 * @param {string|number} query_variables.id - The unique identifier for the exam entity to fetch.
 *
 * @returns {Function} A dispatchable async action that performs the GraphQL query, applies middleware, and dispatches the result.
 *
 * @throws {Error} If `query_variables` is not a valid JSON object.
 *
 * @example
 * // Example usage:
 * const queryVariables = { id: "12345" };
 *
 * dispatch(ExamReadAsyncAction(queryVariables))
 *   .then((result) => {
 *     console.log("Fetched data:", result);
 *   })
 *   .catch((error) => {
 *     console.error("Error fetching data:", error);
 *   });
 */
export const ExamReadAsyncAction = createAsyncGraphQLAction(ExamReadQuery)