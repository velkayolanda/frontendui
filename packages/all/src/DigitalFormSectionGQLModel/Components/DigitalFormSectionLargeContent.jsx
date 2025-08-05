import Row from "react-bootstrap/Row"
import { LeftColumn, MiddleColumn, SimpleCardCapsuleRightCorner } from "@hrbolek/uoisfrontend-shared"
import { DigitalFormSectionCardCapsule } from "./DigitalFormSectionCardCapsule"
import { DigitalFormSectionMediumCard } from "./DigitalFormSectionMediumCard"
import { DigitalFormSectionMediumContent } from "./DigitalFormSectionMediumContent"
import { DigitalFormFieldMediumContent } from "../../DigitalFormFieldGQLModel/Components/DigitalFormFieldMediumContent"
import { Col } from "react-bootstrap"
import { DigitalFormFieldMediumEditableContent } from "../../DigitalFormFieldGQLModel/Components/DigitalFormFieldMediumEditableContent"
import { DigitalFormFieldCardCapsule } from "../../DigitalFormFieldGQLModel/Components/DigitalFormFieldCardCapsule"
import { DigitalFormFieldButton } from "../../DigitalFormFieldGQLModel/Components/DigitalFormFieldCUDButton"
import { DigitalFormSectionMediumEditableContent } from "./DigitalFormSectionMediumEditableContent"
import { DigitalFormSectionButton } from './DigitalFormSectionCUDButton'
import { ArrowDown, ArrowUp, Pencil, PlusLg, SignIntersection, Trash } from "react-bootstrap-icons"
import { DigitalSubmissionFieldMediumEditableContent } from "../../DigitalSubmissionFieldGQLModel/Components/DigitalSubmissionFieldMediumEditableContent"
import { useEffect, useState } from "react"
import { useAsyncAction } from "@hrbolek/uoisfrontend-gql-shared"
import { DigitalFormReadAsyncAction } from "../../DigitalFormGQLModel/Queries"

/**
 * A large card component for displaying detailed content and layout for an digitalformsection entity.
 *
 * This component wraps an `DigitalFormSectionCardCapsule` with a flexible layout that includes multiple
 * columns. It uses a `Row` layout with a `LeftColumn` for displaying an `DigitalFormSectionMediumCard`
 * and a `MiddleColumn` for rendering additional children.
 *
 * @component
 * @param {Object} props - The properties for the DigitalFormSectionLargeCard component.
 * @param {Object} props.digitalformsection - The object representing the digitalformsection entity.
 * @param {string|number} props.digitalformsection.id - The unique identifier for the digitalformsection entity.
 * @param {string} props.digitalformsection.name - The name or label of the digitalformsection entity.
 * @param {React.ReactNode} [props.children=null] - Additional content to render in the middle column.
 *
 * @returns {JSX.Element} A JSX element combining a large card layout with dynamic content.
 *
 * @example
 * // Example usage:
 * const digitalformsectionEntity = { id: 123, name: "Sample Entity" };
 * 
 * <DigitalFormSectionLargeCard digitalformsection={digitalformsectionEntity}>
 *   <p>Additional content for the middle column.</p>
 * </DigitalFormSectionLargeCard>
 */
export const DigitalFormSectionLargeContent = ({digitalformsection, children}) => {
    const {fields, sections} = digitalformsection
    console.log("DigitalFormSectionLargeContent.digitalformsection", digitalformsection)
    return (
        <>  
            {/* DigitalFormSectionLargeContent */}
            <DigitalFormSectionFields digitalsectionfields={fields} />
            <hr/>
            <DigitalFormFieldButton 
                operation="C" 
                className="btn btn-sm btn-outline-success form-control"
                digitalformfield={{
                    formSectionId: digitalformsection?.id,
                    id: crypto.randomUUID(),
                    name: "field",
                    label: "Položka",
                    labelEn: "Item",
                    description: "delší popis",
                    required: false,
                    order: fields.length + 1
                }}
            >
                <PlusLg  /> Přidat položku do sekce
            </DigitalFormFieldButton>

            <DigitalFormSections digitalformsections={sections} />
            {/* <pre>{JSON.stringify(digitalformsection, null, 2)}</pre> */}
        </>
    )
}

