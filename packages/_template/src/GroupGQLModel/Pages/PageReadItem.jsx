import { useGQLEntityContext } from "../../Base/Helpers/GQLEntityProvider"
import { MediumCardScalars } from "../../Base/Scalars/ScalarAttribute"
import { MediumCardVectors } from "../../Base/Vectors/VectorAttribute"
import { LargeCard, LinkURI } from "../Components"
import { ReadAsyncAction } from "../Queries"
import { PageBase, PageItemBase } from "./PageBase"

export const ReadItemURI = `${LinkURI}:id`

export const PageReadItem = ({ children, queryAsyncAction=ReadAsyncAction, ...props }) => {
    return (
        <PageItemBase queryAsyncAction={queryAsyncAction}>
            PageReadItem
            <Read {...props} />
        </PageItemBase>
    )
}

const Read = ({...props}) => {
    const { item } = useGQLEntityContext()
    if (!item) return null
    return (
        <LargeCard item={item} {...props} >
            <MediumCardScalars item={item} />
            <MediumCardVectors item={item} />
        </LargeCard>        
    )    
}