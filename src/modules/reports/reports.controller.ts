import { Request, Response, Router } from "express";
import { AttendanceRating } from "./interfaces/attendance-rating.interface";
import { PaginatedResponse } from "inpulse-crm/utils/src/toPaginated";
import ReportsService from "./reports.service";

class ReportsController {
    public readonly router: Router;

    constructor() {
        this.router = Router();

        this.router.get("/reports/attendance-ratings", this.getAttendanceRatings);
    }

    private async getAttendanceRatings(
        req: Request, res: Response
    ): Promise<Response<PaginatedResponse<AttendanceRating>>> {
        const paginatedAttendanceRatings = await ReportsService.getAttendanceRatings(req.query as any);

        return res.status(200).json({
            message: "successful listed attendance ratings",
            ...paginatedAttendanceRatings
        });
    }
}

export default ReportsController;