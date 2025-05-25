import { createQueryStrLazy } from "@hrbolek/uoisfrontend-gql-shared";

export const MembershipLinkFragment = createQueryStrLazy(`
fragment MembershipLinkFragment on MembershipGQLModel {
  __typename
  id
  lastchange
  created
  createdbyId
  changedbyId
  rbacobjectId
  userId
  groupId
  valid
  startdate
  enddate
}
`);

export const MembershipMediumFragment = createQueryStrLazy(`
fragment MembershipMediumFragment on MembershipGQLModel {
  ...MembershipLinkFragment
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
  user {
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
  group {
    __typename
    id
    lastchange
    created
    createdbyId
    changedbyId
    rbacobjectId
    name
    nameEn
    email
    abbreviation
    startdate
    enddate
    grouptypeId
    mastergroupId
    path
    valid
  }
}
`, MembershipLinkFragment);

export const MembershipLargeFragment = createQueryStrLazy(`
fragment MembershipLargeFragment on MembershipGQLModel {
  ...MembershipMediumFragment
}
`, MembershipMediumFragment);
