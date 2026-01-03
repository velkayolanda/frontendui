import { createQueryStrLazy } from "@hrbolek/uoisfrontend-gql-shared";
import { LargeFragment } from "./Fragments";
import { createAsyncGraphQLAction2 } from "../../../../dynamic/src/Core/createAsyncGraphQLAction2";
import { reduceToFirstEntity, updateItemsFromGraphQLResult } from "../../../../dynamic/src/Store";

const UpdateMutationStr = `
mutation digitalSubmissionFieldUpdate($lastchange: DateTime!, $id: UUID!, $value: String) {
  digitalSubmissionFieldUpdate(submissionField: { id: $id, value: $value, lastchange: $lastchange}) {
    ... on DigitalSubmissionFieldGQLModel { ...Large }
    ... on DigitalSubmissionFieldGQLModelUpdateError { ...Error }
  }
}

fragment Error on DigitalSubmissionFieldGQLModelUpdateError {
  __typename
  Entity {
    ...Large
  }
  msg
  failed
  code
  location
  input
}
`

const UpdateMutation = createQueryStrLazy(`${UpdateMutationStr}`, LargeFragment)
export const UpdateAsyncAction = createAsyncGraphQLAction2(UpdateMutation, 
    updateItemsFromGraphQLResult, reduceToFirstEntity)