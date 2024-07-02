export interface AttendanceRating {
    COD_ATENDIMENTO_AVALIADO: number;
    COD_ATENDIMENTO_PESQUISA: number;
    COD_OPERADOR_AVALIADO: number;
    COD_CLIENTE: number;
    COD_NUMERO: number;
    OPERADOR: string;
    CLIENTE: string;
    CONTATO: string;
    NUMERO: string;
    DATA_INICIO_AVALIADO: Date;
    DATA_FIM_AVALIADO: Date;
    DATA_INICIO_PESQUISA: Date;
    DATA_FIM_PESQUISA: Date;
    AVALIACAO: 1 | 2 | 3 | 4 | 5;
}