import { createQueryStrLazy } from "@hrbolek/uoisfrontend-gql-shared";
import { createAsyncGraphQLAction2 } from "../../../../dynamic/src/Core/createAsyncGraphQLAction2";

const ProgramPageQueryStr = `
query programPage($skip: Int, $limit: Int, $where: ProgramInputFilter) {
  programPage(skip: $skip, limit: $limit, where: $where) {
    __typename
    id
    name
    nameEn
  }
}
`

const ProgramPageQuery = createQueryStrLazy(`${ProgramPageQueryStr}`)
export const ProgramPageAsyncAction = createAsyncGraphQLAction2(ProgramPageQuery)
