import { createQueryStrLazy } from "@hrbolek/uoisfrontend-gql-shared"

/**
 * GraphQL fragmenty pro entitu Subject — hierarchicky uspořádané:
 *   Link ⊂ Medium ⊂ Large
 *
 * LinkFragment  — skalární pole entity; použij pro seznamy (Table) a linky
 * MediumFragment — Link + relace createdby/changedby/rbacobject/program; použij pro detailní zobrazení
 * LargeFragment  — Medium + semesters + guarantors; použij pro edit stránku
 *
 * POZOR: LargeFragment (se semestry) nepoužívej v delete mutaci —
 * načítání semestrů uvnitř delete transakce způsobuje transakční konflikty v backendu.
 */

const LinkFragmentStr = `
fragment Link on SubjectGQLModel {
  __typename
  id
  lastchange
  created
  createdbyId
  changedbyId
  rbacobjectId
  name
  nameEn
  description
  descriptionEn
  programId
  guarantorsGroupId
}
`

const MediumFragmentStr = `
fragment Medium on SubjectGQLModel {
  ...Link
  createdby {
    __typename id fullname
  }
  changedby {
    __typename id fullname
  }
  rbacobject {
    ...RBRoles
  }
  program {
    __typename id name
  }
}
`

const LargeFragmentStr = `
fragment Large on SubjectGQLModel {
  ...Medium
  semesters(limit: 100) {
    __typename id
    id
    order
    lastchange
  }
  guarantors {
    __typename id
  }
}
`

const RoleFragmentStr = `
fragment Role on RoleGQLModel {
    __typename
    id
    lastchange
    created
    createdbyId
    changedbyId
    rbacobjectId
    createdby { id __typename }
    changedby { id __typename }
    rbacobject { id __typename }
    valid
    deputy
    startdate
    enddate
    roletypeId
    userId
    groupId
    roletype { __typename id }
    user { __typename id fullname }
    group { __typename id name }
  }
`

const RBACFragmentStr = `
fragment RBRoles on RBACObjectGQLModel {
  __typename
  id
  currentUserRoles {
    __typename
    id
    lastchange
    valid
    startdate
    enddate
    roletype {
      __typename
      id
      name
    }
    group {
      __typename
      id
      name
      grouptype {
        __typename
        id
        name
      }
    }
  }
}`

export const RoleFragment = createQueryStrLazy(`${RoleFragmentStr}`)
export const RBACFragment = createQueryStrLazy(`${RBACFragmentStr}`)

export const LinkFragment = createQueryStrLazy(`${LinkFragmentStr}`)
export const MediumFragment = createQueryStrLazy(`${MediumFragmentStr}`, LinkFragment, RBACFragment)
export const LargeFragment = createQueryStrLazy(`${LargeFragmentStr}`, MediumFragment)
  