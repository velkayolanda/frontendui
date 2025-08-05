import { createQueryStrLazy } from "@hrbolek/uoisfrontend-gql-shared";
import { FormSectionWithFieldsFragment } from "../../DigitalFormFieldGQLModel/Queries";
import { DigitalFormSectionsFragment } from "../../DigitalFormGQLModel/Queries";

export const RequestTypeLinkFragment = createQueryStrLazy(`
fragment RequestTypeLinkFragment on RequestTypeGQLModel {
  __typename
  id
  lastchange
  created
  createdbyId
  changedbyId
  rbacobjectId
  name
  statemachineId
  stateId
  initialFormId
}
`);

export const RequestTypeMediumFragment = createQueryStrLazy(`
fragment RequestTypeMediumFragment on RequestTypeGQLModel {
  ...RequestTypeLinkFragment
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
  statemachine {
    __typename
    id
    lastchange
    created
    createdbyId
    changedbyId
    rbacobjectId
    name
    nameEn
    typeId
  }
  state {
    __typename
    id
    lastchange
    created
    createdbyId
    changedbyId
    rbacobjectId
    name
    nameEn
    statemachineId
    writerslistId
    readerslistId
    order
    
  }
  initialForm {
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
    stateId
    parentId
    typeId
  }
}
`, RequestTypeLinkFragment);

export const RequestTypeLargeFragment = createQueryStrLazy(`
fragment RequestTypeLargeFragment on RequestTypeGQLModel {
  ...RequestTypeMediumFragment

  initialForm {
      __typename
      id
      name
      ...DigitalFormSectionsFragment
    }  
}
`, 
RequestTypeMediumFragment, 
FormSectionWithFieldsFragment, 
DigitalFormSectionsFragment);
