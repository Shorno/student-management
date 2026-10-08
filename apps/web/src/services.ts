import { createDb } from "@student-management/db";

import { ENV } from "./env.server";

export const db = createDb(ENV);
