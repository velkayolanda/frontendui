
import { UserLink, UserReadPageAsyncAction } from "../../UserGQLModel"
import { ButtonWithDialog, CreateDelayer, Dialog, ErrorHandler, Input, LoadingSpinner, Options, Select } from "@hrbolek/uoisfrontend-shared"
import { PlusLg } from "react-bootstrap-icons"
import { useMemo, useState } from "react"
import { GroupLink, GroupReadPageAsyncAction } from "../../GroupGQLModel"
import { FacilityLink, FacilityReadPageAsyncAction } from "../../FacilityGQLModel"
import { useAsyncAction, useDelayedModelUpdate } from "@hrbolek/uoisfrontend-gql-shared"
import { LessonAddInstructorAsyncAction, LessonRemoveInstructorAsyncAction } from "../Queries/StudyPlanInstructorAsyncActions"
import { LessonAddFacilityAsyncAction, LessonRemoveFacilityAsyncAction } from "../Queries/StudyPlanFacilityAsyncActions"
import { LessonAddGroupAsyncAction, LessonRemoveGroupAsyncAction } from "../Queries/StudyPlanGroupAsyncActions"
import { StudyPlanLessonUpdateAsyncAction } from "../../StudyPlanLessonGQLModel"
import { LessonTypeReadPageAsyncAction } from "../../LessonTypeGQLModel/Queries/LessonTypeReadPageAsyncAction"
import { TopicLink } from "../../TopicGQLModel"
import { EventLink } from "../../EventGQLModel"

/**
 * DialogSelectWithAsyncAction
 *
 * Univerzální výběrový dialog s asynchronickým načítáním možností (select input),
 * vhodný například pro volbu uživatele/skupiny atd.  
 * Po kliknutí na tlačítko otevře dialog s možností filtrovat/vyhledávat podle vzoru a vybrat položku z výsledků.
 *
 * Po potvrzení zavolá callback `onSelected` s vybranou položkou `{id, name, fullname}`.
 *
 * @component
 * @param {Object} props
 * @param {string} [props.pattern=""] - Počáteční vyhledávací vzor (search pattern).
 * @param {string} [props.title="Vybrat"] - Titulek dialogu.
 * @param {function} [props.asyncAction=UserReadPageAsyncAction] - Asynchronní funkce nebo Redux akce, která načte možnosti podle filtru. Dostává objekt `{limit, where}`.
 * @param {function} [props.valueSelector=(option) => (option?.name || option?.fullname)] - Funkce pro extrakci zobrazované hodnoty z možnosti.
 * @param {function} [props.calcWhere=(pattern) => {...}] - Funkce generující GraphQL/Hasura `where` filtr podle zadaného vzoru.
 *   Příklad: `(pattern) => ({ "_or": [ { name: { _ilike: `%${pattern}%` } }, ... ] })`
 * @param {function} [props.onSelected=(user) => null] - Callback, který je zavolán po výběru položky z dialogu. Dostává objekt `{id, name, fullname}`.
 *
 * @returns {JSX.Element} Komponenta pro otevření dialogu a výběr položky.
 *
 * @example
 * // Výběr uživatele pomocí dialogu:
 * <DialogSelectWithAsyncAction
 *   title="Vybrat uživatele"
 *   asyncAction={UserReadPageAsyncAction}
 *   calcWhere={pattern => ({ name: { _ilike: `%${pattern}%` } })}
 *   onSelected={user => setSelectedUser(user)}
 * />
 */
