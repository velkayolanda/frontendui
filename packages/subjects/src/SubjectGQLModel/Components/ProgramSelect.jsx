import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useGQLClient } from "../../../../dynamic/src/Store/RootProviders";
import { ProgramPageAsyncAction } from "../Queries";

/**
 * Select komponenta pro výběr programu.
 *
 * Při prvním renderování načte seznam programů z GraphQL backendu
 * pomocí ProgramPageAsyncAction a zobrazí je v dropdown selectu.
 *
 * Stavy komponenty:
 * - Loading: zobrazí disabled select s textem "Načítání programů..."
 * - Loaded: zobrazí select s možnostmi (první prázdná možnost + seznam programů)
 *
 * @component
 * @param {Object} props
 * @param {string} [props.value] - ID aktuálně vybraného programu
 * @param {Function} props.onChange - Callback volaný při změně výběru (předává ID programu)
 * @param {number} [props.skip=0] - Počet programů k přeskočení (pro stránkování)
 * @param {number} [props.limit=100] - Maximální počet programů k načtení
 * @param {Object} [props.selectProps] - Další props předané do <select> elementu
 *
 * @example
 * <ProgramSelect
 *   value={selectedProgramId}
 *   onChange={(programId) => setSelectedProgramId(programId)}
 * />
 */
export const ProgramSelect = ({
    value,
    onChange,
    skip = 0,
    limit = 100,
    ...selectProps
}) => {
    // Lokální stav pro seznam programů a indikátor načítání
    const [programs, setPrograms] = useState([]);
    const [loading, setLoading] = useState(true);
    const dispatch = useDispatch();
    const gqlClient = useGQLClient();

    /**
     * Effect pro načtení programů při prvním renderování.
     * Volá ProgramPageAsyncAction a ukládá výsledek do lokálního stavu.
     */
    useEffect(() => {
        const fetchPrograms = async () => {
            try {
                setLoading(true);
                const result = await dispatch(ProgramPageAsyncAction({ skip, limit }, gqlClient));
                const data = result?.data;

                if (data?.programPage) {
                    setPrograms(data.programPage);
                } else {
                    console.warn("ProgramSelect: No programs found in response", result);
                }
            } catch (error) {
                console.error("ProgramSelect: Error fetching programs:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPrograms();
    }, [dispatch, gqlClient, skip, limit]);

    /**
     * Handler pro změnu výběru v selectu.
     * Předává pouze hodnotu (ID programu) do onChange callbacku.
     */
    const handleChange = (event) => {
        if (onChange) {
            onChange(event.target.value);
        }
    };

    if (loading) {
        return (
            <select className="form-select" disabled {...selectProps}>
                <option>Načítání programů...</option>
            </select>
        );
    }

    return (
        <select
            className="form-select"
            onChange={handleChange}
            value={value || ""}
            {...selectProps}
        >
            <option value="">-- Vyberte program --</option>
            {programs.map((program) => (
                <option key={program.id} value={program.id}>
                    {program.name || program.nameEn || program.id}
                </option>
            ))}
        </select>
    );
};
