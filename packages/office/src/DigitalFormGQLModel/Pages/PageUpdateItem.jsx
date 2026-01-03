import React, { useMemo, useRef, useState, useCallback } from "react";

import { UpdateBody } from "../Mutations/Update"
import { PageItemBase } from "./PageBase"
import { SimpleCardCapsule, SimpleCardCapsuleRightCorner } from "../../../../_template/src/Base/Components";
import { Input } from "../../../../_template/src/Base/FormControls/Input";
import { Row } from "../../../../_template/src/Base/Components/Row";
import { Col } from "../../../../_template/src/Base/Components/Col";
import { Dialog } from "../../../../_template/src/Base/FormControls/Dialog";
import { DesignButton as DesignFieldButton } from "../../DigitalFormFieldGQLModel/Mutations/Design";
import { DesignButton as DesignSectionButton } from "../../DigitalFormSectionGQLModel/Mutations/Design";
import { AsyncActionProvider, useGQLEntityContext } from "../../../../_template/src/Base/Helpers/GQLEntityProvider";
import {
    DeleteAsyncAction as DeleteSectionAsyncAction,
    InsertAsyncAction as InsertSectionAsyncAction,
    ReadAsyncAction as ReadFormSectionAsyncAction,
    UpdateAsyncAction,
    UpdateAsyncAction as UpdateFormAsyncAction
} from "../../DigitalFormSectionGQLModel/Queries";
import { useEffect } from "react";
import { AsyncStateIndicator } from "../../../../_template/src/Base/Helpers/AsyncStateIndicator";
import {
    DeleteAsyncAction as DeleteFieldAsyncAction,
    InsertAsyncAction as InsertFieldAsyncAction,
    UpdateAsyncAction as UpdateFieldAsyncAction,
    ReadAsyncAction as ReadFormFieldAsyncAction
} from "../../DigitalFormFieldGQLModel/Queries";
import { useAsyncThunkAction } from "../../../../dynamic/src/Hooks";
import { DeleteButton as DeleteFormSectionButton } from "../../DigitalFormSectionGQLModel/Mutations/Delete";
import { UpdateButton as UpdateFormFieldButton } from "../../DigitalFormFieldGQLModel/Mutations/Update";
import { DeleteButton as DeleteFormFieldButton } from "../../DigitalFormFieldGQLModel/Mutations/Delete";
import { CreateButton as CreateFormSectionButton } from "../../DigitalFormSectionGQLModel/Mutations/Create";
import { CreateButton as CreateFormFieldButton } from "../../DigitalFormFieldGQLModel/Mutations/Create";


// const index = {
//   1: ({ children, ...props }) => <h1 {...props}>{children}</h1>,
//   2: ({ children, ...props }) => <h2 {...props}>{children}</h2>,
//   3: ({ children, ...props }) => <h3 {...props}>{children}</h3>,
//   4: ({ children, ...props }) => <h4 {...props}>{children}</h4>,
//   5: ({ children, ...props }) => <h5 {...props}>{children}</h5>,
//   6: ({ children, ...props }) => <h6 {...props}>{children}</h6>,
// };

// const UpdateFormSection = ({ item, data, level=2, index=0 }) => {
//     const {sections=[]} = item || {}
//     const {sections:s_sections=[{}]} = data || {}

//     const {fields=[]} = item || {}
//     const {field:s_fields=[{}]} = data || {}
//     const Heading = index[level] || index[6]
//     return (
//         <div className={"H"+level}>
//             {(index === 0) && <div>
//                 Form Section
//                 <Heading>{item?.label}/{item?.labelEn}({item?.name})</Heading>
//                 {item?.repeatableMin}-{item?.repeatableMax}, {item?.order}<br/>
//                 {item?.description}<br/>
//             </div>}
//             <div>
//                 Submission Sections
//                 {sections.map((s,i)=>(
//                     <UpdateFormSection key={s?.id} item={s} data={s_sections} index={i} level={level+1}/>
//                 ))}
//             </div>
//             <div>
//                 Submission Fields
//                 {fields.map(f => (
//                     <UpdateFieldWrap item={f} data={s_fields} />
//                 ))}
//             </div>
//         </div>
//     )
// }

// const UpdateField = ({ item, data={} }) => {
//     return (
//         <div>
//             {item?.label} / {item?.labelEn} ({item?.name}) [{item?.typeId}]<br/>
//             {data?.value}  <br/>
//         </div>
//     )
// }

// const UpdateFieldWrap = ({ item, data=[] }) => {
//     const filtered = data?.find(f => f?.sectionId === item?.id) || {}
//     return <UpdateField item={item} data={filtered} />
// }

// const UpdateSectionWrap = ({ item, data, index=0, level=2 }) => {
//     const filtered = data?.filter(s=>s?.formSection?.id === item?.id) || []
//     return (
//         <UpdateFormSection item={item} data={filtered} index={index} level={level} />
//     )
// }

// export const UpdateForm = ({ item, submission }) => {
//     const {sections=[]} = item || {}
//     const {sections: s_sections=[]} = submission || {}
//     return (<>
//         <h1>{item?.label}({item?.name})</h1>
//         {sections.map(s=><UpdateSectionWrap key={s?.id} item={s} data={s_sections} />)}
//     </>)
// }


/** =============================================================================
 *  Support utilities
 * ============================================================================= */

