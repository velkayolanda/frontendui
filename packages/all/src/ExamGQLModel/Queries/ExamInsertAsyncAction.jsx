import { createAsyncGraphQLAction, createQueryStrLazy } from "@hrbolek/uoisfrontend-gql-shared";
import { ExamLargeFragment } from "./ExamFragments";


const ExamInsertMutationStr = `
mutation ExamInsertMutation($id: UUID, $name: String, $name_en: String) {
  result: examInsert(
    exam: {id: $id, name: $name, nameEn: $name_en}
  ) {
    ... on InsertError {
      failed
      msg
      input
    }
    ...ExamLarge
  }
}
`

const ExamInsertMutation = createQueryStrLazy(`
mutation ExamInsert($name: String, $nameEn: String, $description: String, $descriptionEn: String, $minScore: Int, $maxScore: Int, $typeId: UUID, $parentId: UUID, $planId: UUID, $id: UUID) {
  result: examInsert(exam: { name: $name, nameEn: $nameEn, description: $description, descriptionEn: $descriptionEn, minScore: $minScore, maxScore: $maxScore, typeId: $typeId, parentId: $parentId, planId: $planId, id: $id }) {
    __typename
    ... on ExamGQLModel {
      ...ExamLargeFragment
    }
    ... on InsertError {
      msg
      failed
      input
    }
  }
}
`, ExamLargeFragment)
export const ExamInsertAsyncAction = createAsyncGraphQLAction(ExamInsertMutation)