import { Input } from "@hrbolek/uoisfrontend-shared"

export const FieldText = ({digitalsubmissionfield, onChange=(e)=>null, onBlur=(e)=>null, children}) => {
    const label = digitalsubmissionfield?.field?.label
    return (
        <>           
            <Input id={"value"} type={"text"} label={label} className="form-control" defaultValue={digitalsubmissionfield?.value|| "Název"} onChange={onChange} onBlur={onBlur}>
                {children}
            </Input>
        </>
    )
}