const ConfirmClickButton = ({ className, onClick = () => null, children, ...props }) => {
    const [state, setState] = useState(0)
    const handleCancel = () => setState(prev => 0)
    const handleProgress = () => setState(prev => 1)
    const handleConfirm = () => {
        setState(prev => 0)
        onClick()
    }
    return (<>
        {(state === 0) && (
            <button
                {...props}
                className={className ? className + " btn-outline-primary" : "btn btn-sm btn-outline-primary"}
                onClick={handleProgress}
            >
                {children}
            </button>
        )}
        {(state === 1) && (
            <button
                {...props}
                className={className ? className + " btn-warning" : "btn btn-sm btn-warning"}
                onClick={handleCancel}
            >
                {children}
            </button>
        )}
        {(state === 1) && (
            <button
                {...props}
                className={className ? className + " btn-danger" : "btn btn-sm btn-danger"}
                onClick={handleConfirm}
            >
                {children}
            </button>
        )}
    </>)
}

const TextDialog = ({ onOk = (value) => null, onCancel = () => null, value = "", ...props }) => {
    const [lastValue, SetLastValue] = useState(value)
    const handleCancel = () => {
        onCancel()
    }
    const handleOk = () => {
        onOk(lastValue)
    }
    const onChange = (e) => {
        const newValue = e?.target?.value
        console.log(newValue)
        SetLastValue(prev => newValue)
    }
    return (
        <Dialog {...props} onCancel={handleCancel} onOk={handleOk}>
            <Input className="form-control" value={lastValue} onChange={onChange} />
        </Dialog>
    )
}

const WrapWithDialog = ({
    children,
    id, name, value,
    onChange = (id, name, value) => null
}) => {
    const [state, setState] = useState(0)
    const handleClick = () => {
        setState(prev => 1)
    }
    const handleOk = (value) => {
        onChange(id, name, value)
        setState(prev => 0)
    }
    const handleCancel = () => {
        setState(prev => 0)
    }
    return (<>
        {(state === 1) && (
            <TextDialog value={value} onOk={handleOk} onCancel={handleCancel} />
        )}
        <span onClick={handleClick}>
            {children}
        </span>
    </>)
}

/** ---------- Headings ---------- */
const headingIndex = {
    1: (p) => <h1 {...p} />,
    2: (p) => <h2 {...p} />,
    3: (p) => <h3 {...p} />,
    4: (p) => <h4 {...p} />,
    5: (p) => <h5 {...p} />,
    6: (p) => <h6 {...p} />,
};


/** ---------- Safe clone ----------
 *  Uses structuredClone if available; falls back to JSON clone.
 *  For your GQL models (plain objects) this is ok.
 */
const deepClone = (obj) => {
    if (typeof structuredClone === "function") return structuredClone(obj);
    return JSON.parse(JSON.stringify(obj));
};










const clamp = (n, a, b) => Math.max(a, Math.min(b, n));


const stableId = () => (globalThis.crypto?.randomUUID ? globalThis.crypto.randomUUID() : `${Date.now()}-${Math.random()}`);

const normalizeFieldsForSection = (section, formSectionDef) => {
    const existing = section?.fields ?? [];
    const defFields = formSectionDef?.fields ?? [];

    // index existujících podle fieldId
    const byFieldId = new Map();
    for (const sf of existing) {
        const fid = sf?.fieldId;
        if (!fid) continue;
        // beru první; pokud jich je víc (data bug), zbytek se v "strict" režimu zahodí
        if (!byFieldId.has(fid)) byFieldId.set(fid, sf);
    }

    const next = defFields.map((fd) => {
        const fid = fd?.id;
        const found = byFieldId.get(fid);
        return found ?? {
            id: stableId(),
            sectionId: section?.id,
            submissionId: section?.submissionId,
            fieldId: fid,
            value: "",
        };
    });

    return next;
};

const normalizeSubsectionsForSection = (section, formSectionDef) => {
    const existing = section?.sections ?? [];
    const defSections = formSectionDef?.sections ?? [];

    // group existing by formSectionId (child definition)
    const bucket = new Map();
    for (const ss of existing) {
        const fsid = ss?.formSectionId;
        if (!fsid) continue;
        if (!bucket.has(fsid)) bucket.set(fsid, []);
        bucket.get(fsid).push(ss);
    }

    const out = [];

    for (const childDef of defSections) {
        const fsid = childDef?.id;
        const arr = bucket.get(fsid) ?? [];

        const min = childDef?.repeatableMin ?? 0;
        const max = childDef?.repeatableMax ?? 1;
        const repeatable = childDef?.repeatable ?? (max > 1);

        // kolik instancí chceme udržet
        const desired = repeatable ? clamp(arr.length || min || 1, Math.max(1, min), max) : 1;

        // vezmi existující do desired
        const kept = arr.slice(0, desired).map((x) => ({
            ...x,
            // parent link
            sectionId: section?.id,
            submissionId: section?.submissionId,
            formSectionId: fsid,
            // default containers
            fields: x?.fields ?? [],
            sections: x?.sections ?? [],
        }));

        // doplň chybějící
        while (kept.length < desired) {
            kept.push({
                id: stableId(),
                sectionId: section?.id,
                submissionId: section?.submissionId,
                formSectionId: fsid,
                fields: [],
                sections: [],
            });
        }

        out.push(...kept);
    }

    return out;
};



















/** =============================================================================
 *  Components: UpdateField, UpdateFormSection, UpdateForm
 * ============================================================================= */

const DefaultSubmissionFieldDefinitionPreview = ({ fieldDef, digital_submission_field, onSubmissionFieldChange, mode }) => (
    <div className="mb-2">
        <div className="text-muted small">
            {fieldDef?.description && <div>{fieldDef.description}</div>}
            {fieldDef?.labelEn && <div>{fieldDef.labelEn}</div>}
        </div>
    </div>
);

