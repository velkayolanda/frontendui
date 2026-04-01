import { GeneratedContentBase } from "../../../../_template/src/Base/Pages/Page"
import { StudentEvaluations } from "../Vectors/StudentEvaluations"
import { PageItemBase } from "./PageBase"

export const PageReadItem = ({ 
    // SubPage=GeneratedContentBase,
    SubPage=StudentEvaluations,
    ...props
}) => {
    return (
        <PageItemBase SubPage={SubPage} {...props}/>
    )
}