const DialogSelectWithAsyncAction = ({
    pattern="", 
    title="Vybrat",
    asyncAction=UserReadPageAsyncAction, 
    valueSelector=(option) => (option?.name || option?.fullname),
    calcWhere=(pattern) => ({"_or": [{"name": {"_ilike": `%${pattern}%`}}, {"surname": {"_ilike": `%${pattern}%`}}]}),
    onSelected=(user) => null,
}) => {
    const [delayer] = useState(() => CreateDelayer())
    const [state, setState] = useState({
        pattern: pattern,
        id: null,
        shouldfetch: 0,
        visible: false
    })
    const onChange = (e) => {
        const { id, value } = e.target
        const text = e.target?.options?.[e.target.selectedIndex]?.text;
        if (id === "pattern") {
            delayer(() => {
                setState((prevState) => ({
                    ...prevState,
                    pattern: value,
                    shouldfetch: prevState.shouldfetch + 1
                }))
            })
        } else {
            setState((prevState) => ({
                ...prevState,
                [id]: value,
                name: text,
            }))
        }
    }
    const okOk = () => {
        if (!state.id) return
        togleVisible()
        onSelected({id: state.id, name: state.name, fullname: state.name})
    }
    const onCancel = () => {
        togleVisible()
    }
    const togleVisible = () => {
        setState((prevState) => ({
            ...prevState,
            visible: !prevState.visible
        }))
    }
    
    if (!state.visible) {
        return (<button className="btn btn-outline-success" onClick={togleVisible}><PlusLg /></button>)
    }

    return (
        <Dialog
            title={title}
            onOk={okOk}
            onCancel={onCancel}
            oklabel={"Vybrat"}
            cancellabel={"Zrušit"}
        >
            <Input id={"pattern"} label={"Vzor"} className="form-control" defaultValue={""} onChange={onChange}/>
            <Select id={"id"} label={"Vybrat"} className="form-control" defaultValue={state?.id} onChange={onChange}>
                <Options 
                    asyncAction={asyncAction} 
                    params={{
                        limit: 10, 
                        "where": calcWhere(state.pattern)
                    }} 
                    shouldFetch={state.shouldfetch}
                    valueSelector={valueSelector}
                />
            </Select>
        </Dialog>
    )
}

/**
 * AddRemoveButton
 *
 * Univerzální tlačítko pro přidání nebo odebrání entity (např. uživatele, skupiny, místnosti atd.).
 * Pokud je stav `state` pravdivý (true), zobrazí se tlačítko pro odebrání (červené, "danger").
 * Pokud je stav `state` nepravdivý (false), zobrazí se tlačítko pro přidání (světlé, "light").
 *
 * Ikona PlusLg se používá pro obě varianty – vizuálně odlišené barvou tlačítka.
 *
 * @component
 * @param {Object} props - Props pro komponentu.
 * @param {boolean} props.state - Stav, který určuje mód tlačítka. `true` = zobrazení odebrání, `false` = přidání.
 * @param {function} props.addAsyncAction - Callback pro akci přidání (volá se po kliknutí, pokud není aktivní stav).
 * @param {function} props.removeAsyncAction - Callback pro akci odebrání (volá se po kliknutí, pokud je aktivní stav).
 *
 * @returns {JSX.Element} Tlačítko pro přidání nebo odebrání, podle aktuálního stavu.
 *
 * @example
 * // Tlačítko podle stavu entity:
 * <AddRemoveButton
 *   state={isAssigned}
 *   addAsyncAction={() => doAssign(id)}
 *   removeAsyncAction={() => doUnassign(id)}
 * />
 */
const AddRemoveButton = ({state, addAsyncAction, removeAsyncAction}) => {
    if (state) {
        return (
            <button className="btn btn-outline-danger" onClick={removeAsyncAction}>
                <PlusLg />
            </button>
        )
    } else {
        return (
            <button className="btn btn-outline-light" onClick={addAsyncAction}>
                <PlusLg />
            </button>
        )
    }
}

const AddRemoveInstructorButton = ({state, onAdd, onRemove}) => 
    <AddRemoveButton state={state} addAsyncAction={onAdd} removeAsyncAction={onRemove} />

const AddRemoveFacilityButton = ({state, onAdd, onRemove}) =>
    <AddRemoveButton state={state} addAsyncAction={onAdd} removeAsyncAction={onRemove} />

const AddRemoveGroupButton = ({state, onAdd, onRemove}) =>
    <AddRemoveButton state={state} addAsyncAction={onAdd} removeAsyncAction={onRemove} />


