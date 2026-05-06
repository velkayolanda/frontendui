import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useGQLClient } from "../../../../dynamic/src/Store/RootProviders";
import { ProgramPageAsyncAction } from "../Queries";

/**
 * A select component for choosing a Program.
 * Fetches programs from GraphQL and displays them in a dropdown.
 */
export const ProgramSelect = ({
    value,
    onChange,
    skip = 0,
    limit = 100,
    ...selectProps
}) => {
    const [programs, setPrograms] = useState([]);
    const [loading, setLoading] = useState(true);
    const dispatch = useDispatch();
    const gqlClient = useGQLClient();

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
