# Deníček projektu — Subject modul

Tento dokument popisuje chronologický vývoj modulu `packages/subjects` — správy předmětů (Subject) a jejich semestrů v rámci školního informačního systému.

---

## 1. 4. 2026 — Nastavení projektu a základní struktura

**Co bylo potřeba udělat:**
Vytvořit celý modul od nuly na základě šablony z hodiny. Cílem bylo mít funkční základ pro CRUD operace nad entitou Subject (předmět).

**Co jsme objevili:**
Šablona předpokládala jinou datovou strukturu než tu, kterou používáme v projektu. Bylo nutné přizpůsobit komponenty na naše data místo dat z příkladu z hodiny.

**Výsledek — vytvořené soubory:**
- Komponenty: `CardCapsule`, `Children`, `ConfirmEdit`, `Filter`, `LargeCard`, `Link`, `LiveEdit`, `MediumCard`, `MediumContent`, `MediumEditableContent`, `Table`
- Mutace: `Create`, `Delete`, `Update`, `InteractiveMutations`
- Stránky: `PageBase`, `PageCreateItem`, `PageDeleteItem`, `PageNavbar`, `PageReadItem`, `PageReadItemEx`, `PageUpdateItem`, `PageVector`, `RouterSegment`
- Queries: `DeleteAsyncAction`, `Fragments`, `InsertAsyncAction`, `ReadAsyncAction`, `ReadPageAsyncAction`, `SearchAsyncAction`, `UpdateAsyncAction`
- Scalars a Vectors atributy
- Nová aplikace `app_subjects` s konfigurací (App, AppNavbar, AppRouter, Vite config)
- Merge s upstream

---

## 7. 4. 2026 — Začátek práce na atributech

**Co se dělalo:**
- Začátek práce na atributech v `MediumContent.jsx`
- Přidání submodulu `_uois`
- Merge s vzdálenou větví monorepo

**Problém:**
Submodul `_uois` bylo potřeba správně navázat na konkrétní commit, aby byl konzistentní s backendem.

---

## 10. 4. 2026 — První readonly zobrazení, přizpůsobení šablony

**Co se dělalo:**
- Přidání `SubjectSubPage` komponenty pro readonly detail předmětu
- Testování `rbacobject` a editace atributů (`MediumContent.jsx`, `PageReadItem.jsx`, `SubjectSubPage.jsx`)
- Změna šablony z hodiny na data, která používáme v projektu (`MediumContent.jsx`, `Scalars/index.js`, `Vectors/index.js`)
- Aktualizace README

**Co jsme objevili:**
Testování `rbacobject` ukázalo, že práva jsou navázána na každý Subject zvlášť — každý předmět má vlastní `rbacobject_id`. Grafické zobrazení rolí (`currentUserRoles`) bylo potřeba přidat do detailu ručně.

---

## 13. 4. 2026 — Oprava zobrazení prázdných polí, úprava fragmentu

**Problém:**
`MediumContent.jsx` zobrazoval prázdná místa, protože atribut `name` přicházel jako prázdný string `""` místo `null`. Podmínka `if (attribute_value)` toto neodchytila.

**Řešení:**
- Skrytí prázdného atributu name v `MediumContent.jsx` — přidána podmínka `{item?.name && ...}`
- Změna GraphQL fragmentu a úprava sloupců v `SubjectSubPage.jsx` (`Fragments.jsx`) pro správná pole

---

## 14. 4. 2026 — Příprava pro publish, synchronizace s monorepo

**Co se dělalo:**
- Aktualizace verze do budoucnosti (`package.json`)
- Změna package pro publish (`package.json`, `package-lock.json`) — nastaveno `"private": false`, `"publishConfig": { "access": "public" }`
- Merge s vzdálenou větví monorepo

**Problém:**
Merge konflikty při synchronizaci s `origin/monorepo` — části šablony, které jsme upravili, kolidovaly s upstream změnami. Konflikty vyřešeny ručně.

---

## 20. 4. 2026 — Editovatelná stránka

**Co se dělalo:**
- Aktualizace stránky start (`MediumEditableContent.jsx`, `Update.jsx`, `UpdateAsyncAction.jsx`)

**Co jsme objevili:**
Původní update logika odesílala na server každou změnu pole okamžitě — bez možnosti zrušit editaci. Bylo potřeba přejít na explicitní potvrzení.

---

## 28. 4. 2026 — Draft stav, ConfirmEdit a LiveEdit

**Co se dělalo:**
- Aktualizace submodulu `_uois`
- Refaktoring `LiveEdit.jsx` a `ConfirmEdit.jsx` pro použití draft stavu — změny se zobrazují okamžitě v UI, ale na server se odešlou až po potvrzení
- Úprava editačních polí (`MediumEditableContent.jsx`, `UpdateAsyncAction.jsx`)

