import { useParams } from "react-router"
import { ExamPageContentLazy } from "./ExamPageContentLazy"
import { ExamLiveEdit } from "../Components"

/**
 * ExamEditPage Component
 *
 * Stránková komponenta pro lazy-loaded editaci entity `exam`.
 *
 * - Získává `id` z URL parametrů pomocí `useParams` (např. `/exam/:id`).
 * - Vytvoří objekt `exam` s tímto `id` a předává jej do komponenty `ExamPageContentLazy`,
 *   která se stará o asynchronní načtení dat z backendu.
 * - Uvnitř `ExamPageContentLazy` vykresluje editační rozhraní pomocí `ExamLiveEdit` a případně další obsah.
 *
 * Pokud předáš children jako render-funkci, ta obdrží:
 *   - `exam` — kompletně načtený entity objekt,
 *   - `onChange` — callback pro změnu hodnoty pole,
 *   - `onBlur` — callback pro blur event (typicky při opuštění pole).
 *
 * @component
 * @param {Object} props - Props objekt.
 * @param {(args: { exam: Object, onChange: function, onBlur: function }) => React.ReactNode} [props.children]
 *   Volitelná render-funkce nebo prvek. Pokud je funkce, předá hodnoty z `ExamPageContentLazy`.
 *
 * @returns {JSX.Element}
 *   Kompletní stránka pro lazy editaci šablony (exam) podle ID z URL.
 *
 * @example
 * // Základní použití v routeru:
 * <Route path="/exam/:id" element={<ExamEditPage />} />
 *
 * @example
 * // Pokročilé použití s render-funkcí pro vlastní zobrazení obsahu:
 * <Route
 *   path="/exam/:id"
 *   element={
 *     <ExamEditPage>
 *       {({ exam, onChange, onBlur }) => (
 *         <input value={exam.name} onChange={onChange} onBlur={onBlur} />
 *       )}
 *     </ExamEditPage>
 *   }
 * />
 */
export const ExamEditPage = ({children}) => {
    const {id} = useParams()
    const exam = {id}
    return (
        <ExamPageContentLazy exam={exam}>
            <ExamLiveEdit exam={exam} />
            {children}
        </ExamPageContentLazy>
    )
}