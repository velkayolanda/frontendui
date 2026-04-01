import { createQueryStrLazy } from "@hrbolek/uoisfrontend-gql-shared"

const LinkFragmentStr = `
fragment Link on StudentGQLModel  {
  __typename
  id
  lastchange
  created
  createdbyId
  changedbyId
  rbacobjectId

  userId
  programId

  stateId
    semesterNumber



}
`

const MediumFragmentStr = `
fragment Medium on StudentGQLModel  {
  ...Link
  rbacobject {
    ...RBRoles
  }

  user {
    __typename
    id
    fullname
    email
}

  program {
    __typename
    id
    name
    nameEn
  lastchange
  created
    type {
        __typename
        id
        lastchange
        created
        createdbyId
        changedbyId
        rbacobjectId
        createdby { __typename id fullname email }
        changedby { __typename id fullname email }
        rbacobject { ...RBRoles }
        name
        nameEn
        levelId
        levelType { __typename id name }
        titleId
        titleType { __typename id name }
        languageId
        languageType { __typename id name }
        formId
        formType { __typename id name }
    }

    }

    state {
  __typename
    id
    name
}
}
`

const LargeFragmentStr = `
fragment Large on StudentGQLModel  {
  ...Medium
  evaluations(limit: 1000) {
  ...Evaluation
}
}

fragment Evaluation on EvaluationGQLModel {
  __typename
  id
  lastchange
  created
  createdbyId
  changedbyId
  rbacobjectId
  createdby { __typename id }
  changedby { __typename id }
  rbacobject { ...RBRoles }
  path
  order
  points
  passed
  description
  classificationlevelId
  classificationlevel { __typename id name }
  studentId
  student { __typename id }
  examinerId
  examiner { __typename id fullname email}
  semesterId
  semester { __typename id order mandatory subject { __typename id name }}
  examId
  exam { __typename id name }
  eventId
  event { __typename id startdate enddate name }
  parentId
  parent { __typename id }
  parts { __typename id }
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
  