**Co jsme objevili:**
Hook `useEditAction` z `packages/dynamic` podporuje dva režimy — `live` (auto-save při každé změně) a `confirm` (explicitní tlačítko Uložit). Draft stav umožňuje uživateli bezpečně editovat bez okamžitého dopadu na server.

---

## 5. 5. 2026 — Popis předmětu

**Co se dělalo:**
- Rozšíření `SubjectEditForm.jsx` o podporu polí pro popis (`description`, `descriptionEn`)
- Aktualizace `InteractiveMutations.jsx` pro reload dialogu při aktualizaci

---

## 6. 5. 2026 — ProgramSelect, refaktoring editačního formuláře

**Problém:**
Předmět patří do studijního programu, ale v editaci nebylo možné program vybrat — pole `programId` bylo pouze textové.

**Co jsme objevili:**
V GraphQL existuje dotaz pro načtení programů stránkovaně. Bylo potřeba vytvořit vlastní select komponentu, která tyto programy načte a zobrazí v dropdownu.

**Řešení:**
- Refaktoring `SubjectEditForm.jsx` pro použití `useEditAction` s explicitním uložením (`SubjectEditForm.jsx`, `ConfirmEdit.jsx`, `LiveEdit.jsx`, `MediumEditableContent.jsx`)
- Přidání komponenty `ProgramSelect.jsx` pro výběr programu z dropdownu
- Přidání `ProgramPageAsyncAction.jsx` — GraphQL dotaz pro načtení programů
- Úpravy v `DeleteAsyncAction.jsx`, `InsertAsyncAction.jsx`
- Úpravy `InteractiveMutations.jsx`

---

## 7. 5. 2026 — Sekce semestrů v detailu, error handling

**Co se dělalo:**
- Přidání `CardCapsule` pro sekci Semestry v `SubjectSubPage.jsx` — vizuální oddělení sekce semestrů do karty s nadpisem
- Refaktoring `InsertAsyncAction.jsx` pro lepší error handling — detailní chybová struktura pro propagaci GraphQL chyb do UI

---

## 11. 5. 2026 — Správa semestrů (SemestersManager)

**Problém (definice):**
Subject může mít více semestrů (1. ročník zimní, 1. ročník letní, 2. ročník zimní, …). Bylo potřeba umožnit přidávání, odebírání a přeřazování semestrů v editaci.

**Co jsme objevili:**
- Původní návrh počítal s výběrem existujícího semestru z dropdownu. Jenže semestry jsou specifické pro každý předmět — dává smysl je vždy vytvářet nové s generovaným UUID, ne vybírat sdílené.
- Změny semestrů nesmí jít na server okamžitě — uživatel může provést víc změn najednou a pak vše uložit jedním kliknutím (draft/commit pattern).
- Synchronizace lokálního stavu s props vyžaduje `JSON.stringify` pro deep compare, jinak `useEffect` nereaguje na změny uvnitř pole objektů.

**Řešení — nové soubory v `packages/subjects/src/SubjectGQLModel/`:**
- `Components/SemestersManager.jsx` — UI komponenta pro správu semestrů:
  - Přidávání existujících semestrů k předmětu (původně z dropdownu)
  - Odebírání semestrů z předmětu (bez smazání semestru ze serveru)
  - Změna pořadí semestrů pomocí tlačítek nahoru/dolů
  - Nové semestry mají flag `_action: 'create'` pro odlišení od existujících
  - Nové semestry se přidávají na konec (nejvyšší `order + 1`)
- `Queries/SemesterUpdateAsyncAction.jsx` — GraphQL mutace pro aktualizaci semestru
- `Queries/SemesterInsertAsyncAction.jsx` — GraphQL mutace pro vytvoření semestru
- `Queries/SemesterDeleteAsyncAction.jsx` — GraphQL mutace pro smazání semestru

**Upravené soubory:**
- `Components/SubjectEditForm.jsx` — přidána logika pro ukládání změn semestrů
- `Components/MediumEditableContent.jsx` — integrace SemestersManager komponenty
- `Components/index.js` — export SemestersManager
- `Queries/index.js` — exporty nových GraphQL akcí

---

## 20.–21. 5. 2026 — EditMode s přepínačem auto-save

**Problém:**
`SubjectEditForm` neumožňoval přepínání mezi okamžitým (live) a manuálním (confirm) ukládáním. Správa semestrů v live režimu navíc způsobovala příliš časté API volání při každé malé změně (každý stisk tlačítka pořadí = volání na server).

