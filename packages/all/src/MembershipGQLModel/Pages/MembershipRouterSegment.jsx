import { MembershipURI } from "../Components/MembershipLink"
import { MembershipEditPage } from "./MembershipEditPage"
import { MembershipPage } from "./MembershipPage"
import { MembershipVectorPage } from "./MembershipVectorPage"

/**
 * Definice segmentů rout pro Membership stránky.
 *
 * Každý objekt v tomto poli popisuje jednu trasu (route) v aplikaci:
 *  - `path`: Stringová URL s parametrem `:id`, která identifikuje konkrétní instanci membership entity.
 *  - `element`: React komponenta, která se má renderovat při shodě s cestou.
 *
 * Pokud komponenta stránky podporuje children jako render funkci,
 * všechny children předané přes router budou dostávat objekt:
 *   - `membership` — načtená entita podle `:id`
 *   - `onChange` — callback pro změnu hodnoty pole
 *   - `onBlur` — callback pro blur event (například při opuštění pole)
 *
 * @constant
 * @type {Array<{ path: string, element: JSX.Element }>}
 *
 * @example
 * // Tato route reaguje na URL jako "/membership/123"
 * {
 *   path: "/membership/:id",
 *   element: <MembershipPage />
 * }
 *
 * // Editační route: "/membership/edit/123"
 * {
 *   path: "/membership/edit/:id",
 *   element: <MembershipEditPage />
 * }
 */
export const MembershipRouterSegments = [
    {
        path: `/${MembershipURI}:id`,
        element: (<MembershipPage />),
    },
    {
        path: `/${MembershipURI}`,
        element: (<MembershipVectorPage />),
    },
    {
        path: `/${MembershipURI.replace('view', 'edit')}:id`,
        element: (<MembershipEditPage />),
    }
]