import { createQueryStrLazy } from "@hrbolek/uoisfrontend-gql-shared";

export const DigitalFormFieldLinkFragment = createQueryStrLazy(`
fragment DigitalFormFieldLinkFragment on DigitalFormFieldGQLModel {
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
`);

export const DigitalFormFieldMediumFragment = createQueryStrLazy(`
fragment DigitalFormFieldMediumFragment on DigitalFormFieldGQLModel {
  ...DigitalFormFieldLinkFragment
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
  formSection {
    __typename
    id
    lastchange
    created
    createdbyId
    changedbyId
    rbacobjectId
    name
    path
    label
    labelEn
    description
    sectionId
    formId
    order
    repatableMin
    repatableMax
    repeatable
  }
  form {
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
`, DigitalFormFieldLinkFragment);

export const FormSectionWithFieldsFragment = createQueryStrLazy(
`fragment FormSectionWithFieldsFragment on DigitalFormSectionGQLModel {
  __typename
  id
  name
  lastchange
  formId
  sectionId
  fields {
    __typename
    id
    lastchange
    name
    description
    label
    labelEn
    order
    required
    formula
    backendFormula
    lastchange
    typeId
  }
}`)


export const DigitalFormFieldLargeFragment = createQueryStrLazy(`
fragment DigitalFormFieldLargeFragment on DigitalFormFieldGQLModel {
  ...DigitalFormFieldMediumFragment
}
`, DigitalFormFieldMediumFragment);
