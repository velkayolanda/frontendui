import { ExamLargeCard } from "../Components"
import { ExamPageNavbar } from "./ExamPageNavbar"

/**
 * Renders a page layout for a single exam entity, including navigation and detailed view.
 *
 * This component wraps `ExamPageNavbar` and `ExamLargeCard` to provide a consistent
 * interface for displaying an individual exam. It also supports rendering children as 
 * nested content inside the card.
 *
 * @component
 * @param {Object} props - Component props.
 * @param {{ id: string|number, name: string }} props.exam - The exam entity to display.
 * @param {React.ReactNode} [props.children] - Optional nested content rendered inside the card.
 * @returns {JSX.Element} Rendered page layout for a exam.
 *
 * @example
 * const exam = { id: 1, name: "Example Exam" };
 * <ExamPageContent exam={exam}>
 *   <p>Additional info here.</p>
 * </ExamPageContent>
 */
export const ExamPageContent = ({exam, children, ...props}) => {
    return (<>
        <ExamPageNavbar exam={exam} />
        <ExamLargeCard exam={exam} {...props} >
            Exam {JSON.stringify(exam)}
            {children}
        </ExamLargeCard>
    </>)
}