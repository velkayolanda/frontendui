import { createAsyncGraphQLAction, createQueryStrLazy } from "@hrbolek/uoisfrontend-gql-shared";
import { DigitalFormSectionLargeFragment } from "./DigitalFormSectionFragments";
import { DigitalFormLargeFragment } from "../../DigitalFormGQLModel/Queries";


const DigitalFormSectionInsertMutationStr = `
mutation DigitalFormSectionInsertMutation(
  $id: UUID, 
  $name: String, 
  $label: String, 
  $labelEn: String,
  $formId: UUID,
  $sectionId: UUID
) {
  result: digitalFormSectionInsert(
    digitalFormSection: {
      id: $id, 
      name: $name, 
      label: $label, 
      labelEn: $labelEn,
      formId: $formId,
      sectionId: $sectionId
    }
  ) {
    ... on InsertError {
      failed
      msg
      input
    }
    ...DigitalFormSectionLargeFragment
    ...on DigitalFormSectionGQLModel {
      form {
          __typename
          ...DigitalFormLargeFragment  
      }
  	}
  }
}
`

const DigitalFormSectionInsertMutation = createQueryStrLazy(
  `${DigitalFormSectionInsertMutationStr}`, 
  DigitalFormSectionLargeFragment,
  DigitalFormLargeFragment
)

export const DigitalFormSectionInsertAsyncAction = createAsyncGraphQLAction(DigitalFormSectionInsertMutation)