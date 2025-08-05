import { Input } from "@hrbolek/uoisfrontend-shared"
import { FieldProxy } from "../_FieldTypeRegister/FieldProxy"

/**
 * A component that displays medium-level content for an digitalsubmissionfield entity.
 *
 * This component renders a label "DigitalSubmissionFieldMediumContent" followed by a serialized representation of the `digitalsubmissionfield` object
 * and any additional child content. It is designed to handle and display information about an digitalsubmissionfield entity object.
 *
 * @component
 * @param {Object} props - The properties for the DigitalSubmissionFieldMediumContent component.
 * @param {Object} props.digitalsubmissionfield - The object representing the digitalsubmissionfield entity.
 * @param {string|number} props.digitalsubmissionfield.id - The unique identifier for the digitalsubmissionfield entity.
 * @param {string} props.digitalsubmissionfield.name - The name or label of the digitalsubmissionfield entity.
 * @param {React.ReactNode} [props.children=null] - Additional content to render after the serialized `digitalsubmissionfield` object.
 *
 * @returns {JSX.Element} A JSX element displaying the entity's details and optional content.
 *
 * @example
 * // Example usage:
 * const digitalsubmissionfieldEntity = { id: 123, name: "Sample Entity" };
 * 
 * <DigitalSubmissionFieldMediumContent digitalsubmissionfield={digitalsubmissionfieldEntity}>
 *   <p>Additional information about the entity.</p>
 * </DigitalSubmissionFieldMediumContent>
 */
export const DigitalSubmissionFieldMediumEditableContent = ({digitalsubmissionfield, onChange=(e)=>null, onBlur=(e)=>null, children}) => {
    // const label = digitalsubmissionfield?.field?.label
    // return (
    //     <>           
    //         <Input id={"value"} label={label} className="form-control" defaultValue={digitalsubmissionfield?.name|| "Název"} onChange={onChange} onBlur={onBlur}>
    //             {children}
    //         </Input>
    //     </>
    // )
    return (
        <FieldProxy digitalsubmissionfield={digitalsubmissionfield} onChange={onChange} onBlur={onBlur}>
            {children}
        </FieldProxy>
    )
}
