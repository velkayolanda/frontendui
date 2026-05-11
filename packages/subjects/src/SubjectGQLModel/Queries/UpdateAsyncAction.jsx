import { createQueryStrLazy } from "@hrbolek/uoisfrontend-gql-shared";
import { LargeFragment } from "./Fragments";
import { createAsyncGraphQLAction2 } from "../../../../dynamic/src/Core/createAsyncGraphQLAction2";
import { reduceToFirstEntity, updateItemsFromGraphQLResult } from "../../../../dynamic/src/Store";

/**
 * GraphQL mutace pro aktualizaci entity Subject.
 *
 * Vstupní parametry:
 * - id: UUID entity k aktualizaci (povinné)
 * - lastchange: DateTime poslední změny pro optimistic locking (povinné)
 * - name: Nový název v češtině (volitelné)
 * - nameEn: Nový název v angličtině (volitelné)
 * - description: Nový popis v češtině (volitelné)
 * - descriptionEn: Nový popis v angličtině (volitelné)
 *
 * Vrací:
 * - SubjectGQLModel při úspěchu (s daty dle LargeFragment)
 * - SubjectGQLModelUpdateError při chybě (s detaily: msg, failed)
 */
const UpdateMutationStr = `
mutation subjectUpdate(
    $id: UUID!
    $lastchange: DateTime!
    $name: String
    $nameEn: String
    $description: String
    $descriptionEn: String
) {
  subjectUpdate(
    subject: {
      id: $id
      lastchange: $lastchange
      name: $name
      nameEn: $nameEn
      description: $description
      descriptionEn: $descriptionEn
    }
  ) {
    ... on SubjectGQLModel { ...Large }
    ... on SubjectGQLModelUpdateError {
      __typename
      Entity { ...Large }
      msg
      failed
    }
  }
}
`

// Vytvoření lazy-loaded GraphQL query s fragmentem pro entitu
const UpdateMutation = createQueryStrLazy(`${UpdateMutationStr}`, LargeFragment)

/**
 * Async action pro aktualizaci entity Subject.
 * Používá se s dispatch v Redux store.
 *
 * Konfigurace:
 * - updateItemsFromGraphQLResult: Aktualizuje položky v Redux store z výsledku
 * - reduceToFirstEntity: Vrátí první entitu z výsledku (pro použití v komponentách)
 *
 * @example
 * const updatedSubject = await dispatch(UpdateAsyncAction({
 *   id: "uuid",
 *   lastchange: "2026-05-01T00:00:00Z",
 *   name: "Aktualizovaný název"
 * }, gqlClient))
 */
export const UpdateAsyncAction = createAsyncGraphQLAction2(UpdateMutation,
    updateItemsFromGraphQLResult, reduceToFirstEntity)