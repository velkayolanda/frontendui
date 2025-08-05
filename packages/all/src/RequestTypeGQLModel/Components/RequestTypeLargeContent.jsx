import Row from "react-bootstrap/Row"
import { useSelector } from "react-redux"
import { LeftColumn, MiddleColumn } from "@hrbolek/uoisfrontend-shared"
import { RequestTypeCardCapsule } from "./RequestTypeCardCapsule"
import { RequestTypeMediumCard } from "./RequestTypeMediumCard"
import { DigitalFormLargeContent } from "../../DigitalFormGQLModel/Components/DigitalFormLargeContent"

/**
 * A large card component for displaying detailed content and layout for an requesttype entity.
 *
 * This component wraps an `RequestTypeCardCapsule` with a flexible layout that includes multiple
 * columns. It uses a `Row` layout with a `LeftColumn` for displaying an `RequestTypeMediumCard`
 * and a `MiddleColumn` for rendering additional children.
 *
 * @component
 * @param {Object} props - The properties for the RequestTypeLargeCard component.
 * @param {Object} props.requesttype - The object representing the requesttype entity.
 * @param {string|number} props.requesttype.id - The unique identifier for the requesttype entity.
 * @param {string} props.requesttype.name - The name or label of the requesttype entity.
 * @param {React.ReactNode} [props.children=null] - Additional content to render in the middle column.
 *
 * @returns {JSX.Element} A JSX element combining a large card layout with dynamic content.
 *
 * @example
 * // Example usage:
 * const requesttypeEntity = { id: 123, name: "Sample Entity" };
 * 
 * <RequestTypeLargeCard requesttype={requesttypeEntity}>
 *   <p>Additional content for the middle column.</p>
 * </RequestTypeLargeCard>
 */
export const RequestTypeLargeContent = ({requesttype, children}) => {
    const { initialForm } = requesttype
    const formFromStore = useSelector(state => state.items[initialForm?.id])
    return (
        <>
            <DigitalFormLargeContent digitalform={formFromStore} />
            {/* <pre>{JSON.stringify(requesttype, null, 4)}</pre> */}
        </>
    )
}
