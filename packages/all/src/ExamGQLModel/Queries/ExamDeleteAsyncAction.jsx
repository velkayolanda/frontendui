import { createAsyncGraphQLAction, createQueryStrLazy } from "@hrbolek/uoisfrontend-gql-shared";
import { ExamLargeFragment } from "./ExamFragments";

const ExamDeleteMutationStr = `
mutation ExamDeleteMutation($id: UUID!, $lastchange: DateTime!) {
  result: examDelete(
    exam: {id: $id, lastchange: $lastchange}
  ) {
    ... on ExamGQLModelDeleteError {
      failed
      msg
      input
      Entity {
        ...ExamLarge
      }
    }
  }
}
`
const ExamDeleteMutation = createQueryStrLazy(`
mutation ExamDelete($id: UUID!, $lastchange: DateTime!, $name: String, $nameEn: String, $description: String, $descriptionEn: String, $minScore: Int, $maxScore: Int, $typeId: UUID, $parentId: UUID, $planId: UUID) {
  result: examDelete(exam: { id: $id, lastchange: $lastchange, name: $name, nameEn: $nameEn, description: $description, descriptionEn: $descriptionEn, minScore: $minScore, maxScore: $maxScore, typeId: $typeId, parentId: $parentId, planId: $planId }) {
    ...ExamLargeFragment
  }
}
`, ExamLargeFragment)
export const ExamDeleteAsyncAction = createAsyncGraphQLAction(ExamDeleteMutation)