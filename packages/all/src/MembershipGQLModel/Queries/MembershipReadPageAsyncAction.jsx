import { createAsyncGraphQLAction, createQueryStrLazy } from "@hrbolek/uoisfrontend-gql-shared";
import { MembershipLargeFragment } from "./MembershipFragments";

const MembershipReadPageQueryStr = `
query MembershipReadPageQuery($skip: Int, $limit: Int, $where: MembershipWhereInputFilter) {
  result: membershipPage(skip: $skip, limit: $limit, where: $where) {
    ...MembershipLarge
  }
}
`
const MembershipReadPageQuery = createQueryStrLazy(`
query MembershipPage($skip: Int, $limit: Int, $orderby: String, $where: MembershipInputWhereFilter) {
  result: membershipPage(skip: $skip, limit: $limit, orderby: $orderby, where: $where) {
    ...MembershipLargeFragment
  }
}
`, MembershipLargeFragment)
export const MembershipReadPageAsyncAction = createAsyncGraphQLAction(MembershipReadPageQuery)