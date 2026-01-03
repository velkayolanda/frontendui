import { createQueryStrLazy } from "@hrbolek/uoisfrontend-gql-shared";
import { LargeFragment } from "./Fragments";
import { createAsyncGraphQLAction2 } from "../../../../dynamic/src/Core/createAsyncGraphQLAction2";

const DeleteMutationStr = `
mutation submissionSectionDelete($id: UUID!, $lastchange: DateTime!) {
  submissionSectionDelete(submissionSection: {id: $id, lastchange: $lastchange}) {
  ...DigitalSubmissionSectionGQLModelDeleteError
}
}

fragment DigitalSubmissionSectionGQLModelDeleteError on DigitalSubmissionSectionGQLModelDeleteError  {
  __typename
  Entity {
    ...Large
  }
  msg
  code
  failed
  location
  input
}
`
const DeleteMutation = createQueryStrLazy(`${DeleteMutationStr}`, LargeFragment)
export const DeleteAsyncAction = createAsyncGraphQLAction2(DeleteMutation)