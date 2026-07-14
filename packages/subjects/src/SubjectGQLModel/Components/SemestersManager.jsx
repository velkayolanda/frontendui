/**
 * @fileoverview Komponenta pro správu semestrů předmětu (Subject).
 * Umožňuje přidávání, odebírání a změnu pořadí semestrů.
 * @module Components
 */

import React, { useState, useCallback, useEffect } from "react";
import { Label } from "../../../../_template/src/Base/FormControls/Label";
import { generateUUID } from "../Tools/generatorUtils";

// ═══════════════════════════════════════════════════════════════════════════
// KONSTANTY
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Maximální počet semestrů pro jeden předmět.
 * Odpovídá 6 letům studia × 2 semestry za rok.
 * @constant {number}
 */
const MAX_SEMESTERS = 12;

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNKCE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Generuje čitelný název semestru podle pořadí.
 *
 * Mapování pořadí na název:
 * - 1 → "1. ročník zimní"
 * - 2 → "1. ročník letní"
 * - 3 → "2. ročník zimní"
 * - 4 → "2. ročník letní"
 * - atd.
 *
 * @param {number|string} order - Pořadí semestru (1, 2, 3, ...)
 * @returns {string} Název semestru, např. "2. ročník letní"
 *
 * @example
 * getSemesterName(1) // "1. ročník zimní"
 * getSemesterName(4) // "2. ročník letní"
 * getSemesterName(12) // "6. ročník letní"
 */
const getSemesterName = (order) => {
    // Převod na číslo (může přijít jako string z JSON)
    const orderNum = parseInt(order, 10) || 0
    // Ročník = ceil(order/2): 1,2→1, 3,4→2, 5,6→3, atd.
    const year = Math.ceil(orderNum / 2)
    // Lichá čísla = zimní (1,3,5...), sudá = letní (2,4,6...)
    const isWinter = orderNum % 2 === 1
    return `${year}. ročník ${isWinter ? "zimní" : "letní"}`
}

// ═══════════════════════════════════════════════════════════════════════════
// KOMPONENTA
// ═══════════════════════════════════════════════════════════════════════════

/**
 * SemestersManager - Komponenta pro správu semestrů předmětu (Subject).
 *
 * ## Funkce
 * - Zobrazení seznamu semestrů v tabulce (pořadí, název, ID, akce)
 * - Přidání nového semestru s automaticky generovaným UUID
 * - Odebrání semestru s potvrzovacím dialogem
 * - Změna pořadí semestrů pomocí tlačítek ↑/↓
 *
 * ## Důležité
 * Změny se **neukládají okamžitě na server**!
 * Komponenta pouze upravuje lokální stav a volá callback `onSemestersChange`.
 * Skutečné uložení na server provádí nadřazená komponenta (EditMode).
 *
 * ## Formát semestru
 * ```js
 * {
 *   id: string,        // UUID semestru
 *   order: number,     // Pořadí (1-12)
 *   subjectId: string, // UUID předmětu
 *   _action?: 'create' // Flag pro nově vytvořené semestry
 * }
 * ```
 *
 * @component
 * @param {Object} props
 * @param {Array<Object>} [props.semesters=[]] - Pole semestrů přiřazených k předmětu
 * @param {string} props.semesters[].id - UUID semestru
 * @param {number} props.semesters[].order - Pořadí semestru
 * @param {string} [props.semesters[]._action] - 'create' pro nově vytvořené
 * @param {string} props.subjectId - UUID předmětu, ke kterému semestry patří
 * @param {Function} [props.onSemestersChange] - Callback volaný při změně seznamu
 * @param {boolean} [props.disabled=false] - Readonly režim (zakáže všechny akce)
 *
 * @example
 * // Základní použití
 * <SemestersManager
 *   semesters={subject.semesters}
 *   subjectId={subject.id}
 *   onSemestersChange={(newSemesters) => setSubject({...subject, semesters: newSemesters})}
 * />
 *
 * @example
 * // Readonly režim
 * <SemestersManager
 *   semesters={subject.semesters}
 *   subjectId={subject.id}
 *   disabled={true}
 * />
 */
