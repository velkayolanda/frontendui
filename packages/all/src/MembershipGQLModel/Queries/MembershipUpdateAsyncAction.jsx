import { createAsyncGraphQLAction, createQueryStrLazy } from "@hrbolek/uoisfrontend-gql-shared";
import { MembershipLargeFragment } from "./MembershipFragments";

const MembershipUpdateMutationStr = `
mutation MembershipUpdateMutation($id: UUID!, $lastchange: DateTime!, $name: String, $name_en: String) {
  result: membershipUpdate(
    membership: {id: $id, lastchange: $lastchange, name: $name, nameEn: $name_en}
  ) {
    ... on MembershipGQLModelUpdateError {
      failed
      msg
      input
      Entity {
        ...MembershipLarge
      }      
    }
    ...MembershipLarge
  }
}
`

const MembershipUpdateMutation = createQueryStrLazy(`
mutation MembershipUpdate($id: UUID!, $lastchange: DateTime!, $valid: Boolean, $startdate: DateTime, $enddate: DateTime) {
  result: membershipUpdate(membership: { id: $id, lastchange: $lastchange, valid: $valid, startdate: $startdate, enddate: $enddate }) {
    __typename
    ... on MembershipGQLModel {
      ...MembershipLargeFragment
    }
    ... on MembershipGQLModelUpdateError {
      Entity {
        ...MembershipLargeFragment
      }
      msg
      failed
      input
    }
  }
}
`, MembershipLargeFragment)
export const MembershipUpdateAsyncAction = createAsyncGraphQLAction(MembershipUpdateMutation)