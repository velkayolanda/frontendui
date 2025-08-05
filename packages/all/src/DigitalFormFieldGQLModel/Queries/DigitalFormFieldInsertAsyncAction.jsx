import { createAsyncGraphQLAction, createQueryStrLazy } from "@hrbolek/uoisfrontend-gql-shared";
import { DigitalFormFieldLargeFragment, FormSectionWithFieldsFragment } from "./DigitalFormFieldFragments";
import { DigitalFormSectionsFragment } from "../../DigitalFormGQLModel/Queries";


const DigitalFormFieldInsertMutationStr = `
mutation digitalFormFieldInsertMutation(
  $id: UUID, 
  $name: String, 
  $typeId: UUID,
  $formId: UUID,
  $formSectionId: UUID,
  $label: String,
  $labelEn: String,
  $description: String,
  $required: Boolean,
  $order: Int
) {
  result: digitalFormFieldInsert(
    formField: {
      id: $id, 
      name: $name, 
      formId: $formId,
      formSectionId: $formSectionId,
      label: $label,
      labelEn: $labelEn,
      description: $description,
      required: $required,
      order: $order,
      typeId: $typeId
    }
  ) {
    ... on InsertError {
      failed
      msg
      input
    }
    ... on DigitalFormFieldGQLModel {
      __typename
      ...DigitalFormFieldLargeFragment
      form {
        __typename
        id
        name
        ...DigitalFormSectionsFragment
      }
    }
    
  }
}
`

const DigitalFormFieldInsertMutation = createQueryStrLazy(
  `${DigitalFormFieldInsertMutationStr}`, 
  DigitalFormFieldLargeFragment,
  FormSectionWithFieldsFragment,
  DigitalFormSectionsFragment
)
export const DigitalFormFieldInsertAsyncAction = createAsyncGraphQLAction(DigitalFormFieldInsertMutation)