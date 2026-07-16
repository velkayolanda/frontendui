## Hodnocení

- [x] **Příběh / deníček** (na githubu) ve formátu md ReadME.md (markdown) 5 b — součástí příběhu musí být, za chybějící prvek snížení počtu bodů
    - [x] časová posloupnost commitů
    - [x] definice problémů k vyřešení
    - [x] co jste objevili
    - [x] které problémy se nedaří řešit, jak byly vyřešeny
    > ✅ `ReadMe.md` v kořeni repozitáře — kronologicky od 1.4.2026 do 14.7.2026

- [x] **Řádné komentáře v kódu, řádné formátování kódu, popis komponent ve formátu jsdoc, generování dokumentace** až 5 b
    - [x] JSDoc komentáře v komponentách (SemestersManager, EditMode, MediumEditableContent, Fragments, ...)
    - [x] JSDoc module anotace (`@module Components`, `@module Queries`, `@module Pages`, `@module Tools`, ...)
    - [x] Generování dokumentace pomocí JSDoc
    > ✅ Dokumentace vygenerována v `packages/subjects/docs/` (index.html, moduly, jednotlivé komponenty)

- [x] **Readonly stránka** 5 b
    > ✅ `PageReadItem.jsx`, `PageReadItemEx.jsx`, `SubjectSubPage.jsx`, `MediumContent.jsx`

- [x] **Writtable stránka** 5 b
    > ✅ `EditMode.jsx`, `PageUpdateItem.jsx`, `MediumEditableContent.jsx`, `SemestersManager.jsx`
    > - Dva režimy ukládání: auto-save (live) a manuální (confirm) s přepínačem
    > - Správa semestrů (přidávání, mazání, změna pořadí)
    > - Race condition prevence (debounce, isSavingRef, pendingSaveRef)

- [x] **Generování dat** ve vztahu k tématu aplikace 10 b (doplnění / úprava systemdata.*.json)
    > ✅ `GenerateForm.jsx`, `generatorUtils.js`
    > - Generátor předmětů s kombinací přídavných a podstatných jmen (česká gramatika)
    > - Automatické vytvoření náhodného počtu semestrů (1-12) pro každý předmět
    > - Výběr programu z API nebo náhodný výběr

- [x] **Publikace npm** 5 b (včetně prokázání funkčnosti)
    > ✅ Balíček `@velkayolanda/package-subjects` je publikován na npm
