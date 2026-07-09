import { CardCapsule, Dialog, LoadingSpinner } from "@hrbolek/uoisfrontend-shared";
import { useEffect, useState } from "react";
import { ProgramSelect } from "./ProgramSelect";
import { ConfirmForm } from "./ConfirmForm";
import { AddNamedTypedItemCard } from "./AddNamedTypedItemCard";
import { JsonStateTools } from "./JsonStateTools";
import { loadDictionaryToState, generateUniqueSubjects } from "../Tools/generatorUtils";
import { AlertBanner } from "./AlertBanner";
import { PermissionGate } from "../../../../dynamic/src/Hooks/useRoles";
import { ProgramPageAsyncAction, InsertAsyncAction, SemesterInsertAsyncAction} from "../Queries";
import { useDispatch } from "react-redux";
import { useGQLClient } from "../../../../dynamic/src/Store/RootProviders";
import { generateUUID, randomInt } from "../Tools/generatorUtils";



const permissions = {
  oneOfRoles: ["administrátor"],
  mode: "absolute",
}

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
        max ="1000"
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
    programList,
    setProgramList,
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
            listState(programList);
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
 * - zvolený program (`selectedProgram`) a seznam programů (`ProgramSelect`).
 *
 * Tok obrazovek:
 * 1) Pokud existují `pendingJsonItems`, vykreslí se `ConfirmForm` pro potvrzení JSON importu.
 * 2) Pokud existují `listOfGeneratedSubjects`, vykreslí se `ConfirmForm` pro potvrzení generovaných položek
 *    a doplňkově `ProgramSelect` (případně `LoadingSpinner` při načítání programů).
 *    - `onConfirm` -> `handleConfirmGenerated`
 *    - `onCancel`  -> `handleBackGenerated`
 * 3) Jinak se vykreslí standardní `DataForm`.
 *
 * Komponenta při mountu načítá výchozí slovníky (`DEFAULT_ADJECTIVES`, `DEFAULT_SUBJECTS`)
 * a inicializační hlášku do alertu.
 *
 * @component
 * @returns {JSX.Element} Kompletní UI generátoru včetně alert banneru.
 */
const GenerateForm = () => {
  const [predmety, setPredmet] = useState([]);
  const [listOfGeneratedSubjects, setListOfGeneratedSubjects] = useState([]);
  const [adjectives, setAdjective] = useState([]);
  const [alertInfo, setAlertInfo] = useState("");
  //Selected Program
  const [selectedProgram, setSelectedProgram] = useState();
  //Seznam všech programů
  const [programList, setProgramList] = useState([]);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const gqlClient = useGQLClient();


  const [pendingJsonItems, setPendingJsonItems] = useState([]);

  // Kontext pro předávání stavu do podkomponent
  const contextValue = {
    predmety,
    setPredmet,
    listOfGeneratedSubjects,
    setListOfGeneratedSubjects,
    adjectives,
    setAdjective,
    alertInfo,
    setAlertInfo,
    selectedProgram,
    setSelectedProgram,
    programList,
    setProgramList,
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

  //Fetch programs zkopirovano z ProgramSelect.jsx
  useEffect(() => {
    loadDefaultAdjectives();
    loadDefaultSubjects();
    setAlertInfo("Načteny výchozí hodnoty přídavných jmen a předmětů.");

    const skip = 0;
    const limit = 200;

    const fetchPrograms = async () => {
      try {
        setLoading(true);
        const result = await dispatch(ProgramPageAsyncAction({ skip, limit }, gqlClient));
        const data = result?.data;

        if (data?.programPage) {
          setProgramList(data.programPage);
        } else {
          console.warn("GenerateForm: No programs found in response", result);
        }
      } catch (error) {
        console.error("GenerateForm: Error fetching programs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPrograms();
  }, [dispatch, gqlClient]);

  // TODO: Implementovat odeslání vygenerovaných předmětů na server
  const handleConfirmGenerated = async (selectedItems) => {
    setLoading(true);

    const insertSemesters = async (subjectId) => {
      var count = randomInt(9) + 1;
      const semesters = Array.from({ length: count }, () => generateUUID());

      for (const semester of semesters) {
        const semesterResponse =dispatch(SemesterInsertAsyncAction({
          id: semester,
          subjectId: subjectId,
          order: count
        }, gqlClient));

          const semesterResult = semesterResponse?.data?.semesterInsert || semesterResponse?.semesterInsert || semesterResponse;

          if (semesterResult?.failed === true || semesterResult?.__typename?.includes('Error')) {
              console.error('Failed to create semester:', semesterResult?.msg);
          }
        count--;
      }
      return semesters;
    };

    for (const item of selectedItems) {
      const id = generateUUID();
      const response = await dispatch(InsertAsyncAction({
        id: id,
        name: item,
        programId: selectedProgram ? selectedProgram : programList[randomInt(programList.length - 1)].id,
        semesters: [],
      }, gqlClient));

      const result = response?.data?.response || response?.subjectInsert || response;

      if (result?.failed === true || result?.__typename?.includes('Error')) {
        console.error('Failed to create subject:', result?.msg);
      }
      else {
        insertSemesters(id);
      }
    }
    setAlertInfo("Požadavky odeslány na server.");
    setListOfGeneratedSubjects([]);
    setSelectedProgram("");
    setLoading(false);
  };

  const handleBackGenerated = () => {
    setListOfGeneratedSubjects([]);
    setAlertInfo("");
    setSelectedProgram("");
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
    loading ?
      <LoadingSpinner /> :
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
          <ProgramSelect value={selectedProgram} onChange={setSelectedProgram} programs={programList}/>
        </ConfirmForm>
        ) : (
            <DataForm
              contextValue={contextValue}
              loadDefaultAdjectives={loadDefaultAdjectives}
              loadDefaultSubjects={loadDefaultSubjects}
              AddToState={AddToState}
              setPendingJsonItems={setPendingJsonItems}/>
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
export const GenerateButton = ({ rbacitem, ...props }) => {
  const [dialogVisible, setDialogVisible] = useState(false);

  return (
    <>
      <PermissionGate oneOfRoles={permissions.oneOfRoles} mode={permissions.mode} item={rbacitem}>
      <button
        {...props}
        onClick={(e) => {
          props.onClick?.(e);
          setDialogVisible(true);
        }}
      >
        {props.children}
      </button>
        </PermissionGate>
      {dialogVisible && (
        <GenerateDialog
          onOk={() => setDialogVisible(false)}
          onCancel={() => setDialogVisible(false)}
        />
      )}
    </>
  );
};
