/** @module Tools */
/**
 * Vrátí náhodné celé číslo včetně obou hranic intervalu `<0, N>`.
 *
 * Rozsah:
 * - minimum: `0`
 * - maximum: `N`
 *
 * @param {number} N - Horní mez intervalu (včetně).
 * @returns {number} Náhodné celé číslo od `0` do `N` (včetně).
 *
 * @example
 * randomInt(5) // může vrátit 0,1,2,3,4 nebo 5
 */
export const randomInt = (N) => Math.floor(Math.random() * (N + 1));

/**
 * Sestaví výsledný název předmětu z podstatného a přídavného jména
 * podle typu přídavného jména a rodu podstatného jména.
 *
 * Pravidla:
 * - Pokud je přídavné jméno typu `mekke`, použije se přímo ve tvaru
 *   `Adjective + Subject` (s velkým počátečním písmenem).
 * - Jinak se upraví koncovka přídavného jména podle rodu podstatného jména:
 *   - `zensky` -> `á`
 *   - `stredni` -> `é`
 *   - `muzsky` -> `ý`
 *   - `mnozne` -> `é`
 *   - výchozí -> `ý`
 *
 * @param {{name: string, type: string} | undefined | null} subject - Podstatné jméno s rodem.
 * @param {{name: string, type: string} | undefined | null} adjective - Přídavné jméno s typem (`mekke` / `tvrde`).
 *
 * @returns {string} Vygenerovaný název předmětu. Pokud chybí vstupy, vrací prázdný řetězec.
 *
 * @example
 * buildSubjectName({ name: "informatika", type: "zensky" }, { name: "teoretický", type: "tvrde" })
 * // => "Teoretická Informatika"
 */
export const buildSubjectName = (subject, adjective) => {
  if (!subject || !adjective) return "";

  if (adjective.type === "mekke") {
    return (
      adjective.name.charAt(0).toUpperCase() +
      adjective.name.slice(1) +
      " " +
      subject.name.charAt(0).toUpperCase() +
      subject.name.slice(1)
    );
  }

  let result = adjective.name.charAt(0).toUpperCase() + adjective.name.slice(1, -1);
  switch (subject.type) {
    case "zensky":
      result += "á";
      break;
    case "stredni":
      result += "é";
      break;
    case "muzsky":
      result += "ý";
      break;
    case "mnozne":
      result += "é";
      break;
    default:
      result += "ý";
      break;
  }

  return result + " " + subject.name.charAt(0).toUpperCase() + subject.name.slice(1);
};

/**
 * Vygeneruje unikátní kombinace přídavných a podstatných jmen.
 *
 * Funkce vybírá náhodné dvojice indexů `subject + adjective` tak,
 * aby se neopakovaly. Výsledkem je pole vygenerovaných názvů a doprovodná zpráva.
 *
 * @param {Object} params - Vstupní parametry generování.
 * @param {Array<{name: string, type: string}>} [params.subjects=[]] - Seznam podstatných jmen.
 * @param {Array<{name: string, type: string}>} [params.adjectives=[]] - Seznam přídavných jmen.
 * @param {number} [params.count=0] - Počet požadovaných generovaných položek.
 *
 * @returns {{generated: string[], message: string}} Objekt s výslednými názvy a informační zprávou.
 */
export const generateUniqueSubjects = ({ subjects = [], adjectives = [], count = 0 }) => {
  if (subjects.length === 0 || adjectives.length === 0) {
    return { generated: [], message: "Nejsou dostupná data pro generování." };
  }
  if (count <= 0) {
    return { generated: [], message: "Zadejte počet předmětů větší než 0." };
  }

  const indexPairList = [];
  const outList = [];

  for (let i = 0; i < count; i++) {
    let subjectIndex = randomInt(subjects.length - 1);
    let adjectiveIndex = randomInt(adjectives.length - 1);

    let adjTries = 0;
    let subjTries = 0;

    while (indexPairList.some((s) => s.subjectId === subjectIndex && s.adjectiveId === adjectiveIndex)) {
      if (adjectiveIndex >= adjectives.length - 1) adjectiveIndex = 0;
      else adjectiveIndex++;
      adjTries++;

      if (adjTries < adjectives.length) continue;

      if (subjectIndex >= subjects.length - 1) subjectIndex = 0;
      else subjectIndex++;
      subjTries++;
      adjTries = 0;

      if (subjTries >= subjects.length) break;
    }

    if (!indexPairList.some((s) => s.subjectId === subjectIndex && s.adjectiveId === adjectiveIndex)) {
      indexPairList.push({ subjectId: subjectIndex, adjectiveId: adjectiveIndex });
      outList.push(buildSubjectName(subjects[subjectIndex], adjectives[adjectiveIndex]));
    }
  }

  const message =
    outList.length > 0
      ? "Vyberte předměty pro přidání. Vybrané předměty budou přidány náhodoně pokud nebude vybrán program."
      : "Nelze vygenerovat další unikátní kombinace.";

  return { generated: outList, message };
};


/**
 * Načte slovník `name -> type` do cílového stavu přes předaný callback.
 *
 * Každý záznam slovníku převádí na payload `{ name, type }`
 * a předává ho funkci `addToState`.
 *
 * @param {Object.<string, string>} dictionary - Zdrojový slovník.
 * @param {Function} addToState - Funkce pro vložení položky do stavu. Přijímá (payload, stateSetter).
 * @param {Function} stateSetter - Setter cílového stavu (`setState`).
 *
 * @returns {void}
 */
export const loadDictionaryToState = (dictionary, addToState, stateSetter) => {
  for (const [name, type] of Object.entries(dictionary ?? {})) {
    addToState({ name, type }, stateSetter);
  }
};

/**
 * Vygeneruje náhodný identifikátor ve formátu UUID v4.
 *
 * Poznámka:
 * - Formát odpovídá UUID v4 (`xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx`),
 * - implementace využívá `Math.random()`,
 * - není určeno pro kryptografické/bezpečnostní použití.
 *
 * @returns {string} Řetězec ve tvaru UUID v4.
 *
 * @example
 * generateUUID() // např. "3f8c2a4e-91b7-4c2e-a9d1-6d2c8f7b1a22"
 */
export const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};
