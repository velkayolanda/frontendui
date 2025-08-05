import { Input } from "@hrbolek/uoisfrontend-shared"

export const FieldCheckbox = ({digitalsubmissionfield, onChange=(e)=>null, onBlur=(e)=>null, children}) => {
    const label = digitalsubmissionfield?.field?.label
    return (
        <>           
            <Input id={"value"} 
                type="checkbox" 
                label={label} 
                // className="form-control" 
                checked={digitalsubmissionfield?.value} 
                // checked={true} 
                // defaultValue={digitalsubmissionfield?.value|| "Název"} 
                onChange={onChange} 
                onBlur={onBlur}
            >
                {children}
            </Input>
        </>
    )
}
