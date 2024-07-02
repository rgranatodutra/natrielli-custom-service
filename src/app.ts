import "express-async-errors";
import express from "express";
import "dotenv/config";
import { handleRequestError } from "@rgranatodutra/http-errors";
import cors from "cors";
import ReportsController from "./modules/reports/reports.controller";
import getRouterEndpoints from "inpulse-crm/utils/src/getRouterEndpoints.util";

const app = express();

const controllers = {
    reports: new ReportsController(),
}

app.use(express.json());
app.use(cors());

app.use(controllers.reports.router);

app.use(handleRequestError);

Object.values(controllers).forEach(c => {
    const e = getRouterEndpoints(c.router, "");
    e.forEach(r => console.log(`[ROUTE] ${r}`));
});

export default app;
