import { PageVector } from "./PageVector"
import { PageUpdateItem } from "./PageUpdateItem"
import { PageCreateItem } from "./PageCreateItem"
import { PageReadItem } from "./PageReadItem"
import { PageDeleteItem } from "./PageDeleteItem"
import { PagePlan } from "./PagePlan"

import { DeleteItemURI, UpdateItemURI } from "../Components"
import { CreateURI, ReadItemURI, VectorItemsURI, PlanItemURI } from "../Components"
import { PageSubevents, SubEventsURI } from "./PageSubevents"

/**
 * Definice segmentů rout pro Event stránky.
 *
 * Každý objekt v tomto poli popisuje jednu trasu (route) v aplikaci:
 *  - `path`: Stringová URL s parametrem `:id`, která identifikuje konkrétní instanci event entity.
 *  - `element`: React komponenta, která se má renderovat při shodě s cestou.
 *
 * Pokud komponenta stránky podporuje children jako render funkci,
 * všechny children předané přes router budou dostávat objekt:
 *   - `event` — načtená entita podle `:id`
 *   - `onChange` — callback pro změnu hodnoty pole
 *   - `onBlur` — callback pro blur event (například při opuštění pole)
 *
 * @constant
 * @type {Array<{ path: string, element: JSX.Element }>}
 *
 * @example
 * // Tato route reaguje na URL jako "/event/123"
 * {
 *   path: "/event/:id",
 *   element: <EventPage />
 * }
 *
 * // Editační route: "/event/edit/123"
 * {
 *   path: "/event/edit/:id",
 *   element: <EventEditPage />
 * }
 */
export const EventRouterSegments = [
    {
        path: CreateURI,
        element: (<PageCreateItem />),
    },
    {
        path: VectorItemsURI,
        element: (<PageVector />),
    },
    {
        path: ReadItemURI,
        element: (<PageReadItem />),
    },
    {
        path: PlanItemURI,
        element: (<PagePlan />),
    },
    {
        path: UpdateItemURI,
        element: (<PageUpdateItem />),
    },   
    {
        path: DeleteItemURI,
        element: (<PageDeleteItem />),
    },   
    {
        path: SubEventsURI,
        element: (<PageSubevents />),
    },
    // {
    //     path: "sad",
    //     element: (<PageReadItemRolesOn />)
    // },
    {
        path: VectorItemsURI.replace("list", ":any"),
        element: (<PageVector />),
    },
    {
        path: ReadItemURI.replace("view", ":any"),
        element: (<PageReadItem />),
    }    
]