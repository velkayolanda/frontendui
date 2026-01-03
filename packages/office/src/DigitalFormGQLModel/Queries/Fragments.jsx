import { createQueryStrLazy } from "@hrbolek/uoisfrontend-gql-shared"

const LinkFragmentStr = `
fragment Link on DigitalFormGQLModel {
__typename
id
lastchange
created
createdbyId
changedbyId
rbacobjectId
createdby {
  __typename
  id
  fullname
}
changedby {
  __typename
  id
  fullname
}

name
nameEn
description
stateId
parentId
typeId
type {
  ...DocumentType
}  
}

fragment DocumentType on DocumentTypeGQLModel {
  __typename
  id
  lastchange
  created
  createdbyId
  changedbyId
  rbacobjectId
  createdby { __typename id
  fullname }
  changedby { __typename id
  fullname }
  rbacobject { __typename id
  }
  name
  nameEn
  description
  parentId
  }
`

const MediumFragmentStr = `
fragment Medium on DigitalFormGQLModel {
  ...Link
  rbacobject {
    ...RBRoles
  }
}
`

const LargeFragmentStr = `
fragment Large on DigitalFormGQLModel {
  ...Medium
sections {
  ...DigitalFormSection
  sections {
    ...DigitalFormSection
    sections {
        ...DigitalFormSection
        sections {
            ...DigitalFormSection
            sections {
                ...DigitalFormSection
            }
        }
    }
    }
}
submissions {
  ...DigitalSubmission
}
}

fragment DigitalFormSection on DigitalFormSectionGQLModel {
  __typename
  id
  lastchange
  created
  createdbyId
  changedbyId
  rbacobjectId
  createdby { __typename }
  changedby { __typename }
  rbacobject { __typename }
  name
  path
  label
  labelEn
  description
  sectionId
  formId
  form { __typename id name }
  section { __typename id name }
  sections { __typename id name }
  fields { __typename ...DigitalFormField }
  order
  repeatableMin
  repeatableMax
  repeatable
  parent { __typename }
  }

fragment DigitalSubmission on DigitalSubmissionGQLModel {
  __typename
  id
  lastchange
  created
  createdbyId
  changedbyId
  rbacobjectId
  createdby { __typename }
  changedby { __typename }
  rbacobject { __typename }
  name
  nameEn
  stateId
  formId
  parentId
  form { __typename id name }
#   parent { __typename }
#   sections { __typename }
#  fields { __typename }
#  submittedSectionsAll { __typename }
  value
  }

fragment DigitalFormField on DigitalFormFieldGQLModel {
    __typename
    id
    lastchange
    created
    createdbyId
    changedbyId
    rbacobjectId
    createdby {
        __typename id fullname
    }
    changedby {
        __typename id fullname
    }
    rbacobject {
        ...RBRoles
    }
    name
    label
    labelEn
    description
    formSectionId
    formSection {
        __typename id name
    }
    formId
    form {
        __typename id name
    }
    required
    order
    computed
    formula
    typeId
    backendFormula
    flattenFormula
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
  