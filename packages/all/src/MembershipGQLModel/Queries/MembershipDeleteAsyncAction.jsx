import { createAsyncGraphQLAction, createQueryStrLazy } from "@hrbolek/uoisfrontend-gql-shared";
import { MembershipLargeFragment } from "./MembershipFragments";

const MembershipDeleteMutationStr = `
mutation MembershipDeleteMutation($id: UUID!, $lastchange: DateTime!) {
  result: membershipDelete(
    membership: {id: $id, lastchange: $lastchange}
  ) {
    ... on MembershipGQLModelDeleteError {
      failed
      msg
      input
      Entity {
        ...MembershipLarge
      }
    }
  }
}
`
const MembershipDeleteMutation = createQueryStrLazy(`
mutation MembershipDelete($id: UUID!, $lastchange: DateTime!) {
  result: membershipDelete(membership: { id: $id, lastchange: $lastchange }) {
    ...MembershipLargeFragment
  }
}
`, MembershipLargeFragment)
export const MembershipDeleteAsyncAction = createAsyncGraphQLAction(MembershipDeleteMutation)