/**
 * StudyPlanPivotTableHeader
 *
 * Komponenta vykreslující hlavičku pivotní tabulky studijního plánu (StudyPlan).
 * Hlavička je dvouřádková – první řádek obsahuje základní sloupce a ovládací prvky pro přidávání skupin, učitelů a místností
 * (pokud je tabulka v editačním režimu), druhý řádek pak zobrazuje názvy konkrétních skupin, učitelů a místností.
 * Pro orientaci sloupců s entitami se používá svislé (vertikální) zarovnání textu a natočení.
 *
 * @component
 * @param {Object} props - Vstupní vlastnosti komponenty.
 * @param {Object} props.studyplan - Objekt studijního plánu (používá se jen pro případné budoucí rozšíření).
 * @param {Array<Object>} props.instructors - Pole objektů učitelů, jejichž sloupce budou zobrazeny.
 * @param {Array<Object>} props.groups - Pole objektů skupin, jejichž sloupce budou zobrazeny.
 * @param {Array<Object>} props.facilities - Pole objektů místností, jejichž sloupce budou zobrazeny.
 * @param {Function} props.onAddFacility - Callback pro přidání nové místnosti (volá se po výběru v dialogu).
 * @param {Function} props.onAddGroup - Callback pro přidání nové skupiny (volá se po výběru v dialogu).
 * @param {Function} props.onAddInstructor - Callback pro přidání nového učitele (volá se po výběru v dialogu).
 * @param {boolean} props.editable - Pokud je true, zobrazují se dialogy pro přidávání skupin, učitelů a místností.
 *
 * @returns {JSX.Element} Hlavička tabulky (<thead>) včetně editačních ovládacích prvků (pokud je povoleno).
 *
 * @example
 * <StudyPlanPivotTableHeader
 *   studyplan={studyplan}
 *   instructors={instructors}
 *   groups={groups}
 *   facilities={facilities}
 *   onAddFacility={handleAddFacility}
 *   onAddGroup={handleAddGroup}
 *   onAddInstructor={handleAddInstructor}
 *   editable={true}
 * />
 */
const StudyPlanPivotTableHeader = ({studyplan, instructors, groups, facilities, onAddFacility, onAddGroup, onAddInstructor, editable}) => {
    return (
        <thead>
            <tr>
                <th scope="col" rowSpan={2} style={{ verticalAlign: "middle", textAlign: "center"}}>#</th>
                <th scope="col" rowSpan={2} style={{ verticalAlign: "middle", textAlign: "center"}}>Name</th>
                <th 
                    scope="col" 
                    rowSpan={2} 
                    style={{ writingMode: "vertical-rl", verticalAlign: "middle", transform: "rotate(180deg)", textAlign: "center"}}
                >
                    Link<br />do akreditace
                </th>
                <th scope="col" rowSpan={2} style={{ verticalAlign: "middle", textAlign: "center"}}>Type</th>

                <th scope="col" colSpan={1+groups.length} className="text-center">
                    {editable && <DialogSelectWithAsyncAction 
                        title="Vybrat skupinu"
                        onSelected={onAddGroup}
                        asyncAction={GroupReadPageAsyncAction}
                        calcWhere={(pattern) => ({"_and": [{"name": {"_ilike": `%${pattern}%`}}, {grouptype_id:{_eq: "cd49e157-610c-11ed-9312-001a7dda7110"}}]})}
                    />}
                </th>
                <th scope="col" colSpan={1+instructors.length} className="text-center">
                    {editable && <DialogSelectWithAsyncAction 
                        onSelected={onAddInstructor}
                        title="Vybrat učitele"
                    />}
                </th>
                <th scope="col" colSpan={1+facilities.length} className="text-center">
                    {editable && <DialogSelectWithAsyncAction 
                        title="Vybrat místnost"
                        onSelected={onAddFacility}
                        asyncAction={FacilityReadPageAsyncAction}
                        calcWhere={(pattern) => ({"name": {"_ilike": `%${pattern}%`}})}
                    />}
                </th>
                <th 
                    rowSpan={2}
                    style={{ writingMode: "vertical-rl", verticalAlign: "middle", transform: "rotate(180deg)", textAlign: "center"}}
                >
                    Událost
                </th>
            </tr>
            <tr>
                {groups.map(group => <th 
                        key={group?.id} 
                        scope="col" 
                        className="text-center" 
                        style={{ writingMode: "vertical-rl", verticalAlign: "middle", transform: "rotate(180deg)", textAlign: "center"}}
                    >
                        <GroupLink group={group} />
                    </th>
                )}
                <th scope="col" className="text-center"></th>

                {instructors.map(instructor => <th 
                        key={instructor?.id} 
                        scope="col" 
                        className="text-center"
                        style={{ writingMode: "vertical-rl", verticalAlign: "middle", transform: "rotate(180deg)", textAlign: "center"}}
                    >
                        <UserLink user={instructor} />
                    </th>
                )}
                <th scope="col" className="text-center"></th>

                {facilities.map(facility => <th 
                        key={id} 
                        scope="col" 
                        className="text-center"
                        style={{ writingMode: "vertical-rl", verticalAlign: "middle", transform: "rotate(180deg)", textAlign: "center"}}
                    >
                        <FacilityLink facility={facility} />
                    </th>
                )}
                <th scope="col" className="text-center"></th>
            </tr>
        </thead>
    )
}