**Co jsme objevili:**
- `useEditAction` podporuje `mode: "live"` i `mode: "confirm"`, ale chyběl přepínač v UI.
- Semestry potřebují vlastní stav oddělený od ostatních polí, protože jsou polem objektů a `useEditAction` je navržen pro skalární hodnoty.
- `lastchange` timestamp vrácený serverem po každé mutaci musí být uložen a použit pro další mutace — jinak server odmítne update s chybou "zastaralý záznam".
- Debounce 600ms na auto-save semestrů zabraňuje zbytečným API voláním při rychlých změnách.

**Výsledek — nová komponenta `EditMode.jsx`:**
- Přepínač (toggle switch) mezi automatickým (live) a manuálním (confirm) ukládáním
- Podpora správy semestrů s debounce auto-save (600ms)
- Sledování změn semestrů — přidání, odebrání, změna pořadí
- Automatické ukládání změn na server v live režimu
- Tlačítka "Uložit změny" a "Zrušit změny" v confirm režimu
- Indikátor ukládání a zobrazení chyb
- `lastchangeMap` pro sledování aktuálních `lastchange` hodnot (potřebné pro optimistické aktualizace)

**Změna přidávání semestrů (`SemestersManager.jsx`):**
- Místo výběru z existujících se vytváří nový semestr s generovaným UUID
- Zjednodušení UI — pouze tlačítko "Přidat nový semestr"

**Aktualizace `useEditAction` hooku (`useEditAction.js`):**
- Rozšířená podpora pro přepínání auto-save režimu
- Nové vlastnosti: `autoSaveEnabled`, `toggleAutoSave`, `effectiveMode`

---

## 26. 5. 2026 — Řazení tabulky, generování názvů semestrů, CRUD rozšíření

**Problém 1 — názvy semestrů:**
Tabulka zobrazovala semestry jen jako číslo (`order: 1`). Nebylo jasné, co číslo znamená.

**Co jsme objevili:**
Pořadí semestru kóduje zároveň ročník i typ: lichá čísla = zimní semestr, sudá = letní, ročník = `Math.ceil(order / 2)`.

**Řešení:**
- Funkce `getSemesterName(order)` generuje čitelný název, např. "2. ročník letní" (`SemestersManager.jsx`, `SubjectSubPage.jsx`)

---

**Problém 2 — řazení tabulky:**
Tabulka předmětů neměla možnost řazení. Data navíc přicházejí stránkovaně (limit 25) — klient-side sort by řadil jen 25 načtených položek, ne všechny.

**Řešení:**
- Implementace řazení tabulky (`Table.jsx`):
  - Nová komponenta `SortableTableHeader` pro záhlaví s tlačítky řazení
  - Komponenta `SortButton` pro přepínání: ↕ → ↑ → ↓ → ↕
  - Podpora řazení podle: názvu, anglického názvu, programu, počtu semestrů, data změny
  - Funkce `getSortValue` a `compareValues` pro správné řazení textů i čísel (česká lokalizace přes `localeCompare`)
- Při prvním kliknutí na řazení `PageVector` restartuje načítání s `limit: 10000` — načtou se všechny záznamy najednou, pak se seřadí lokálně

---

**Rozšíření správy semestrů a CRUD operací (`EditMode.jsx`, `SemestersManager.jsx`, `Create.jsx`, `Delete.jsx`):**
- **Potvrzovací popup před smazáním semestru** s varováním o závislostech (foreign key)
- **Rollback při selhání** — semestr se obnoví v UI, pokud smazání selže (obsahuje klasifikace nebo jiná data)
- **Podpora semestrů při vytváření Subjectu** — semestry se automaticky vytvoří ihned po vytvoření předmětu
- **Validace programu** v create dialogu — vyžaduje výběr programu před uložením
- **Kaskádové mazání** — při smazání Subjectu se nejdřív smažou všechny jeho semestry
- Přidání názvu programu do seznamu (nové pole `name` v GraphQL fragmentu)
- Vlastní `Table` komponenta pro Subject se sloupci: název, anglický název, program, počet semestrů, nástroje

---

## 1. 6. 2026 — Oprava pořadí semestrů po neúspěšném smazání, přidání odkazů

**Co se dělalo:**
- Přidání odkazů na programy a semestry v detailních zobrazeních (`MediumContent.jsx`, `SubjectSubPage.jsx`)
  - Program ID je nyní klikatelný odkaz na `/program/ProgramGQLModel/{id}`
  - Semester ID je nyní klikatelný odkaz na `/semestr/SemesterGQLModel/{id}`

**Bug — pořadí semestrů po neúspěšném smazání:**
Při pokusu o smazání semestru s klasifikacemi server vrátil chybu (foreign key constraint). Přesto se v UI pořadí ostatních semestrů posunulo — a po obnovení dat ze serveru existovaly dva semestry se stejným číslem pořadí.