const DefaultSubmissionRead = ({ 
    children,
    ...props
}) => {
    const {
        fieldDef,
        digital_submission_field,
        onSubmissionFieldChange,
        mode,
    } = props
    return (<>{(mode==="design") && <DefaultSubmissionFieldDefinitionPreview {...props} />}
        <div className="py-2">
            {digital_submission_field?.value ?? <span className="text-muted">--</span>}
        </div>
    </>);
}

const SubmissionFieldEdit = ({
    children, ...props
}) => {
    const {
        fieldDef,
        digital_submission_field,
        onSubmissionFieldChange,
        mode,
    } = props
    
    const resolvedValue = digital_submission_field?.value ?? "";
    const resolvedPlaceholder = fieldDef?.description ?? "";

    const handleValueChange = (e) => {
        const newValue = e?.target?.value;
        onSubmissionFieldChange?.({
            ...digital_submission_field,
            field: fieldDef,
            fieldId: fieldDef?.id,
            value: newValue,
        });
    };

    return (<>{(mode==="design") && <DefaultSubmissionFieldDefinitionPreview {...props} />}
        <Input
            className="form-control"
            value={resolvedValue}
            onChange={handleValueChange}
            placeholder={resolvedPlaceholder}
            disabled={mode==="design"}
        />
    </>);
};

export const UpdateField = ({
    fieldDef,
    digital_submission_field,
    // onFieldValueChange,
    onSubmissionFieldChange,
    reRead,
    mode = "design",
    children,
    SubmissionFieldComponent = SubmissionFieldEdit
}) => {
    
    // const handleFieldDefChange = useCallback(())
    const {
        run: deleteField, error: errorDeleteField, loading: deletingField,
        // entity, data 
    } = useAsyncThunkAction(DeleteFieldAsyncAction, empty, { deferred: true })

    const handleDelete = useCallback(async () => {
        const result = await deleteField({
            id: fieldDef?.id,
            lastchange: fieldDef?.lastchange
        })
        reRead()
    }, [deleteField])

    const normalizeSubmissionField = useCallback(
        (partial) => ({
            ...digital_submission_field,
            fieldId: fieldDef?.id,
            field: fieldDef,
            ...partial,
        }),
        [digital_submission_field, fieldDef]
    );

    const handleSubmissionChange = useCallback(
        (next) => {
            const partial =
                next && typeof next === "object" && !Array.isArray(next)
                    ? next
                    : { value: next };
            const result = normalizeSubmissionField(partial)
            // console.log("UpdateField.handleSubmissionChange", next, "=>", result)
            onSubmissionFieldChange(result);
        },
        [normalizeSubmissionField, onSubmissionFieldChange]
    );

    return (
        <AsyncActionProvider item={fieldDef} queryAsyncAction={ReadFormFieldAsyncAction} options={{ deferred: true }}>
            <AsyncStateIndicator error={errorDeleteField} loading={deletingField} text="Odstraňuji položku" />
            <SimpleCardCapsule
                className="border-start border-2 border-success"
                title={<>
                    <strong>{fieldDef?.label ?? "------------"}</strong>{" "}
                    {(mode === "design") && <small>{fieldDef?.name ?? "------------"}</small>}{" "}
                    {fieldDef?.required ? <strong>*</strong> : null}
                </>}
                style={{ paddingLeft: 12, border: "none", borderLeftx: "2px solid #3a7900ff", }}
            >
                {(mode === "design") &&
                    <SimpleCardCapsuleRightCorner>
                        <UpdateFormFieldButton className="btn btn-sm btn-outline-primary border-0" >
                            🖍
                        </UpdateFormFieldButton>
                        {/* <ConfirmClickButton className="btn btn-sm border-0" type="button" onClick={handleUpdate} title="Upravit field">
                            Pencil
                        </ConfirmClickButton> */}
                        <ConfirmClickButton className="btn btn-sm border-0" type="button" onClick={handleDelete} title="Remove field">
                            🗑
                        </ConfirmClickButton>
                    </SimpleCardCapsuleRightCorner>
                }
                {/* {JSON.stringify(fieldDef)}
                <hr/>
                {JSON.stringify(sectionInstance)} */}

                {/* <Input
                    className="form-control" value={value}
                    onChange={handleChange}
                    placeholder="Enter value…"
                /> */}
                
                <SubmissionFieldComponent
                    onSubmissionFieldChange={handleSubmissionChange}
                    fieldDef={fieldDef}
                    digital_submission_field={digital_submission_field}
                    mode={mode}
                />
                
            </SimpleCardCapsule>
        </AsyncActionProvider>
    );
};

const empty = {}
const dummy = () => { }
export const FormSectionFields = ({
    formSectionDefFields = [],
    digital_submission_sectionFields = [],
    reRead,
    mode,
    onSubmissionFieldChange,
    SubmissionFieldComponent = SubmissionFieldEdit
}) => {
    const formfieldsSorted = useMemo(
        () => formSectionDefFields?.toSorted((a, b) => (a?.order || 0) - (b?.order || 0)) ?? [],
        [formSectionDefFields]
    )
    const digital_submission_sectionFieldsSorted = useMemo(
        () => digital_submission_sectionFields?.toSorted((a, b) => (a?.order || 0) - (b?.order || 0)) ?? [],
        [digital_submission_sectionFields]
    )
    return (<>
        {/* <br/>F{JSON.stringify(formfieldsSorted.length)}/D{JSON.stringify(digital_submission_sectionFields.length)} */}
        {(formfieldsSorted || []).map(
            form_field => {
                const submission_fields = digital_submission_sectionFieldsSorted
                const filtered = submission_fields.filter(
                    sf => sf?.fieldId === form_field?.id
                )

                return (<div key={form_field?.id}>
                    {filtered.map(submission_field =>
                        <UpdateField
                            key={submission_field?.id}
                            fieldDef={form_field}
                            reRead={reRead}
                            mode={mode}
                            digital_submission_field={submission_field}
                            onSubmissionFieldChange={onSubmissionFieldChange}
                            SubmissionFieldComponent={SubmissionFieldComponent}
                        />
                    )}
                </div>)
            }
        )}

    </>)
}

