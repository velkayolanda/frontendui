# Změny

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