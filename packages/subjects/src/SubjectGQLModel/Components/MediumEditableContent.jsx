import { Input } from "../../../../_template/src/Base/FormControls/Input"
import { Label } from "../../../../_template/src/Base/FormControls/Label"
import { ProgramSelect } from "./ProgramSelect"
import { SemestersManager } from "./SemestersManager"

/**
 * MediumEditableContent - Komponenta pro zobrazení editovatelného obsahu entity Subject.
 *
 * Tato komponenta je "prezentační" vrstva editačního formuláře.
 * Zobrazuje všechna editovatelná pole předmětu a předává události změn
 * nadřazené komponentě, která řeší ukládání.
 *
 * Zobrazená pole:
 * - Program (ProgramSelect - dropdown s výběrem z dostupných programů)
 * - Název (Input - textové pole pro český název)
 * - Anglický název (Input - textové pole pro anglický název)
 * - Popis (textarea - víceřádkový český popis)
 * - Anglický popis (textarea - víceřádkový anglický popis)
 * - Semestry (SemestersManager - správa semestrů předmětu)
 *
 * Architektura:
 * - Komponenta NEŘEŠÍ ukládání dat na server
 * - Pouze předává události onChange/onBlur/onSemestersChange nadřazené komponentě
 * - Nadřazená komponenta (SubjectEditForm) řeší:
 *   - Udržování draft stavu
 *   - Detekci změn (dirty)
 *   - Uložení na server po kliknutí na tlačítko
 *
 * Použití s různými strategiemi ukládání:
 * - SubjectEditForm: Explicitní ukládání tlačítkem "Uložit"
 * - ConfirmEdit: Ukládání s potvrzovacím dialogem
 * - LiveEdit: Automatické ukládání při změně (onBlur)
 *
 * @component
 * @param {Object} props
 * @param {Object} props.item - Objekt entity Subject s vlastnostmi:
 *   - id: ID předmětu
 *   - name: Český název
 *   - nameEn: Anglický název
 *   - description: Český popis
 *   - descriptionEn: Anglický popis
 *   - programId: ID přiřazeného programu
 *   - semesters: Pole semestrů [{id, order, ...}, ...]
 * @param {Function} [props.onChange] - Callback volaný při změně hodnoty pole
 *   Parametr: event s target.id (název pole) a target.value (nová hodnota)
 * @param {Function} [props.onBlur] - Callback volaný při opuštění pole
 * @param {Function} [props.onSemestersChange] - Callback volaný při změně seznamu semestrů
 *   Parametr: nové pole semestrů
 * @param {React.ReactNode} [props.children] - Další obsah zobrazený pod formulářem
 *   (typicky tlačítka Uložit/Zrušit a zprávy o stavu)
 *
 * @example
 * <MediumEditableContent
 *   item={subject}
 *   onChange={(e) => setDraft({...draft, [e.target.id]: e.target.value})}
 *   onSemestersChange={(semesters) => setDraft({...draft, semesters})}
 * >
 *   <button onClick={onSave}>Uložit</button>
 * </MediumEditableContent>
 */
export const MediumEditableContent = ({ item, onChange=(e)=>null, onBlur=(e)=>null, onSemestersChange=(s)=>null, children }) => {
    /**
     * Speciální handler pro ProgramSelect, který transformuje hodnotu
     * na standardní event objekt očekávaný onChange.
     */
    const handleProgramChange = (programId) => {
        onChange({ target: { id: 'programId', value: programId } })
    }

    return (
        <>
            <div className="mb-3" label ="Program">
                <label htmlFor="programId" className="form-label">Program</label>
                <ProgramSelect
                    id="programId"
                    value={item?.programId || ""}
                    onChange={handleProgramChange}
                />
            </div>
            <Input id="name" label="Název" className="form-control"
                   value={item?.name || ""} onChange={onChange} onBlur={onBlur} />
            <Input id="nameEn" label="Anglický název" className="form-control"
                   value={item?.nameEn || ""} onChange={onChange} onBlur={onBlur} />

            <Label id="description" title="Popis">
                <textarea
                    id="description"
                    className="form-control"
                    rows={4}
                    value={item?.description || ""}
                    onChange={onChange}
                    onBlur={onBlur}
                />
            </Label>

            <Label id="descriptionEn" title="Anglický popis">
                <textarea
                    id="descriptionEn"
                    className="form-control"
                    rows={4}
                    value={item?.descriptionEn || ""}
                    onChange={onChange}
                    onBlur={onBlur}
                />
            </Label>

            <SemestersManager
                semesters={item?.semesters}
                subjectId={item?.id}
                onSemestersChange={onSemestersChange}
            />

            {children}
        </>
    )
}
