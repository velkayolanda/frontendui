import { createQueryStrLazy } from "@hrbolek/uoisfrontend-gql-shared";
import { LargeFragment } from "./Fragments";
import { createAsyncGraphQLAction2 } from "../../../../dynamic/src/Core/createAsyncGraphQLAction2";


const InsertMutationStr = `
mutation digitalFormSubmissionInsert2($formId: UUID!, $name: String, $nameEn: String, $parentId: UUID, $id: UUID) {
  digitalFormSubmissionInsert2(digitalFormSubmission: {formId: $formId, name: $name, nameEn: $nameEn, parentId: $parentId, id: $id}) {
    ... on DigitalSubmissionGQLModel { ...Large }
    ... on DigitalSubmissionGQLModelInsertError { ...DigitalSubmissionGQLModelInsertError }
  }
}


fragment DigitalSubmissionGQLModelInsertError on DigitalSubmissionGQLModelInsertError {
  __typename
  msg
  failed
  code
  location
  input

}
`

const InsertMutation = createQueryStrLazy(`${InsertMutationStr}`, LargeFragment)
export const InsertAsyncAction = createAsyncGraphQLAction2(InsertMutation)