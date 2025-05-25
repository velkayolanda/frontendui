import { ChildWrapper } from "@hrbolek/uoisfrontend-shared";

/**
 * ExamChildren Component
 *
 * A utility React component that wraps its children with the `ChildWrapper` component, 
 * passing down an `exam` entity along with other props to all child elements.
 * This component is useful for injecting a common `exam` entity into multiple children 
 * while preserving their existing functionality.
 *
 * @component
 * @param {Object} props - The props for the ExamChildren component.
 * @param {any} props.exam - An entity (e.g., object, string, or other data) to be passed to the children.
 * @param {React.ReactNode} props.children - The children elements to be wrapped and enhanced.
 * @param {...any} props - Additional props to be passed to each child element.
 *
 * @returns {JSX.Element} A `ChildWrapper` component containing the children with the injected `exam` entity.
 *
 * @example
 * // Example usage:
 * const examEntity = { id: 1, message: "No data available" };
 *
 * <ExamChildren exam={examEntity}>
 *     <CustomMessage />
 *     <CustomIcon />
 * </ExamChildren>
 *
 * // Result: Both <CustomMessage /> and <CustomIcon /> receive the 'exam' prop with the specified entity.
 */
export const ExamChildren = ({exam, children, ...props}) => <ChildWrapper exam={exam} children={children} {...props} />