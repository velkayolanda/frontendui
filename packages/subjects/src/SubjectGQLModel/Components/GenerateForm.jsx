import { CardCapsule, Dialog } from "@hrbolek/uoisfrontend-shared";
import { useEffect, useState } from "react";
import { ProgramSelect } from "./ProgramSelect";
import { ConfirmForm } from "./ConfirmForm";
import { AddNamedTypedItemCard } from "./AddNamedTypedItemCard";
import { JsonStateTools } from "./JsonStateTools";
import { loadDictionaryToState, generateUniqueSubjects } from "../Tools/generatorUtils";
import { AlertBanner } from "./AlertBanner";

/**
 * Výchozí slovník přídavných jmen.
 *
 * Klíč = text přídavného jména, hodnota = typ skloňování.
 * Očekávané hodnoty typu: `tvrde` | `mekke`.
 *
 * @type {Record<string, "tvrde" | "mekke">}
 */
const DEFAULT_ADJECTIVES = {
  Pokročilý: "tvrde",
  Základní: "mekke",
  Aplikovaný: "tvrde",
  Teoretický: "tvrde",
  Obecný: "tvrde",
  Praktický: "tvrde",
  Komplexní: "mekke",
  Experimentální: "mekke",
  Klasický: "tvrde",
  Moderní: "mekke",
  Užitý: "tvrde",
  Strategický: "tvrde",
  Kvantový: "tvrde",
  Digitální: "mekke",
  Vojenský: "tvrde",
  Numerický: "tvrde",
  Tajný: "tvrde",
  Síťový: "tvrde",
  Projektový: "tvrde",
  Umělý: "tvrde",
  Databázový: "tvrde",
};

/**
 * Výchozí slovník podstatných jmen (názvů předmětů).
 *
 * Klíč = název předmětu, hodnota = rod/číslo podstatného jména.
 * Očekávané hodnoty typu: `zensky` | `muzsky` | `stredni` | `mnozne`.
 *
 * @type {Record<string, "zensky" | "muzsky" | "stredni" | "mnozne">}
 */
const DEFAULT_SUBJECTS = {
  Matematika: "zensky",
  Fyzika: "zensky",
  Informatika: "zensky",
  Statistika: "zensky",
  Algebra: "zensky",
  Geometrie: "zensky",
  Programování: "stredni",
  Elektrotechnika: "zensky",
  Mechanika: "zensky",
  Termodynamika: "zensky",
  Systémy: "mnozne",
  Technologie: "zensky",
  Řízení: "stredni",
  Ekonomie: "zensky",
  Filozofie: "zensky",
  Logika: "zensky",
  Kryptografie: "zensky",
  Robotika: "zensky",
  Inteligence: "zensky",
  Taktika: "zensky",
  Management: "muzsky",
};

/**
 * Karta generátoru názvů předmětů.
 *
 * Komponenta umožňuje zadat počet generovaných položek a spustit generování
 * unikátních kombinací z dostupných podstatných a přídavných jmen.
 * Samotnou logiku generování deleguje na utilitu `generateUniqueSubjects`.
 *
 * @component
 * @param {Object} props - Vstupní vlastnosti komponenty.
 * @param {Array<{name: string, type: string}>} props.subjects - Seznam podstatných jmen.
 * @param {Array<{name: string, type: string}>} props.adjectives - Seznam přídavných jmen.
 * @param {(items: string[]) => void} props.setListOfGeneratedSubjects - Setter výsledného seznamu vygenerovaných názvů.
 * @param {(message: string) => void} props.setAlertInfo - Setter informační hlášky.
 *
 * @returns {JSX.Element} Karta s inputem pro počet a tlačítkem Generate.
 */
