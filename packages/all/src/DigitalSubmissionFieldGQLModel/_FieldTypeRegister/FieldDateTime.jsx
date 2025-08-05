import { Input } from "@hrbolek/uoisfrontend-shared"

export const FieldDateTime = ({digitalsubmissionfield, onChange=(e)=>null, onBlur=(e)=>null, children}) => {
    const label = digitalsubmissionfield?.field?.label
    return (
        <>           
            <Input id={"value"} type="datetime-local" label={label} className="form-control" defaultValue={digitalsubmissionfield?.value|| "Název"} onChange={onChange} onBlur={onBlur}>
                {children}
            </Input>
        </>
    )
}