const FormSectionSections = ({
    formSections = [],
    submissionSections = [],
    level,
    dummy,
    mode,
    onSubmissionSectionChange,
    onRemoveSubmissionSection,
    SubmissionFieldComponent = SubmissionFieldEdit,
    FormSectionComponent = UpdateFormSection
}) => {
    const handleAddSubmissionSection = useCallback(
        (formSectionDef) => {
            const payload = {
                id: stableId(),
                formSectionId: formSectionDef?.id,
                sections: [],
                fields: [],
            };
            onSubmissionSectionChange(payload);
        },
        [onSubmissionSectionChange]
    )

    const handleRemoveSubmissionSection = useCallback(
        (formSectionDef, targetSection, count) => {
            const min = formSectionDef?.repeatableMin ?? 0;
            if (count <= min) return;
            if (onRemoveSubmissionSection) {
                onRemoveSubmissionSection(targetSection);
            }
        },
        [onRemoveSubmissionSection]
    )

    const formSectionsSorted = useMemo(
        () => (formSections || []).toSorted((a, b) => (a?.order || 0) - (b?.order || 0)),
        [formSections]
    )
    const submissionSectionsSorted = useMemo(
        () => (submissionSections || []).toSorted((a, b) => (a?.order || 0) - (b?.order || 0)),
        [submissionSections]
    )
    return (
        <>
            {/* S{JSON.stringify(formSectionsSorted.length)}/Ds{JSON.stringify(submissionSectionsSorted.length)} */}
            {formSectionsSorted.map((form_section) => {
                const filtered = submissionSectionsSorted.filter(
                    (s) => s?.formSectionId === form_section?.id
                )
                return (
                    <div key={form_section?.id}>
                        {filtered.map((sectionInstance, index) => (
                            <div key={sectionInstance?.id}>
                                <UpdateSectionWrap
                                    formSectionDef={form_section}
                                    level={level + 1}
                                    dummy={dummy}
                                    mode={mode}
                                    digital_submission_sections={[sectionInstance]}
                                    onSubmissionSectionChange={onSubmissionSectionChange}
                                    SubmissionFieldComponent={SubmissionFieldComponent}
                                    FormSectionComponent={FormSectionComponent}
                                />
                                {filtered.length > (form_section?.repeatableMin ?? 0) && (
                                    <button
                                        className="form-control btn btn-outline-danger mt-2"
                                        type="button"
                                        onClick={() =>
                                            handleRemoveSubmissionSection(form_section, sectionInstance, filtered.length)
                                        }
                                        disabled={mode === "view"}
                                    >
                                        - {form_section?.label ?? form_section?.name ?? "section"} [{index+1}]
                                    </button>
                                )}
                            </div>
                        ))}
                        {(form_section?.repeatableMax > filtered.length) && (
                            <button
                                className="form-control btn btn-outline-primary"
                                type="button"
                                onClick={() => handleAddSubmissionSection(form_section)}
                                disabled={mode === "view"}
                            >
                                + {form_section?.label ?? form_section?.name ?? "section"} [{filtered.length}/{form_section?.repeatableMax}]
                            </button>
                        )}
                    </div>
                )
            })}
        </>
    )
}

