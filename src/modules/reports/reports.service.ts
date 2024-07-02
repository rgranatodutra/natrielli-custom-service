import { FilterWithPaginationQueryParameters, toPaginated } from "inpulse-crm/utils";
import { AttendanceRating } from "./interfaces/attendance-rating.interface";
import instancesService from "../../instances.service";
import SELECT_ATTENDANCE_RATINGS_FILTER from "./queries/get-attendance-ratings.query";
import { PaginatedResponse } from "inpulse-crm/utils/src/toPaginated";


class ReportsService {
    public static async getAttendanceRatings(
        filters: FilterWithPaginationQueryParameters<AttendanceRating>,
    ): Promise<PaginatedResponse<AttendanceRating>> {
        const { page, perPage } = filters;

        const [query, values] = SELECT_ATTENDANCE_RATINGS_FILTER(filters);

        console.log(query);

        const result = await instancesService
            .executeQuery<Array<AttendanceRating>>("develop", query, values)
            .then((data) => data.result);

        const paginatedResult = toPaginated<AttendanceRating>(result, +page, +perPage);

        return paginatedResult;
    }
}

export default ReportsService;