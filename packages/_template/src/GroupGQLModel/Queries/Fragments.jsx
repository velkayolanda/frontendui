import { createQueryStrLazy } from "@hrbolek/uoisfrontend-gql-shared"

const LinkFragmentStr = `
fragment Link on GroupGQLModel {
  __typename
  id
  lastchange
name
nameEn
email
abbreviation
startdate
enddate
grouptypeId
  grouptype {
    __typename
    id
    name
    }

mastergroupId
mastergroup { __typename id name }
}

`

const MediumFragmentStr = `
fragment Medium on GroupGQLModel {
  ...Link
  rbacobject {
    ...RBRoles
  }
    changedby {
    __typename
    id
    fullname
    }    
    mastergroup {
        ...Link
    }
    mastergroups {
        ...Link
    }
}
`

const LargeFragmentStr = `
fragment Large on GroupGQLModel {
  ...Medium
  subgroups(where: {
      grouptype: {
        id: {
          _in: [
            "cd49e152-610c-11ed-9f29-001a7dda7110", 
            "cd49e153-610c-11ed-bf19-001a7dda7110",
            "cd49e154-610c-11ed-bdbf-001a7dda7110",
            "cd49e155-610c-11ed-bdbf-001a7dda7110",
            "cd49e155-610c-11ed-844e-001a7dda7110",
            "cd49e156-610c-11ed-87ef-001a7dda7110"
          ]
        }
      }
    }) {
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
  rolesOn {
    ...Role
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
    createdby { id __typename fullname }
    changedby { id __typename fullname }
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
  