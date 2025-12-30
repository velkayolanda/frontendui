import { GeneratedContentBase } from "../../Base/Pages/Page"
import { PageItemBase } from "./PageBase"

export const PageReadItem = ({ 
    SubPage=GeneratedContentBase,
    ...props
}) => {
    return (
        <PageItemBase SubPage={SubPage} {...props}/>
    )
}