import { BaseUI } from "../../Base"
import { Attribute } from "../../Base/Components/Attribute"
import { Link } from "../../Base/Components/Link"

export const RBACObject = ({ item }) => {
    const { rbacobject } = item || {}
    const { currentUserRoles=[] } = rbacobject || {}
    return (
        <BaseUI.CardCapsule item={{}} title="Moje role vůči této entitě">
            
            {currentUserRoles.map(role => (
                <Attribute key={role?.id}>
                    <Link item={role?.roletype} />@
                    <Link item={role?.group} />
                </Attribute>
            ))}
            
            {/* <hr/>
            <pre>
            {JSON.stringify(currentUserRoles, null, 2)}
            </pre> */}
        </BaseUI.CardCapsule>
    )
}