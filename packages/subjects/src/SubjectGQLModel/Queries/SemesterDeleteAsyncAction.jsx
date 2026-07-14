/** @module Queries */
import { createQueryStrLazy } from "@hrbolek/uoisfrontend-gql-shared";
import { createAsyncGraphQLAction2 } from "../../../../dynamic/src/Core/createAsyncGraphQLAction2";

/**
 * SemesterDeleteAsyncAction - GraphQL mutace pro smazání semestru.
 *
 * UPOZORNĚNÍ: Tato akce trvale smaže semestr z databáze!
 * Pro odpojení semestru od předmětu (bez smazání) použijte SemesterUpdateAsyncAction
 * s nastavením subjectId na null.
 *
 * Mutace vyžaduje:
 * - id (UUID!): ID semestru ke smazání
 * - lastchange (DateTime!): Timestamp poslední změny pro optimistic locking
 *
 * Použití:
 * ```javascript
 * await dispatch(SemesterDeleteAsyncAction({
 *     id: semesterId,
 *     lastchange: currentLastchange
 * }, gqlClient));
 * ```
 *
 * Návratová hodnota:
 * - Při úspěchu: SemesterGQLModel se smazanými daty
 * - Při chybě: SemesterGQLModelDeleteError s informacemi o chybě
 *
 * @module SemesterDeleteAsyncAction
 */

const DeleteMutationStr = `
mutation semesterDeleteMutation($id: UUID!, $lastchange: DateTime!) {
  semesterDelete(semester: {id: $id, lastchange: $lastchange}) {
    msg
    failed
    Entity {
      id
      lastchange
    }
  }
}
`

const DeleteMutation = createQueryStrLazy(`${DeleteMutationStr}`)
export const SemesterDeleteAsyncAction = createAsyncGraphQLAction2(DeleteMutation)
