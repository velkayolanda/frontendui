import { createQueryStrLazy } from "@hrbolek/uoisfrontend-gql-shared"

const LinkFragmentStr = `
fragment Link on UserGQLModel {
  __typename
  id
  lastchange
  name
  surname
  fullname
  email
}
`

const MediumFragmentStr = `
fragment Medium on UserGQLModel {
  ...Link
  rbacobject {
    ...RBRoles
  }
}
`

const LargeFragmentStr = `
fragment Large on UserGQLModel {
  ...Medium
  rolesOn {
    ...Role
  }
  memberships {
    __typename
    id
    groupId
    group {
      __typename
      id
      name
      grouptype {
        __typename
        id
        name
      }
        rbacobject {
        ...RBRoles
    }
    }
    valid
    startdate
    enddate
    rbacobject {
        ...RBRoles
    }
  }
  roles {
    ...Role
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
    createdby { id __typename fullname}
    changedby { id __typename fullname}
    rbacobject { id __typename }
    valid
    deputy
    startdate
    enddate
    roletypeId
    userId
    groupId
    roletype { __typename id name }
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
export const LargeFragment = createQueryStrLazy(`${LargeFragmentStr}`, MediumFragment, RoleFragment)
  