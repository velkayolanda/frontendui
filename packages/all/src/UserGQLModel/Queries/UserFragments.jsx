import { createQueryStrLazy } from "@hrbolek/uoisfrontend-gql-shared";

export const UserLinkFragment = createQueryStrLazy(`
fragment UserLinkFragment on UserGQLModel {
  __typename
  id
  fullname
  email
  lastchange
  created
  createdbyId
  changedbyId
  rbacobjectId
  startdate
  enddate
  typeId
}
`);

export const UserMediumFragment = createQueryStrLazy(`
fragment UserMediumFragment on UserGQLModel {
  ...UserLinkFragment
  createdby {
    __typename
    id
    lastchange
    created
    createdbyId
    changedbyId
    rbacobjectId
    startdate
    enddate
    typeId
  }
  changedby {
    __typename
    id
    lastchange
    created
    createdbyId
    changedbyId
    rbacobjectId
    startdate
    enddate
    typeId
  }
  rbacobject {
    __typename
    id
  }
}
`, UserLinkFragment);

export const UserLargeFragment = createQueryStrLazy(`
fragment UserLargeFragment on UserGQLModel {
  ...UserMediumFragment
  studies {
    __typename
    id
    myId
    lastchange
    created
    createdbyId
    changedbyId
    rbacobjectId
    userId
    programId
    stateId
  }
  memberships {
    __typename
    id
    lastchange
    created
    createdbyId
    changedbyId
    rbacobjectId
    userId
    groupId
    group {
      __typename
      id
      name
      grouptype { id name }
    }
    startdate
    enddate
  }
  membership {
    __typename
    id
    lastchange
    created
    createdbyId
    changedbyId
    rbacobjectId
    userId
    groupId
    
    startdate
    enddate
  }
  roles {
    __typename
    id
    lastchange
    created
    createdbyId
    changedbyId
    rbacobjectId
    startdate
    enddate
    roletypeId
    userId
    groupId
  }
  rolesOn {
    __typename
    id
    lastchange
    created
    createdbyId
    changedbyId
    rbacobjectId
    startdate
    enddate
    roletypeId
    userId
    groupId
  }
  memberOf {
    __typename
    id
    lastchange
    created
    createdbyId
    changedbyId
    rbacobjectId
    startdate
    enddate
    grouptypeId
    mastergroupId
  }
}
`, UserMediumFragment);
