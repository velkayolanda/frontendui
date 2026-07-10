import { useRef } from "react";

/**
 * Univerzální nástroj pro export a import JSON dat.
 *
 * Umožňuje:
 * - export aktuálního stavu do `.json` souboru,
 * - načtení `.json` souboru z disku a předání naparsovaného obsahu callbacku.
 *
 * @component
 * @param {Object} props - Vstupní vlastnosti komponenty.
 * @param {Function} props.toJsonObject - Funkce vracející serializovatelný objekt pro export.
 * @param {Function} props.fromJsonObject - Funkce zpracovávající naparsovaný JSON při importu.
 * @param {Function} [props.onMessage] - Volitelný callback pro informační hlášky.
 * @param {string} [props.fileName="data.json"] - Název exportovaného souboru.
 * @param {string} [props.downloadLabel="Download as JSON"] - Text tlačítka pro export.
 * @param {string} [props.loadLabel="Load from JSON"] - Text tlačítka pro import.
 * @param {string} [props.className="btn btn-outline-primary"] - CSS třída tlačítek.
 *
 * @returns {JSX.Element} Dvojice tlačítek (export/import) + skrytý file input.
 */
export const JsonStateTools = ({
  toJsonObject,
  fromJsonObject,
  onMessage,
  fileName = "data.json",
  downloadLabel = "Download as JSON",
  loadLabel = "Load from JSON",
  className = "btn btn-outline-primary",
}) => {
  const fileInputRef = useRef(null);

  const downloadJson = () => {
    try {
      const dump = toJsonObject?.() ?? {};
      const json = JSON.stringify(dump, null, 2);
      const blob = new Blob([json], { type: "application/json;charset=utf-8" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);
      onMessage?.("Data dumpnuta do souboru.");
    } catch (err) {
      console.error("JSON export failed", err);
      onMessage?.("Chyba při exportu JSON.");
    }
  };

  const openJsonPicker = () => {
    fileInputRef.current?.click();
  };

  const loadFromJsonFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      fromJsonObject?.(parsed);
      onMessage?.("Načteno úspěšně.");
    } catch (err) {
      console.error("Invalid JSON file", err);
      onMessage?.("Chyba při načítání JSON souboru.");
    } finally {
      event.target.value = "";
    }
  };

  return (
    <>
      <button className={className} onClick={downloadJson}>
        {downloadLabel}
      </button>
      <button className={className} onClick={openJsonPicker}>
        {loadLabel}
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json,.json"
        style={{ display: "none" }}
        onChange={loadFromJsonFile}
      />
    </>
  );
};