export const ReadFormSection = ({
    formSectionDef,
    level = 2,
    dummy = true,
    mode = "design",
    digital_submission_section = empty,
    onSubmissionSectionChange = dummy,
    SubmissionFieldComponent= SubmissionFieldEdit,
    children
}) => {

    const handleSubmissionFieldChange = useCallback((submission_field) => {
        const new_section = {
            ...digital_submission_section,
            id: digital_submission_section?.id,              // ← STABILNÍ
            fields: digital_submission_section?.fields || []
        };

        const new_submission_field = {
            ...submission_field,
            sectionId: new_section.id,                       // ← navázat na stabilní section.id
        };

        // upsert podle fieldId (ne podle submission_field.id!)
        const hasIdx = new_section.fields.findIndex(f => f?.fieldId === new_submission_field.fieldId);
        new_section.fields =
            hasIdx >= 0
                ? new_section.fields.map((f, i) => i === hasIdx ? { ...f, ...new_submission_field } : f)
                : [...new_section.fields, new_submission_field];

        onSubmissionSectionChange(new_section);
    }, [digital_submission_section, onSubmissionSectionChange]);

    const handleSubmissionSectionChange = useCallback((child) => {
        const parentId = digital_submission_section?.id ?? stableId();

        const normalizedChild = { ...child, sectionId: parentId };

        const new_section = {
            ...digital_submission_section,
            id: parentId,
            sections: digital_submission_section?.sections || [],
        };

        const idx = new_section.sections.findIndex(s => s?.id === normalizedChild.id);
        new_section.sections =
            idx >= 0
                ? new_section.sections.map((s, i) => i === idx ? normalizedChild : s)
                : [...new_section.sections, normalizedChild];

        onSubmissionSectionChange(new_section);
    }, [digital_submission_section, onSubmissionSectionChange]);

    const max = formSectionDef?.repeatableMax ?? 1;
    const repeatable = formSectionDef?.repeatable ?? (max > 1);

    const H = headingIndex[clamp(level, 1, 6)] ?? headingIndex[6];
   
    const { reRead } = useGQLEntityContext()
    

    useEffect(() => {
        // bezpečně: bez id nemá cenu normalizovat
        if (!digital_submission_section?.id || !formSectionDef?.id) return;

        const current = digital_submission_section;

        const normalizedBase = {
            ...current,
            // jistota vazeb
            formSectionId: current?.formSectionId ?? formSectionDef?.id,
            fields: normalizeFieldsForSection(current, formSectionDef),
        };
        const normalizedSections = normalizeSubsectionsForSection(current, formSectionDef);
        const normalizedSectionIds = new Set(normalizedSections.map((s) => s?.id));
        const mergedSections = [
            ...normalizedSections,
            ...(current?.sections ?? []).filter((s) => s?.id && !normalizedSectionIds.has(s.id)),
        ];

        const normalized = {
            ...normalizedBase,
            sections: mergedSections,
        };

        // velmi jednoduchá "changed" detekce:
        // - počet fields/sections
        // - set fieldIdů
        // - set (formSectionId, parent sectionId) u subsekcí
        const sameFields =
            (current?.fields?.length ?? 0) === (normalized.fields?.length ?? 0) &&
            (current?.fields ?? []).every((sf) =>
                normalized.fields.some((nf) => nf.fieldId === sf.fieldId && nf.sectionId === sf.sectionId)
            );

        const sameSections =
            (current?.sections?.length ?? 0) === (normalized.sections?.length ?? 0) &&
            (current?.sections ?? []).every((ss) =>
                normalized.sections.some((ns) => ns.id === ss.id || (ns.formSectionId === ss.formSectionId && ns.sectionId === ss.sectionId))
            );

        if (!sameFields || !sameSections) {
            onSubmissionSectionChange(normalized);
        }
    }, [digital_submission_section, formSectionDef, onSubmissionSectionChange]);


    const handleRemoveChildSubmissionSection = useCallback(
        (child) => {
            const parentId = digital_submission_section?.id ?? stableId();
            const nextSections = (digital_submission_section?.sections || []).filter(
                (s) => s?.id !== child?.id
            );
            onSubmissionSectionChange({
                ...digital_submission_section,
                id: parentId,
                sections: nextSections,
            });
        },
        [digital_submission_section, onSubmissionSectionChange]
    );

    return (
        <SimpleCardCapsule title={<>
            {(mode === "design") && (<>{formSectionDef?.label ?? formSectionDef?.name}{" "}</>)}
            {(mode === "design") && <small>({formSectionDef?.name})</small>}
        </>}
            // className="border-start border-danger ps-3"
            style={{ paddingLeft: 12, borderLeft: "2px solid #e02222ff" }}
        >

            <div>
                <H>{formSectionDef?.label ?? "--NEOZNAČEN--"}</H>
                {(mode === "design") && (<div>
                    repeat: {formSectionDef?.repeatableMin ?? "undef"}-
                    {formSectionDef?.repeatableMax ?? "undef"} ({repeatable ? "repeatable" : "single"})
                </div>)}
                {formSectionDef?.description ?? "--NEPOPSÁN--"}

                <div>
                    <FormSectionBody 
                        formSectionDef={formSectionDef}
                        digital_submission_section={digital_submission_section}
                        level={level}
                        dummy={dummy}
                        mode={mode}
                        reRead={reRead}
                        onSubmissionSectionChange={handleSubmissionSectionChange}
                        onSubmissionFieldChange={handleSubmissionFieldChange}
                        // onAddSubmissionSection=dummyFunc,
                        onRemoveSubmissionSection={handleRemoveChildSubmissionSection}
                        SubmissionFieldComponent={SubmissionFieldComponent}
                    />
                    {/* <FormSectionFields
                        formSectionDefFields={formSectionDef?.fields || []}
                        digital_submission_sectionFields={digital_submission_section?.fields || []}
                        reRead={reRead}
                        mode={mode}
                        onSubmissionFieldChange={handleSubmissionFieldChange}
                        SubmissionFieldComponent={SubmissionFieldComponent}
                        
                    />
                    <FormSectionSections
                        formSections={formSectionDef?.sections || []}
                        submissionSections={digital_submission_section?.sections || []}
                        level={level}
                        dummy={dummy}
                        mode={mode}
                        onSubmissionSectionChange={handleSubmissionSectionChange}
                        onRemoveSubmissionSection={handleRemoveChildSubmissionSection}
                        SubmissionFieldComponent={SubmissionFieldComponent}
                    /> */}
                </div>
            </div>
        </SimpleCardCapsule>
    );
};


