import { ButtonWithDialog, ErrorHandler, LoadingSpinner } from "@hrbolek/uoisfrontend-shared";

import { useAsyncAction } from "@hrbolek/uoisfrontend-gql-shared";
import { ExamDeleteAsyncAction, ExamInsertAsyncAction, ExamUpdateAsyncAction } from "../Queries";
import { ExamMediumEditableContent } from "./ExamMediumEditableContent";

/**
 * ExamCUDButton Component
 *
 * A higher-order component that dynamically renders one of the following components
 * based on the `operation` prop:
 * - `InsertExamButton` for creating a new item (operation "C")
 * - `UpdateExamButton` for updating an existing item (operation "U")
 * - `DeleteExamButton` for deleting an existing item (operation "D")
 *
 * This component validates the `exam` prop:
 * - For "C" (create), `exam` can be any object (no restrictions).
 * - For "U" (update) and "D" (delete), `exam` must include an `id` key.
 *
 * If the `operation` prop is invalid or required conditions for `exam` are not met,
 * an `ErrorHandler` component is rendered with an appropriate error message.
 *
 * @component
 * @param {Object} props - The props for the ExamCUDButton component.
 * @param {string} props.operation - The operation type ("C" for create, "U" for update, "D" for delete).
 * @param {React.ReactNode} props.children - The content or label for the button.
 * @param {Object} props.exam - The parameters for the operation. For "U" and "D", it must include an `id` key.
 * @param {string} [props.exam.id] - The unique identifier for the item (required for "U" and "D").
 * @param {string} [props.exam.name] - The name of the item (optional).
 * @param {string} [props.exam.name_en] - The English name of the item (optional).
 * @param {Function} [props.onDone=(exam) => {}] - Callback executed after the operation completes. Receives the `exam` object.
 * @param {...Object} props - Additional props passed to the underlying button components.
 *
 * @example
 * // Example Usage
 * const Example = () => {
 *   const handleDone = (data) => console.log("Operation completed:", data);
 *
 *   return (
 *     <>
 *       <ExamCUDButton
 *         operation="C"
 *         exam={{ name: "New Item", name_en: "New Item EN" }}
 *         onDone={handleDone}
 *       >
 *         Insert
 *       </ExamCUDButton>
 *
 *       <ExamCUDButton
 *         operation="U"
 *         exam={{ id: "123", name: "Updated Item", name_en: "Updated Item EN" }}
 *         onDone={handleDone}
 *       >
 *         Update
 *       </ExamCUDButton>
 *
 *       <ExamCUDButton
 *         operation="D"
 *         exam={{ id: "123" }}
 *         onDone={handleDone}
 *       >
 *         Delete
 *       </ExamCUDButton>
 *     </>
 *   );
 * };
 *
 * @returns {JSX.Element} The dynamically selected button component for the specified operation.
 */
export const ExamButton = ({ operation, children, exam, onDone = () => {}, ...props }) => {
    const operationConfig = {
        C: {
            asyncAction: ExamInsertAsyncAction,
            dialogTitle: "Vložit novou exam",
            loadingMsg: "Vkládám novou exam",
            renderContent: () => <ExamMediumEditableContent exam={exam} />,
        },
        U: {
            asyncAction: ExamUpdateAsyncAction,
            dialogTitle: "Upravit exam",
            loadingMsg: "Ukládám exam",
            renderContent: () => <ExamMediumEditableContent exam={exam} />,
        },
        D: {
            asyncAction: ExamDeleteAsyncAction,
            dialogTitle: "Chcete odebrat exam?",
            loadingMsg: "Odstraňuji exam",
            renderContent: () => (
                <h2>
                    {exam?.name} ({exam?.name_en})
                </h2>
            ),
        },
    };

    if (!operationConfig[operation]) {
        return <ErrorHandler errors={`Invalid operation value: '${operation}'. Must be one of 'C', 'U', or 'D'.`} />;
    }

    const { asyncAction, dialogTitle, loadingMsg, renderContent } = operationConfig[operation];

    const { error, loading, fetch, entity } = useAsyncAction(asyncAction, exam, { deferred: true });
    const handleClick = async (params = {}) => {
        const fetchParams = { ...exam, ...params };
        const freshExam = await fetch(fetchParams);
        onDone(freshExam); // Pass the result to the external callback
    };

    // Validate required fields for "U" and "D"
    if ((operation === 'U' || operation === 'D') && !exam?.id) {
        return <ErrorHandler errors={`For '${operation}' operation, 'exam' must include an 'id' key.`} />;
    }

    return (<>
        {error && <ErrorHandler errors={error} />}
        {loading && <LoadingSpinner text={loadingMsg} />}
        <ButtonWithDialog
            buttonLabel={children}
            dialogTitle={dialogTitle}
            {...props}
            params={exam}
            onClick={handleClick}
        >
            {renderContent()}
        </ButtonWithDialog>
    </>);
};

// // Prop validation using PropTypes
// ExamCUDButton.propTypes = {
//     /** The operation to perform: "C" for create, "U" for update, "D" for delete. */
//     operation: PropTypes.oneOf(['C', 'U', 'D']).isRequired,
//     /** The label or content for the button. */
//     children: PropTypes.node,
//     /** The parameters for the operation. */
//     exam: PropTypes.shape({
//         id: PropTypes.string, // Required for "U" and "D" operations
//         name: PropTypes.string,
//         name_en: PropTypes.string,
//     }).isRequired,
//     /** Callback executed after the operation completes. Receives the `exam` object. */
//     onDone: PropTypes.func,
// };

// // Default props
// ExamCUDButton.defaultProps = {
//     onDone: () => {},
// };