export const SemestersManager = ({
    semesters = [],
    subjectId,
    onSemestersChange = () => null,
    disabled = false
}) => {
    // ═══════════════════════════════════════════════════════════════════════
    // STATE
    // ═══════════════════════════════════════════════════════════════════════

    /** Lokální kopie semestrů pro editaci */
    const [localSemesters, setLocalSemesters] = useState([]);

    /** State pro potvrzovací dialog mazání */
    const [deleteConfirmation, setDeleteConfirmation] = useState({
        show: false,
        semesterId: null,
        semesterOrder: null
    });

    // ═══════════════════════════════════════════════════════════════════════
    // SYNCHRONIZACE A ODVOZENÝ STAV
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Synchronizace lokálního stavu s props.
     * Používá JSON.stringify pro detekci hlubokých změn v poli objektů.
     * Bez JSON.stringify by React nedetekoval změny uvnitř pole (shallow compare).
     */
    useEffect(() => {
        // Vytvoření nové kopie pole - důležité pro immutabilitu
        setLocalSemesters([...(semesters || [])]);
    }, [JSON.stringify(semesters)]); // eslint-disable-line react-hooks/exhaustive-deps

    /** Semestry seřazené podle pořadí (order) vzestupně */
    const sortedSemesters = [...localSemesters].sort((a, b) => {
        // parseInt pro případ, že order je string
        const orderA = parseInt(a.order, 10) || 0;
        const orderB = parseInt(b.order, 10) || 0;
        return orderA - orderB; // Vzestupně: 1, 2, 3...
    });

    /** Nejvyšší aktuální pořadí - pro určení pořadí nového semestru */
    // reduce projde všechny semestry a najde maximum z order hodnot
    const maxOrder = sortedSemesters.reduce((max, s) => Math.max(max, s.order || 0), 0);

    // ═══════════════════════════════════════════════════════════════════════
    // HANDLERS
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Přidá nový semestr s automaticky generovaným UUID.
     * Nový semestr dostane pořadí maxOrder + 1 a flag _action: 'create'.
     * Nepřidá semestr, pokud byl dosažen MAX_SEMESTERS.
     */
    const handleAddNewSemester = useCallback(() => {
        if (maxOrder >= MAX_SEMESTERS) {
            return;
        }

        const newSemester = {
            id: generateUUID(),
            order: maxOrder + 1,
            subjectId: subjectId,
            _action: 'create' // Flag pro EditMode - tento semestr je nový
        };

        const newList = [...localSemesters, newSemester];
        setLocalSemesters(newList);
        onSemestersChange(newList);
    }, [localSemesters, maxOrder, subjectId, onSemestersChange]);

    /**
     * Zobrazí potvrzovací dialog pro smazání semestru.
     * @param {string} semesterId - UUID semestru ke smazání
     */
    const showDeleteConfirmation = useCallback((semesterId) => {
        const semester = localSemesters.find(s => s.id === semesterId);
        setDeleteConfirmation({
            show: true,
            semesterId,
            semesterOrder: semester?.order
        });
    }, [localSemesters]);

    /**
     * Zavře potvrzovací dialog bez provedení akce.
     */
    const cancelDeleteConfirmation = useCallback(() => {
        setDeleteConfirmation({
            show: false,
            semesterId: null,
            semesterOrder: null
        });
    }, []);

    /**
     * Odebere semestr z lokálního seznamu a přečísluje pořadí zbývajících.
     * Volá se po potvrzení v dialogu.
     * POZNÁMKA: Nemazání na serveru - to zajišťuje EditMode.
     * @param {string} semesterId - UUID semestru k odebrání
     */
    const handleRemoveSemester = useCallback((semesterId) => {
        // Filtrujeme - necháme jen semestry s jiným ID
        const filtered = localSemesters.filter(s => s.id !== semesterId);

        // Seřadíme podle aktuálního pořadí a přečíslujeme od 1
        const renumbered = filtered
            .sort((a, b) => (parseInt(a.order, 10) || 0) - (parseInt(b.order, 10) || 0))
            .map((semester, index) => ({
                ...semester,
                order: index + 1
            }));

        setLocalSemesters(renumbered);
        // Propagace změny do nadřazené komponenty (EditMode)
        onSemestersChange(renumbered);
        // Zavření potvrzovacího dialogu
        setDeleteConfirmation({
            show: false,
            semesterId: null,
            semesterOrder: null
        });
    }, [localSemesters, onSemestersChange]);

    /**
     * Posune semestr nahoru v pořadí (swap s předchozím).
     * @param {number} index - Index semestru v seřazeném poli
     */
    const handleMoveUp = useCallback((index) => {
        if (index <= 0) return;

        const newSorted = [...sortedSemesters];
        const currentOrder = newSorted[index].order;
        const previousOrder = newSorted[index - 1].order;

        // Swap pořadí mezi aktuálním a předchozím semestrem
        newSorted[index] = { ...newSorted[index], order: previousOrder };
        newSorted[index - 1] = { ...newSorted[index - 1], order: currentOrder };

        setLocalSemesters(newSorted);
        onSemestersChange(newSorted);
    }, [sortedSemesters, onSemestersChange]);

    /**
     * Posune semestr dolů v pořadí (swap s následujícím).
     * @param {number} index - Index semestru v seřazeném poli
     */
    const handleMoveDown = useCallback((index) => {
        if (index >= sortedSemesters.length - 1) return;

        const newSorted = [...sortedSemesters];
        const currentOrder = newSorted[index].order;
        const nextOrder = newSorted[index + 1].order;

        // Swap pořadí mezi aktuálním a následujícím semestrem
        newSorted[index] = { ...newSorted[index], order: nextOrder };
        newSorted[index + 1] = { ...newSorted[index + 1], order: currentOrder };

        setLocalSemesters(newSorted);
        onSemestersChange(newSorted);
    }, [sortedSemesters, onSemestersChange]);

    // ═══════════════════════════════════════════════════════════════════════
    // RENDER
    // ═══════════════════════════════════════════════════════════════════════

    return (
        <div className="mb-3">
            {/* Label wrapper - poskytuje jednotný vzhled s ostatními poli formuláře */}
            <Label id="semesters" title="Semestry">
                {/* Podmíněné renderování: tabulka nebo prázdný stav */}
                {sortedSemesters.length > 0 ? (
                    <div className="mb-3">
                        <table className="table table-sm table-bordered">
                            <thead className="table-light">
                                <tr>
                                    <th style={{ width: '70px' }}>Pořadí</th>
                                    <th style={{ width: '140px' }}>Název</th>
                                    <th>ID</th>
                                    <th style={{ width: '120px' }}>Akce</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedSemesters.map((semester, index) => (
                                    <tr key={semester.id}>
                                        <td>{semester.order}</td>
                                        <td>{getSemesterName(semester.order)}</td>
                                        <td><small className="text-muted">{semester.id}</small></td>
                                        <td>
                                            <div className="btn-group btn-group-sm">
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-secondary"
                                                    onClick={() => handleMoveUp(index)}
                                                    disabled={disabled || index === 0}
                                                    title="Posunout nahoru"
                                                >
                                                    ↑
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-secondary"
                                                    onClick={() => handleMoveDown(index)}
                                                    disabled={disabled || index === sortedSemesters.length - 1}
                                                    title="Posunout dolů"
                                                >
                                                    ↓
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-danger"
                                                    onClick={() => showDeleteConfirmation(semester.id)}
                                                    disabled={disabled}
                                                    title="Odebrat semestr"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-muted mb-3">Žádné semestry</div>
                )}

                {/* Tlačítko pro vytvoření nového semestru */}
                <button
                    type="button"
                    className="btn btn-sm btn-success"
                    onClick={handleAddNewSemester}
                    disabled={disabled || maxOrder >= MAX_SEMESTERS}
                    title={maxOrder >= MAX_SEMESTERS ? `Dosažen maximální počet semestrů (${MAX_SEMESTERS})` : ''}
                >
                    + Přidat nový semestr (pořadí: {maxOrder + 1})
                </button>
                {maxOrder >= MAX_SEMESTERS && (
                    <div className="alert alert-warning mt-2 mb-0">
                        <small>
                            Dosažen maximální počet semestrů ({MAX_SEMESTERS}). Nelze přidat další semestry.
                        </small>
                    </div>
                )}
            </Label>

            {/* Potvrzovací modal pro smazání semestru */}
            {/* Bootstrap modal - ručně řízen stavem (ne data-bs-toggle) */}
            {deleteConfirmation.show && (
                <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Potvrzení smazání</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={cancelDeleteConfirmation}
                                    aria-label="Zavřít"
                                />
                            </div>
                            <div className="modal-body">
                                <p>
                                    Opravdu chcete smazat semestr <strong>#{deleteConfirmation.semesterOrder}</strong>?
                                </p>
                                <div className="alert alert-warning mb-0">
                                    <strong>Upozornění:</strong> Pokud semestr obsahuje klasifikace nebo jiná data,
                                    smazání se nepodaří a bude nutné nejprve odstranit všechna související data.
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={cancelDeleteConfirmation}
                                >
                                    Zrušit
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-danger"
                                    onClick={() => handleRemoveSemester(deleteConfirmation.semesterId)}
                                >
                                    Smazat semestr
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
