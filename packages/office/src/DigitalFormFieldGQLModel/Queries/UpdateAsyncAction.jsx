import { createQueryStrLazy } from "@hrbolek/uoisfrontend-gql-shared";
import { LargeFragment } from "./Fragments";
import { createAsyncGraphQLAction2 } from "../../../../dynamic/src/Core/createAsyncGraphQLAction2";
import { reduceToFirstEntity, updateItemsFromGraphQLResult } from "../../../../dynamic/src/Store";

const UpdateMutationStr = `
mutation digitalFormFieldUpdate($id: UUID!, $lastchange: DateTime!, $name: String, $label: String, $labelEn: String, $description: String, $required: Boolean, $order: Int, $computed: Int) {
  digitalFormFieldUpdate(formField: {id: $id, lastchange: $lastchange, name: $name, label: $label, labelEn: $labelEn, description: $description, required: $required, order: $order, computed: $computed}) {
    ... on DigitalFormFieldGQLModel { ...Large }
    ... on DigitalFormFieldGQLModelUpdateError { ...Error }
  }
}

fragment Error on RoleTypeGQLModelUpdateError {
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