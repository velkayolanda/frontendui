import { useParams } from "react-router"
import { MembershipPageContentLazy } from "./MembershipPageContentLazy"
import { MembershipLiveEdit } from "../Components"

/**
 * MembershipEditPage Component
 *
 * Stránková komponenta pro lazy-loaded editaci entity `membership`.
 *
 * - Získává `id` z URL parametrů pomocí `useParams` (např. `/membership/:id`).
 * - Vytvoří objekt `membership` s tímto `id` a předává jej do komponenty `MembershipPageContentLazy`,
 *   která se stará o asynchronní načtení dat z backendu.
 * - Uvnitř `MembershipPageContentLazy` vykresluje editační rozhraní pomocí `MembershipLiveEdit` a případně další obsah.
 *
 * Pokud předáš children jako render-funkci, ta obdrží:
 *   - `membership` — kompletně načtený entity objekt,
 *   - `onChange` — callback pro změnu hodnoty pole,
 *   - `onBlur` — callback pro blur event (typicky při opuštění pole).
 *
 * @component
 * @param {Object} props - Props objekt.
 * @param {(args: { membership: Object, onChange: function, onBlur: function }) => React.ReactNode} [props.children]
 *   Volitelná render-funkce nebo prvek. Pokud je funkce, předá hodnoty z `MembershipPageContentLazy`.
 *
 * @returns {JSX.Element}
 *   Kompletní stránka pro lazy editaci šablony (membership) podle ID z URL.
 *
 * @example
 * // Základní použití v routeru:
 * <Route path="/membership/:id" element={<MembershipEditPage />} />
 *
 * @example
 * // Pokročilé použití s render-funkcí pro vlastní zobrazení obsahu:
 * <Route
 *   path="/membership/:id"
 *   element={
 *     <MembershipEditPage>
 *       {({ membership, onChange, onBlur }) => (
 *         <input value={membership.name} onChange={onChange} onBlur={onBlur} />
 *       )}
 *     </MembershipEditPage>
 *   }
 * />
 */
export const MembershipEditPage = ({children}) => {
    const {id} = useParams()
    const membership = {id}
    return (
        <MembershipPageContentLazy membership={membership}>
            <MembershipLiveEdit membership={membership} />
            {children}
        </MembershipPageContentLazy>
    )
}