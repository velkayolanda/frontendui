import { Input, SimpleCardCapsule } from "@hrbolek/uoisfrontend-shared"
import { ExamMediumCard } from "./ExamMediumCard"
import { ExamButton } from "./ExamCUDButton"

/**
 * A component that displays medium-level content for an exam entity.
 *
 * This component renders a label "ExamMediumContent" followed by a serialized representation of the `exam` object
 * and any additional child content. It is designed to handle and display information about an exam entity object.
 *
 * @component
 * @param {Object} props - The properties for the ExamMediumContent component.
 * @param {Object} props.exam - The object representing the exam entity.
 * @param {string|number} props.exam.id - The unique identifier for the exam entity.
 * @param {string} props.exam.name - The name or label of the exam entity.
 * @param {React.ReactNode} [props.children=null] - Additional content to render after the serialized `exam` object.
 *
 * @returns {JSX.Element} A JSX element displaying the entity's details and optional content.
 *
 * @example
 * // Example usage:
 * const examEntity = { id: 123, name: "Sample Entity" };
 * 
 * <ExamMediumContent exam={examEntity}>
 *   <p>Additional information about the entity.</p>
 * </ExamMediumContent>
 */
export const ExamMediumEditableContent = ({exam, onChange=(e)=>null, onBlur=(e)=>null, children}) => {
    const {parts=[]} = exam
    return (
        <>           
            <Input id={"name"} label={"Název"} className="form-control" defaultValue={exam?.name|| "Název"} onChange={onChange} onBlur={onBlur} />
            <Input id={"name_en"} label={"Anglický název"} className="form-control" defaultValue={exam?.name_en|| "Anglický název"} onChange={onChange} onBlur={onBlur} />
            <Input id={"description"} label={"Popis"} className="form-control" defaultValue={exam?.description|| "Popis"} onChange={onChange} onBlur={onBlur} />
            <Input id={"descriptionEn"} label={"Anglický popis"} className="form-control" defaultValue={exam?.description|| "Popis"} onChange={onChange} onBlur={onBlur} />
            <Input id={"minScore"} type={"number"} label={"Minimální skóre"} className="form-control" defaultValue={exam?.minScore|| 50} onChange={onChange} onBlur={onBlur} />
            <Input id={"maxScore"} type={"number"} label={"Maximální skóre"} className="form-control" defaultValue={exam?.maxScore|| 100} onChange={onChange} onBlur={onBlur} />
            <SimpleCardCapsule title="Části">
                {parts.map(part => <ExamMediumCard key={part?.id} exam={part} >
                    <ExamButton className="btn btn-outline-success form-control"
                        operation="U" 
                        exam={part}
                    >   
                        Upravit
                    </ExamButton>
                </ExamMediumCard>)}
                <br/>
                <ExamButton 
                    className="btn btn-outline-success form-control"
                    operation="C" 
                    exam={{parentId: exam?.id}}
                >   
                    Vložit novou část
                </ExamButton>
            </SimpleCardCapsule>
            
            {/* {parts.map(part => <ExamMediumCard key={part?.id} exam={part} />)} */}
            {children}
        </>
    )
}
