import { useLocation } from "react-router"
import { InfiniteScroll, MyNavbar } from "@hrbolek/uoisfrontend-shared"
import { ExamReadPageAsyncAction } from "../Queries"
import { ExamMediumCard } from "../Components"

/**
 * Visualizes a list of exam entities using ExamMediumCard.
 *
 * This component receives an array of exam objects via the `items` prop
 * and renders a `ExamMediumCard` for each item. Each card is keyed by the exam's `id`.
 *
 * @component
 * @param {Object} props - Component properties.
 * @param {Array<Object>} props.items - Array of exam entities to visualize. Each object should have a unique `id` property.
 * @returns {JSX.Element} A fragment containing a list of ExamMediumCard components.
 *
 * @example
 * const exams = [
 *   { id: 1, name: "Exam 1", ... },
 *   { id: 2, name: "Exam 2", ... }
 * ];
 *
 * <ExamVisualiser items={exams} />
 */
const ExamVisualiser = ({items}) => {
    return (
        <>
            {items.map(exam => (
                <ExamMediumCard key={exam.id} exam={exam} />
            ))}
        </>
    )
}

/**
 * Page component for displaying a (potentially filtered) list of exam entities with infinite scrolling.
 *
 * This component parses the `where` query parameter from the URL (if present), 
 * passes it as a filter to the `InfiniteScroll` component, and visualizes the resulting exams using the specified `Visualiser`.
 * 
 * You can optionally provide custom children or a custom Visualiser component.
 *
 * @component
 * @param {Object} props - Component props.
 * @param {function} [props.Visualiser=ExamVisualiser] - 
 *   Optional component used to visualize the loaded exams. Receives `items` as prop.
 * @param {React.ReactNode} [props.children] - Optional child elements to render below the visualized exams.
 *
 * @returns {JSX.Element} The rendered page with infinite scroll and optional children.
 *
 * @example
 * // Will fetch and display exams filtered by a `where` clause passed in the URL, e.g.:
 * //   /exam?where={"name":"Example"}
 * <ExamVectorPage />
 *
 * @example
 * // With a custom visualizer and children:
 * <ExamVectorPage Visualiser={CustomExamList}>
 *   <Footer />
 * </ExamVectorPage>
 */
export const ExamVectorPage = ({children, Visualiser=ExamVisualiser}) => {
    const { search } = useLocation();
    let actionParams = { skip: 0, limit: 10};
    try {
        const params = new URLSearchParams(search);
        const where = params.get('where');        
        actionParams.where = where ? JSON.parse(where) : undefined;
    } catch (e) {
        console.warn("Invalid 'where' query parameter!", e);
    }
    return (<>
        <MyNavbar onSearchChange={onSearchChange} />
        <InfiniteScroll
            preloadedItems={[]} // No preloaded items for exam
            actionParams={actionParams} 
            asyncAction={ExamReadPageAsyncAction}
            Visualiser={Visualiser}
        />
        {children}
    </>)
}