import { FilterWithPaginationQueryParameters, createWhereString, toPaginated } from "inpulse-crm/utils";
import instancesService from "./instances.service";
import { ContactResearch } from "./types/contact-research.type";

const SELECT_CONTACT_RESEARCHES_QUERY = "SELECT\n"
    + "   wp.*,\n"
    + "   cli.RAZAO,\n"
    + "   cli.ATIVO,\n"
    + "   cli.CPF_CNPJ,\n"
    + "   cli.ESTADO,\n"
    + "   cli.CIDADE\n"
    + "FROM w_pesquisa_contato wp\n"
    + "LEFT JOIN w_atendimentos wa ON wa.CODIGO = wp.attendance_id\n"
    + "LEFT JOIN clientes cli ON cli.CODIGO = wp.customer_id\n";

const dateColumns: Array<keyof ContactResearch> = ["ask_date", "answer_date"];
const likeColumns: Array<keyof ContactResearch> = [];
const numberColumns: Array<keyof ContactResearch> = ["attendance_id", "customer_id", "id"];

async function fetchContactResearches(filters: FilterWithPaginationQueryParameters<ContactResearch>) {
    const [where, values] = createWhereString({ parameters: filters, dateColumns, likeColumns, numberColumns });

    const rows = await instancesService
        .executeQuery<ContactResearch[]>(
            "natrielli",
            `${SELECT_CONTACT_RESEARCHES_QUERY}\n${where}`,
            values
        )
        .then(data => data.result);

    const paginatedRows = toPaginated(rows, +filters.page, +filters.perPage);

    return paginatedRows;
}

export default fetchContactResearches;
