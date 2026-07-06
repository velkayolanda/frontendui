import { CardCapsule } from "@hrbolek/uoisfrontend-shared";
import { useEffect, useState } from "react";

/**
 * Univerzální potvrzovací formulář pro výběr položek pomocí checkboxů.
 *
 * Komponenta zobrazuje:
 * - stránkování seznamu (tlačítka Prev / Next),
 * - více sloupcové zobrazení položek (výchozí rozložení 4 sloupce × 10 řádků),
 * - hromadné akce pro výběr / zrušení výběru (na aktuální stránce i globálně),
 * - potvrzení nebo zrušení akce.
 *
 * Interní stav výběru se inicializuje z `itemList` a při změně `itemList` se resetuje.
 * Po potvrzení (`onConfirm`) se vrací pouze zaškrtnuté položky v původním pořadí.
 *
 * @component
 * @param {Object} props - Vstupní vlastnosti komponenty ConfirmForm.
 * @param {Array<any>} [props.itemList=[]] - Seznam položek určených k potvrzení.
 * @param {(item: any, index: number) => string} [props.getLabel] - Funkce pro vykreslení popisku položky.
 * @param {(selectedItems: Array<any>) => void} [props.onConfirm] - Callback volaný po kliknutí na Confirm; dostane pouze vybrané položky.
 * @param {() => void} [props.onCancel] - Callback volaný po kliknutí na Cancel.
 * @param {React.ReactNode} [props.children] - Volitelný obsah vykreslený mezi sekcí „Options“ a akčními tlačítky.
 * @param {number} [props.rowsPerColumn=10] - Počet řádků na každém sloupci.
 * @param {number} [props.columnsPerPage=4] - Počet sloupců na každé stránce.
 *
 * @returns {JSX.Element} Potvrzovací formulář se stránkováním a výběrem položek.
 */
export const ConfirmForm = ({
  itemList = [],
  getLabel,
  onConfirm,
  onCancel,
  rowsPerColumn = 10,
  columnsPerPage = 4,
  ...props
}) => {
  const resolveLabel = (item, index) => {
    if (getLabel) return getLabel(item, index);
    if (typeof item === "string") return item;
    if (item && typeof item === "object") {
      if ("name" in item && "type" in item) return `${item.name} (${item.type})`;
      if ("name" in item) return String(item.name);
      return JSON.stringify(item);
    }
    return String(item ?? "");
  };

  const [items, setItems] = useState(
    (itemList ?? []).map((_, index) => ({
      index,
      checked: true,
    }))
  );

  const pageSize = rowsPerColumn * columnsPerPage;
  const [page, setPage] = useState(0);

  useEffect(() => {
    setItems((itemList ?? []).map((_, index) => ({ index, checked: true })));
    setPage(0);
  }, [itemList]);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const start = page * pageSize;
  const pageItems = items.slice(start, start + pageSize);

  const columns = Array.from({ length: columnsPerPage }, (_, col) =>
    pageItems.slice(col * rowsPerColumn, (col + 1) * rowsPerColumn)
  );

  const handleConfirm = () => {
    onConfirm?.(items.filter((i) => i.checked).map((i) => itemList[i.index]));
  };

  const Navigation = () => (
    <div className="d-flex gap-2">
      <button
        className="btn btn-outline-primary"
        disabled={page === 0}
        onClick={() => setPage((p) => Math.max(0, p - 1))}
      >
        Prev
      </button>

      <button
        className="btn btn-outline-primary"
        disabled={page >= totalPages - 1}
        onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
      >
        Next
      </button>

      <span className="align-self-center">
        Page {page + 1} / {totalPages}
      </span>
    </div>
  );

  const SelectOptions = () => (
    <CardCapsule title="Options">
      <button
        className="btn btn-outline-secondary"
        disabled={pageItems.every((i) => i.checked)}
        onClick={() =>
          setItems((prev) =>
            prev.map((i) =>
              i.index >= start && i.index < start + pageSize ? { ...i, checked: true } : i
            )
          )
        }
      >
        Select all on page
      </button>

      <button
        className="btn btn-outline-secondary"
        disabled={pageItems.every((i) => !i.checked)}
        onClick={() =>
          setItems((prev) =>
            prev.map((i) =>
              i.index >= start && i.index < start + pageSize ? { ...i, checked: false } : i
            )
          )
        }
      >
        Deselect all on page
      </button>

      <div>
        <button
          className="btn btn-outline-secondary"
          disabled={items.every((i) => i.checked)}
          onClick={() => setItems((prev) => prev.map((i) => ({ ...i, checked: true })))}
        >
          Select all items
        </button>

        <button
          className="btn btn-outline-secondary"
          disabled={items.every((i) => !i.checked)}
          onClick={() => setItems((prev) => prev.map((i) => ({ ...i, checked: false })))}
        >
          Deselect all items
        </button>
      </div>
    </CardCapsule>
  );

  const ItemList = () => (
    <CardCapsule title="Items">
      <div className="row">
        {columns.map((colItems, colIdx) => (
          <div className="col-3" key={colIdx}>
            {colItems.map((item) => (
              <div key={item.index}>
                <input
                  type="checkbox"
                  checked={item.checked}
                  onChange={() =>
                    setItems((prev) =>
                      prev.map((i) =>
                        i.index === item.index ? { ...i, checked: !i.checked } : i
                      )
                    )
                  }
                />
                <> </>
                {resolveLabel(itemList[item.index], item.index)}
              </div>
            ))}
          </div>
        ))}
      </div>
    </CardCapsule>
  );

  return (
    <>
      <Navigation />
      <ItemList />
      <SelectOptions />
      {props.children}
      <div>
        <button className="btn btn-outline-success" onClick={handleConfirm}>
          Confirm
        </button>
        <button className="btn btn-outline-danger" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </>
  );
};
