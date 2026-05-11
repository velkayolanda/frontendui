import React, { useState, useCallback, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useGQLClient } from "../../../../dynamic/src/Store/RootProviders";
import { Label } from "../../../../_template/src/Base/FormControls/Label";
import { ReadPageAsyncAction as SemesterReadPageAsyncAction } from "../../../../granting2/src/SemesterGQLModel/Queries/ReadPageAsyncAction";

/**
 * SemestersManager - Komponenta pro správu semestrů předmětu (Subject).
 *
 * Tato komponenta umožňuje:
 * - Zobrazit seznam aktuálních semestrů přiřazených k předmětu
 * - Přidat existující semestr z dropdownu všech dostupných semestrů
 * - Odebrat semestr z předmětu
 * - Změnit pořadí semestrů pomocí tlačítek nahoru/dolů
 *
 * DŮLEŽITÉ: Změny se neukládají okamžitě na server!
 * Komponenta pouze upravuje lokální stav a volá callback `onSemestersChange`
 * s novým seznamem semestrů. Skutečné uložení na server provádí nadřazená
 * komponenta (SubjectEditForm) po kliknutí na tlačítko "Uložit".
 *
 * Architektura:
 * 1. Při mountu se načtou všechny dostupné semestry z backendu (semesterPage query)
 * 2. Lokální stav `localSemesters` se synchronizuje s props `semesters`
 * 3. Při každé změně (přidání, odebrání, změna pořadí) se:
 *    - Aktualizuje lokální stav
 *    - Zavolá callback `onSemestersChange` s novým seznamem
 * 4. Nadřazená komponenta pak může zobrazit tlačítko "Uložit" a provést uložení
 *
 * @component
 * @param {Object} props
 * @param {Array} props.semesters - Pole semestrů aktuálně přiřazených k předmětu
 * @param {string} props.subjectId - ID předmětu, ke kterému semestry patří
 * @param {Function} props.onSemestersChange - Callback volaný při změně seznamu semestrů
 *                                             Parametr: nový seznam semestrů (Array)
 * @param {boolean} [props.disabled=false] - Zda je komponenta zakázána (readonly režim)
 *
 * @example
 * <SemestersManager
 *     semesters={subject.semesters}
 *     subjectId={subject.id}
 *     onSemestersChange={(newSemesters) => setDraft({...draft, semesters: newSemesters})}
 * />
 */
