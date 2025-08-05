import { ButtonWithDialog, ErrorHandler, LoadingSpinner } from "@hrbolek/uoisfrontend-shared";

import { useAsyncAction } from "@hrbolek/uoisfrontend-gql-shared";
import { DigitalFormFieldDeleteAsyncAction, DigitalFormFieldInsertAsyncAction, DigitalFormFieldUpdateAsyncAction } from "../Queries";
import { DigitalFormFieldMediumEditableContent } from "./DigitalFormFieldMediumEditableContent";

/**
 * DigitalFormFieldCUDButton Component
 *
 * A higher-order component that dynamically renders one of the following components
 * based on the `operation` prop:
 * - `InsertDigitalFormFieldButton` for creating a new item (operation "C")
 * - `UpdateDigitalFormFieldButton` for updating an existing item (operation "U")
 * - `DeleteDigitalFormFieldButton` for deleting an existing item (operation "D")
 *
 * This component validates the `digitalformfield` prop:
 * - For "C" (create), `digitalformfield` can be any object (no restrictions).
 * - For "U" (update) and "D" (delete), `digitalformfield` must include an `id` key.
 *
 * If the `operation` prop is invalid or required conditions for `digitalformfield` are not met,
 * an `ErrorHandler` component is rendered with an appropriate error message.
 *
 * @component
 * @param {Object} props - The props for the DigitalFormFieldCUDButton component.
 * @param {string} props.operation - The operation type ("C" for create, "U" for update, "D" for delete).
 * @param {React.ReactNode} props.children - The content or label for the button.
 * @param {Object} props.digitalformfield - The parameters for the operation. For "U" and "D", it must include an `id` key.
 * @param {string} [props.digitalformfield.id] - The unique identifier for the item (required for "U" and "D").
 * @param {string} [props.digitalformfield.name] - The name of the item (optional).
 * @param {string} [props.digitalformfield.name_en] - The English name of the item (optional).
 * @param {Function} [props.onDone=(digitalformfield) => {}] - Callback executed after the operation completes. Receives the `digitalformfield` object.
 * @param {...Object} props - Additional props passed to the underlying button components.
 *
 * @example
 * // Example Usage
 * const Example = () => {
 *   const handleDone = (data) => console.log("Operation completed:", data);
 *
 *   return (
 *     <>
 *       <DigitalFormFieldCUDButton
 *         operation="C"
 *         digitalformfield={{ name: "New Item", name_en: "New Item EN" }}
 *         onDone={handleDone}
 *       >
 *         Insert
 *       </DigitalFormFieldCUDButton>
 *
 *       <DigitalFormFieldCUDButton
 *         operation="U"
 *         digitalformfield={{ id: "123", name: "Updated Item", name_en: "Updated Item EN" }}
 *         onDone={handleDone}
 *       >
 *         Update
 *       </DigitalFormFieldCUDButton>
 *
 *       <DigitalFormFieldCUDButton
 *         operation="D"
 *         digitalformfield={{ id: "123" }}
 *         onDone={handleDone}
 *       >
 *         Delete
 *       </DigitalFormFieldCUDButton>
 *     </>
 *   );
 * };
 *
 * @returns {JSX.Element} The dynamically selected button component for the specified operation.
 */
export const DigitalFormFieldButton = ({ operation, children, digitalformfield, onDone = () => {}, ...props }) => {
    const operationConfig = {
        C: {
            asyncAction: DigitalFormFieldInsertAsyncAction,
            dialogTitle: "Vložit novou položku formuláře",
            loadingMsg: "Vkládám novou položku formuláře",
            renderContent: () => <DigitalFormFieldMediumEditableContent digitalformfield={digitalformfield} />,
        },
        U: {
            asyncAction: DigitalFormFieldUpdateAsyncAction,
            dialogTitle: "Upravit položku formuláře",
            loadingMsg: "Ukládám položku formuláře",
            renderContent: () => <DigitalFormFieldMediumEditableContent digitalformfield={digitalformfield} />,
        },
        D: {
            asyncAction: DigitalFormFieldDeleteAsyncAction,
            dialogTitle: "Chcete odebrat položku formuláře?",
            loadingMsg: "Odstraňuji položku formuláře",
            renderContent: () => (
                <h2>
                    {digitalformfield?.name} 
                </h2>
            ),
        },
    };

    if (!operationConfig[operation]) {
        return <ErrorHandler errors={`Invalid operation value: '${operation}'. Must be one of 'C', 'U', or 'D'.`} />;
    }

    const { asyncAction, dialogTitle, loadingMsg, renderContent } = operationConfig[operation];

    const { error, loading, fetch, entity } = useAsyncAction(asyncAction, digitalformfield, { deferred: true });
    const handleClick = async (params = {}) => {
        const fetchParams = { ...digitalformfield, ...params };
        const freshDigitalFormField = await fetch(fetchParams);
        onDone(freshDigitalFormField); // Pass the result to the external callback
    };

    // Validate required fields for "U" and "D"
    if ((operation === 'U' || operation === 'D') && !digitalformfield?.id) {
        return <ErrorHandler errors={`For '${operation}' operation, 'digitalformfield' must include an 'id' key.`} />;
    }

    return (<>
        {error && <ErrorHandler errors={error} />}
        {loading && <LoadingSpinner text={loadingMsg} />}
        <ButtonWithDialog
            buttonLabel={children}
            dialogTitle={dialogTitle}
            {...props}
            params={digitalformfield}
            onClick={handleClick}
        >
            {renderContent()}
        </ButtonWithDialog>
    </>);
};

// // Prop validation using PropTypes
// DigitalFormFieldCUDButton.propTypes = {
//     /** The operation to perform: "C" for create, "U" for update, "D" for delete. */
//     operation: PropTypes.oneOf(['C', 'U', 'D']).isRequired,
//     /** The label or content for the button. */
//     children: PropTypes.node,
//     /** The parameters for the operation. */
//     digitalformfield: PropTypes.shape({
//         id: PropTypes.string, // Required for "U" and "D" operations
//         name: PropTypes.string,
//         name_en: PropTypes.string,
//     }).isRequired,
//     /** Callback executed after the operation completes. Receives the `digitalformfield` object. */
//     onDone: PropTypes.func,
// };

// // Default props
// DigitalFormFieldCUDButton.defaultProps = {
//     onDone: () => {},
// };