/**
 * StudyPlanPivotGroupSegmentRow
 *
 * Komponenta zobrazující jeden "segment" řádku pivotní tabulky pro skupiny v rámci konkrétní lekce studijního plánu.
 * Pro každou skupinu v poli `groups` zobrazí buňku tabulky s tlačítkem na přidání nebo odebrání této skupiny z dané lekce.
 * Přidávání a odebírání využívá asynchronní akce (`LessonAddGroupAsyncAction`, `LessonRemoveGroupAsyncAction`) a zobrazuje loading/error stavy.
 *
 * @component
 * @param {Object} props - Vstupní vlastnosti komponenty.
 * @param {Object} props.lesson - Objekt lekce, ke které se skupiny vztahují.
 * @param {Array<Object>} props.groups - Pole skupin, které mají být zobrazeny v tabulce jako sloupce.
 * @param {boolean} props.editable - Pokud je true, povoluje přidávání a odebírání skupin z lekce (zobrazuje tlačítka).
 *
 * @returns {JSX.Element} Fragment s buňkami tabulky (<td>), obsahujícími Add/Remove tlačítka pro každou skupinu,
 *   případně spinner nebo error message při asynchronních akcích.
 *
 * @example
 * <StudyPlanPivotGroupSegmentRow
 *   lesson={lesson}
 *   groups={groups}
 *   editable={true}
 * />
 */
const StudyPlanPivotGroupSegmentRow = ({lesson, groups, editable}) => {
    const {studyGroups: lessongroups = []} = lesson
    const { 
        loading: addLoading, 
        error: addError, 
        fetch: addFetch } = useAsyncAction(LessonAddGroupAsyncAction, lesson, {deferred: true})
    const { 
        loading: removeLoading, 
        error: removeError, 
        fetch: removeFetch } = useAsyncAction(LessonRemoveGroupAsyncAction, lesson, {deferred: true})
    const handleAdd = async (group) => {
        if (!editable) return
        if (lessongroups.find(i => i?.id === group?.id)) return
        const result = await addFetch({...lesson, groupId: group.id})
        // console.log("addFetch", result)
    }
    const handleRemove = async (group) => {
        if (!editable) return
        if (!lessongroups.find(i => i?.id === group?.id)) return
        const result = await removeFetch({...lesson, groupId: group.id})
        // console.log("removeFetch", result)
    }
    return (<>
        {(addLoading || removeLoading) && <LoadingSpinner />}
        {(addError || removeError) && <ErrorHandler errors={addError || removeError} />}
        {groups.map(group => {
            const {id} = group
            return (<td key={id} className="text-center">
                <AddRemoveGroupButton 
                    state={lessongroups.find(i => i?.id === group?.id)} 
                    onAdd={()=>handleAdd(group)}
                    onRemove={()=>handleRemove(group)}                        
                />
            </td>)
        })}
    </>)
}

/**
 * StudyPlanPivotFacilitySegmentRow
 *
 * Komponenta, která zobrazuje segment řádku pivotní tabulky určený pro přiřazení místností (facilities) k jedné lekci.
 * Umožňuje interaktivně přidávat a odebírat místnosti k lekci, pokud je komponenta v režimu `editable`.
 * Při změně volá asynchronní akce pro přidání nebo odebrání místnosti a zobrazuje loading/error stavy.
 *
 * @component
 * @param {Object} props - Vstupní vlastnosti komponenty.
 * @param {Object} props.lesson - Objekt lekce, ke které se přiřazují místnosti.
 * @param {Array<Object>} props.facilities - Pole místností, které budou reprezentovány jako buňky v řádku tabulky.
 * @param {boolean} props.editable - Určuje, zda jsou povoleny akce přidání a odebrání místnosti (zobrazení tlačítek).
 *
 * @returns {JSX.Element} Fragment obsahující buňky tabulky (<td>) s Add/Remove tlačítky pro každou místnost,
 *   včetně načítacího spinneru a zobrazení chyb při asynchronních operacích.
 *
 * @example
 * <StudyPlanPivotFacilitySegmentRow
 *   lesson={lesson}
 *   facilities={facilities}
 *   editable={true}
 * />
 */
