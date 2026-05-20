import { createQueryStrLazy } from "@hrbolek/uoisfrontend-gql-shared";
import { createAsyncGraphQLAction2 } from "../../../../dynamic/src/Core/createAsyncGraphQLAction2";

/**
 * SemesterInsertAsyncAction - GraphQL mutace pro vytvoření nového semestru.
 *
 * Podle GraphQL schématu SemesterInsertGQLModel podporuje:
 * - id (UUID, volitelný): Vlastní ID semestru
 * - subjectId (UUID, volitelný): ID předmětu
 * - order (Int, volitelný): Pořadí semestru
 * - mandatory (Boolean, volitelný): Povinnost
 * - credits (Int, volitelný): Kredity
 *
 * POZOR: Backend NEPODPORUJE pole "name" pro semestr!
 *
 * @module SemesterInsertAsyncAction
 */
const InsertMutationStr = `
mutation semesterInsert($id: UUID, $subjectId: UUID, $order: Int) {
  semesterInsert(semester: {id: $id, subjectId: $subjectId, order: $order}) {
    __typename
    ... on SemesterGQLModel {
      id
      lastchange
      order
      subjectId
    }
  }
}
`

const InsertMutation = createQueryStrLazy(`${InsertMutationStr}`)
export const SemesterInsertAsyncAction = createAsyncGraphQLAction2(InsertMutation)
