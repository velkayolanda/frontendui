import { createQueryStrLazy } from "@hrbolek/uoisfrontend-gql-shared"

const LinkFragmentStr = `
fragment Link on DigitalSubmissionFieldGQLModel {
  __typename
  id
  lastchange
  created
  createdbyId
  changedbyId
  rbacobjectId
    
  path
  value
  fieldId
  submissionId
  sectionId
  stateId
  
  createdby {
    id __typename fullname
    }
  changedby {
    id __typename fullname
    }    
}
`

const MediumFragmentStr = `
fragment Medium on DigitalSubmissionFieldGQLModel {
  ...Link
  rbacobject {
    ...RBRoles
  }



    field {
    ...DigitalFormField
    }
    section {
    ...DigitalSubmissionSection
    }
    
    state {
    ...State
    }
}


fragment DigitalFormField on DigitalFormFieldGQLModel {
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
    formId
    required
    order
    computed
    formula
    typeId
    backendFormula
    flattenFormula
    }

fragment LDigitalSubmissionSection on DigitalSubmissionSectionGQLModel {
    id
    lastchange
    created
    createdbyId
    changedbyId
    rbacobjectId
    createdby { id __typename fullname }
    changedby { id __typename fullname }
    path
    index
    stateId
    sectionId
    formSectionId
    submissionId
    submission { __typename id name }
    section { __typename id }
    formSection { __typename id label name}
}

fragment DigitalSubmissionSection on DigitalSubmissionSectionGQLModel {
    __typename
    rbacobject { ...RBRoles }
    submission { ...DigitalSubmission }
    sections { __typename }
    fields { __typename id value }
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
  parent { __typename }
  sections { 
    ...LDigitalSubmissionSection 
    fields { ...Link }
    sections { 
        ...LDigitalSubmissionSection 
        fields { ...Link }
        sections { 
            ...LDigitalSubmissionSection 
            fields { ...Link }
            sections { 
                ...LDigitalSubmissionSection 
                fields { ...Link }
                sections { 
                    ...LDigitalSubmissionSection 
                    fields { ...Link }
                }
            }
        }
    }
  }
  fields { ...Link }
  submittedSectionsAll { 
    ...LDigitalSubmissionSection 
    fields { ...Link }
  
    }

  value
  }

fragment State on StateGQLModel {
    __typename
    id
    }
`

const LargeFragmentStr = `
fragment Large on DigitalSubmissionFieldGQLModel {
  ...Medium
  
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
  