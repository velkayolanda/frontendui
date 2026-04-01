import { useMemo } from "react";
import { CardCapsule, Col, Row } from "../../../../_template/src/Base";
import { Attribute, formatDateTime } from "../../../../_template/src/Base"
import { Link as BaseLink} from "../../../../_template/src/Base/Components/Link"

const groupEvaluations = (data) => {
    const subjectsMap = new Map();

    for (const evalItem of data) {
        const subject = evalItem?.semester?.subject;
        const semester = evalItem?.semester;

        if (!subject || !semester) continue;

        // SUBJECT
        if (!subjectsMap.has(subject.id)) {
            subjectsMap.set(subject.id, {
                ...subject,
                semesters: new Map()
            });
        }

        const subjectEntry = subjectsMap.get(subject.id);

        // SEMESTER
        if (!subjectEntry.semesters.has(semester.id)) {
            subjectEntry.semesters.set(semester.id, {
                ...semester,
                evaluations: []
            });
        }

        const semesterEntry = subjectEntry.semesters.get(semester.id);

        // EVALUATION
        semesterEntry.evaluations.push(evalItem);
    }

    // převod na pole + sort
    const result = Array.from(subjectsMap.values()).map(subject => {
        const semesters = Array.from(subject.semesters.values())
            .map(sem => ({
                ...sem,
                evaluations: sem.evaluations
                    .slice()
                    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
            }))
            .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

        return {
            ...subject,
            semesters
        };
    });

    return result;
}

const Evaluation = ({ item }) => {
    return (<Col>
        <Attribute label="Známka" item={item}>
            {item?.classificationlevel?.name || item?.classificationlevel?.id}
        </Attribute>
        <Attribute label="Popis" item={item}>
            {item?.description}
        </Attribute>
        <Attribute label="Počet bodů" item={item}>
            {item?.points}
        </Attribute>
        <Attribute label="Termín" item={item}>
            {item?.event?.startdate}
        </Attribute>
        {item?.parts && (<Row>
            {item?.parts.map(part => <Evaluation item={part} />)}
        </Row>)}
        
        <Attribute label="Zapsal" item={item}>
            <BaseLink item={item?.examiner} />{" @ "}{formatDateTime(item?.created)}
        </Attribute>
        <hr />
        {/* <pre>
            {JSON.stringify(item, null, 2)}
        </pre> */}
    </Col>)
}

const SemesterEvaluation = ({ item }) => {
    const { evaluations= []} = item
    return (<>
        <Row>
            {evaluations.map(evaluation => <Evaluation key={evaluation?.id} item={evaluation}/>)}
        </Row>
    </>)
}

const SubjectEvaluation = ({ item }) => {
    const { semesters= []} = item
    return (<Row>
        {semesters.map(semester => <Col><CardCapsule key={semester?.id} title={"Semestr " + semester?.order}>
                <SemesterEvaluation item={semester} />
            </CardCapsule>
            </Col>
        )}
    </Row>)
}


export const FlexRow = ({ children }) => {
    return (
        <div
            className="d-flex gap-1 align-items-center"
            style={{ flexWrap: "nowrap" }}
        >
            {children}
        </div>
    )
}

export const FlexContainer = ({ children }) => {
    return (
        <div
            style={{
                overflowX: "auto",
                overflowY: "hidden",
                width: "100%",
            }}
        >
            <div
                style={{
                    display: "inline-flex",
                    flexDirection: "column",
                    gap: "4px",
                    minWidth: "max-content",
                }}
            >
                {children}
            </div>
        </div>
    )
}

const SubjectEvaluation2 = ({ item }) => {
    const { semesters= []} = item
    return (<>
        {semesters.map(semester => semester?.evaluations?.map(evaluation => <tr key={`${semester?.id}-${evaluation?.id}`}>
            <td>
                <BaseLink item={item} />
            </td>
            <td>
                <BaseLink item={semester}>
                    {semester?.order}
                </BaseLink>
            </td>
            <td>
                {evaluation?.classificationlevel?.name || evaluation?.classificationlevel?.id}
            </td>
            <td>
                {evaluation?.description}
            </td>
            <td>
                {evaluation?.points}
            </td>
            <td>
                {evaluation?.event?.startdate}
            </td>
            <td>
                <BaseLink item={evaluation?.examiner} />{" @ "}{formatDateTime(evaluation?.created)}
            </td>
        </tr>))}
    </>)
}

export const StudentEvaluations = ({ item }) => {
    const { evaluations = [] } = item
    const data = useMemo(() => groupEvaluations(evaluations), [evaluations])
    return (<>
        <table className="table table-striped">
            <thead>
                <tr>
                    <th>Předmět</th>
                    <th>Semestr</th>
                    <th>Známka</th>
                    <th>Popis</th>
                    <th>Body</th>
                    <th>Zapsal</th>
                </tr>
                
            </thead>
            <tbody>
                {data.map(row => <SubjectEvaluation2 key={row?.id} item={row} />)}
            </tbody>
        </table>
        {data.map(row => <CardCapsule key={row?.id} title={row?.name}>
            <SubjectEvaluation item={row}/>
        </CardCapsule>)}
        
    </>)
}