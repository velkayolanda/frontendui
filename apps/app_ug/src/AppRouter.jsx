import {
      createBrowserRouter,
      RouterProvider
} from "react-router-dom";
import { GroupRouterSegment as GroupRouterSegmentUG2, UserRouterSegment as UserRouterSegmentUG2 } from "@hrbolek/uoisfrontend-ug2";
import { SchemaRouterSegment } from "@hrbolek/uoisfrontend-all";

import { UserRouterSegments } from "@hrbolek/uoisfrontend-all";
import { SchemaTypeRouterSegment } from "../../../packages/all/src/SchemaType/Pages/SchemaTypeRouterSegment";
import { GroupRouterSegments } from "../../../packages/all/src/GroupGQLModel";
import { StateMachineRouterSegments } from "../../../packages/all/src/StateMachineGQLModel";


import { ProgramRouterSegments } from "../../../packages/all/src/ProgramGQLModel";
import { SubjectRouterSegments } from "../../../packages/all/src/SubjectGQLModel";
import { SemesterRouterSegments } from "../../../packages/all/src/SemesterGQLModel";
import { StudentRouterSegments } from "../../../packages/all/src/StudentGQLModel";

import { AdmissionRouterSegments } from "../../../packages/all/src/AdmissionGQLModel";
import { PaymentInfoRouterSegments } from "../../../packages/all/src/PaymentInfoGQLModel";
import { PaymentRouterSegments } from "../../../packages/all/src/PaymentGQLModel";

import { StudyPlanRouterSegments } from "../../../packages/all/src/StudyPlanGQLModel";
import { StudyPlanLessonRouterSegments } from "../../../packages/all/src/StudyPlanLessonGQLModel";
import { StateRouterSegments } from "../../../packages/all/src/StateGQLModel";

import { ExamRouterSegments } from "../../../packages/all/src/ExamGQLModel";


const Routes = [
    UserRouterSegmentUG2,
    GroupRouterSegmentUG2,
    SchemaRouterSegment,
    SchemaTypeRouterSegment,

    ...UserRouterSegments,
    ...GroupRouterSegments,
    ...StateMachineRouterSegments,
    ...StateRouterSegments,

    ...ProgramRouterSegments,
    ...SubjectRouterSegments,
    ...SemesterRouterSegments,
    
    ...StudentRouterSegments,

    ...AdmissionRouterSegments,
    ...PaymentInfoRouterSegments,
    ...PaymentRouterSegments,

    ...StudyPlanRouterSegments,
    ...StudyPlanLessonRouterSegments,

    ...ExamRouterSegments
]

// const router = createBrowserRouter(Routes, {basename: "/ug"});
const router = createBrowserRouter(Routes);
// const router = createProxyBrowseRouter(Routes, {basename: "/ug"});

export const AppRouter = () => <RouterProvider router={router} />