const SubjectGenerateCard = ({ subjects, adjectives, setListOfGeneratedSubjects, setAlertInfo }) => {
  const [numberOfSubjects, setNumberOfSubjects] = useState(0);

  const handleGeneration = () => {
    const { generated, message } = generateUniqueSubjects({
      subjects,
      adjectives,
      count: numberOfSubjects,
    });

    setListOfGeneratedSubjects(generated);
    setAlertInfo(message);
  };

  return (
    <CardCapsule title="Generator">
      <input
        type="number"
        min="0"
        className="form-control"
        value={numberOfSubjects}
        onChange={(e) => setNumberOfSubjects(Number(e.target.value))}
        placeholder="..."
      />
      <button className="btn btn-outline-primary" onClick={handleGeneration}>
        Generate
      </button>
    </CardCapsule>
  );
};
/**
 * Hlavní datová část formuláře generátoru.
 *
 * Komponenta sdružuje:
 * - přidávání podstatných jmen (`AddNamedTypedItemCard`),
 * - přidávání přídavných jmen (`AddNamedTypedItemCard`),
 * - generování kombinací (`SubjectGenerateCard`),
 * - nástroje (výpis do konzole, load default dat, clear, JSON import/export).
 *
 * @component
 * @param {Object} props - Vstupní vlastnosti komponenty.
 * @param {Object} props.contextValue - Sdílený stav generátoru.
 * @param {Array<{name: string, type: string}>} props.contextValue.predmety
 * @param {(value: any) => void} props.contextValue.setPredmet
 * @param {string[]} props.contextValue.listOfGeneratedSubjects
 * @param {(value: any) => void} props.contextValue.setListOfGeneratedSubjects
 * @param {Array<{name: string, type: string}>} props.contextValue.adjectives
 * @param {(value: any) => void} props.contextValue.setAdjective
 * @param {(message: string) => void} props.contextValue.setAlertInfo
 * @param {() => void} props.loadDefaultAdjectives - Načtení výchozích přídavných jmen.
 * @param {() => void} props.loadDefaultSubjects - Načtení výchozích podstatných jmen.
 * @param {(payload: {name: string, type: string}, stateSetter: Function) => void} props.AddToState - Univerzální přidání položky do stavu.
 * @param {(items: Array<{name: string, type: string, target: "subjects"|"adjectives"}>) => void} props.setPendingJsonItems - Setter pending položek pro potvrzení JSON importu.
 *
 * @returns {JSX.Element} Formulářová část pro práci s daty a nástroji.
 */