const StudyPlanPivotFacilitySegmentRow = ({lesson, facilities, editable}) => {
    const {facilities: lessonfacilities = []} = lesson
    const { 
        loading: addLoading, 
        error: addError, 
        fetch: addFetch } = useAsyncAction(LessonAddFacilityAsyncAction, lesson, {deferred: true})
    const { 
        loading: removeLoading, 
        error: removeError, 
        fetch: removeFetch } = useAsyncAction(LessonRemoveFacilityAsyncAction, lesson, {deferred: true})
    const handleAdd = async (facility) => {
        if (!editable) return
        if (lessonfacilities.find(i => i?.id === facility?.id)) return
        const result = await addFetch({...lesson, facilityId: facility.id})
        // console.log("addFetch", result)
    }
    const handleRemove = async (facility) => {
        if (!editable) return
        if (!lessonfacilities.find(i => i?.id === facility?.id)) return
        const result = await removeFetch({...lesson, facilityId: facility.id})
        // console.log("removeFetch", result)
    }
    return (<>
        {(addLoading || removeLoading) && <LoadingSpinner />}
        {(addError || removeError) && <ErrorHandler errors={addError || removeError} />}
        {facilities.map(facility => 
            (<td key={facility?.id} className="text-center">
                <AddRemoveFacilityButton 
                    state={lessonfacilities.find(i => i?.id === facility?.id)} 
                    onAdd={()=>handleAdd(facility)}
                    onRemove={()=>handleRemove(facility)}                    
                />
            </td>)
        )}
    </>)
}

/**
 * StudyPlanPivotInstructorSegmentRow
 *
 * Komponenta pro segment řádku pivotní tabulky určený k přiřazování vyučujících (instructors) k jedné lekci.
 * Umožňuje interaktivně přidávat a odebírat vyučující k lekci, pokud je komponenta v režimu `editable`.
 * Při změně volá asynchronní akce pro přidání nebo odebrání vyučujícího a zobrazuje loading/error stavy.
 *
 * @component
 * @param {Object} props - Vstupní vlastnosti komponenty.
 * @param {Object} props.lesson - Objekt lekce, ke které se přiřazují vyučující.
 * @param {Array<Object>} props.instructors - Pole vyučujících, kteří budou reprezentováni jako buňky v řádku tabulky.
 * @param {boolean} props.editable - Určuje, zda jsou povoleny akce přidání a odebrání vyučujícího (zobrazení tlačítek).
 *
 * @returns {JSX.Element} Fragment obsahující buňky tabulky (<td>) s Add/Remove tlačítky pro každého vyučujícího,
 *   včetně načítacího spinneru a zobrazení chyb při asynchronních operacích.
 *
 * @example
 * <StudyPlanPivotInstructorSegmentRow
 *   lesson={lesson}
 *   instructors={instructors}
 *   editable={true}
 * />
 */
const StudyPlanPivotInstructorSegmentRow = ({lesson, instructors, editable}) => {
    const {instructors: lessonsinstructors = []} = lesson
    const { 
        loading: addLoading, 
        error: addError, 
        fetch: addFetch } = useAsyncAction(LessonAddInstructorAsyncAction, lesson, {deferred: true})
    const { 
        loading: removeLoading, 
        error: removeError, 
        fetch: removeFetch } = useAsyncAction(LessonRemoveInstructorAsyncAction, lesson, {deferred: true})
    const handleAdd = async (instructor) => {
        if (!editable) return
        if (lessonsinstructors.find(i => i?.id === instructor?.id)) return
        const result = await addFetch({...lesson, userId: instructor.id})
        // console.log("addFetch", result)
    }
    const handleRemove = async (instructor) => {
        if (!editable) return
        if (!lessonsinstructors.find(i => i?.id === instructor?.id)) return
        const result = await removeFetch({...lesson, userId: instructor.id})
        // console.log("removeFetch", result)
    }
    // console.log("StudyPlanPivotInstructorSegmentRow", instructors)
    return (<>
        {(addLoading || removeLoading) && <LoadingSpinner />}
        {(addError || removeError) && <ErrorHandler errors={addError || removeError} />}
        {instructors.map(instructor => {
            const {id} = instructor
            return (<td key={id} className="text-center">
                <AddRemoveInstructorButton 
                    state={lessonsinstructors.find(i => i?.id === instructor?.id)} 
                    onAdd={()=>handleAdd(instructor)}
                    onRemove={()=>handleRemove(instructor)}
                />
            </td>)
        })}
    </>)
}