export const UpdateFormSection = ({
    formSectionDef,
    level = 2,
    dummy = true,
    mode = "design",
    digital_submission_section = empty,
    onSubmissionSectionChange = dummy,
    SubmissionFieldComponent = SubmissionFieldEdit,
    UpdateFormSectionComponent = UpdateFormSection,
    children
}) => {

    const handleSubmissionFieldChange = useCallback((submission_field) => {
        const new_section = {
            ...digital_submission_section,
            id: digital_submission_section?.id,              // ← STABILNÍ
            fields: digital_submission_section?.fields || []
        };

        const new_submission_field = {
            ...submission_field,
            sectionId: new_section.id,                       // ← navázat na stabilní section.id
        };

        // upsert podle fieldId (ne podle submission_field.id!)
        const hasIdx = new_section.fields.findIndex(f => f?.fieldId === new_submission_field.fieldId);
        new_section.fields =
            hasIdx >= 0
                ? new_section.fields.map((f, i) => i === hasIdx ? { ...f, ...new_submission_field } : f)
                : [...new_section.fields, new_submission_field];

        onSubmissionSectionChange(new_section);
    }, [digital_submission_section, onSubmissionSectionChange]);

    const handleSubmissionSectionChange = useCallback((child) => {
        const parentId = digital_submission_section?.id ?? stableId();

        const normalizedChild = { ...child, sectionId: parentId };

        const new_section = {
            ...digital_submission_section,
            id: parentId,
            sections: digital_submission_section?.sections || [],
        };

        const idx = new_section.sections.findIndex(s => s?.id === normalizedChild.id);
        new_section.sections =
            idx >= 0
                ? new_section.sections.map((s, i) => i === idx ? normalizedChild : s)
                : [...new_section.sections, normalizedChild];

        onSubmissionSectionChange(new_section);
    }, [digital_submission_section, onSubmissionSectionChange]);

    const max = formSectionDef?.repeatableMax ?? 1;
    const repeatable = formSectionDef?.repeatable ?? (max > 1);

    const H = headingIndex[clamp(level, 1, 6)] ?? headingIndex[6];
    const {
        run: update, error: errorUpdate, loading: updating,
        // entity, data 
    } = useAsyncThunkAction(UpdateAsyncAction, empty, { deferred: true })
    const {
        run: insertSection, error: errorInsertSection, loading: creatingSection,
        // entity, data 
    } = useAsyncThunkAction(InsertSectionAsyncAction, empty, { deferred: true })
    const {
        run: deleteSection, error: errorDeleteSection, loading: deletingSection,
        // entity, data 
    } = useAsyncThunkAction(DeleteSectionAsyncAction, empty, { deferred: true })
    const {
        run: insertField, error: errorInsertField, loading: creatingField,
        // entity, data 
    } = useAsyncThunkAction(InsertFieldAsyncAction, empty, { deferred: true })

    const { reRead } = useGQLEntityContext()
    const onAddSubSection = useCallback(async (id) => {
        console.log("onAddSubSection", id)
        const itemid = crypto.randomUUID();
        const result = await insertSection({
            sectionId: formSectionDef?.id,
            id: itemid,
            formId: formSectionDef?.formId,
            name: `sekce_${level}_${formSectionDef?.sections?.length + 1}`,
            label: `${level}.${formSectionDef?.sections?.length + 1}. Nová sekce`,
            labelEn: "New section",
            description: `Sekce ${level}.${formSectionDef?.sections?.length + 1}`,
            repeatableMin: 1,
            repeatableMax: 1,
            fields: [
                {
                    id: crypto.randomUUID(),
                    formSectionId: itemid,
                    formId: formSectionDef?.formId,
                    label: "Nová položka",
                    labelEn: "New field",
                    name: "field",
                    order: formSectionDef?.sections?.length + 1
                }
            ]
        })
        console.log("onAddSubSection.result", result)
    }, [insertSection, level, formSectionDef])

    const onRemoveSection = useCallback(async (e) => {
        console.log("onRemoveSection", e)
        const result = await deleteSection({
            id: formSectionDef?.id,
            lastchange: formSectionDef?.lastchange
        })
        console.log("onRemoveSection.result", result)
        reRead()
    }, [reRead, deleteSection])

    const onAddField = useCallback(async (e) => {
        console.log("onAddField", e)
        const itemid = crypto.randomUUID();
        const result = await insertField({
            formSectionId: formSectionDef?.id,
            id: itemid,
            formId: formSectionDef?.formId,
            name: `field_${level}_${formSectionDef?.fields?.length + 1}`,
            label: `${level}.${formSectionDef?.fields?.length + 1}. Nová položka`,
            labelEn: "New field",
            order: formSectionDef?.fields?.length + 1
        })
        console.log("onAddField.result", result)
    }, [insertField, level, formSectionDef])


    useEffect(() => {
        // bezpečně: bez id nemá cenu normalizovat
        if (!digital_submission_section?.id || !formSectionDef?.id) return;

        const current = digital_submission_section;

        const normalizedBase = {
            ...current,
            // jistota vazeb
            formSectionId: current?.formSectionId ?? formSectionDef?.id,
            fields: normalizeFieldsForSection(current, formSectionDef),
        };
        const normalizedSections = normalizeSubsectionsForSection(current, formSectionDef);
        const normalizedSectionIds = new Set(normalizedSections.map((s) => s?.id));
        const mergedSections = [
            ...normalizedSections,
            ...(current?.sections ?? []).filter((s) => s?.id && !normalizedSectionIds.has(s.id)),
        ];

        const normalized = {
            ...normalizedBase,
            sections: mergedSections,
        };

        // velmi jednoduchá "changed" detekce:
        // - počet fields/sections
        // - set fieldIdů
        // - set (formSectionId, parent sectionId) u subsekcí
        const sameFields =
            (current?.fields?.length ?? 0) === (normalized.fields?.length ?? 0) &&
            (current?.fields ?? []).every((sf) =>
                normalized.fields.some((nf) => nf.fieldId === sf.fieldId && nf.sectionId === sf.sectionId)
            );

        const sameSections =
            (current?.sections?.length ?? 0) === (normalized.sections?.length ?? 0) &&
            (current?.sections ?? []).every((ss) =>
                normalized.sections.some((ns) => ns.id === ss.id || (ns.formSectionId === ss.formSectionId && ns.sectionId === ss.sectionId))
            );

        if (!sameFields || !sameSections) {
            onSubmissionSectionChange(normalized);
        }
    }, [digital_submission_section, formSectionDef, onSubmissionSectionChange]);

    const handleAddChildSubmissionSection = useCallback(
        (child) => {
            const parentId = digital_submission_section?.id ?? stableId();
            const normalizedChild = { ...child, sectionId: parentId };
            const nextSections = [
                ...(digital_submission_section?.sections || []),
                normalizedChild,
            ];
            onSubmissionSectionChange({
                ...digital_submission_section,
                id: parentId,
                sections: nextSections,
            });
        },
        [digital_submission_section, onSubmissionSectionChange]
    );

    const handleRemoveChildSubmissionSection = useCallback(
        (child) => {
            const parentId = digital_submission_section?.id ?? stableId();
            const nextSections = (digital_submission_section?.sections || []).filter(
                (s) => s?.id !== child?.id
            );
            onSubmissionSectionChange({
                ...digital_submission_section,
                id: parentId,
                sections: nextSections,
            });
        },
        [digital_submission_section, onSubmissionSectionChange]
    );

    return (
        <AsyncActionProvider item={formSectionDef} queryAsyncAction={ReadFormSectionAsyncAction} options={{ deferred: true }}>
            <AsyncStateIndicator error={errorUpdate} loading={updating} text="Ukládám" />
            <AsyncStateIndicator error={errorInsertSection} loading={creatingSection} text="Vytvářím sekci" />
            <AsyncStateIndicator error={errorDeleteSection} loading={deletingSection} text="Odstraňuji sekci" />

            <SimpleCardCapsule title={<>
                {(mode === "design") && (<>{formSectionDef?.label ?? formSectionDef?.name}{" "}</>)}
                {(mode === "design") && <small>({formSectionDef?.name})</small>}
            </>}
                // className="border-start border-danger ps-3"
                style={{ paddingLeft: 12, borderLeft: "2px solid #e02222ff" }}
            >

                {(mode === "design") &&
                    <SimpleCardCapsuleRightCorner>
                        <DesignSectionButton
                            className="btn btn-sm btn-outline-primary border-0"
                        >🖍</DesignSectionButton>

                        <ConfirmClickButton className="btn btn-sm border-0" onClick={onAddSubSection}>
                            + Sekce
                        </ConfirmClickButton>
                        <ConfirmClickButton className="btn btn-sm border-0" onClick={onAddField}>
                            + Položka
                        </ConfirmClickButton>
                        <ConfirmClickButton className="btn btn-sm border-0" onClick={onRemoveSection}>
                            🗑
                        </ConfirmClickButton>
                    </SimpleCardCapsuleRightCorner>
                }
                <div>
                    <H>{formSectionDef?.label ?? "--NEOZNAČEN--"}</H>
                    {(mode === "design") && (<div>
                        repeat: {formSectionDef?.repeatableMin ?? "undef"}-
                        {formSectionDef?.repeatableMax ?? "undef"} ({repeatable ? "repeatable" : "single"})
                    </div>)}
                    {formSectionDef?.description ?? "--NEPOPSÁN--"}

                    <div>
                        <FormSectionBody
                            formSectionDef={formSectionDef}
                            digital_submission_section={digital_submission_section}
                            mode={mode}
                            level={level}
                            dummy={dummy}
                            reRead={reRead}
                            onSubmissionFieldChange={handleSubmissionFieldChange}
                            onSubmissionSectionChange={handleSubmissionSectionChange}
                            SubmissionFieldComponent={SubmissionFieldComponent}
                            onAddSubmissionSection={handleAddChildSubmissionSection}
                            onRemoveSubmissionSection={handleRemoveChildSubmissionSection}
                        />
                    </div>
                </div>
            </SimpleCardCapsule>
        </AsyncActionProvider>
    );
};