const DataForm = ({
  contextValue,
  loadDefaultAdjectives,
  loadDefaultSubjects,
  AddToState,
  setPendingJsonItems,
}) => {
  const {
    predmety,
    setPredmet,
    listOfGeneratedSubjects,
    setListOfGeneratedSubjects,
    adjectives,
    setAdjective,
    setAlertInfo,
  } = contextValue;

  const listState = (stateVariable) => {
    console.log(stateVariable);
  };

  return (
    <>
      <AddNamedTypedItemCard
        title="Podstatné jméno předmetu"
        placeholder="..."
        options={[
          { value: "zensky", label: "Ženský" },
          { value: "muzsky", label: "Mužský" },
          { value: "stredni", label: "Střední" },
          { value: "mnozne", label: "Množné číslo" },
        ]}
        defaultType="zensky"
        onAdd={(payload) => AddToState(payload, setPredmet)}
      />

      <AddNamedTypedItemCard
        title="Přídavné jmnéno předmětu"
        placeholder="..."
        options={[
          { value: "tvrde", label: "Tvrdé" },
          { value: "mekke", label: "Měkké" },
        ]}
        defaultType="tvrde"
        onAdd={(payload) => AddToState(payload, setAdjective)}
      />

      <SubjectGenerateCard
        subjects={predmety}
        adjectives={adjectives}
        setListOfGeneratedSubjects={setListOfGeneratedSubjects}
        setAlertInfo={setAlertInfo}
      />

      <CardCapsule title="Tools">
        <button
          className="btn btn-outline-primary"
          onClick={() => {
            setAlertInfo("Data vypsána do konzole");
            listState(predmety);
            listState(adjectives);
            listState(listOfGeneratedSubjects);
          }}
        >
          Print list
        </button>

        <button
          className="btn btn-outline-primary"
          onClick={() => {
            setAlertInfo("Přídavná jména z výchozího seznamu načtena");
            loadDefaultAdjectives();
          }}
        >
          Load default adjectives
        </button>

        <button
          className="btn btn-outline-primary"
          onClick={() => {
            setAlertInfo("Předměty z výchozího seznamu načteny");
            loadDefaultSubjects();
          }}
        >
          Load default subjects
        </button>

        <button
          className="btn btn-outline-danger"
          onClick={() => {
            setPredmet([]);
            setAdjective([]);
            setAlertInfo("Data vymazána");
          }}
        >
          Clear list
        </button>

        <JsonStateTools
          fileName="generator-keywords.json"
          onMessage={(msg) => setAlertInfo(msg)}
          toJsonObject={() => ({
            ADJECTIVES: Object.fromEntries(adjectives.map((a) => [a.name, a.type])),
            SUBJECTS: Object.fromEntries(predmety.map((s) => [s.name, s.type])),
          })}
          fromJsonObject={(parsed) => {
            const loadedAdjectives = Object.entries(parsed.ADJECTIVES ?? {}).map(([name, type]) => ({
              name: String(name).trim(),
              type: String(type).trim(),
              target: "adjectives",
            }));

            const loadedSubjects = Object.entries(parsed.SUBJECTS ?? {}).map(([name, type]) => ({
              name: String(name).trim(),
              type: String(type).trim(),
              target: "subjects",
            }));

            const mixed = [...loadedSubjects, ...loadedAdjectives];

            if (mixed.length === 0) {
              setAlertInfo("JSON neobsahuje importovatelná data.");
              return;
            }

            setPendingJsonItems(mixed);
            setAlertInfo("Potvrďte import položek z JSON.");
          }}
        />
      </CardCapsule>
    </>
  );
};

/**
 * Kořenová komponenta formuláře generátoru dat.
 *
 * Spravuje kompletní stav:
 * - seznam podstatných jmen,
 * - seznam přídavných jmen,
 * - seznam vygenerovaných názvů,
 * - pending položky z JSON importu,
 * - alert zprávy,
 * - volitelný program (`ProgramSelect`).
 *
 * Podle stavu přepíná mezi:
 * - potvrzením JSON importu (`ConfirmForm`),
 * - potvrzením vygenerovaných položek (`ConfirmForm`),
 * - standardním datovým formulářem (`DataForm`).
 *
 * @component
 * @returns {JSX.Element} Kompletní UI generátoru včetně alertu.
 */