/**
 * StudyPlanPivotTableRow
 *
 * Řádková komponenta pro pivotní tabulku studijního plánu, která zobrazuje a umožňuje editaci detailů jedné lekce (lesson).
 * Zahrnuje pole pro název, popis, typ lekce a interaktivní segmenty pro přiřazení skupin, vyučujících a místností.
 * V případě editace umožňuje změny hodnot a interaktivní přidávání/odebírání vazeb přes podkomponenty.
 *
 * @component
 * @param {Object} props - Vstupní vlastnosti komponenty.
 * @param {Object} props.lesson - Objekt lekce (lesson), jehož data se zobrazují v řádku.
 * @param {Array<Object>} props.instructors - Pole všech možných vyučujících k dispozici v tabulce.
 * @param {Array<Object>} props.groups - Pole všech možných skupin k dispozici v tabulce.
 * @param {Array<Object>} props.facilities - Pole všech možných místností k dispozici v tabulce.
 * @param {boolean} props.editable - Povolení editace hodnot (true/false).
 *
 * @returns {JSX.Element} Jeden řádek <tr> v tabulce, se sloupci pro jednotlivá pole lekce, editovatelnými poli
 *   a segmenty pro správu skupin, vyučujících a místností. Obsahuje také volání podkomponent pro každý segment.
 *
 * @example
 * <StudyPlanPivotTableRow
 *   lesson={lesson}
 *   instructors={instructors}
 *   groups={groups}
 *   facilities={facilities}
 *   editable={true}
 * />
 */
const StudyPlanPivotTableRow = ({lesson, instructors, groups, facilities, editable}) => {
    const { loading, error, fetch } = useAsyncAction(StudyPlanLessonUpdateAsyncAction, lesson, {deferred: true})
    const { handleChange } = useDelayedModelUpdate(lesson, fetch)
    //useRemoteState
    //useBackendState
    return (<tr>
        <th scope="row">
            {loading && <LoadingSpinner />}
            {error && <ErrorHandler errors={error} />}
            <Input 
                id="order"
                type="number" 
                className="form-control" 
                defaultValue={lesson?.order} 
                disabled={!editable}
                onChange={handleChange}
                style={{ width: '8ch' }}
                // onBlur={(handleChange)}
            />
        </th>
        <td>
            <Input 
                id="name"
                type="text" 
                className="form-control" 
                defaultValue={lesson?.name} 
                disabled={!editable}
                onChange={handleChange}
                // onBlur={(handleChange)}
            />
        </td>
        <td>
            <Input 
                id="length"
                type="number" 
                className="form-control" 
                defaultValue={lesson?.length} 
                disabled={!editable}
                onChange={handleChange}
                style={{ width: '8ch' }}
                // onBlur={(handleChange)}
            />
            {/* <TopicLink topic={{id: lesson?.topicId, name: "akr"}} /> */}
            {/* <Input 
                id="description"
                type="text" 
                className="form-control" 
                defaultValue={lesson?.description} 
                disabled={!editable}
                onChange={handleChange}
                // onBlur={(handleChange)}
            /> */}
        </td>
        <td>
            <Select 
                id={"lessontypeId"} 
                className="form-control" 
                defaultValue={lesson?.lessontypeId} 
                disabled={!editable} 
                onChange={handleChange} 
                // onBlur={handleChange}
            >
                {/* {lesson?.lessontypeId && <option value={lesson?.lessontypeId}>Zvoleno</option>} */}
                <Options 
                    asyncAction={LessonTypeReadPageAsyncAction}
                    params={{limit: 100, skip: 0}} 
                    shouldFetch={0} 
                />
            </Select>
            {/* {lesson?.type?.name} */}
        </td>
        <StudyPlanPivotGroupSegmentRow lesson={lesson} groups={groups} editable={editable}/>
        <td></td>
        <StudyPlanPivotInstructorSegmentRow lesson={lesson} instructors={instructors} editable={editable}/>
        <td></td>
        <StudyPlanPivotFacilitySegmentRow lesson={lesson} facilities={facilities} editable={editable}/>
        <td></td>
        <td>
            {lesson?.event && <EventLink event={lesson?.event} /> }
            {lesson?.event?.id}
        </td>
    </tr>)
}

