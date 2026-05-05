import { useState, useCallback } from "react";
import { LoadingSpinner } from "@hrbolek/uoisfrontend-shared";
import { gqlClient } from "../../../../dynamic/src/Core/gqlClient2";

/**
 * Simple direct edit form for Subject entity.
 * Manages its own state and directly calls the mutation.
 */
const UpdateMutationQuery = `
mutation subjectUpdate(
    $id: UUID!
    $lastchange: DateTime!
    $name: String
    $nameEn: String
    $description: String
    $descriptionEn: String
) {
  subjectUpdate(
    subject: {
      id: $id
      lastchange: $lastchange
      name: $name
      nameEn: $nameEn
      description: $description
      descriptionEn: $descriptionEn
    }
  ) {
    ... on SubjectGQLModel {
      __typename
      id
      lastchange
      name
      nameEn
      description
      descriptionEn
    }
    ... on SubjectGQLModelUpdateError {
      __typename
      msg
      failed
    }
  }
}
`;

export const SubjectEditForm = ({ item, children }) => {

    // Local state for editable fields
    const [name, setName] = useState(item?.name || "");
    const [nameEn, setNameEn] = useState(item?.nameEn || "");
    const [description, setDescription] = useState(item?.description || "");
    const [descriptionEn, setDescriptionEn] = useState(item?.descriptionEn || "");

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [saved, setSaved] = useState(false);

    // Check if anything changed
    const isDirty =
        name !== (item?.name || "") ||
        nameEn !== (item?.nameEn || "") ||
        description !== (item?.description || "") ||
        descriptionEn !== (item?.descriptionEn || "");

    const handleSave = useCallback(async () => {
        if (!isDirty) return;

        setSaving(true);
        setError(null);
        setSaved(false);

        try {
            const variables = {
                id: item.id,
                lastchange: item.lastchange,
                name,
                nameEn,
                description,
                descriptionEn,
            };

            console.log("SubjectEditForm saving variables:", JSON.stringify(variables, null, 2));

            // Direct GraphQL call
            const response = await gqlClient.request({
                query: UpdateMutationQuery,
                variables: variables
            });

            console.log("SubjectEditForm response:", JSON.stringify(response, null, 2));

            const result = response?.data?.subjectUpdate;

            // Check for error response
            const isError = result?.failed ||
                            result?.__typename?.includes("Error");

            if (result && !isError) {
                setSaved(true);
                // Reload page to show updated data
                setTimeout(() => window.location.reload(), 500);
            } else {
                const errorMsg = result?.msg || "Uložení selhalo";
                setError(errorMsg);
            }
        } catch (err) {
            console.error("SubjectEditForm error:", err);
            setError(err.message || "Chyba při ukládání");
        } finally {
            setSaving(false);
        }
    }, [item, name, nameEn, description, descriptionEn, isDirty]);

    const handleCancel = useCallback(() => {
        setName(item?.name || "");
        setNameEn(item?.nameEn || "");
        setDescription(item?.description || "");
        setDescriptionEn(item?.descriptionEn || "");
        setError(null);
        setSaved(false);
    }, [item]);

    return (
        <>
            <div className="mb-3">
                <label htmlFor="name" className="form-label">Název</label>
                <input
                    id="name"
                    type="text"
                    className="form-control"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
            </div>

            <div className="mb-3">
                <label htmlFor="nameEn" className="form-label">Anglický název</label>
                <input
                    id="nameEn"
                    type="text"
                    className="form-control"
                    value={nameEn}
                    onChange={(e) => setNameEn(e.target.value)}
                />
            </div>

            <div className="mb-3">
                <label htmlFor="description" className="form-label">Popis</label>
                <textarea
                    id="description"
                    className="form-control"
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
            </div>

            <div className="mb-3">
                <label htmlFor="descriptionEn" className="form-label">Anglický popis</label>
                <textarea
                    id="descriptionEn"
                    className="form-control"
                    rows={3}
                    value={descriptionEn}
                    onChange={(e) => setDescriptionEn(e.target.value)}
                />
            </div>

            {saving && <LoadingSpinner />}
            {saved && <div className="alert alert-success py-2">Uloženo</div>}
            {error && <div className="alert alert-danger py-2">{error}</div>}

            <div className="d-flex gap-2 mt-3">
                <button
                    className="btn btn-outline-secondary flex-grow-1"
                    onClick={handleCancel}
                    disabled={!isDirty || saving}
                >
                    Zrušit
                </button>
                <button
                    className="btn btn-primary flex-grow-1"
                    onClick={handleSave}
                    disabled={!isDirty || saving}
                >
                    Uložit
                </button>
            </div>

            {children}
        </>
    );
};