export const DigitalFormSection = ({ digitalformsection }) => {
    const {sections=[]} = digitalformsection
    const { loading, error, fetch: formrefetch } = useAsyncAction(DigitalFormReadAsyncAction, {id: digitalformsection.formId}, {deferred: true})
    const onDelete = async() => {
        console.log("refetching form from section", digitalformsection)
        const fresh = await formrefetch({id: digitalformsection.formId})
        console.log("refetched form", fresh)
    }
    return (
        <DigitalFormSectionCardCapsule key={digitalformsection?.id} digitalformsection={digitalformsection}>
            <SimpleCardCapsuleRightCorner>
                <button className="btn btn-sm btn-outline-success">E</button>
                <button className="btn btn-sm btn-outline-success">
                    <ArrowUp />
                </button>
                <button className="btn btn-sm btn-outline-success">
                    <ArrowDown />
                </button>
                <DigitalFormSectionButton
                    operation="D" 
                    className="btn btn-sm btn-outline-danger"
                    onDone={onDelete}
                    digitalformsection={digitalformsection}
                >
                    <Trash  />
                </DigitalFormSectionButton>                
            </SimpleCardCapsuleRightCorner>
            {/* <DigitalFormSectionMediumEditableContent digitalformsection={digitalformsection} /> */}
            <DigitalFormSectionLargeContent digitalformsection={digitalformsection} />
            <hr/>
            <DigitalFormSectionButton
                operation="C" 
                className="btn btn-sm btn-outline-success form-control"
                digitalformsection={{
                    sectionId: digitalformsection?.id,
                    id: crypto.randomUUID(),
                    name: "section",
                    label: "Nová vnořená sekce",
                    labelEn: "New section",
                    description: "Popis / nápověda",
                    order: sections.lenght + 1,
                    repeatable: false,
                    repeatableMin: 1,
                    repeatableMax: 1
                }}
            >
                <PlusLg  /> Přidat vnořenou sekci
            </DigitalFormSectionButton>
        </DigitalFormSectionCardCapsule>
    )
}


export const DigitalFormSections = ({ digitalformsections }) => {
    const ordered = digitalformsections.toSorted((a,b) => {
        const aorder = a?.order ?? 0;
        const border = b?.order ?? 0;
        return border - aorder
    })
    return (
        <>
        {/* DigitalFormSections */}
        {ordered.map(section => <DigitalFormSection key={section?.id} digitalformsection={section} />)}
        </>
    )
}

export const DigitalFormField = ({ digitalformfield }) => {
    const [submissionField, setSubmissionField] = useState({
        id: crypto.randomUUID(),
        field: digitalformfield,
        value: null
    })
    useEffect(
        () => setSubmissionField(old => ({...old, field: digitalformfield})),
        [digitalformfield]
    )
    // console.log("DigitalFormField", submissionField)
    const onChangeField = (e) => {
        const value = e?.target?.value
        setSubmissionField(
            old => ({...old, value})
        )
    }
    const onUpdateDone = async () => {

    }
    const onDeleteDone = async () => {

    }
    return (<>
        <DigitalSubmissionFieldMediumEditableContent digitalsubmissionfield={submissionField} onChange={onChangeField} onBlur={onChangeField}>
            <SimpleCardCapsuleRightCorner>
                {/* <button className="btn btn-sm btn-outline-success"><Pencil /></button> */}
                <DigitalFormFieldButton 
                    operation="U" 
                    className="btn btn-sm btn-outline-success"
                    digitalformfield={digitalformfield}
                    onDone={onUpdateDone}
                >
                    <Pencil />
                </DigitalFormFieldButton>
                <DigitalFormFieldButton 
                    operation="D" 
                    className="btn btn-sm btn-outline-success"
                    digitalformfield={digitalformfield}
                    onDone={onDeleteDone}
                >
                    <Trash />
                </DigitalFormFieldButton>
            </SimpleCardCapsuleRightCorner>  
        </DigitalSubmissionFieldMediumEditableContent>
         
        </>
        // <DigitalFormFieldMediumContent key={field?.id} digitalformfield={field} />
        // <DigitalFormFieldCardCapsule key={digitalformfield?.id} digitalformfield={digitalformfield}>
            // {/* <DigitalFormFieldMediumEditableContent key={digitalformfield?.id} digitalformfield={digitalformfield} /> */}
            
        // </DigitalFormFieldCardCapsule>
    )
}
export const DigitalFormSectionFields = ({ digitalsectionfields }) => {
    const ordered = digitalsectionfields.toSorted((a,b) => {
        const aorder = a?.order ?? 0;
        const border = b?.order ?? 0;
        return aorder - border
    })
    return (
        <>
        {ordered.map(field => <DigitalFormField key={field?.id} digitalformfield={field} />)}
        </>
    )
}