const DummyFieldsAndSections = {fields: [], sections: []}
const FormSectionBody = ({
    formSectionDef=DummyFieldsAndSections,
    digital_submission_section=DummyFieldsAndSections,
    level=2,
    dummy=dummy,
    mode="design",
    reRead=dummyFunc,
    onSubmissionSectionChange=dummyFunc,
    onSubmissionFieldChange=dummyFunc,
    // onAddSubmissionSection=dummyFunc,
    onRemoveSubmissionSection=dummyFunc,
    SubmissionFieldComponent=dummyFunc,
    ...props
}) => {
    // console.log("formSectionDef?.sections", formSectionDef?.sections)
    return (<>
        {/* S{JSON.stringify(formSectionDef?.sections.length)}/F{JSON.stringify(formSectionDef?.fields.length)} */}
        <FormSectionFields
            formSectionDefFields={formSectionDef?.fields || []}
            digital_submission_sectionFields={digital_submission_section?.fields || []}
            reRead={reRead}
            mode={mode}
            onSubmissionFieldChange={onSubmissionFieldChange}
            SubmissionFieldComponent={SubmissionFieldComponent}
        />
        <FormSectionSections
            formSections={formSectionDef?.sections || []}
            submissionSections={digital_submission_section?.sections || []}
            level={level}
            dummy={dummy}
            mode={mode}
            onSubmissionSectionChange={onSubmissionSectionChange}
            // onAddSubmissionSection={onAddSubmissionSection}
            onRemoveSubmissionSection={onRemoveSubmissionSection}
            SubmissionFieldComponent={SubmissionFieldComponent}
        />
    </>)
}

