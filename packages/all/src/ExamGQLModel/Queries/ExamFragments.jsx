import { createQueryStrLazy } from "@hrbolek/uoisfrontend-gql-shared";

export const ExamLinkFragment = createQueryStrLazy(`
fragment ExamLinkFragment on ExamGQLModel {
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
  minScore
  maxScore
  typeId
  parentId
  planId
}
`);

export const ExamMediumFragment = createQueryStrLazy(`
fragment ExamMediumFragment on ExamGQLModel {
  ...ExamLinkFragment
  createdby {
    __typename
    id
    lastchange
    created
    createdbyId
    changedbyId
    rbacobjectId
    name
    givenname
    middlename
    email
    firstname
    surname
    valid
    startdate
    enddate
    typeId
    isThisMe
    gdpr
    fullname
  }
  changedby {
    __typename
    id
    lastchange
    created
    createdbyId
    changedbyId
    rbacobjectId
    name
    givenname
    middlename
    email
    firstname
    surname
    valid
    startdate
    enddate
    typeId
    isThisMe
    gdpr
    fullname
  }
  rbacobject {
    __typename
    id
  }
  parent {
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
    minScore
    maxScore
    typeId
    parentId
    planId
  }
  plan {
    __typename
    id
    lastchange
    created
    createdbyId
    changedbyId
    rbacobjectId
    semesterId
    classificationplanId
    examId
    eventId
  }
}
`, ExamLinkFragment);

export const ExamLargeFragment = createQueryStrLazy(`
fragment ExamLargeFragment on ExamGQLModel {
  ...ExamMediumFragment
  parts {
      ...ExamMediumFragment
  }
}
`, ExamMediumFragment);
