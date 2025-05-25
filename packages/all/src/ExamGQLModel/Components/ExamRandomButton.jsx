import { useAsyncAction } from "@hrbolek/uoisfrontend-gql-shared"
import { ExamInsertAsyncAction } from "../Queries"
import { ErrorHandler, LoadingSpinner } from "@hrbolek/uoisfrontend-shared"

export const RandomExamAsyncAction = ({subExams=2, levels=1, ...exam}) => async (dispatch, getState) => {
    const masterEntity = {
        id: crypto.randomUUID(),
        name: `Zkouška`,
        nameEn: `Exam`,
        description: "Popisek",
        descriptionEnd: "Description",
        minScore: 50,
        maxScore: 100,
        ...exam
    }
    const result = await dispatch(ExamInsertAsyncAction(masterEntity))
    result.parts = []
    if (levels <= 0) {
        return result
    }
    for(let index=0; index < subExams; index++) {
        const subExam = await dispatch(RandomExamAsyncAction({
            subExams, 
            levels: levels - 1, 
            parentId: result?.id,
            name: `${index}. část`,
            nameEn: `Part ${index}`
        }))
        result.parts.push(subExam)
    }
    return result
}

export const ExamRandomButton = ({ exam }) => {
    const { loading, error, entity, fetch } = useAsyncAction(RandomExamAsyncAction, {parentId: exam?.id}, {deferred: true})
    if (loading || error) {
        return (<>
            {loading && <LoadingSpinner />}
            {error && <ErrorHandler errors={error} />}
        </>)
    }
    const runRandom = async () => {
        const result = await fetch()
        console.log("Random Exam", result)
    }
    return (
        <button className="btn btn-sm btn-outline-danger" onClick={runRandom}>Random</button>
    )
}