import { ButtonWithDialog, ErrorHandler, LoadingSpinner } from "@hrbolek/uoisfrontend-shared";

import { useAsyncAction } from "@hrbolek/uoisfrontend-gql-shared";
import { DeleteAsyncAction, InsertAsyncAction, UpdateAsyncAction } from "../Queries";
import { MediumEditableContent } from "./MediumEditableContent";

/**
 * TemplateCUDButton Component
 *
 * A higher-order component that dynamically renders one of the following components
 * based on the `operation` prop:
 * - `InsertTemplateButton` for creating a new item (operation "C")
 * - `UpdateTemplateButton` for updating an existing item (operation "U")
 * - `DeleteTemplateButton` for deleting an existing item (operation "D")
 *
 * This component validates the `template` prop:
 * - For "C" (create), `template` can be any object (no restrictions).
 * - For "U" (update) and "D" (delete), `template` must include an `id` key.
 *
 * If the `operation` prop is invalid or required conditions for `template` are not met,
 * an `ErrorHandler` component is rendered with an appropriate error message.
 *
 * @component
 * @param {Object} props - The props for the TemplateCUDButton component.
 * @param {string} props.operation - The operation type ("C" for create, "U" for update, "D" for delete).
 * @param {React.ReactNode} props.children - The content or label for the button.
 * @param {Object} props.template - The parameters for the operation. For "U" and "D", it must include an `id` key.
 * @param {string} [props.template.id] - The unique identifier for the item (required for "U" and "D").
 * @param {string} [props.template.name] - The name of the item (optional).
 * @param {string} [props.template.name_en] - The English name of the item (optional).
 * @param {Function} [props.onDone=(template) => {}] - Callback executed after the operation completes. Receives the `template` object.
 * @param {...Object} props - Additional props passed to the underlying button components.
 *
 * @example
 * // Example Usage
 * const Example = () => {
 *   const handleDone = (data) => console.log("Operation completed:", data);
 *
 *   return (
 *     <>
 *       <TemplateCUDButton
 *         operation="C"
 *         template={{ name: "New Item", name_en: "New Item EN" }}
 *         onDone={handleDone}
 *       >
 *         Insert
 *       </TemplateCUDButton>
 *
 *       <TemplateCUDButton
 *         operation="U"
 *         template={{ id: "123", name: "Updated Item", name_en: "Updated Item EN" }}
 *         onDone={handleDone}
 *       >
 *         Update
 *       </TemplateCUDButton>
 *
 *       <TemplateCUDButton
 *         operation="D"
 *         template={{ id: "123" }}
 *         onDone={handleDone}
 *       >
 *         Delete
 *       </TemplateCUDButton>
 *     </>
 *   );
 * };
 *
 * @returns {JSX.Element} The dynamically selected button component for the specified operation.
 */
export const CUDButton = ({ operation, children, item, onDone = () => {}, onOptimistic = () => {}, ...props }) => {
    const operationConfig = {
        C: {
            asyncAction: InsertAsyncAction,
            dialogTitle: "Vložit novou template",
            loadingMsg: "Vkládám novou template",
            renderContent: () => <MediumEditableContent item={item} />,
        },
        U: {
            asyncAction: UpdateAsyncAction,
            dialogTitle: "Upravit template",
            loadingMsg: "Ukládám template",
            renderContent: () => <MediumEditableContent item={item} />,
        },
        D: {
            asyncAction: DeleteAsyncAction,
            dialogTitle: "Chcete odebrat template?",
            loadingMsg: "Odstraňuji template",
            renderContent: () => (
                <h2>
                    {item?.name} ({item?.name_en})
                </h2>
            ),
        },
    };

    if (!operationConfig[operation]) {
        return <ErrorHandler errors={`Invalid operation value: '${operation}'. Must be one of 'C', 'U', or 'D'.`} />;
    }

    const { asyncAction, dialogTitle, loadingMsg, renderContent } = operationConfig[operation];

    const { error, loading, fetch, entity } = useAsyncAction(asyncAction, item, { deferred: true });
    const handleClick = async (params = {}) => {
        const fetchParams = { ...item, ...params };
        onOptimistic(fetchParams);
        const freshTemplate = await fetch(fetchParams);
        onDone(freshTemplate); // Pass the result to the external callback
    };

    // Validate required fields for "U" and "D"
    if ((operation === 'U' || operation === 'D') && !item?.id) {
        return <ErrorHandler errors={`For '${operation}' operation, 'template' must include an 'id' key.`} />;
    }

    return (<>
        {error && <ErrorHandler errors={error} />}
        {loading && <LoadingSpinner text={loadingMsg} />}
        <ButtonWithDialog
            buttonLabel={children}
            dialogTitle={dialogTitle}
            {...props}
            params={item}
            onClick={handleClick}
        >
            {renderContent()}
        </ButtonWithDialog>
    </>);
};