const GenerateForm = () => {
  const [predmety, setPredmet] = useState([]);
  const [listOfGeneratedSubjects, setListOfGeneratedSubjects] = useState([]);
  const [adjectives, setAdjective] = useState([]);
  const [alertInfo, setAlertInfo] = useState("");
  const [program, setProgram] = useState();

  const [pendingJsonItems, setPendingJsonItems] = useState([]);

  const contextValue = {
    predmety,
    setPredmet,
    listOfGeneratedSubjects,
    setListOfGeneratedSubjects,
    adjectives,
    setAdjective,
    alertInfo,
    setAlertInfo,
    program,
    setProgram,
  };

  const AddToState = (payload, stateSetter) => {
    if (!payload.name || !payload.type) return;
    stateSetter((prev) => {
      const exists = prev.some(
        (p) => p.name.trim().toLowerCase() === payload.name.trim().toLowerCase()
      );
      if (exists) {
        console.log("Entry already exists", payload);
        return prev;
      }
      return [...prev, payload];
    });
  };

  const loadDefaultAdjectives = () => {
    loadDictionaryToState(DEFAULT_ADJECTIVES, AddToState, setAdjective);
  };

  const loadDefaultSubjects = () => {
    loadDictionaryToState(DEFAULT_SUBJECTS, AddToState, setPredmet);
  };

  useEffect(() => {
    loadDefaultAdjectives();
    loadDefaultSubjects();
    setAlertInfo("Načteny výchozí hodnoty přídavných jmen a předmětů.");
  }, []);

  // TODO: Implementovat odeslání vygenerovaných předmětů na server
  const handleConfirmGenerated = (selectedItems) => {
    console.log(selectedItems);
    console.log(program);

    setListOfGeneratedSubjects([]);
    setAlertInfo("Předměty přidány do seznamu.");
  };

  const handleBackGenerated = () => {
    setListOfGeneratedSubjects([]);
    setAlertInfo("");
  };

  const handleConfirmJsonImport = (selectedItems) => {
    selectedItems.forEach((item) => {
      if (item.target === "subjects") {
        AddToState({ name: item.name, type: item.type }, setPredmet);
      } else if (item.target === "adjectives") {
        AddToState({ name: item.name, type: item.type }, setAdjective);
      }
    });

    setPendingJsonItems([]);
    setAlertInfo(`Importováno ${selectedItems.length} položek.`);
  };

  const handleCancelJsonImport = () => {
    setPendingJsonItems([]);
    setAlertInfo("Import JSON zrušen.");
  };

  return (
    <div>
      {pendingJsonItems.length > 0 ? (
        <ConfirmForm
          itemList={pendingJsonItems}
          getLabel={(item) =>
            `${item.target === "subjects" ? "[SUBJECT]" : "[ADJECTIVE]"} ${item.name} (${item.type})`
          }
          onConfirm={handleConfirmJsonImport}
          onCancel={handleCancelJsonImport}
        />
      ) : listOfGeneratedSubjects.length > 0 ? (
        <ConfirmForm
          itemList={listOfGeneratedSubjects}
          onConfirm={handleConfirmGenerated}
          onCancel={handleBackGenerated}
        >
          <ProgramSelect value={program} onChange={setProgram} />
        </ConfirmForm>
      ) : (
        <DataForm
          contextValue={contextValue}
          loadDefaultAdjectives={loadDefaultAdjectives}
          loadDefaultSubjects={loadDefaultSubjects}
          AddToState={AddToState}
          setPendingJsonItems={setPendingJsonItems}
        />
      )}

      <AlertBanner message={alertInfo} variant="warning" />
    </div>
  );
};

/**
 * Dialogové okno obalující formulář generátoru.
 *
 * @component
 * @param {Object} props - Vstupní vlastnosti komponenty.
 * @param {() => void} props.onOk - Callback při potvrzení dialogu.
 * @param {() => void} props.onCancel - Callback při zrušení dialogu.
 *
 * @returns {JSX.Element} Dialog s vloženým `GenerateForm`.
 */
export const GenerateDialog = ({ onOk, onCancel }) => {
  return (
    <Dialog title="Data Generator" onOk={onOk} onCancel={onCancel}>
      <GenerateForm />
    </Dialog>
  );
};

/**
 * Tlačítko pro otevření dialogu generátoru dat.
 *
 * Komponenta předává všechny přijaté props na `<button>` a zachovává
 * i externí `onClick` handler (pokud je předán).
 *
 * @component
 * @param {Object} props - Vstupní vlastnosti tlačítka.
 * @param {React.ReactNode} props.children - Obsah tlačítka.
 *
 * @returns {JSX.Element} Tlačítko + podmíněně vykreslený `GenerateDialog`.
 */
export const GenerateButton = ({ ...props }) => {
  const [dialogVisible, setDialogVisible] = useState(false);

  return (
    <>
      <button
        {...props}
        onClick={(e) => {
          props.onClick?.(e);
          setDialogVisible(true);
        }}
      >
        {props.children}
      </button>

      {dialogVisible && (
        <GenerateDialog
          onOk={() => setDialogVisible(false)}
          onCancel={() => setDialogVisible(false)}
        />
      )}
    </>
  );
};
//TODO: Přidat guatd pouze pro uživatele s pravomocí
