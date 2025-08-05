import { FieldCheckbox } from "./FieldCheckbox"
import { FieldDateTime } from "./FieldDateTime"
import { FieldNumber } from "./FieldNumber"
import { FieldText } from "./FieldText"

const typemap = {
    "cc335bb5-4e4e-40ce-8dc1-e7bfedf4d3cf": FieldText,
    "e8559764-38de-413d-8378-822bc31cdbdd": FieldNumber,
    "eed38692-157c-479c-97f6-eafe244acd1d": FieldDateTime,
    "8c4bc85a-39ad-4a9b-a36f-706f404cdadd": FieldCheckbox
}


export const FieldProxy = ({digitalsubmissionfield, onChange=(e)=>null, onBlur=(e)=>null, children}) => {
    const Component = typemap[digitalsubmissionfield?.field?.typeId] ?? FieldText
    console.log("FieldProxy.typeId", digitalsubmissionfield?.field?.typeId, Component)
    return (
        <Component digitalsubmissionfield={digitalsubmissionfield} onChange={onChange} onBlur={onBlur}>
            {children}
        </Component>
    )
}
