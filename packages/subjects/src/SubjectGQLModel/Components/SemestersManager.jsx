import React, { useState, useCallback, useEffect } from "react";
import { Label } from "../../../../_template/src/Base/FormControls/Label";
import { generateUUID } from "../Tools/generatorUtils";

/**
 * Generuje název semestru podle pořadí.
 * Lichá čísla = zimní semestr, sudá čísla = letní semestr.
 * @param {number} order - Pořadí semestru (1, 2, 3, ...)
 * @returns {string} Název semestru, např. "1. ročník zimní"
 */
const getSemesterName = (order) => {
    const orderNum = parseInt(order, 10) || 0
    const year = Math.ceil(orderNum / 2)
    const isWinter = orderNum % 2 === 1
    return `${year}. ročník ${isWinter ? "zimní" : "letní"}`
}

/**
 * SemestersManager - Komponenta pro správu semestrů předmětu (Subject).
 *
 * Tato komponenta umožňuje:
 * - Zobrazit seznam aktuálních semestrů přiřazených k předmětu
 * - Vytvořit nový semestr s názvem a automaticky generovaným ID
 * - Odebrat semestr z předmětu
 * - Změnit pořadí semestrů pomocí tlačítek nahoru/dolů
 *
 * DŮLEŽITÉ: Změny se neukládají okamžitě na server!
 * Komponenta pouze upravuje lokální stav a volá callback `onSemestersChange`
 * s novým seznamem semestrů. Skutečné uložení na server provádí nadřazená
 * komponenta (EditMode) po kliknutí na tlačítko "Uložit".
 *
 * @component
 * @param {Object} props
 * @param {Array} props.semesters - Pole semestrů aktuálně přiřazených k předmětu
 * @param {string} props.subjectId - ID předmětu, ke kterému semestry patří
 * @param {Function} props.onSemestersChange - Callback volaný při změně seznamu semestrů
 * @param {boolean} [props.disabled=false] - Zda je komponenta zakázána (readonly režim)
 */
export const SemestersManager = ({
    semesters = [],
    subjectId,
    onSemestersChange = () => null,
    disabled = false
}) => {
    // Lokální kopie semestrů pro editaci (synchronizovaná s props)
    const [localSemesters, setLocalSemesters] = useState([]);

    // State for delete confirmation modal
    const [deleteConfirmation, setDeleteConfirmation] = useState({
        show: false,
        semesterId: null,
        semesterOrder: null
    });


    /**
     * Synchronizace lokálního stavu s props.
     * Use JSON.stringify to detect deep changes in semesters array.
     */
    useEffect(() => {
        setLocalSemesters([...(semesters || [])]);
    }, [JSON.stringify(semesters)]);

    // Seřazení semestrů podle pořadí (order) - ensure numeric comparison
    const sortedSemesters = [...localSemesters].sort((a, b) => {
        const orderA = parseInt(a.order, 10) || 0;
        const orderB = parseInt(b.order, 10) || 0;
        return orderA - orderB;
    });

    // Nejvyšší pořadí - pro určení pořadí nově přidaného semestru
    const maxOrder = sortedSemesters.reduce((max, s) => Math.max(max, s.order || 0), 0);

    /**
     * Přidání nově vytvořeného semestru.
     */
    const handleAddNewSemester = useCallback(() => {
        const newSemester = {
            id: generateUUID(),
            order: maxOrder + 1,
            subjectId: subjectId,
            _action: 'create'
        };

        const newList = [...localSemesters, newSemester];
        setLocalSemesters(newList);
        onSemestersChange(newList);
    }, [localSemesters, maxOrder, subjectId, onSemestersChange]);

    /**
     * Zobrazení potvrzovacího dialogu pro smazání semestru.
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
     * Zrušení potvrzovacího dialogu.
     */
    const cancelDeleteConfirmation = useCallback(() => {
        setDeleteConfirmation({
            show: false,
            semesterId: null,
            semesterOrder: null
        });
    }, []);

    /**
     * Odebrání semestru z lokálního seznamu (po potvrzení).
     */
    const handleRemoveSemester = useCallback((semesterId) => {
        const newList = localSemesters.filter(s => s.id !== semesterId);
        setLocalSemesters(newList);
        onSemestersChange(newList);
        // Close confirmation dialog
        setDeleteConfirmation({
            show: false,
            semesterId: null,
            semesterOrder: null
        });
    }, [localSemesters, onSemestersChange]);

    /**
     * Přesun semestru nahoru (swap s předchozím).
     */
    const handleMoveUp = useCallback((index) => {
        if (index <= 0) return;

        const newSorted = [...sortedSemesters];
        const currentOrder = newSorted[index].order;
        const previousOrder = newSorted[index - 1].order;

        newSorted[index] = { ...newSorted[index], order: previousOrder };
        newSorted[index - 1] = { ...newSorted[index - 1], order: currentOrder };

        setLocalSemesters(newSorted);
        onSemestersChange(newSorted);
    }, [sortedSemesters, onSemestersChange]);

    /**
     * Přesun semestru dolů (swap s následujícím).
     */
    const handleMoveDown = useCallback((index) => {
        if (index >= sortedSemesters.length - 1) return;

        const newSorted = [...sortedSemesters];
        const currentOrder = newSorted[index].order;
        const nextOrder = newSorted[index + 1].order;

        newSorted[index] = { ...newSorted[index], order: nextOrder };
        newSorted[index + 1] = { ...newSorted[index + 1], order: currentOrder };

        setLocalSemesters(newSorted);
        onSemestersChange(newSorted);
    }, [sortedSemesters, onSemestersChange]);

    return (
        <div className="mb-3">
            <Label id="semesters" title="Semestry">
                {/* Tabulka existujících semestrů předmětu */}
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
                    disabled={disabled}
                >
                    + Přidat nový semestr (pořadí: {maxOrder + 1})
                </button>
            </Label>

            {/* Delete Confirmation Modal */}
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
