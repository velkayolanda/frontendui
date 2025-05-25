import { ProxyLink } from "@hrbolek/uoisfrontend-shared"
import { URIRoot } from "../../uriroot";

export const ExamURI = `${URIRoot}/exam/view/`;

/**
 * A React component that renders a `ProxyLink` to an "exam" entity's view page.
 *
 * The target URL is dynamically constructed using the `exam` object's `id`, and the link displays
 * the `exam` object's `name` as its clickable content.
 *
 * @function ExamLink
 * @param {Object} props - The properties for the `ExamLink` component.
 * @param {Object} props.exam - The object representing the "exam" entity.
 * @param {string|number} props.exam.id - The unique identifier for the "exam" entity. Used to construct the target URL.
 * @param {string} props.exam.name - The display name for the "exam" entity. Used as the link text.
 *
 * @returns {JSX.Element} A `ProxyLink` component linking to the specified "exam" entity's view page.
 *
 * @example
 * // Example usage with a sample exam entity:
 * const examEntity = { id: 123, name: "Example Exam Entity" };
 * 
 * <ExamLink exam={examEntity} />
 * // Renders: <ProxyLink to="/exam/exam/view/123">Example Exam Entity</ProxyLink>
 *
 * @remarks
 * - This component utilizes `ProxyLink` to ensure consistent link behavior, including parameter preservation and conditional reloads.
 * - The URL format `/exam/exam/view/:id` must be supported by the application routing.
 *
 * @see ProxyLink - The base component used for rendering the link.
 */
export const ExamLink = ({exam, ...props}) => {
    return <ProxyLink to={ExamURI + exam.id} {...props}>{exam.name}</ProxyLink>
}