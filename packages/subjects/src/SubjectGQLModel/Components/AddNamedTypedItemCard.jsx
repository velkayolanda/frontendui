import { useState } from "react";
import { CardCapsule } from "@hrbolek/uoisfrontend-shared";

/**
 * Univerzální karta pro přidání položky se strukturou `{ name, type }`.
 *
 * Komponenta zobrazuje textové pole pro název, výběr typu, tlačítko pro odeslání
 * a tlačítko pro vymazání formuláře.
 *
 * @component
 * @param {Object} props - Vstupní vlastnosti komponenty.
 * @param {string} props.title - Titulek karty.
 * @param {Array<{value: string, label: string}>} [props.options=[]] - Možnosti typu.
 * @param {string} [props.defaultType=""] - Výchozí hodnota typu.
 * @param {string} [props.placeholder="..."] - Placeholder pro pole názvu.
 * @param {(payload: {name: string, type: string}) => void} [props.onAdd] - Callback volaný po kliknutí na Send.
 *
 * @returns {JSX.Element} Karta s formulářem pro přidání položky.
 */
export const AddNamedTypedItemCard = ({
  title,
  options = [],
  defaultType = "",
  placeholder = "...",
  onAdd,
}) => {
  const [name, setName] = useState("");
  const [selectedType, setSelectedType] = useState(defaultType || options[0]?.value || "");

  const handleSend = () => {
    const payload = {
      name: name.trim(),
      type: selectedType,
    };
    if (!payload.name || !payload.type) return;
    onAdd?.(payload);
  };

  const handleClear = () => {
    setName("");
    setSelectedType(defaultType || options[0]?.value || "");
  };

  return (
    <CardCapsule title={title}>
      <input
        type="text"
        className="form-control"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={placeholder}
      />

      <select
        value={selectedType}
        onChange={(e) => setSelectedType(e.target.value)}
        className="form-select"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      <button className="btn btn-outline-success" onClick={handleSend}>
        Send
      </button>
      <button className="btn btn-outline-danger" onClick={handleClear}>
        Clear
      </button>
    </CardCapsule>
  );
};