**Analýza:**
`handleRemoveSemester` v `SemestersManager.jsx` okamžitě přečísloval zbývající semestry (`order = i + 1`) a propagoval tuto změnu přes `onSemestersChange`. `EditMode` odeslal přečíslování na server jako update. Server pořadí aktualizoval — ale smazání odmítl. Výsledek: smazaný semestr zůstal s původním pořadím, které nyní sdílel s jiným semestrem.

**Řešení (dvoustupňové):**
1. `SemestersManager.handleRemoveSemester` — odstraněno okamžité přečíslování. Semestry si ponechají původní pořadí, dokud server smazání nepotvrdí.
2. `EditMode.saveSemesterChanges` — přestrukturováno pořadí operací:
   - Nejdřív se provedou všechna smazání
   - Teprve po zjištění výsledků se sestaví finální seznam (selhané smazání → semestr zpět)
   - Finální seznam se seřadí a přečísluje (`order = i + 1`)
   - Teprve pak se odešlou update mutace pro změněná pořadí
   - Výsledek: pokud smazání selže, přečíslování vyjde stejně jako originál → žádné zbytečné volání

---

## 21. 6. 2026 — Oprava infinite scroll po deaktivaci řazení

**Bug:**
Po deaktivaci řazení (třetí klik na sort tlačítko) přestával fungovat infinite scroll — nové stránky se nenačítaly při scrollování dolů.

**Analýza:**
`onSortDeactivate` volal `restart({limit: 25})`, což vyčistilo `items` a způsobilo, že `hasMore` přešlo z `false` (všechny záznamy načteny při sort) na `true`. Tím se remountoval sentinel div (`<div ref={sentinelRef} />`). `IntersectionObserver` uvnitř `useInfiniteScroll` byl však stále navázán na starý (odpojený) DOM node a na nový sentinel nereagoval — infinite scroll byl nefunkční.

**Řešení:**
`onSortDeactivate` odstraněno. Po deaktivaci řazení data zůstanou tak jak jsou — všechny načtené záznamy zůstanou v paměti, jen se odstraní vizuální řazení. `IntersectionObserver` zůstane navázán na stejný sentinel node a infinite scroll funguje bez přerušení.

---

## Přehled commitů

| Datum | Commit | Co se řešilo |
|---|---|---|
| 1. 4. 2026 | `project setup` | Inicializace projektu, základní struktura |
| 7. 4. 2026 | `attribute start` | Začátek práce na atributech MediumContent, přidání submodulu _uois |
| 10. 4. 2026 | `subpage add + RBACobject test` | SubjectSubPage, testování práv, přizpůsobení šablony |
| 13. 4. 2026 | `fragment change` | Oprava GraphQL fragmentu, skrytí prázdných polí |
| 14. 4. 2026 | `package change for publish` | Příprava package.json pro npm, merge s monorepo |
| 20. 4. 2026 | `update stranky start` | Editovatelná stránka, úprava polí |
| 28. 4. 2026 | `Refactor LiveEdit and ConfirmEdit` | Draft stav, explicitní uložení, _uois update |
| 5. 5. 2026 | `Enhance SubjectEditForm` | Pole pro popis a anglický popis |
| 6. 5. 2026 | `Refactor SubjectEditForm` | ProgramSelect, useEditAction integrace |
| 7. 5. 2026 | `Add CardCapsule`, `Refactor InsertAsyncAction` | Sekce semestrů v detailu, error handling |
| 11. 5. 2026 | `Add SemestersManager` | Správa semestrů, nové GraphQL akce, draft/commit pattern |
| 20. 5. 2026 | `Add EditMode` | Auto-save toggle, debounce, draft semestrů, lastchange tracking |
| 21. 5. 2026 | `Enhance EditMode` | Vylepšení auto-save, rollback při chybě |
| 26. 5. 2026 | `Implement sortable table`, `Add semester name generation` | Řazení tabulky, getSemesterName, load-all při sortu |
| 26. 5. 2026 | `Add semester management features` | Potvrzovací dialog, kaskádové mazání, validace programu |
| 1. 6. 2026 | `Add links`, `Sort semesters after removal` | Oprava pořadí po neúspěšném smazání, klikatelné odkazy |
| 21. 6. 2026 | Opravy bugů | Pořadí semestrů — dvoustupňové řešení; infinite scroll po deaktivaci sortu |

---

## URI fragment

```
/subject
```

## Jak spustit projekt

```cmd
npm run dev -w @velkayolanda/app_subjects
```

## Jak sestavit projekt

```cmd
npm run build -w @velkayolanda/app_subjects
```
