import { createAsyncGraphQLAction, createQueryStrLazy } from "@hrbolek/uoisfrontend-gql-shared";
import { MembershipLargeFragment } from "./MembershipFragments";


const MembershipInsertMutationStr = `
mutation MembershipInsertMutation($id: UUID, $name: String, $name_en: String) {
  result: membershipInsert(
    membership: {id: $id, name: $name, nameEn: $name_en}
  ) {
    ... on InsertError {
      failed
      msg
      input
    }
    ...MembershipLarge
  }
}
`

const MembershipInsertMutation = createQueryStrLazy(`
mutation MembershipInsert($userId: UUID!, $groupId: UUID!, $id: UUID, $startdate: DateTime, $enddate: DateTime) {
  result: membershipInsert(membership: { userId: $userId, groupId: $groupId, id: $id, startdate: $startdate, enddate: $enddate }) {
    __typename
    ... on MembershipGQLModel {
      ...MembershipLargeFragment
    }
    ... on InsertError {
      msg
      failed
      input
    }
  }
}
`, MembershipLargeFragment)
export const MembershipInsertAsyncAction = createAsyncGraphQLAction(MembershipInsertMutation)