/**
 * StudyPlanPivotTableBody
 *
 * Komponenta, která renderuje <tbody> pivotní tabulky studijního plánu s jednotlivými řádky pro každou lekci (lesson).
 * Každý řádek je reprezentován komponentou StudyPlanPivotTableRow, které jsou předány potřebné seznamy vyučujících,
 * skupin a místností, stejně jako informace o editovatelnosti. Navíc umožňuje vložit další děti (children) na konec tabulky.
 *
 * @component
 * @param {Object} props - Vstupní vlastnosti komponenty.
 * @param {Object} props.studyplan - Objekt studijního plánu obsahující pole lessons (lekce).
 * @param {Array<Object>} props.instructors - Seznam vyučujících, které lze přiřadit k lekcím.
 * @param {Array<Object>} props.groups - Seznam skupin, které lze přiřadit k lekcím.
 * @param {Array<Object>} props.facilities - Seznam místností, které lze přiřadit k lekcím.
 * @param {React.ReactNode} [props.children] - Volitelný obsah, který se vykreslí na konci <tbody>.
 * @param {boolean} props.editable - Povolení editace hodnot v tabulce (true/false).
 * @param {...any} props - Ostatní volitelné props, které jsou předány přímo na <tbody>.
 *
 * @returns {JSX.Element} Element <tbody> obsahující řádky tabulky pro všechny lekce v daném studijním plánu,
 *   případně další děti přidané na konec.
 *
 * @example
 * <StudyPlanPivotTableBody
 *   studyplan={studyplan}
 *   instructors={instructors}
 *   groups={groups}
 *   facilities={facilities}
 *   editable={true}
 * >
 *   <tr><td colSpan={10}>Extra řádek</td></tr>
 * </StudyPlanPivotTableBody>
 */
const StudyPlanPivotTableBody = ({studyplan, instructors, groups, facilities, children, editable, ...props}) => {
    const {lessons = []} = studyplan
    const lessonsSorted = lessons.toSorted((a, b) => (a?.order||0) - (b?.order||0))
    return (
        <tbody {...props}>
            {lessonsSorted.map(lesson => <StudyPlanPivotTableRow 
                key={lesson.id} 
                lesson={lesson} 
                instructors={instructors} 
                groups={groups} 
                facilities={facilities} 
                editable={editable}
            />)}
            {children}
        </tbody>
    )
}

/**
 * Extrahuje unikátní vyučující (instructors), skupiny (groups) a místnosti (facilities)
 * ze všech lekcí (lessons) daného studijního plánu.
 *
 * Prochází všechny lekce ve studijním plánu a sbírá do objektů všechny unikátní
 * vyučující, skupiny a místnosti dle jejich ID. Výsledkem jsou objekty s klíči podle ID a hodnotami jsou celé entity.
 *
 * @function
 * @param {Object} studyplan - Objekt studijního plánu, který obsahuje pole lessons (každá lesson obsahuje instructors, studyGroups, facilities).
 * @returns {{ instructors: Object.<string, Object>, groups: Object.<string, Object>, facilities: Object.<string, Object> }}
 *   Vrací objekt se třemi vlastnostmi:
 *   - instructors: Mapa všech vyučujících dle jejich ID.
 *   - groups: Mapa všech skupin dle jejich ID.
 *   - facilities: Mapa všech místností dle jejich ID.
 *
 * @example
 * const { instructors, groups, facilities } = gatherStudyPlanData(studyplan);
 * // instructors["123"] → objekt vyučujícího s id "123"
 * // groups["abc"] → objekt skupiny s id "abc"
 * // facilities["x9y"] → objekt místnosti s id "x9y"
 */
const gatherStudyPlanData = (studyplan) => {
    const instructors = {}
    const groups = {}
    const facilities = {}
    const {lessons = []} = studyplan
    lessons.forEach(lesson => {
        const {
            instructors: lessonsinstructors = [], 
            studyGroups: lessongroups = [], 
            facilities: lessonfacilities = []
        } = lesson

        lessonsinstructors.forEach(instructor => {
            const { id } = instructor
            instructors[id] = instructor
        })
        lessongroups.forEach(group => {
            const { id } = group
            groups[id] = group
        })
        lessonfacilities.forEach(facility => {
            const { id } = facility
            facilities[id] = facility
        })
    })
    return {instructors, groups, facilities}
}

const gatherLessonsSummary = (studyplan) => {
    const result = {}
    const {lessons=[]} = studyplan
    lessons.forEach(
        lesson => {
            const id = lesson?.lessontype?.id || "uknown"
            const {lessontype={id: "unknonw", name: "unknown"}, sum=0} = lesson
            const currentValue = (result[id] || {id, lessontype, sum})
            result[id] = {...currentValue, sum: currentValue.sum + (lesson?.length || 0)}
        }
    )
    return result
}

