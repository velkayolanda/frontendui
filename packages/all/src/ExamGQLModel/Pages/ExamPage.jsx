import { useParams } from "react-router"
import { ExamPageContentLazy } from "./ExamPageContentLazy"

/**
 * A page component for displaying lazy-loaded content of a exam entity.
 *
 * This component extracts the `id` parameter from the route using `useParams`,
 * constructs a `exam` object, and passes it to the `ExamPageContentLazy` component.
 * The `ExamPageContentLazy` handles fetching and rendering of the entity's data.
 *
 * The `children` prop can be a render function that receives:
 * - `exam`: the fetched exam entity,
 * - `onChange`: a callback for change events,
 * - `onBlur`: a callback for blur events.
 *
 * @component
 * @param {Object} props - Component props.
 * @param {(params: { exam: Object, onChange: function, onBlur: function }) => React.ReactNode} [props.children] -
 *   Optional render function that will be passed to `ExamPageContentLazy`.
 *
 * @returns {JSX.Element} The rendered page component displaying the lazy-loaded content for the exam entity.
 *
 * @example
 * // Example route setup:
 * <Route path="/exam/:id" element={<ExamPage />} />
 *
 * // Or using children as a render function:
 * <Route
 *   path="/exam/:id"
 *   element={
 *     <ExamPage>
 *       {({ exam, onChange, onBlur }) => (
 *         <input value={exam.name} onChange={onChange} onBlur={onBlur} />
 *       )}
 *     </ExamPage>
 *   }
 * />
 */

export const ExamPage = ({children}) => {
    const {id} = useParams()
    const exam = {id}
    return (
        <ExamPageContentLazy exam={exam}>
            {children}
        </ExamPageContentLazy>
    )
}