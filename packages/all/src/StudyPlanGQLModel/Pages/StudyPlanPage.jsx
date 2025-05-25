import { useParams } from "react-router"
import { StudyPlanPageContentLazy } from "./StudyPlanPageContentLazy"
import { StudyPlanPivotTable } from "../Components/StudyPlanPivotTable"

/**
 * A page component for displaying lazy-loaded content of a studyplan entity.
 *
 * This component extracts the `id` parameter from the route using `useParams`,
 * constructs a `studyplan` object, and passes it to the `StudyPlanPageContentLazy` component.
 * The `StudyPlanPageContentLazy` handles fetching and rendering of the entity's data.
 *
 * The `children` prop can be a render function that receives:
 * - `studyplan`: the fetched studyplan entity,
 * - `onChange`: a callback for change events,
 * - `onBlur`: a callback for blur events.
 *
 * @component
 * @param {Object} props - Component props.
 * @param {(params: { studyplan: Object, onChange: function, onBlur: function }) => React.ReactNode} [props.children] -
 *   Optional render function that will be passed to `StudyPlanPageContentLazy`.
 *
 * @returns {JSX.Element} The rendered page component displaying the lazy-loaded content for the studyplan entity.
 *
 * @example
 * // Example route setup:
 * <Route path="/studyplan/:id" element={<StudyPlanPage />} />
 *
 * // Or using children as a render function:
 * <Route
 *   path="/studyplan/:id"
 *   element={
 *     <StudyPlanPage>
 *       {({ studyplan, onChange, onBlur }) => (
 *         <input value={studyplan.name} onChange={onChange} onBlur={onBlur} />
 *       )}
 *     </StudyPlanPage>
 *   }
 * />
 */

export const StudyPlanPage = ({children}) => {
    const {id} = useParams()
    const studyplan = {id}
    return (
        <StudyPlanPageContentLazy studyplan={studyplan}>
            <StudyPlanPivotTable studyplan={studyplan} editable={false} />
            {children}
        </StudyPlanPageContentLazy>
    )
}