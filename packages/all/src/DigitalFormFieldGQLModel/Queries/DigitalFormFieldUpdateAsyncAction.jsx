import { createAsyncGraphQLAction, createQueryStrLazy } from "@hrbolek/uoisfrontend-gql-shared";
import { DigitalFormFieldLargeFragment } from "./DigitalFormFieldFragments";
import { DigitalFormSectionsFragment } from "../../DigitalFormGQLModel/Queries";

const DigitalFormFieldUpdateMutationStr = `
mutation DigitalFormFieldUpdateMutation(
    $id: UUID!, 
    $lastchange: DateTime!, 

    $name: String, 
    $label: String,
    $labelEn: String,
    $description: String,
    $required: Boolean,
    $order: Int
    ) {
  result: digitalFormFieldUpdate(
    formField: {
      id: $id, 
      name: $name, 
      label: $label,
      labelEn: $labelEn,
      description: $description,
      required: $required,
      order: $order,
      lastchange: $lastchange
    }
  ) {
    ... on DigitalFormFieldGQLModelUpdateError {
      failed
      msg
      input
      Entity {
        ...DigitalFormFieldLargeFragment
      }      
    }
    ... on DigitalFormFieldGQLModel {
    	...DigitalFormFieldLargeFragment  
      form {
        ...DigitalFormSectionsFragment
      }
    }
  }
}
`

const DigitalFormFieldUpdateMutation = createQueryStrLazy(
    `${DigitalFormFieldUpdateMutationStr}`, 
    DigitalFormFieldLargeFragment,
    DigitalFormSectionsFragment
)
export const DigitalFormFieldUpdateAsyncAction = createAsyncGraphQLAction(DigitalFormFieldUpdateMutation)