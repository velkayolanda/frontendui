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

/**
 * Fragment pro načtení základních dat semestru po aktualizaci.
 * Obsahuje všechny klíčové fieldy které se mohou změnit.
 */
const SemesterLinkFragmentStr = `
fragment SemesterLinkUpdate on SemesterGQLModel {
  __typename
  id
  lastchange
  order
  mandatory
  credits
  classificationtypeId
  subjectId
}
`

/**
 * GraphQL mutace pro aktualizaci semestru.
 *
 * Parametry:
 * - id (UUID!, povinný): ID semestru k aktualizaci
 * - lastchange (DateTime!, povinný): Timestamp poslední změny pro optimistic locking
 * - subjectId (UUID): ID předmětu, ke kterému semestr patří (null = nepřiřazený)
 * - order (Int): Pořadí semestru v rámci předmětu
 * - mandatory (Boolean): Zda je semestr povinný
 * - credits (Int): Počet kreditů
 * - classificationtypeId (UUID): ID typu klasifikace
 */
const UpdateMutationStr = `
mutation semesterUpdate($id: UUID!, $lastchange: DateTime!, $subjectId: UUID, $order: Int, $mandatory: Boolean, $credits: Int, $classificationtypeId: UUID) {
  semesterUpdate(semester: {id: $id, lastchange: $lastchange, subjectId: $subjectId, order: $order, mandatory: $mandatory, credits: $credits, classificationtypeId: $classificationtypeId}) {
    ... on SemesterGQLModelUpdateError {
      __typename
      failed
      msg
      code
      location
      input
      Entity {
        ...SemesterLinkUpdate
      }
    }
    ... on SemesterGQLModel { ...SemesterLinkUpdate }
  }
}
`

const SemesterLinkFragment = createQueryStrLazy(`${SemesterLinkFragmentStr}`)
const UpdateMutation = createQueryStrLazy(`${UpdateMutationStr}`, SemesterLinkFragment)
export const SemesterUpdateAsyncAction = createAsyncGraphQLAction2(UpdateMutation)
