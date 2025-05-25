import { ButtonWithDialog, ErrorHandler, LoadingSpinner } from "@hrbolek/uoisfrontend-shared";

import { useAsyncAction } from "@hrbolek/uoisfrontend-gql-shared";
import { MembershipDeleteAsyncAction, MembershipInsertAsyncAction, MembershipUpdateAsyncAction } from "../Queries";
import { MembershipMediumEditableContent } from "./MembershipMediumEditableContent";

/**
 * MembershipCUDButton Component
 *
 * A higher-order component that dynamically renders one of the following components
 * based on the `operation` prop:
 * - `InsertMembershipButton` for creating a new item (operation "C")
 * - `UpdateMembershipButton` for updating an existing item (operation "U")
 * - `DeleteMembershipButton` for deleting an existing item (operation "D")
 *
 * This component validates the `membership` prop:
 * - For "C" (create), `membership` can be any object (no restrictions).
 * - For "U" (update) and "D" (delete), `membership` must include an `id` key.
 *
 * If the `operation` prop is invalid or required conditions for `membership` are not met,
 * an `ErrorHandler` component is rendered with an appropriate error message.
 *
 * @component
 * @param {Object} props - The props for the MembershipCUDButton component.
 * @param {string} props.operation - The operation type ("C" for create, "U" for update, "D" for delete).
 * @param {React.ReactNode} props.children - The content or label for the button.
 * @param {Object} props.membership - The parameters for the operation. For "U" and "D", it must include an `id` key.
 * @param {string} [props.membership.id] - The unique identifier for the item (required for "U" and "D").
 * @param {string} [props.membership.name] - The name of the item (optional).
 * @param {string} [props.membership.name_en] - The English name of the item (optional).
 * @param {Function} [props.onDone=(membership) => {}] - Callback executed after the operation completes. Receives the `membership` object.
 * @param {...Object} props - Additional props passed to the underlying button components.
 *
 * @example
 * // Example Usage
 * const Example = () => {
 *   const handleDone = (data) => console.log("Operation completed:", data);
 *
 *   return (
 *     <>
 *       <MembershipCUDButton
 *         operation="C"
 *         membership={{ name: "New Item", name_en: "New Item EN" }}
 *         onDone={handleDone}
 *       >
 *         Insert
 *       </MembershipCUDButton>
 *
 *       <MembershipCUDButton
 *         operation="U"
 *         membership={{ id: "123", name: "Updated Item", name_en: "Updated Item EN" }}
 *         onDone={handleDone}
 *       >
 *         Update
 *       </MembershipCUDButton>
 *
 *       <MembershipCUDButton
 *         operation="D"
 *         membership={{ id: "123" }}
 *         onDone={handleDone}
 *       >
 *         Delete
 *       </MembershipCUDButton>
 *     </>
 *   );
 * };
 *
 * @returns {JSX.Element} The dynamically selected button component for the specified operation.
 */
export const MembershipButton = ({ operation, children, membership, onDone = () => {}, ...props }) => {
    const operationConfig = {
        C: {
            asyncAction: MembershipInsertAsyncAction,
            dialogTitle: "Vložit novou membership",
            loadingMsg: "Vkládám novou membership",
            renderContent: () => <MembershipMediumEditableContent membership={membership} />,
        },
        U: {
            asyncAction: MembershipUpdateAsyncAction,
            dialogTitle: "Upravit membership",
            loadingMsg: "Ukládám membership",
            renderContent: () => <MembershipMediumEditableContent membership={membership} />,
        },
        D: {
            asyncAction: MembershipDeleteAsyncAction,
            dialogTitle: "Chcete odebrat membership?",
            loadingMsg: "Odstraňuji membership",
            renderContent: () => (
                <h2>
                    {membership?.name} ({membership?.name_en})
                </h2>
            ),
        },
    };

    if (!operationConfig[operation]) {
        return <ErrorHandler errors={`Invalid operation value: '${operation}'. Must be one of 'C', 'U', or 'D'.`} />;
    }

    const { asyncAction, dialogTitle, loadingMsg, renderContent } = operationConfig[operation];

    const { error, loading, fetch, entity } = useAsyncAction(asyncAction, membership, { deferred: true });
    const handleClick = async (params = {}) => {
        const fetchParams = { ...membership, ...params };
        const freshMembership = await fetch(fetchParams);
        onDone(freshMembership); // Pass the result to the external callback
    };

    // Validate required fields for "U" and "D"
    if ((operation === 'U' || operation === 'D') && !membership?.id) {
        return <ErrorHandler errors={`For '${operation}' operation, 'membership' must include an 'id' key.`} />;
    }

    return (<>
        {error && <ErrorHandler errors={error} />}
        {loading && <LoadingSpinner text={loadingMsg} />}
        <ButtonWithDialog
            buttonLabel={children}
            dialogTitle={dialogTitle}
            {...props}
            params={membership}
            onClick={handleClick}
        >
            {renderContent()}
        </ButtonWithDialog>
    </>);
};

// // Prop validation using PropTypes
// MembershipCUDButton.propTypes = {
//     /** The operation to perform: "C" for create, "U" for update, "D" for delete. */
//     operation: PropTypes.oneOf(['C', 'U', 'D']).isRequired,
//     /** The label or content for the button. */
//     children: PropTypes.node,
//     /** The parameters for the operation. */
//     membership: PropTypes.shape({
//         id: PropTypes.string, // Required for "U" and "D" operations
//         name: PropTypes.string,
//         name_en: PropTypes.string,
//     }).isRequired,
//     /** Callback executed after the operation completes. Receives the `membership` object. */
//     onDone: PropTypes.func,
// };

// // Default props
// MembershipCUDButton.defaultProps = {
//     onDone: () => {},
// };