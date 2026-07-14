/** @module Queries */
/**
 * @fileoverview GraphQL fragmenty pro entitu Subject.
 *
 * Hierarchie fragmentů (menší ⊂ větší):
 * ```
 * LinkFragment ⊂ MediumFragment ⊂ LargeFragment
 * ```
 *
 * ## Použití fragmentů
 *
 * | Fragment | Použití | Obsah |
 * |----------|---------|-------|
 * | LinkFragment | Seznamy, odkazy, tabulky | Skalární pole entity |
 * | MediumFragment | Detailní zobrazení | Link + relace (createdby, changedby, rbacobject, program) |
 * | LargeFragment | Editační stránka | Medium + semesters (limit: 100) + guarantors |
 *
 * ## Pomocné fragmenty
 * - **RoleFragment** - Struktura role (RoleGQLModel)
 * - **RBACFragment** - Práva aktuálního uživatele (currentUserRoles)
 *
 * ## Důležité
 * - LargeFragment obsahuje `semesters(limit: 100)` pro načtení všech semestrů
 * - **NEPOUŽÍVEJ** LargeFragment v delete mutaci - způsobuje transakční konflikty
 *
 * @module Fragments
 */

import { createQueryStrLazy } from "@hrbolek/uoisfrontend-gql-shared"

// ═══════════════════════════════════════════════════════════════════════════
// SUBJECT FRAGMENTY
// ═══════════════════════════════════════════════════════════════════════════

/**
 * LinkFragment - základní skalární pole entity Subject.
 * Použij pro seznamy (Table), odkazy (Link) a rychlé náhledy.
 *
 * Obsahuje:
 * - Identifikátory: id, __typename
 * - Metadata: lastchange, created, createdbyId, changedbyId
 * - Základní atributy: name, nameEn, description, descriptionEn
 * - Relační ID: programId, rbacobjectId, guarantorsGroupId
 */
const LinkFragmentStr = `
fragment Link on SubjectGQLModel {
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
  programId
  guarantorsGroupId
}
`

/**
 * MediumFragment - rozšířený fragment pro detailní zobrazení.
 * Obsahuje LinkFragment + relace pro zobrazení souvisejících entit.
 *
 * Přidává k Link:
 * - createdby: Uživatel, který entitu vytvořil (id, fullname)
 * - changedby: Uživatel, který entitu naposledy změnil (id, fullname)
 * - rbacobject: RBAC práva včetně rolí aktuálního uživatele
 * - program: Přiřazený studijní program (id, name)
 */
const MediumFragmentStr = `
fragment Medium on SubjectGQLModel {
  ...Link
  createdby {
    __typename id fullname
  }
  changedby {
    __typename id fullname
  }
  rbacobject {
    ...RBRoles
  }
  program {
    __typename id name
  }
}
`

/**
 * LargeFragment - kompletní fragment pro editační stránku.
 * Obsahuje MediumFragment + semestry a garanty.
 *
 * Přidává k Medium:
 * - semesters: Pole semestrů předmětu (id, order, lastchange)
 *   - Používá limit: 100 pro načtení všech semestrů (backend má default 10)
 * - guarantors: Pole garantů předmětu (id)
 *
 * **VAROVÁNÍ**: Nepoužívej v delete mutaci!
 * Načítání semestrů uvnitř delete transakce způsobuje konflikty v backendu.
 */
const LargeFragmentStr = `
fragment Large on SubjectGQLModel {
  ...Medium
  semesters(limit: 100) {
    # limit: 100 - backend má default limit 10, explicitně nastavujeme vyšší
    # pro předměty s více semestry (max 12 = 6 let studia)
    __typename id
    id
    order       # Pořadí semestru (1-12)
    lastchange  # Potřebné pro update/delete operace (optimistic locking)
  }
  guarantors {
    __typename id
  }
}
`

// ═══════════════════════════════════════════════════════════════════════════
// POMOCNÉ FRAGMENTY
// ═══════════════════════════════════════════════════════════════════════════

/**
 * RoleFragment - struktura role (RoleGQLModel).
 * Používá se pro detailní zobrazení rolí uživatelů.
 *
 * Obsahuje:
 * - Identifikátory a metadata
 * - Časové omezení: valid, startdate, enddate
 * - Relace: roletype, user, group
 */
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

/**
 * RBACFragment (RBRoles) - RBAC práva aktuálního uživatele.
 * Používá se pro kontrolu oprávnění v UI.
 *
 * Obsahuje:
 * - currentUserRoles: Pole rolí přihlášeného uživatele
 *   - roletype: Typ role (id, name)
 *   - group: Skupina, ke které role patří (id, name, grouptype)
 *   - valid, startdate, enddate: Platnost role
 */
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

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTY
// ═══════════════════════════════════════════════════════════════════════════

// createQueryStrLazy vytváří lazy-loaded fragment string
// Druhý a další parametry jsou závislé fragmenty, které se automaticky připojí

/** Fragment pro role - RoleGQLModel */
export const RoleFragment = createQueryStrLazy(`${RoleFragmentStr}`)

/** Fragment pro RBAC práva - RBACObjectGQLModel.currentUserRoles */
export const RBACFragment = createQueryStrLazy(`${RBACFragmentStr}`)

/** Základní fragment - skalární pole Subject */
export const LinkFragment = createQueryStrLazy(`${LinkFragmentStr}`)

/**
 * Střední fragment - Link + relace.
 * Závislosti: LinkFragment, RBACFragment (automaticky se připojí do query)
 */
export const MediumFragment = createQueryStrLazy(`${MediumFragmentStr}`, LinkFragment, RBACFragment)

/**
 * Velký fragment - Medium + semesters + guarantors.
 * Závislosti: MediumFragment (a transitively LinkFragment, RBACFragment)
 */
export const LargeFragment = createQueryStrLazy(`${LargeFragmentStr}`, MediumFragment)
