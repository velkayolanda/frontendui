import { Input } from "../../../../_template/src/Base/FormControls/Input"
import { ProgramSelect } from "./ProgramSelect"

/**
 * A component that displays medium-level editable content for a Subject entity.
 *
 * @component
 * @param {Object} props - The properties for the MediumEditableContent component.
 * @param {Object} props.item - The object representing the subject entity.
 * @param {Function} props.onChange - Callback when field changes
 * @param {Function} props.onBlur - Callback when field loses focus
 * @param {React.ReactNode} [props.children=null] - Additional content to render.
 *
 * @returns {JSX.Element} A JSX element displaying editable fields.
 */
export const MediumEditableContent = ({ item, onChange=(e)=>null, onBlur=(e)=>null, children }) => {
    const handleProgramChange = (programId) => {
        // Simulate onChange event for programId
        onChange({ target: { id: 'programId', value: programId } })
    }

    return (
        <>
            <div className="mb-3">
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
            <Input id="description" label="Popis" className="form-control"
                   value={item?.description || ""} onChange={onChange} onBlur={onBlur} />
            <Input id="descriptionEn" label="Anglický popis" className="form-control"
                   value={item?.descriptionEn || ""} onChange={onChange} onBlur={onBlur} />
            {children}
        </>
    )
}
