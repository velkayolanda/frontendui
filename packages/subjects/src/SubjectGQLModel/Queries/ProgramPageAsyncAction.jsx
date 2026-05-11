import { createQueryStrLazy } from "@hrbolek/uoisfrontend-gql-shared";
import { createAsyncGraphQLAction2 } from "../../../../dynamic/src/Core/createAsyncGraphQLAction2";

/**
 * GraphQL query pro načtení seznamu programů.
 *
 * Používá se primárně v ProgramSelect komponentě pro zobrazení
 * dostupných programů při vytváření/editaci předmětu.
 *
 * Vstupní parametry:
 * - skip: Počet záznamů k přeskočení (pro stránkování)
 * - limit: Maximální počet vrácených záznamů
 * - where: Filtr dle ProgramInputFilter (volitelné)
 *
 * Vrací pole programů s:
 * - __typename: Typ entity
 * - id: UUID programu
 * - name: Název v češtině
 * - nameEn: Název v angličtině
 */
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

// Vytvoření lazy-loaded GraphQL query (bez fragmentu - vrací jen základní pole)
const ProgramPageQuery = createQueryStrLazy(`${ProgramPageQueryStr}`)

/**
 * Async action pro načtení seznamu programů.
 * Používá se s dispatch v Redux store.
 *
 * @example
 * const result = await dispatch(ProgramPageAsyncAction({ skip: 0, limit: 100 }, gqlClient))
 * const programs = result?.data?.programPage
 */
export const ProgramPageAsyncAction = createAsyncGraphQLAction2(ProgramPageQuery)
