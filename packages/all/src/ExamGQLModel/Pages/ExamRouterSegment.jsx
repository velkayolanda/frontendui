import { ExamURI } from "../Components/ExamLink"
import { ExamEditPage } from "./ExamEditPage"
import { ExamPage } from "./ExamPage"
import { ExamVectorPage } from "./ExamVectorPage"

/**
 * Definice segmentů rout pro Exam stránky.
 *
 * Každý objekt v tomto poli popisuje jednu trasu (route) v aplikaci:
 *  - `path`: Stringová URL s parametrem `:id`, která identifikuje konkrétní instanci exam entity.
 *  - `element`: React komponenta, která se má renderovat při shodě s cestou.
 *
 * Pokud komponenta stránky podporuje children jako render funkci,
 * všechny children předané přes router budou dostávat objekt:
 *   - `exam` — načtená entita podle `:id`
 *   - `onChange` — callback pro změnu hodnoty pole
 *   - `onBlur` — callback pro blur event (například při opuštění pole)
 *
 * @constant
 * @type {Array<{ path: string, element: JSX.Element }>}
 *
 * @example
 * // Tato route reaguje na URL jako "/exam/123"
 * {
 *   path: "/exam/:id",
 *   element: <ExamPage />
 * }
 *
 * // Editační route: "/exam/edit/123"
 * {
 *   path: "/exam/edit/:id",
 *   element: <ExamEditPage />
 * }
 */
export const ExamRouterSegments = [
    {
        path: `/${ExamURI}:id`,
        element: (<ExamPage />),
    },
    {
        path: `/${ExamURI}`,
        element: (<ExamVectorPage />),
    },
    {
        path: `/${ExamURI.replace('view', 'edit')}:id`,
        element: (<ExamEditPage />),
    }
]