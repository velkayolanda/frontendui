import { createQueryStrLazy } from "@hrbolek/uoisfrontend-gql-shared";

export const StudyPlanLinkFragment = createQueryStrLazy(`
fragment StudyPlanLinkFragment on StudyPlanGQLModel {
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
`);

export const StudyPlanMediumFragment = createQueryStrLazy(`
fragment StudyPlanMediumFragment on StudyPlanGQLModel {
  ...StudyPlanLinkFragment
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
  semester {
    __typename
    id
    lastchange
    created
    createdbyId
    changedbyId
    rbacobjectId
    order
    mandatory
    credits
    classificationtypeId
    subjectId
  }
  exam {
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
  event {
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
    startdate
    enddate
    duration_raw
    place
    facilityId
    mastereventId
    typeId
    duration
  }
}
`, StudyPlanLinkFragment);

export const StudyPlanLargeFragment = createQueryStrLazy(`
fragment StudyPlanLargeFragment on StudyPlanGQLModel {
  ...StudyPlanMediumFragment
  lessons {
    __typename
    id
    lastchange
    created
    createdbyId
    changedbyId
    rbacobjectId
    order
    name
    nameEn
    length
    eventId
    event {
      id
      name
    }
    topicId
    lessontypeId
    lessontype {
      id
      name
    }
    linkedWithId
    planId

    instructors {
        id
        fullname
        email
      }
      studyGroups {
        id
        name
      }
      facilities {
        id
        name
      }
  }
}
`, StudyPlanMediumFragment);
