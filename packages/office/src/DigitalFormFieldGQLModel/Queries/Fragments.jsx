import { createQueryStrLazy } from "@hrbolek/uoisfrontend-gql-shared"

const LinkFragmentStr = `
fragment Link on DigitalFormFieldGQLModel  {
  __typename
  id
  lastchange
  created
  createdbyId
  changedbyId
  rbacobjectId

  name
  label
  labelEn
  description
  formSectionId
  typeId
  required
  order
  computed
  formula
  typeId
  backendFormula
  flattenFormula  
}
`

const MediumFragmentStr = `
fragment Medium on DigitalFormFieldGQLModel  {
  ...Link
  rbacobject {
    ...RBRoles
  }
  createdby {
    __typename id fullname
    }
  changedby {
    __typename id fullname
    }   

    formSection {
    __typename
    id
    name
    }

    form {
    __typename
    id
    name
    }
}
`

const LargeFragmentStr = `
fragment Large on DigitalFormFieldGQLModel  {
  ...Medium
  
    formSection {
    __typename
    id
    name
    }

    form {
    __typename
    id
    name
    }
}

fragment LSection on {
    __typename
    id
    name
    fields {
        ...Medium
    }
}

fragment LForm on {
    __typename
    id
    name
    sections {
        ...LSection
        sections {
            ...LSection
            sections {
                ...LSection
                sections {
                    ...LSection
                }
            }
        }
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
  