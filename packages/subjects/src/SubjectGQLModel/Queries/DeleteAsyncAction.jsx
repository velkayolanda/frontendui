import { createQueryStrLazy } from "@hrbolek/uoisfrontend-gql-shared";
import { LargeFragment } from "./Fragments";
import { createAsyncGraphQLAction2 } from "../../../../dynamic/src/Core/createAsyncGraphQLAction2";

/**
 * GraphQL mutace pro smazání entity Subject.
 *
 * Vstupní parametry:
 * - id: UUID entity k smazání (povinné)
 * - lastchange: DateTime poslední změny pro optimistic locking (povinné)
 *
 * Vrací:
 * - SubjectGQLModelDeleteError při chybě (s detaily: msg, code, failed, location, input)
 * - Úspěšné smazání nevrací data (jen prázdný výsledek)
 */
const DeleteMutationStr = `
mutation subjectDelete(
    $id: UUID!
    $lastchange: DateTime!
) {
  subjectDelete(
    subject: {
      id: $id
      lastchange: $lastchange
    }
  ) {
    ... on SubjectGQLModelDeleteError {
      __typename
      Entity { ...Large }
      msg
      code
      failed
      location
      input
    }
  }
}
`

// Vytvoření lazy-loaded GraphQL query s fragmentem pro entitu
const DeleteMutation = createQueryStrLazy(`${DeleteMutationStr}`, LargeFragment)

/**
 * Async action pro smazání entity Subject.
 * Používá se s dispatch v Redux store.
 *
 * @example
 * dispatch(DeleteAsyncAction({ id: "uuid", lastchange: "2026-05-01T00:00:00Z" }, gqlClient))
 */
export const DeleteAsyncAction = createAsyncGraphQLAction2(DeleteMutation)
