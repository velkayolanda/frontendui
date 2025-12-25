import { createQueryStrLazy } from "@hrbolek/uoisfrontend-gql-shared";
import { LargeFragment } from "./Fragments";
import { createAsyncGraphQLAction2 } from "../../../../dynamic/src/Core/createAsyncGraphQLAction2";

const DeleteMutationStr = `
mutation DeleteMutation($id: UUID!, $lastchange: DateTime!) {
  result: roleDelete(
    item : {id: $id, lastchange: $lastchange}
  ) {
    ... on RoleGQLModelDeleteError {
      failed
      msg
      input
      Entity {
        ...Large
      }
    }
  }
}
`
const DeleteMutation = createQueryStrLazy(`${DeleteMutationStr}`, LargeFragment)
export const DeleteAsyncAction = createAsyncGraphQLAction2(DeleteMutation)