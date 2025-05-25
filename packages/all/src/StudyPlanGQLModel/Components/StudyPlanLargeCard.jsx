import Row from "react-bootstrap/Row"
import { ChevronLeft, ChevronRight } from 'react-bootstrap-icons';
import { LeftColumn, MiddleColumn } from "@hrbolek/uoisfrontend-shared"
import { StudyPlanCardCapsule } from "./StudyPlanCardCapsule"
import { StudyPlanMediumCard } from "./StudyPlanMediumCard"
import { useState } from "react"

const styles = {
  switchButton: {
    position: "absolute",
    top: "50vh",
    left: "-14px",
    transform: "translateY(-50vh)",
    height: "90vh",     // nebo nějaká fixní výška, pokud chceš
    maxHeight: "90vh",  // max 90 % výšky okna
    padding: "0 8px",
  }
}


/**
 * A large card component for displaying detailed content and layout for an studyplan entity.
 *
 * This component wraps an `StudyPlanCardCapsule` with a flexible layout that includes multiple
 * columns. It uses a `Row` layout with a `LeftColumn` for displaying an `StudyPlanMediumCard`
 * and a `MiddleColumn` for rendering additional children.
 *
 * @component
 * @param {Object} props - The properties for the StudyPlanLargeCard component.
 * @param {Object} props.studyplan - The object representing the studyplan entity.
 * @param {string|number} props.studyplan.id - The unique identifier for the studyplan entity.
 * @param {string} props.studyplan.name - The name or label of the studyplan entity.
 * @param {React.ReactNode} [props.children=null] - Additional content to render in the middle column.
 *
 * @returns {JSX.Element} A JSX element combining a large card layout with dynamic content.
 *
 * @example
 * // Example usage:
 * const studyplanEntity = { id: 123, name: "Sample Entity" };
 * 
 * <StudyPlanLargeCard studyplan={studyplanEntity}>
 *   <p>Additional content for the middle column.</p>
 * </StudyPlanLargeCard>
 */
export const StudyPlanLargeCard = ({studyplan, children}) => {
    const [showLeft, setShowLeft] = useState(true)
    return (
        <StudyPlanCardCapsule studyplan={studyplan} >
            <button className="btn btn-sm btn-outline-light" style={styles.switchButton} onClick={()=>setShowLeft(!showLeft)}>{showLeft ? <ChevronLeft /> : <ChevronRight />}</button> <br />
            <Row>
                {showLeft && <LeftColumn>
                    <StudyPlanMediumCard studyplan={studyplan}/>
                </LeftColumn>}
                <MiddleColumn xl={showLeft?9:12}>
                    {children}
                </MiddleColumn>
            </Row>
            {/* {!showLeft && <>{children}</>} */}
        </StudyPlanCardCapsule>
    )
}
