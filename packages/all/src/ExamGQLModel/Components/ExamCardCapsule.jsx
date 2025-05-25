import { CardCapsule } from "@hrbolek/uoisfrontend-shared"
import { PersonFill } from "react-bootstrap-icons"
import { ExamLink } from "./ExamLink"

/**
 * A specialized card component that displays an `ExamLink` as its title and encapsulates additional content.
 *
 * This component extends the `CardCapsule` component by using a combination of a `PersonFill` icon and 
 * an `ExamLink` component in the card's header. The `children` prop is used to render any content 
 * inside the card body. It is designed for use with entities represented by the `exam` object.
 *
 * @component
 * @param {Object} props - The props for the ExamCardCapsule component.
 * @param {Object} props.exam - The object representing the exam entity.
 * @param {string|number} props.exam.id - The unique identifier for the exam entity.
 * @param {string} props.exam.name - The display name for the exam entity.
 * @param {React.ReactNode} [props.children=null] - The content to render inside the card's body.
 *
 * @returns {JSX.Element} The rendered card component with a dynamic title and body content.
 *
 * @example
 * // Example usage:
 * import { ExamCardCapsule } from './ExamCardCapsule';
 * import { Button } from 'react-bootstrap';
 *
 * const examEntity = { id: 123, name: "Example Entity" };
 *
 * <ExamCardCapsule exam={examEntity}>
 *   <Button variant="primary">Click Me</Button>
 * </ExamCardCapsule>
 */
export const ExamCardCapsule = ({exam, children, title=<><PersonFill /> <ExamLink exam={exam} /></>}) => {
    return (
        <CardCapsule title={title}>
            {children}
        </CardCapsule>
    )
}
