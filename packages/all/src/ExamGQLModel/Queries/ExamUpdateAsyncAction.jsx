import { createAsyncGraphQLAction, createQueryStrLazy } from "@hrbolek/uoisfrontend-gql-shared";
import { ExamLargeFragment } from "./ExamFragments";

const ExamUpdateMutationStr = `
mutation ExamUpdateMutation($id: UUID!, $lastchange: DateTime!, $name: String, $name_en: String) {
  result: examUpdate(
    exam: {id: $id, lastchange: $lastchange, name: $name, nameEn: $name_en}
  ) {
    ... on ExamGQLModelUpdateError {
      failed
      msg
      input
      Entity {
        ...ExamLarge
      }      
    }
    ...ExamLarge
  }
}
`

const ExamUpdateMutation = createQueryStrLazy(`
mutation ExamUpdate($id: UUID!, $lastchange: DateTime!, $name: String, $nameEn: String, $description: String, $descriptionEn: String, $minScore: Int, $maxScore: Int, $typeId: UUID, $parentId: UUID, $planId: UUID) {
  result: examUpdate(exam: { id: $id, lastchange: $lastchange, name: $name, nameEn: $nameEn, description: $description, descriptionEn: $descriptionEn, minScore: $minScore, maxScore: $maxScore, typeId: $typeId, parentId: $parentId, planId: $planId }) {
    __typename
    ... on ExamGQLModel {
      ...ExamLargeFragment
    }
    ... on ExamGQLModelUpdateError {
      Entity {
        ...ExamLargeFragment
      }
      msg
      failed
      input
    }
  }
}
`, ExamLargeFragment)
export const ExamUpdateAsyncAction = createAsyncGraphQLAction(ExamUpdateMutation)