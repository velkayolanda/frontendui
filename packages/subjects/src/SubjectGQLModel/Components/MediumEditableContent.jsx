import { Input } from "../../../../_template/src/Base/FormControls/Input"
import { Label } from "../../../../_template/src/Base/FormControls/Label"
import { ProgramSelect } from "./ProgramSelect"

/**
 * Komponenta pro zobrazení editovatelného obsahu entity Subject.
 *
 * Zobrazuje formulář s poli:
 * - Program (select s výběrem z dostupných programů)
 * - Název (textové pole)
 * - Anglický název (textové pole)
 * - Popis (textarea)
 * - Anglický popis (textarea)
 *
 * Komponenta sama neřeší ukládání - pouze předává události onChange/onBlur
 * nadřazené komponentě (např. ConfirmEdit, LiveEdit, SubjectEditForm).
 *
 * @component
 * @param {Object} props
 * @param {Object} props.item - Objekt entity Subject s vlastnostmi name, nameEn, description, descriptionEn, programId
 * @param {Function} [props.onChange] - Callback volaný při změně hodnoty pole (event s target.id a target.value)
 * @param {Function} [props.onBlur] - Callback volaný při opuštění pole
 * @param {React.ReactNode} [props.children] - Další obsah zobrazený pod formulářem
 *
 * @example
 * <MediumEditableContent
 *   item={subject}
 *   onChange={(e) => console.log(e.target.id, e.target.value)}
 * />
 */
export const MediumEditableContent = ({ item, onChange=(e)=>null, onBlur=(e)=>null, children }) => {
    /**
     * Speciální handler pro ProgramSelect, který transformuje hodnotu
     * na standardní event objekt očekávaný onChange.
     */
    const handleProgramChange = (programId) => {
        onChange({ target: { id: 'programId', value: programId } })
    }

    return (
        <>
            <div className="mb-3" label ="Program">
                <label htmlFor="programId" className="form-label">Program</label>
                <ProgramSelect
                    id="programId"
                    value={item?.programId || ""}
                    onChange={handleProgramChange}
                />
            </div>
            <Input id="name" label="Název" className="form-control"
                   value={item?.name || ""} onChange={onChange} onBlur={onBlur} />
            <Input id="nameEn" label="Anglický název" className="form-control"
                   value={item?.nameEn || ""} onChange={onChange} onBlur={onBlur} />

            <Label id="description" title="Popis">
                <textarea
                    id="description"
                    className="form-control"
                    rows={4}
                    value={item?.description || ""}
                    onChange={onChange}
                    onBlur={onBlur}
                />
            </Label>

            <Label id="descriptionEn" title="Anglický popis">
                <textarea
                    id="descriptionEn"
                    className="form-control"
                    rows={4}
                    value={item?.descriptionEn || ""}
                    onChange={onChange}
                    onBlur={onBlur}
                />
            </Label>

            {children}
        </>
    )
}
