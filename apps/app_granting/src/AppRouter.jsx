import {
    createBrowserRouter,
    Outlet,
    RouterProvider,
} from "react-router-dom";
import { NavigationHistoryLinks, NavigationHistoryProvider } from '../../../packages/_template/src/Base/Helpers/NavigationHistoryProvider';

import { StudentGQLModelRouterSegments } from "../../../packages/granting2/src/StudentGQLModel/Pages/RouterSegment";
import { CatchRouterSegments } from "../../../packages/granting2/src/_PageCatch/PageCatch";
import { AppNavbar } from "./AppNavbar";
import { ProgramGQLModelRouterSegments } from "../../../packages/granting2/src/ProgramGQLModel/Pages/RouterSegment";


const AppLayout = () => (
    <NavigationHistoryProvider>
        <AppNavbar />
        <NavigationHistoryLinks />
        <Outlet />
    </NavigationHistoryProvider>
);

const ChildRoutes = [
    ...StudentGQLModelRouterSegments,
    ...ProgramGQLModelRouterSegments,
    ...CatchRouterSegments,
]

const Routes = [
    {
        path: "/",          // root
        element: <AppLayout />,
        children: [
            ...ChildRoutes
        ],
    },
];

// console.log("Routes", Routes)
// console.log("Routes", GroupRouterSegments)

const router = createBrowserRouter(Routes);

export const AppRouter = () => <RouterProvider router={router} />;
