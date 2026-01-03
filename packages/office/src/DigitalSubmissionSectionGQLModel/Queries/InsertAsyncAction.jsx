import { createQueryStrLazy } from "@hrbolek/uoisfrontend-gql-shared";
import { LargeFragment } from "./Fragments";
import { createAsyncGraphQLAction2 } from "../../../../dynamic/src/Core/createAsyncGraphQLAction2";


const InsertMutationStr = `
mutation submissionSectionInsert($submissionId: UUID, $sectionId: UUID, $formSectionId: UUID, $index: Int, $id: UUID, $sections: [SubmissionSectionInsertGQLModel!], $fields: [DigitalSubmissionFieldInsertGQLModel!]) {
  submissionSectionInsert(submissionSection: {submissionId: $submissionId, sectionId: $sectionId, formSectionId: $formSectionId, index: $index, id: $id, sections: $sections, fields: $fields}) {
    ... on DigitalSubmissionSectionGQLModel { ...Large }
    ... on DigitalSubmissionSectionGQLModelInsertError { ...DigitalSubmissionSectionGQLModelInsertError }
  }
}


fragment DigitalSubmissionSectionGQLModelInsertError on DigitalSubmissionSectionGQLModelInsertError {
  __typename
  Entity {
  ...DigitalSubmissionSection
}
  msg
  failed
  code
  location
  input
  }
`

const InsertMutation = createQueryStrLazy(`${InsertMutationStr}`, LargeFragment)
export const InsertAsyncAction = createAsyncGraphQLAction2(InsertMutation)