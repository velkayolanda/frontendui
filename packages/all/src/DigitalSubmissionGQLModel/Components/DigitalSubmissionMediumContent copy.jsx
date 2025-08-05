import { Col, Row } from "react-bootstrap"

import { DigitalSubmissionNameAttribute } from "../Attributes"
/**
 * A component that displays medium-level content for an digitalsubmission entity.
 *
 * This component renders a label "DigitalSubmissionMediumContent" followed by a serialized representation of the `digitalsubmission` object
 * and any additional child content. It is designed to handle and display information about an digitalsubmission entity object.
 *
 * @component
 * @param {Object} props - The properties for the DigitalSubmissionMediumContent component.
 * @param {Object} props.digitalsubmission - The object representing the digitalsubmission entity.
 * @param {string|number} props.digitalsubmission.id - The unique identifier for the digitalsubmission entity.
 * @param {string} props.digitalsubmission.name - The name or label of the digitalsubmission entity.
 * @param {React.ReactNode} [props.children=null] - Additional content to render after the serialized `digitalsubmission` object.
 *
 * @returns {JSX.Element} A JSX element displaying the entity's details and optional content.
 *
 * @example
 * // Example usage:
 * const digitalsubmissionEntity = { id: 123, name: "Sample Entity" };
 * 
 * <DigitalSubmissionMediumContent digitalsubmission={digitalsubmissionEntity}>
 *   <p>Additional information about the entity.</p>
 * </DigitalSubmissionMediumContent>
 */
export const DigitalSubmissionMediumContent = ({digitalsubmission, children}) => {
    const {fields = []} = digitalsubmission;
    return (
        <>{
            
        }
            <Row>
                <Col>Name</Col>
                <Col>
                    <DigitalSubmissionNameAttribute digitalsubmission={digitalsubmission} />
                </Col>
            </Row>
            {children}
        </>
    )
}
