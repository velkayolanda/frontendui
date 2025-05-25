import Row from "react-bootstrap/Row"
import { LeftColumn, MiddleColumn } from "@hrbolek/uoisfrontend-shared"
import { ExamCardCapsule } from "./ExamCardCapsule"
import { ExamMediumCard } from "./ExamMediumCard"

/**
 * A large card component for displaying detailed content and layout for an exam entity.
 *
 * This component wraps an `ExamCardCapsule` with a flexible layout that includes multiple
 * columns. It uses a `Row` layout with a `LeftColumn` for displaying an `ExamMediumCard`
 * and a `MiddleColumn` for rendering additional children.
 *
 * @component
 * @param {Object} props - The properties for the ExamLargeCard component.
 * @param {Object} props.exam - The object representing the exam entity.
 * @param {string|number} props.exam.id - The unique identifier for the exam entity.
 * @param {string} props.exam.name - The name or label of the exam entity.
 * @param {React.ReactNode} [props.children=null] - Additional content to render in the middle column.
 *
 * @returns {JSX.Element} A JSX element combining a large card layout with dynamic content.
 *
 * @example
 * // Example usage:
 * const examEntity = { id: 123, name: "Sample Entity" };
 * 
 * <ExamLargeCard exam={examEntity}>
 *   <p>Additional content for the middle column.</p>
 * </ExamLargeCard>
 */
export const ExamLargeCard = ({exam, children}) => {
    return (
        <ExamCardCapsule exam={exam} >
            <Row>
                <LeftColumn>
                    <ExamMediumCard exam={exam}/>
                </LeftColumn>
                <MiddleColumn>
                    {children}
                </MiddleColumn>
            </Row>
        </ExamCardCapsule>
    )
}
