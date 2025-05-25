import { HashContainer } from "@hrbolek/uoisfrontend-shared"
import { GroupLargeCard } from "../Components"
import { GroupPageNavbar } from "./GroupPageNavbar"
import { GroupMembershipsAttribute, GroupMembershipsAttributeCardsInfinite, GroupMembershipsAttributeInfinite } from "../Vectors/GroupMembershipsAttribute"
import { GroupCardCapsule } from "../Components"
import { GroupSubgroupsAttribute } from "../Vectors/GroupSubgroupsAttribute"
import { GroupAccreditedprogramsAttribute } from "../Vectors/GroupAccreditedProgramsAttribute"

/**
 * Renders a page layout for a single group entity, including navigation and detailed view.
 *
 * This component wraps `GroupPageNavbar` and `GroupLargeCard` to provide a consistent
 * interface for displaying an individual group. It also supports rendering children as 
 * nested content inside the card.
 *
 * @component
 * @param {Object} props - Component props.
 * @param {{ id: string|number, name: string }} props.group - The group entity to display.
 * @param {React.ReactNode} [props.children] - Optional nested content rendered inside the card.
 * @returns {JSX.Element} Rendered page layout for a group.
 *
 * @example
 * const group = { id: 1, name: "Example Group" };
 * <GroupPageContent group={group}>
 *   <p>Additional info here.</p>
 * </GroupPageContent>
 */
export const GroupPageContent = ({group, children, ...props}) => {
    return (<>
        <GroupPageNavbar group={group} />
        <GroupLargeCard group={group} {...props} >
            <GroupMembershipsAttributeCardsInfinite id="administration" group={group} />
            {/* <HashContainer firstAsDefault={false}>
                <GroupCardCapsule id="administration" group={group} >
                    <GroupMembershipsAttributeInfinite id="administration" group={group} />
                </GroupCardCapsule>
                <GroupCardCapsule id="administration" group={group} >
                    <GroupSubgroupsAttribute id="administration" group={group} />
                </GroupCardCapsule>
                <GroupCardCapsule id="education" group={group} >
                    <GroupAccreditedprogramsAttribute id="education" group={group} />
                </GroupCardCapsule>
            </HashContainer> */}
            {/* {JSON.stringify(group?.memberships)} */}
            {children}
        </GroupLargeCard>
    </>)
}