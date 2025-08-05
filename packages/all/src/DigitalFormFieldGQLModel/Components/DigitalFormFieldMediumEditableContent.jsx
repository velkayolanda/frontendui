import { Input, Label, Select, SelectInput } from "@hrbolek/uoisfrontend-shared"

/**
 * A component that displays medium-level content for an digitalformfield entity.
 *
 * This component renders a label "DigitalFormFieldMediumContent" followed by a serialized representation of the `digitalformfield` object
 * and any additional child content. It is designed to handle and display information about an digitalformfield entity object.
 *
 * @component
 * @param {Object} props - The properties for the DigitalFormFieldMediumContent component.
 * @param {Object} props.digitalformfield - The object representing the digitalformfield entity.
 * @param {string|number} props.digitalformfield.id - The unique identifier for the digitalformfield entity.
 * @param {string} props.digitalformfield.name - The name or label of the digitalformfield entity.
 * @param {React.ReactNode} [props.children=null] - Additional content to render after the serialized `digitalformfield` object.
 *
 * @returns {JSX.Element} A JSX element displaying the entity's details and optional content.
 *
 * @example
 * // Example usage:
 * const digitalformfieldEntity = { id: 123, name: "Sample Entity" };
 * 
 * <DigitalFormFieldMediumContent digitalformfield={digitalformfieldEntity}>
 *   <p>Additional information about the entity.</p>
 * </DigitalFormFieldMediumContent>
 */
export const DigitalFormFieldMediumEditableContent = ({digitalformfield, onChange=(e)=>null, onBlur=(e)=>null, children}) => {
    return (
        <>           
            <Input id={"name"} label={"Název"} className="form-control" defaultValue={digitalformfield?.name|| "Název"} onChange={onChange} onBlur={onBlur} />
            <Input id={"label"} label={"Titulek"} className="form-control" defaultValue={digitalformfield?.label|| "Název"} onChange={onChange} onBlur={onBlur} />
            <Input id={"label_en"} label={"Anglický titulek"} className="form-control" defaultValue={digitalformfield?.label_en|| "Name"} onChange={onChange} onBlur={onBlur} />
            <Input id={"description"} label={"Popisek"} className="form-control" defaultValue={digitalformfield?.description|| "Description"} onChange={onChange} onBlur={onBlur} />
            <Input id={"order"} type="number" label={"Pořadí"} className="form-control" defaultValue={digitalformfield?.order|| 1} onChange={onChange} onBlur={onBlur} />
            <Input id={"required"} type="text" label={"Nutná"} className="form-control" defaultValue={digitalformfield?.required|| false} onChange={onChange} onBlur={onBlur} />

            <Select id={"typeId"} label={"Typ položky"} className="form-control" defaultValue={digitalformfield?.typeId}  onChange={onChange} onBlur={onBlur} >
                <option value="e8559764-38de-413d-8378-822bc31cdbdd">Číslo</option>
                <option value="eed38692-157c-479c-97f6-eafe244acd1d">Datum</option>
                <option value="cc335bb5-4e4e-40ce-8dc1-e7bfedf4d3cf">Text</option>
                <option value="8c4bc85a-39ad-4a9b-a36f-706f404cdadd">Checkbox</option>
            </Select>
            {children}
        </>
    )
}
