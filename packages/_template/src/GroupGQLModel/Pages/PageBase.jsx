import { useParams } from "react-router"
import { AsyncActionProvider } from "../../Base/Helpers/GQLEntityProvider"
import { PlaceChild } from "../../Base/Helpers/PlaceChild"
import { PageNavbar } from "./PageNavbar"
import { ReadAsyncAction } from "../Queries"

export const PageItemBase = ({ children, queryAsyncAction=ReadAsyncAction }) => {
    const {id} = useParams()
    const item = {id}
    return (
        <AsyncActionProvider item={item} queryAsyncAction={queryAsyncAction}>
            <PlaceChild Component={PageNavbar} />
            {children}
        </AsyncActionProvider>
    )
}


export const PageBase = ({ children }) => {
    return (
        <>
            <PageNavbar />
            {children}
        </>
    )
}