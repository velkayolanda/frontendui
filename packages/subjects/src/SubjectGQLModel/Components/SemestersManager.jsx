import React, { useState, useCallback, useEffect } from "react";
import { Label } from "../../../../_template/src/Base/FormControls/Label";

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
 * komponenta (SubjectEditForm) po kliknutí na tlačítko "Uložit".
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


    /**
     * Synchronizace lokálního stavu s props.
     */
    useEffect(() => {
        setLocalSemesters([...(semesters || [])]);
    }, [semesters]);

    // Seřazení semestrů podle pořadí (order)
    const sortedSemesters = [...localSemesters].sort((a, b) => (a.order || 0) - (b.order || 0));

    // Nejvyšší pořadí - pro určení pořadí nově přidaného semestru
    const maxOrder = sortedSemesters.reduce((max, s) => Math.max(max, s.order || 0), 0);

    /**
     * Generování UUID pro nový semestr.
     */
    const generateUUID = () => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    };

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
     * Odebrání semestru z lokálního seznamu.
     */
    const handleRemoveSemester = useCallback((semesterId) => {
        const newList = localSemesters.filter(s => s.id !== semesterId);
        setLocalSemesters(newList);
        onSemestersChange(newList);
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
                                    <th>ID</th>
                                    <th style={{ width: '120px' }}>Akce</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedSemesters.map((semester, index) => (
                                    <tr key={semester.id}>
                                        <td>{semester.order}</td>
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
                                                    onClick={() => handleRemoveSemester(semester.id)}
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
        </div>
    );
};
