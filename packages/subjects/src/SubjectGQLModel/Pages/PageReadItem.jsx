import { GeneratedContentBase } from "../../../../_template/src/Base/Pages/Page"
import { PageItemBase } from "./PageBase"
import { SubjectSubPage } from "./SubjectSubPage"

// originalne zobrazenie
// export const PageReadItem = ({
//     SubPage=GeneratedContentBase,
//     ...props
// }) => {
//     return (
//         <PageItemBase SubPage={SubPage} {...props}/>
//     )
// }

export const PageReadItem = ({
    SubPage=SubjectSubPage,
    ...props
}) => {
    return (
        <PageItemBase SubPage={SubPage} {...props}/>
    )
}