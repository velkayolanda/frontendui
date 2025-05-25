import { Col, Row } from "react-bootstrap"
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
export const ExamMediumContent = ({exam, children}) => {
    return (
        <>
            <Row>
                <Col>Název</Col>
                <Col>{exam?.name}</Col>
            </Row>
            <Row>
                <Col>Anglický název</Col>
                <Col>{exam?.nameEn}</Col>
            </Row>
            <Row>
                <Col>Popis</Col>
                <Col>{exam?.description}</Col>
            </Row>
            <Row>
                <Col>Anglický popis</Col>
                <Col>{exam?.descriptionEn}</Col>
            </Row>
            <Row>
                <Col>Min score</Col>
                <Col>{exam?.minScore}</Col>
            </Row>
            <Row>
                <Col>Max score</Col>
                <Col>{exam?.maxScore}</Col>
            </Row>
            {/* <Row>
                <Col>JSON</Col>
                <Col><pre>{JSON.stringify(exam, null, 2)}</pre></Col>
            </Row> */}
            {children}
        </>
    )
}
