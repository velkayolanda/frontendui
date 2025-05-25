import { createAsyncGraphQLAction, createQueryStrLazy } from "@hrbolek/uoisfrontend-gql-shared";
import { ExamLargeFragment } from "./ExamFragments";

const ExamReadPageQueryStr = `
query ExamReadPageQuery($skip: Int, $limit: Int, $where: ExamWhereInputFilter) {
  result: examPage(skip: $skip, limit: $limit, where: $where) {
    ...ExamLarge
  }
}
`
const ExamReadPageQuery = createQueryStrLazy(`
query ExamPage($skip: Int, $limit: Int, $orderby: String, $where: ExamInputFilter) {
  result: examPage(skip: $skip, limit: $limit, orderby: $orderby, where: $where) {
    ...ExamLargeFragment
  }
}
`, ExamLargeFragment)
export const ExamReadPageAsyncAction = createAsyncGraphQLAction(ExamReadPageQuery)