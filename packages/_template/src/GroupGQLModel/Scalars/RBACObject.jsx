import { ShieldLock } from "react-bootstrap-icons"

import { BaseUI } from "../../Base"
import { Attribute } from "../../../../_template/src/Base/Components/Attribute"
import { Link } from "../../../../_template/src/Base/Components/Link"
import { useMemo } from "react"
import { SimpleCardCapsuleRightCorner } from "../../Base/Components"
import { Dialog } from "../../Base/FormControls/Dialog"
import { useState } from "react"

import { formatDateTime } from "../../Base/Components/Attribute"
import { EntityLookup } from "../../Base/FormControls/EntityLookup"
import { Input } from "../../Base/FormControls/Input"
import { SearchAsyncAction as SearchUserAsyncAction } from "../../UserGQLModel/Queries/SearchAsyncAction"
import { useEffect } from "react"
import { useAsync, useAsyncThunkAction } from "../../../../dynamic/src/Hooks"
import { ReadAsyncAction } from "../../GroupGQLModel"
import { AsyncStateIndicator } from "../../Base/Helpers/AsyncStateIndicator"
import { InsertAsyncAction } from "../../RoleGQLModel/Queries"
import { SearchAsyncAction as SearchRoleTypeAsyncAction } from "../../RoleTypeGQLModel/Queries/SearchAsyncAction"

export const RBACObject = ({ item }) => {
    const { rbacobject } = item || {}
    const { currentUserRoles=[] } = rbacobject || {}
    const filtered = useMemo(() => currentUserRoles.filter(cr => cr?.valid), [currentUserRoles])
    return (
        <BaseUI.CardCapsule item={{}} title="Moje role vůči této entitě">
            {item?.__typename !== "UserGQLModel" && (
                <SimpleCardCapsuleRightCorner>
                    <Edit item={item}/>
                </SimpleCardCapsuleRightCorner>
            )}
            
            {filtered.map(role => (
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

const Edit = ({ item }) => {
    const [visible, setVisible] = useState(false)
    const handleShow = () => setVisible(true)
    const BTN = (
        <button 
            className="btn btn-sm btn-outline-primary border-0"
            onClick={handleShow}
        ><ShieldLock /></button>
    )
    if (!visible) return BTN
    const handleHide = () => setVisible(false)
    return (<>
        {BTN}
        <Dialog
            title="Oprávnění"
            onCancel={handleHide}
            onOk={handleHide}
        >
            {/* {JSON.stringify(item)} */}
            <RBACEdit item={item?.rbacobject}/>
        </Dialog>
    </>)
}

export const RBACEdit = ({ item, onChange }) => {
    const { id="" } = item || {}
    const { entity, loading, error, run } = useAsyncThunkAction(ReadAsyncAction, {id}, {deferred: true})
    const { data, loading: saving, error: updateError, run: save } = useAsyncThunkAction(InsertAsyncAction, {id}, {deferred: true})
    // const { entity=item, loading, error, run } = useAsync(ReadAsyncAction, {id}, {deferred: true})
    // const { data, loading: saving, error: updateError, run: save } = useAsync(InsertAsyncAction, {id}, {deferred: true})
    // const [itemCached, setItemCached] = useState(item)
    const [roles, setRoles] = useState((entity || {})?.roles||[])

    // useEffect(()=>{
    //     setItemCached(() => entity)
    // },[entity])

    
    // useEffect(()=>{
    //     const newRoles = (entity || {})?.roles||[]
    //     if (newRoles === roles)
    //         return 
    //     setRoles(newRoles)
    // }, [entity, roles])

    useEffect(()=>{
        if (!id) return
        console.log("RBACEdit", item?.id, item)
    
        const runner = async () => {
            const result = await run({id})
            console.log("RBACEdit", item?.id, result)
    
        }
        runner()
    }, [id])

    useEffect(() => {
        console.log("RBACEdit.useEffect2", item?.id, entity)
        const newRoles = (entity || {})?.roles||[]
        setRoles(newRoles)
    },[entity])

    const [role, setRole] = useState({
        id: crypto.randomUUID(),
        groupId: entity?.id ?? id,
        // startdate: formatDateTime(new Date()),
        // enddate: formatDateTime(new Date() + 14)
    })

    const handleChangeOrBlur = (e) => {
        const id = e?.target?.id
        const value = e?.target?.value
        if (!id) return;
            
        setRole(prev => ({
            ...prev, [id]: value
        }))
        
    }
    const handleConfirm = async() => {
        console.log("RBACEdit.handleConfirm", item?.id, role)
        await save(role)
        await run({id})
        setRole(
            prev => ({
                ...prev,
                id: crypto.randomUUID(),
                userId: null,
                user: null,
            })
        )
        // await run()
        // setRoles(prev => ([...prev, role]))
    }
    return (<>
        {/* {JSON.stringify(roles)} */}
        <AsyncStateIndicator 
            error={error} 
            loading={loading} 
            text={"Nahrávám"} 
        />
        <AsyncStateIndicator 
            error={updateError} 
            loading={saving} 
            text={"Ukládám"} 
        />
        <table className="table table-stripped">
            <thead>
            <tr>
                <th>Typ role</th>
                <th>Osoba</th>
                <th>Počátek</th>
                <th>Konec</th>
                <th>Platná</th>
                <th></th>
            </tr>
            </thead>
            <tbody>
                {roles.map(role => <tr key={role?.id}>
                    <td>
                        <Link item={role?.roletype || {}}/>
                    </td>
                    <td>
                        <Link item={role?.user || {}}/>
                    </td>
                    <td>
                        {role?.startdate?formatDateTime(role?.startdate):"-"}
                    </td>
                    <td>
                        {role?.enddate?formatDateTime(role?.enddate):"-"}
                    </td>
                    <td>
                        {role?.valid?"Ano":"Ne"}
                    </td>
                    <td>

                    </td>
                </tr>
                )}
            </tbody>
            <tfoot>
                <tr>
                    <td>
                        <EntityLookup 
                            id="roletypeId"
                            className="form-control"
                            asyncAction={SearchRoleTypeAsyncAction}
                            onChange={handleChangeOrBlur}
                            onBlur={handleChangeOrBlur}
                            value={role?.roletype}
                        />
                    </td>
                    <td>
                        <EntityLookup 
                            id="userId"
                            className="form-control"
                            asyncAction={SearchUserAsyncAction}
                            onChange={handleChangeOrBlur}
                            onBlur={handleChangeOrBlur}
                            value={role?.user}
                        />
                    </td>
                    <td>
                        <Input 
                            id="startdate"
                            type="datetime-local" 
                            className="form-control"
                            onChange={handleChangeOrBlur}
                            onBlur={handleChangeOrBlur}
                            value={role?.startdate}
                        />
                    </td>
                    <td>
                        <Input 
                            id="enddate"
                            type="datetime-local" 
                            className="form-control"
                            onChange={handleChangeOrBlur}
                            onBlur={handleChangeOrBlur}
                            value={role?.enddate}
                        />
                    </td>
                    <td colSpan={2}>
                        <button 
                            className="btn btn-outline-primary form-control"
                            onClick={handleConfirm}
                            disabled={
                                !(role?.userId && role?.startdate && role?.roletypeId)
                            }
                        >Ok</button>
                    </td>
                </tr>
            </tfoot>
        </table>
    </>)
}