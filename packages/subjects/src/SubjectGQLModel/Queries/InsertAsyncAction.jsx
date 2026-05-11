import { createQueryStrLazy } from "@hrbolek/uoisfrontend-gql-shared";
import { LargeFragment } from "./Fragments";
import { createAsyncGraphQLAction2 } from "../../../../dynamic/src/Core/createAsyncGraphQLAction2";

/**
 * GraphQL mutace pro vytvoření nové entity Subject.
 *
 * Vstupní parametry:
 * - programId: UUID programu (povinné) - předmět musí patřit do programu
 * - id: UUID nové entity (volitelné) - pokud není zadáno, vygeneruje se
 * - name: Název předmětu v češtině (volitelné)
 * - nameEn: Název předmětu v angličtině (volitelné)
 * - description: Popis předmětu v češtině (volitelné)
 * - descriptionEn: Popis předmětu v angličtině (volitelné)
 * - groupId: UUID skupiny (volitelné)
 *
 * Vrací:
 * - SubjectGQLModel při úspěchu (s daty dle LargeFragment)
 * - SubjectGQLModelInsertError při chybě (s detaily: msg, failed)
 */
const InsertMutationStr = `
mutation subjectInsert(
    $programId: UUID!
    $id: UUID
    $name: String
    $nameEn: String
    $description: String
    $descriptionEn: String
    $groupId: UUID
) {
  subjectInsert(
    subject: {
      programId: $programId
      id: $id
      name: $name
      nameEn: $nameEn
      description: $description
      descriptionEn: $descriptionEn
      groupId: $groupId
    }
  ) {
    ... on SubjectGQLModel { ...Large }
    ... on SubjectGQLModelInsertError {
      __typename
      Entity { ...Large }
      msg
      failed
    }
  }
}
`

// Vytvoření lazy-loaded GraphQL query s fragmentem pro entitu
const InsertMutation = createQueryStrLazy(`${InsertMutationStr}`, LargeFragment)

/**
 * Async action pro vytvoření nové entity Subject.
 * Používá se s dispatch v Redux store.
 *
 * @example
 * dispatch(InsertAsyncAction({
 *   programId: "uuid-programu",
 *   name: "Nový předmět",
 *   nameEn: "New Subject"
 * }, gqlClient))
 */
export const InsertAsyncAction = createAsyncGraphQLAction2(InsertMutation)
