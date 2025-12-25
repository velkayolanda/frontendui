import { useGQLEntityContext } from "./GQLEntityProvider";


export const PlaceChild = ({ Component, children }) => {
    const { item } = useGQLEntityContext()
    if (item)
        return (
            <Component item={item}>
                {children}
            </Component>
        )
    return null;
}