export const SemestersManager = ({
    semesters = [],
    subjectId,
    onSemestersChange = () => null,
    disabled = false
}) => {
    const dispatch = useDispatch();
    const gqlClient = useGQLClient();

    // Všechny dostupné semestry načtené z backendu
    const [allSemesters, setAllSemesters] = useState([]);
    // ID vybraného semestru v dropdownu
    const [selectedSemesterId, setSelectedSemesterId] = useState("");
    // Indikátor načítání semestrů
    const [loadingSemesters, setLoadingSemesters] = useState(true);

    // Lokální kopie semestrů pro editaci (synchronizovaná s props)
    const [localSemesters, setLocalSemesters] = useState([]);

    /**
     * Synchronizace lokálního stavu s props.
     * Když se změní props.semesters (např. po uložení), aktualizuje se lokální stav.
     */
    useEffect(() => {
        setLocalSemesters([...(semesters || [])]);
    }, [semesters]);

    /**
     * Načtení všech dostupných semestrů z backendu při mountu komponenty.
     * Používá se pro naplnění dropdownu.
     */
    useEffect(() => {
        const fetchSemesters = async () => {
            try {
                setLoadingSemesters(true);
                const result = await dispatch(SemesterReadPageAsyncAction({ limit: 1000 }, gqlClient));
                const data = result?.data?.semesterPage || result;
                if (Array.isArray(data)) {
                    setAllSemesters(data);
                }
            } catch (err) {
                console.error("Error loading semesters:", err);
            } finally {
                setLoadingSemesters(false);
            }
        };
        fetchSemesters();
    }, [dispatch, gqlClient]);

    // Seřazení semestrů podle pořadí (order)
    const sortedSemesters = [...localSemesters].sort((a, b) => (a.order || 0) - (b.order || 0));

    // Filtrování - zobraz jen semestry, které ještě nejsou přiřazeny k tomuto předmětu
    const availableSemesters = allSemesters.filter(
        sem => !localSemesters.some(s => s.id === sem.id)
    );

    // Nejvyšší pořadí - pro určení pořadí nově přidaného semestru
    const maxOrder = sortedSemesters.reduce((max, s) => Math.max(max, s.order || 0), 0);

    /**
     * Přidání semestru do lokálního seznamu.
     * Nový semestr dostane pořadí maxOrder + 1 (přidá se na konec).
     * Označení _action: 'add' slouží pro identifikaci při ukládání.
     */
    const handleAddSemester = useCallback(() => {
        if (!selectedSemesterId) return;

        const semesterToAdd = allSemesters.find(s => s.id === selectedSemesterId);
        if (!semesterToAdd) return;

        const newSemester = {
            ...semesterToAdd,
            order: maxOrder + 1,
            subjectId: subjectId,
            _action: 'add' // Označení pro pozdější uložení
        };

        const newList = [...localSemesters, newSemester];
        setLocalSemesters(newList);
        setSelectedSemesterId("");
        onSemestersChange(newList);
    }, [selectedSemesterId, allSemesters, localSemesters, maxOrder, subjectId, onSemestersChange]);

    /**
     * Odebrání semestru z lokálního seznamu.
     * Semestr se pouze odstraní ze seznamu, skutečné odpojení od předmětu
     * (nastavení subjectId na null) provede SubjectEditForm při uložení.
     */
    const handleRemoveSemester = useCallback((semesterId) => {
        const newList = localSemesters.filter(s => s.id !== semesterId);
        setLocalSemesters(newList);
        onSemestersChange(newList);
    }, [localSemesters, onSemestersChange]);

    /**
     * Přesun semestru nahoru (swap s předchozím).
     * Prohodí hodnoty order mezi aktuálním a předchozím semestrem.
     */
    const handleMoveUp = useCallback((index) => {
        if (index <= 0) return;

        const newSorted = [...sortedSemesters];
        const currentOrder = newSorted[index].order;
        const previousOrder = newSorted[index - 1].order;

        // Prohoď pořadí
        newSorted[index] = { ...newSorted[index], order: previousOrder };
        newSorted[index - 1] = { ...newSorted[index - 1], order: currentOrder };

        setLocalSemesters(newSorted);
        onSemestersChange(newSorted);
    }, [sortedSemesters, onSemestersChange]);

    /**
     * Přesun semestru dolů (swap s následujícím).
     * Prohodí hodnoty order mezi aktuálním a následujícím semestrem.
     */
    const handleMoveDown = useCallback((index) => {
        if (index >= sortedSemesters.length - 1) return;

        const newSorted = [...sortedSemesters];
        const currentOrder = newSorted[index].order;
        const nextOrder = newSorted[index + 1].order;

        // Prohoď pořadí
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
                                    <th>ID</th>
                                    <th style={{ width: '70px' }}>Pořadí</th>
                                    <th style={{ width: '120px' }}>Akce</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedSemesters.map((semester, index) => (
                                    <tr key={semester.id}>
                                        <td><small>{semester.id}</small></td>
                                        <td>{semester.order}</td>
                                        <td>
                                            <div className="btn-group btn-group-sm">
                                                {/* Tlačítko pro přesun nahoru */}
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-secondary"
                                                    onClick={() => handleMoveUp(index)}
                                                    disabled={disabled || index === 0}
                                                    title="Posunout nahoru"
                                                >
                                                    ↑
                                                </button>
                                                {/* Tlačítko pro přesun dolů */}
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-secondary"
                                                    onClick={() => handleMoveDown(index)}
                                                    disabled={disabled || index === sortedSemesters.length - 1}
                                                    title="Posunout dolů"
                                                >
                                                    ↓
                                                </button>
                                                {/* Tlačítko pro odebrání */}
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

                {/* Karta s dropdownem pro přidání semestru */}
                <div className="card">
                    <div className="card-header py-2">
                        <small>Přidat semestr</small>
                    </div>
                    <div className="card-body py-2">
                        <div className="row g-2 align-items-end">
                            <div className="col">
                                {loadingSemesters ? (
                                    <select className="form-select form-select-sm" disabled>
                                        <option>Načítání semestrů...</option>
                                    </select>
                                ) : (
                                    <select
                                        className="form-select form-select-sm"
                                        value={selectedSemesterId}
                                        onChange={(e) => setSelectedSemesterId(e.target.value)}
                                        disabled={disabled}
                                    >
                                        <option value="">-- Vyberte semestr --</option>
                                        {availableSemesters.map((semester) => (
                                            <option key={semester.id} value={semester.id}>
                                                {semester.id} {semester.order ? `(pořadí: ${semester.order})` : ''}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>
                            <div className="col-auto">
                                <button
                                    type="button"
                                    className="btn btn-sm btn-primary"
                                    onClick={handleAddSemester}
                                    disabled={disabled || !selectedSemesterId}
                                >
                                    Přidat
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </Label>
        </div>
    );
};
