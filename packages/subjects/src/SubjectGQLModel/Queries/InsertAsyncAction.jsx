import { createQueryStrLazy } from "@hrbolek/uoisfrontend-gql-shared";
import { LargeFragment } from "./Fragments";
import { createAsyncGraphQLAction2 } from "../../../../dynamic/src/Core/createAsyncGraphQLAction2";

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

const InsertMutation = createQueryStrLazy(`${InsertMutationStr}`, LargeFragment)
export const InsertAsyncAction = createAsyncGraphQLAction2(InsertMutation)
