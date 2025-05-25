import { PersonFill } from "react-bootstrap-icons"
import { ExamLink } from "./ExamLink"
import { ExamCardCapsule } from "./ExamCardCapsule"
import { ExamMediumContent } from "./ExamMediumContent"

/**
 * A card component that displays detailed content for an exam entity.
 *
 * This component combines `ExamCardCapsule` and `ExamMediumContent` to create a card layout
 * with a title and medium-level content. The title includes a `PersonFill` icon and a link to
 * the exam entity's details, while the body displays serialized details of the entity along
 * with any additional children passed to the component.
 *
 * @component
 * @param {Object} props - The properties for the ExamMediumCard component.
 * @param {Object} props.exam - The object representing the exam entity.
 * @param {string|number} props.exam.id - The unique identifier for the exam entity.
 * @param {string} props.exam.name - The name or label of the exam entity.
 * @param {React.ReactNode} [props.children=null] - Additional content to render inside the card body.
 *
 * @returns {JSX.Element} A JSX element combining a card with a title and detailed content.
 *
 * @example
 * // Example usage:
 * const examEntity = { id: 123, name: "Sample Entity" };
 * 
 * <ExamMediumCard exam={examEntity}>
 *   <p>Additional details or actions for the entity.</p>
 * </ExamMediumCard>
 */
export const ExamMediumCard = ({exam, children}) => {
    return (
        <ExamCardCapsule title={<><PersonFill /> <ExamLink exam={exam} /></>}>
            <ExamMediumContent exam={exam}>
                {children}
            </ExamMediumContent>
        </ExamCardCapsule>
    )
}
