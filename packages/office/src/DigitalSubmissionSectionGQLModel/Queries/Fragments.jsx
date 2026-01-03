import { createQueryStrLazy } from "@hrbolek/uoisfrontend-gql-shared"

const LinkFragmentStr = `
fragment Link on DigitalSubmissionSectionGQLModel {
  __typename
  id
  lastchange
  created
  createdbyId
  changedbyId
  rbacobjectId

  path
  index
  stateId
  sectionId
  formSectionId
  submissionId
  

  createdby {
  __typename id fullname
}
  changedby {
  __typename id fullname
}  

}
`

const MediumFragmentStr = `
fragment Medium on DigitalSubmissionSectionGQLModel {
  ...Link
  rbacobject {
    ...RBRoles
  }
    section { ...Link }

    formSection {
    ...DigitalFormSection
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
    createdby { __typename id fullname }
    changedby { __typename id fullname }
    rbacobject { ...RBRoles }
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
    
    fields { 
        __typename id name 
        name
        label
        labelEn
        description
        formSectionId
        required
        order
        computed
        formula
        typeId
        backendFormula
        flattenFormula
    }
    order
    repeatableMin
    repeatableMax
    repeatable
    parent { __typename }
    }
`

const LargeFragmentStr = `
fragment Large on DigitalSubmissionSectionGQLModel {
  ...Medium
  submission {
      ...SubLarge
  }
}

fragment SubLarge on DigitalSubmissionGQLModel  {
    __typename
    id
    lastchange
    created
    createdbyId
    changedbyId
    rbacobjectId
    name
    nameEn
    stateId
    formId
    parentId

    rbacobject {
        ...RBRoles
    }
    form {
        __typename
        id
        name
    }   
        
    sections {
        ...DigitalSubmissionSection
    }

    sections {
        ...DigitalSubmissionSection
        fields {
            ...DigitalSubmissionField
        }
        sections {
            ...DigitalSubmissionSection
            fields {
                ...DigitalSubmissionField
            }
            sections {
                fields {
                    ...DigitalSubmissionField
                }
                ...DigitalSubmissionSection
            }
        }
    }
}

fragment DigitalSubmissionSection on DigitalSubmissionSectionGQLModel {
  __typename
  id
  lastchange
  created
  createdbyId
  changedbyId
  rbacobjectId
  createdby { __typename id fullname }
  changedby { __typename id fullname  }
  rbacobject { ...RBRoles }
  path
  index
  stateId
  sectionId
  formSectionId
  submissionId
  section { __typename id }
  formSection { 
    __typename 
    id 
    name 
    label 
    labelEn 
    description 
    
    order
    repeatableMin
    repeatableMax
    repeatable
}
  submission { __typename id name }
  sections { __typename id }
  fields { __typename id }
}

fragment DigitalSubmissionField on DigitalSubmissionFieldGQLModel {
  __typename
  id
  lastchange
  created
  createdbyId
  changedbyId
  rbacobjectId
  createdby { __typename id fullname }
  changedby { __typename id fullname }
  rbacobject { __typename ...RBRoles }
  path
  value
  fieldId
  submissionId
  sectionId
  field { __typename id name typeId }
  section { __typename id }
  stateId
  state { __typename id name  }
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
  