const StudyPlanPivotTableFooter = ({studyplan, instructors, groups, facilities, children, editable, ...props}) => {
    const lessonTypesMap = gatherLessonsSummary(studyplan)
    const total = Object.values(lessonTypesMap).map( r => r?.sum).reduce((a, v)=> a + v)
    return (<tfoot>{Object.values(lessonTypesMap).map(
        lessontype => <tr key={lessontype?.lessontype?.id}>
                <th colSpan={2}></th>
                <td className="text-center">{lessontype?.sum}</td>
                <th
                    colSpan={1+
                        groups?.length+1 + 
                        instructors?.length+1 + 
                        facilities?.length+1 +
                        1
                    }
                >
                    {lessontype?.lessontype?.name}
                </th>
            </tr>
        )}
        <tr className="bg-light">
            <th colSpan={2} className="text-center"></th>
            <td className="text-center">{total}</td>
            <th 
                scope="row" 
                colSpan={1+
                    groups?.length+1 + 
                    instructors?.length+1 + 
                    facilities?.length+1 +
                    1
                }
            >
                celkem
            </th>
        </tr>
        {children && <tr>
            <th scope="row" colSpan={(
                5+
                groups?.length+1+
                instructors?.length+1+
                facilities?.length+1
                +1
                )}
            >
                {children}
            </th>
        </tr>}
    </tfoot>)
}


/**
 * Komponenta tabulky pro zobrazení a interaktivní editaci pivot tabulky studijního plánu.
 *
 * Tabulka agreguje všechny unikátní vyučující (instructors), skupiny (groups) a místnosti (facilities) napříč lekcemi
 * v zadaném studijním plánu, umožňuje jejich ruční přidávání, a zobrazuje segmenty tabulky podle těchto entit.
 *
 * Komponenta spravuje lokální stav (přidané vyučující, skupiny a místnosti) přes `useState`, což umožňuje uživatelsky
 * přidávat entity bez ovlivnění původního objektu `studyplan`. Handler funkce `onAddInstructor`, `onAddGroup` a `onAddFacility`
 * přidávají entity do stavu pouze pokud tam daná entita ještě není.
 *
 * @component
 * @param {Object} props - Vstupní vlastnosti komponenty.
 * @param {Object} props.studyplan - Objekt studijního plánu s polem lessons a souvisejícími daty.
 * @param {boolean} props.editable - Zda má být tabulka editovatelná (zobrazení tlačítek pro přidávání).
 * @param {React.ReactNode} [props.children] - Volitelný dodatečný obsah, který bude přidán na konec `<tbody>`.
 * @param {...any} props - Další props jsou předány přímo na element `<table>`.
 *
 * @returns {JSX.Element} Tabulka s pivot pohledem na studijní plán a možností interaktivní editace.
 *
 * @example
 * <StudyPlanPivotTable studyplan={studyplan} editable={true} />
 */
export const StudyPlanPivotTable = ({studyplan, editable, children, ...props}) => {
    const {instructors: instructors_, groups: groups_, facilities: facilities_} = useMemo(() => gatherStudyPlanData(studyplan))


    const [instructors, setInstructors] = useState(Object.values(instructors_))
    const [groups, setGroups] = useState(Object.values(groups_))
    const [facilities, setFacilities] = useState(Object.values(facilities_))

    const onAddInstructor = (instructor) => {
        // console.log("onAddInstructor", instructor)
        if (instructors.find(i => i.id === instructor.id)) return
        setInstructors((prevState) => [...prevState, instructor])
    }
    const onAddGroup = (group) => {
        // console.log("onAddGroup", group)
        if (groups.find(g => g.id === group.id)) return
        setGroups((prevState) => [...prevState, group])
    }
    const onAddFacility = (facility) => {
        // console.log("onAddFacility", facility)
        if (facilities.find(f => f.id === facility.id)) return
        setFacilities((prevState) => [...prevState, facility])
    }

    return(
        <table className="table table-striped table-bordered table-hover" {...props}>
            <StudyPlanPivotTableHeader 
                studyplan={studyplan} 
                instructors={instructors} 
                groups={groups} 
                facilities={facilities} 
                onAddFacility={onAddFacility}
                onAddGroup={onAddGroup}
                onAddInstructor={onAddInstructor}
                editable={editable}
            />
            <StudyPlanPivotTableBody 
                studyplan={studyplan} 
                instructors={instructors} 
                groups={groups} 
                facilities={facilities} 
                editable={editable}
            >
                
            </StudyPlanPivotTableBody>
            <StudyPlanPivotTableFooter 
               studyplan={studyplan} 
                instructors={instructors} 
                groups={groups} 
                facilities={facilities} 
                onAddFacility={onAddFacility}
                onAddGroup={onAddGroup}
                onAddInstructor={onAddInstructor}
                editable={editable}
            >
                {children}
            </StudyPlanPivotTableFooter>

        </table>
    )
}