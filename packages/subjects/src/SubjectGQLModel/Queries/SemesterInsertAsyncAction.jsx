import { createQueryStrLazy } from "@hrbolek/uoisfrontend-gql-shared";
import { createAsyncGraphQLAction2 } from "../../../../dynamic/src/Core/createAsyncGraphQLAction2";

/**
 * SemesterInsertAsyncAction - GraphQL mutace pro vytvoření nového semestru.
 *
 * DŮLEŽITÉ: Podle GraphQL schématu SemesterInsertGQLModel má pouze:
 * - name (String!, povinný): Název semestru
 * - id (UUID, volitelný): Vlastní ID semestru
 *
 * Ostatní fieldy (subjectId, order, credits, mandatory) se musí nastavit
 * následným voláním SemesterUpdateAsyncAction!
 *
 * Typický postup pro vytvoření semestru přiřazeného k předmětu:
 * 1. Zavolat SemesterInsertAsyncAction s názvem
 * 2. Z odpovědi získat id a lastchange nového semestru
 * 3. Zavolat SemesterUpdateAsyncAction pro nastavení subjectId, order atd.
 *
 * Použití:
 * ```javascript
 * const result = await dispatch(SemesterInsertAsyncAction({
 *     name: "Zimní semestr 2024"
 * }, gqlClient));
 *
 * if (result?.id) {
 *     await dispatch(SemesterUpdateAsyncAction({
 *         id: result.id,
 *         lastchange: result.lastchange,
 *         subjectId: subjectId,
 *         order: 1
 *     }, gqlClient));
 * }
 * ```
 *
 * Návratová hodnota:
 * - Při úspěchu: SemesterGQLModel s id a lastchange
 * - Při chybě: InsertError s informacemi o chybě
 *
 * @module SemesterInsertAsyncAction
 */
const InsertMutationStr = `
mutation semesterInsert($name: String!, $id: UUID) {
  semesterInsert(semester: {name: $name, id: $id}) {
    ... on InsertError {
      __typename
      msg
      failed
      code
      location
      input
    }
    ... on SemesterGQLModel {
      __typename
      id
      lastchange
    }
  }
}
`

const InsertMutation = createQueryStrLazy(`${InsertMutationStr}`)
export const SemesterInsertAsyncAction = createAsyncGraphQLAction2(InsertMutation)
