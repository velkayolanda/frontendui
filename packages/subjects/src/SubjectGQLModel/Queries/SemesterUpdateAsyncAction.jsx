/** @module Queries */
import { createQueryStrLazy } from "@hrbolek/uoisfrontend-gql-shared";
import { createAsyncGraphQLAction2 } from "../../../../dynamic/src/Core/createAsyncGraphQLAction2";

/**
 * SemesterUpdateAsyncAction - GraphQL mutace pro aktualizaci semestru.
 *
 * Tato async action umožňuje:
 * - Přiřadit semestr k předmětu (nastavení subjectId)
 * - Odebrat semestr z předmětu (nastavení subjectId na null)
 * - Změnit pořadí semestru (order)
 * - Změnit další vlastnosti (mandatory, credits, classificationtypeId)
 *
 * DŮLEŽITÉ: Mutace vyžaduje platný lastchange timestamp!
 * Před každým voláním je nutné načíst aktuální lastchange ze serveru,
 * jinak mutace selže s chybou "concurrent modification".
 *
 * Použití:
 * ```javascript
 * await dispatch(SemesterUpdateAsyncAction({
 *     id: semesterId,
 *     lastchange: currentLastchange,  // Musí být aktuální!
 *     subjectId: subjectId,           // nebo null pro odpojení
 *     order: newOrder
 * }, gqlClient));
 * ```
 *
 * Návratová hodnota:
 * - Při úspěchu: SemesterGQLModel s aktualizovanými daty a novým lastchange
 * - Při chybě: SemesterGQLModelUpdateError s informacemi o chybě a aktuálním stavem entity
 *
 * @module SemesterUpdateAsyncAction
 */

const UpdateMutationStr = `
mutation semesterUpdateMutation($id: UUID!, $lastchange: DateTime!, $subjectId: UUID, $order: Int, $mandatory: Boolean, $credits: Int, $classificationtypeId: UUID) {
  semesterUpdate(semester: {id: $id, lastchange: $lastchange, subjectId: $subjectId, order: $order, mandatory: $mandatory, credits: $credits, classificationtypeId: $classificationtypeId}) {
    __typename
    ... on SemesterGQLModel {
      id
      lastchange
      order
      subjectId
    }
    ... on SemesterGQLModelUpdateError {
      failed
      msg
    }
  }
}
`

const UpdateMutation = createQueryStrLazy(`${UpdateMutationStr}`)
export const SemesterUpdateAsyncAction = createAsyncGraphQLAction2(UpdateMutation)
