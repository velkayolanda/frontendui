import { Page, PageCatch, PageVector } from "../../../_template/src/Base"

export const CatchRouterSegments = [
    {
        path: `/generic/:typename/:action/:id`, 
        element: <Page />
    },
    {
        path: `/generic/:typename/:action/`, 
        element: <PageVector />
    },
    {
        path: `*`,
        element: (<PageCatch />),
    },    
]