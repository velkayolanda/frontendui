import { GroupRolesAttributeLazy } from "../Vectors/GroupRolesAttribute"
import { GroupRolesOnAttributeLazy } from "../Vectors/GroupRolesOnsAttribute"
import { GroupLink } from "./GroupLink"

/**
 * A component that displays medium-level content for an group entity.
 *
 * This component renders a label "GroupMediumContent" followed by a serialized representation of the `group` object
 * and any additional child content. It is designed to handle and display information about an group entity object.
 *
 * @component
 * @param {Object} props - The properties for the GroupMediumContent component.
 * @param {Object} props.group - The object representing the group entity.
 * @param {string|number} props.group.id - The unique identifier for the group entity.
 * @param {string} props.group.name - The name or label of the group entity.
 * @param {React.ReactNode} [props.children=null] - Additional content to render after the serialized `group` object.
 *
 * @returns {JSX.Element} A JSX element displaying the entity's details and optional content.
 *
 * @example
 * // Example usage:
 * const groupEntity = { id: 123, name: "Sample Entity" };
 * 
 * <GroupMediumContent group={groupEntity}>
 *   <p>Additional information about the entity.</p>
 * </GroupMediumContent>
 */
export const GroupMediumContent = ({group, children}) => {
    const { mastergroup } = group
    return (
        <>
            {mastergroup && (<>
                <b>Nadřízený</b>: <GroupLink group={mastergroup} />
            </>)}
            <hr />
            <GroupRolesOnAttributeLazy group={group} filter={r=>r?.valid} />
            {/* <hr />
            <GroupRolesAttributeLazy group={group} filter={r=>r?.valid} />
            <hr />
            <GroupRolesAttributeLazy group={group} filter={r=>!r?.valid} /> */}
            {/* $GroupMediumContent$ <br />
            {JSON.stringify(group)}
            $GroupMediumContent$ */}
            {children}
        </>
    )
}
