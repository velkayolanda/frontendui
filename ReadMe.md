# Změny

## 11.5.2026

- Přidání správy semestrů předmětu (SemestersManager) - nová funkcionalita pro:
  - Přidávání existujících semestrů k předmětu z dropdownu
  - Odebírání semestrů z předmětu (bez smazání semestru)
  - Změna pořadí semestrů pomocí tlačítek nahoru/dolů
  - Nové semestry se přidávají na konec (nejvyšší order + 1)
- Nové soubory v `packages/subjects/src/SubjectGQLModel/`:
  - `Components/SemestersManager.jsx` - UI komponenta pro správu semestrů
  - `Queries/SemesterUpdateAsyncAction.jsx` - GraphQL mutace pro aktualizaci semestru
  - `Queries/SemesterInsertAsyncAction.jsx` - GraphQL mutace pro vytvoření semestru
  - `Queries/SemesterDeleteAsyncAction.jsx` - GraphQL mutace pro smazání semestru
- Upravené soubory:
  - `Components/SubjectEditForm.jsx` - přidána logika pro ukládání změn semestrů
  - `Components/MediumEditableContent.jsx` - integrace SemestersManager komponenty
  - `Components/index.js` - export SemestersManager
  - `Queries/index.js` - exporty nových GraphQL akcí
- Architektura: draft/commit pattern - změny se neukládají okamžitě, ale až po kliknutí na "Uložit"

## 7.5.2026

- Přidání CardCapsule pro sekci Semestry v SubjectSubPage (`SubjectSubPage.jsx`)

## 6.5.2026

- Refaktoring SubjectEditForm pro použití useEditAction s explicitním uložením (`SubjectEditForm.jsx`, `ConfirmEdit.jsx`, `LiveEdit.jsx`, `MediumEditableContent.jsx`)
- Přidání komponenty ProgramSelect pro výběr programu (`ProgramSelect.jsx`)
- Přidání ProgramPageAsyncAction dotazu (`ProgramPageAsyncAction.jsx`)
- Úpravy v Delete a Insert async akcích (`DeleteAsyncAction.jsx`, `InsertAsyncAction.jsx`)
- Úpravy InteractiveMutations (`InteractiveMutations.jsx`)

## 5.5.2026

- Rozšíření SubjectEditForm o podporu polí pro popis (`SubjectEditForm.jsx`)
- Aktualizace InteractiveMutations pro reload při aktualizaci dialogu (`InteractiveMutations.jsx`)

## 28.4.2026

- Aktualizace submodulu _uois
- Úprava editačních polí (`MediumEditableContent.jsx`, `UpdateAsyncAction.jsx`)

## 20.4.2026

- Aktualizace stránky start (`MediumEditableContent.jsx`, `Update.jsx`, `UpdateAsyncAction.jsx`)

## 14.4.2026

- Aktualizace verze do budoucnosti (`package.json`)
- Změna package pro publish (`package.json`, `package-lock.json`)
- Merge s vzdálenou větví monorepo

## 13.4.2026

- Skrytí prázdného atributu name u medium content (`MediumContent.jsx`)
- Změna GraphQL fragmentu a úprava sloupců v SubjectSubPage (`SubjectSubPage.jsx`, `Fragments.jsx`)

## 10.4.2026

- Přidání SubjectSubPage komponenty
- Testování RBACobject a editace atributů (`MediumContent.jsx`, `PageReadItem.jsx`, `SubjectSubPage.jsx`)
- Změna šablony z hodiny na data, která používáme v projektu (`MediumContent.jsx`, `Scalars/index.js`, `Vectors/index.js`)
- Aktualizace README

## 7.4.2026

- Začátek práce na atributech v MediumContent komponenty
- Přidání submodulu `_uois`
- Merge s vzdálenou větví monorepo

## 1.4.2026

- Nastavení projektu subjects - vytvoření kompletní struktury:
  - Komponenty: CardCapsule, Children, ConfirmEdit, Filter, LargeCard, Link, LiveEdit, MediumCard, MediumContent, MediumEditableContent, Table
  - Mutace: Create, Delete, Update, InteractiveMutations
  - Stránky: PageBase, PageCreateItem, PageDeleteItem, PageNavbar, PageReadItem, PageReadItemEx, PageUpdateItem, PageVector, RouterSegment
  - Queries: DeleteAsyncAction, Fragments, InsertAsyncAction, ReadAsyncAction, ReadPageAsyncAction, SearchAsyncAction, UpdateAsyncAction
  - Scalars a Vectors atributy
- Vytvoření nové aplikace app_subjects s konfigurací (App, AppNavbar, AppRouter, Vite config)
- Merge s upstream

# URI Fragement:
```angular2html
/subject
```

# Jak spustit projekt app
```cmd
npm run dev -w @velkayolanda/app_subjects    
```

# Jak sestavit projekt app
```cmd
npm run build -w @velkayolanda/app_subjects
```