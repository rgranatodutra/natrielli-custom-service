import { FilterWithPaginationQueryParameters, createWhereString, toPaginated } from "inpulse-crm/utils";
import { AttendanceRating } from "./types/attendance-rating.type";
import instancesService from "./instances.service";

const SELECT_ATTENDANCE_RATINGS_QUERY = "SELECT\n"
    + "   waa.CODIGO AS COD_ATENDIMENTO_AVALIADO,\n"
    + "   wap.CODIGO AS COD_ATENDIMENTO_PESQUISA,\n"
    + "   waa.CODIGO_OPERADOR AS COD_OPERADOR_AVALIADO,\n"
    + "   waa.CODIGO_CLIENTE AS COD_CLIENTE,\n"
    + "   waa.CODIGO_NUMERO AS COD_NUMERO,\n"
    + "   op.NOME AS OPERADOR,\n"
    + "   cli.RAZAO AS CLIENTE,\n"
    + "   wcn.NOME AS CONTATO,\n"
    + "   wcn.NUMERO AS  NUMERO,\n"
    + "   waa.DATA_INICIO AS DATA_INICIO_AVALIADO,\n"
    + "   waa.DATA_FIM AS DATA_FIM_AVALIADO,\n"
    + "   wap.DATA_INICIO AS DATA_INICIO_PESQUISA,\n"
    + "   wap.DATA_FIM AS DATA_FIM_PESQUISA,\n"
    + "   wf.NOTA_ATENDIMENTO AS AVALIACAO\n"
    + "FROM w_atendimentos_feedbacks wf\n"
    + "INNER JOIN w_atendimentos wap ON wap.CODIGO = wf.CODIGO_ATENDIMENTO\n"
    + "INNER JOIN w_atendimentos waa ON waa.CODIGO = wf.CODIGO_ATENDIMENTO_AVALIADO\n"
    + "INNER JOIN w_clientes_numeros wcn ON wcn.CODIGO = waa.CODIGO_NUMERO\n"
    + "INNER JOIN clientes cli ON cli.CODIGO = waa.CODIGO_CLIENTE\n"
    + "INNER JOIN operadores op ON op.CODIGO = wf.CODIGO_OPERADOR\n";

const dateColumns: Array<keyof AttendanceRating> = ["DATA_FIM_AVALIADO", "DATA_FIM_PESQUISA", "DATA_INICIO_AVALIADO", "DATA_INICIO_PESQUISA"];
const likeColumns: Array<keyof AttendanceRating> = ["CONTATO", "CLIENTE", "OPERADOR", "NUMERO"];
const numberColumns: Array<keyof AttendanceRating> = ["COD_ATENDIMENTO_AVALIADO", "COD_ATENDIMENTO_PESQUISA", "COD_CLIENTE", "COD_NUMERO", "COD_OPERADOR_AVALIADO"];

async function fetchAttendanceRatings(filters: FilterWithPaginationQueryParameters<AttendanceRating>) {
    const [where, values] = createWhereString({
        parameters: filters,
        alias: "ar",
        dateColumns, likeColumns, numberColumns
    });

    const rows = await instancesService
        .executeQuery<AttendanceRating[]>(
            "natrielli",
            `SELECT * FROM (${SELECT_ATTENDANCE_RATINGS_QUERY}) ar \n${where}`,
            values
        )
        .then(data => data.result);

    const paginatedRows = toPaginated(rows, +filters.page, +filters.perPage);

    return paginatedRows;
}

export default fetchAttendanceRatings;