const UpdateSectionWrap = ({
    digital_submission_sections,
    FormSectionComponent=UpdateFormSection,
    ...props
}) => {
    const { formSectionDef } = props
    if (digital_submission_sections.length === 0) {
        return <FormSectionComponent {...props} digital_submission_section={{
            id: crypto.randomUUID(),
            formSectionId: formSectionDef?.id,
            sections: [],
            fields: []
        }} />
    }
    return (<>
        {digital_submission_sections.map(
            digital_submission_section => <FormSectionComponent
                key={digital_submission_section?.id}
                digital_submission_section={digital_submission_section}
                {...props}
            />
        )}
    </>)
}

const dummyFunc = () => { }
export const UpdateForm = ({
    item: initialFormDef,
    submission: initialSubmission,
    dummy = true,
    debug = true,

    FormSectionComponent = UpdateFormSection,

    /** Event hooks for your GraphQL mutations */
    onFormDefinitionChange = dummyFunc, // (nextFormDef, meta) => void
    onSubmissionChange = dummyFunc, // (nextSubmission, meta) => void
    onPersist = dummyFunc, // ({formDef, submission, meta}) => void (debounced)
}) => {
    // Master states
    const formDef = initialFormDef
    const [mode, setMode] = useState("design")
    const [submission, setSubmission] = useState(() => ({
        ...(deepClone(initialSubmission ?? {})),
        sections: initialSubmission?.sections ?? [],
        fields: initialSubmission?.fields ?? [],
        ds: [],
    }));

    // useEffect(()=>{
    //     setFormDef(()=>deepClone(initialFormDef ?? {}))
    // },[initialFormDef, setFormDef])
    const handleSubmissionSectionChange = useCallback((submission_section) => {
        setSubmission(prev => {
            const { ds = [] } = prev
            const idx = ds.findIndex(s => s?.id === submission_section?.id)
            const existing = idx >= 0 ? ds[idx] : undefined

            const merged = existing
                ? {
                    ...existing,
                    ...submission_section,
                    // prefer incoming sections when present; otherwise keep existing to avoid accidental drops
                    sections: submission_section?.sections?.length
                        ? submission_section.sections
                        : existing.sections,
                }
                : submission_section

            const newds = idx >= 0
                ? ds.map((s, i) => (i === idx ? merged : s))
                : [...ds, merged]

            const result = {
                ...prev,
                ds: newds
            }
            console.log("handleSubmissionSectionChange", submission_section, prev, result)

            return result

        })
        // console.log(submission_section)
    }, [])
    /** ---------------------------
     *  Designer changes (structure)
     * --------------------------- */


    const {
        run: insertSection, error: errorInsertSection, loading: creatingSection,
        // entity, data 
    } = useAsyncThunkAction(InsertSectionAsyncAction, empty, { deferred: true })

    const handleCreate = useCallback(async () => {
        const sectionid = crypto.randomUUID()
        const result = await insertSection({
            id: sectionid,
            formId: initialFormDef?.id,
            name: `sekce`,
            label: 'Sekce',
            repeatable: false,
            repeatableMin: 1,
            repeatableMax: 1,
            fields: [{
                id: crypto.randomUUID(),
                name: "field",
                label: "Položka"
            }]
        })
        console.log(result)
        return result
    }, [insertSection])

    // const handleCreate = () => null
    /** ---------------------------
     *  Render
     * --------------------------- */
    return (
        <Row>
            <Col>
                <SimpleCardCapsule title={formDef?.name ?? "Form"}>
                    <SimpleCardCapsuleRightCorner>
                        {mode === 'design' && (<ConfirmClickButton
                            onClick={handleCreate}
                            className="btn btn-sm border-0"
                        >
                            + Sekce
                        </ConfirmClickButton>)}
                        <button className="btn btn-success btn-sm border-0" onClick={() => setMode(prev => prev === 'design' ? 'view' : 'design')}>
                            {mode === 'design' ? 'design' : 'view'}
                        </button>
                    </SimpleCardCapsuleRightCorner>

                    <h1>{formDef?.name ?? "Form"}</h1>
                    {formDef?.description && "--NEVYPLNĚNO--"}
                    <div>
                        {(formDef?.sections ?? []).map((secDef) => {
                            const digital_submission_sections =
                                submission?.ds?.filter(s => s?.formSectionId === secDef?.id) || []
                            return (
                                <UpdateSectionWrap
                                    digital_submission_sections={digital_submission_sections}
                                    onSubmissionSectionChange={handleSubmissionSectionChange}
                                    key={secDef?.id}
                                    formSectionDef={secDef}
                                    submission={submission}
                                    level={2}
                                    dummy={dummy}
                                    mode={mode}
                                    FormSectionComponent={FormSectionComponent}
                                // onFieldValueChange={handleFieldValueChange}
                                />
                            )
                        })}
                    </div>
                </SimpleCardCapsule>
            </Col>
            {debug && (
                <Col>
                    <SimpleCardCapsule title="Draft submission">
                        <pre>{JSON.stringify(submission?.ds, null, 2)}</pre>
                    </SimpleCardCapsule>
                    <SimpleCardCapsule title="Draft submission">
                        <pre>{JSON.stringify(submission, null, 2)}</pre>
                    </SimpleCardCapsule>
                    <pre>{JSON.stringify(initialFormDef, null, 2)}</pre>
                </Col>)}
            {debug && (
                <Col>
                    <SimpleCardCapsule title="Draft form definition">
                        <pre>{JSON.stringify(formDef, null, 2)}</pre>
                    </SimpleCardCapsule>
                </Col>
            )}
        </Row>

    );
};





export const PageUpdateItem = ({
    SubPage = UpdateForm,
    ...props
}) => {
    return (
        <PageItemBase
            SubPage={SubPage}
            {...props}
        />
    )
}




