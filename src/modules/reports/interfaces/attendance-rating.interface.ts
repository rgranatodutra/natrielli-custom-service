export interface AttendanceRating {
    CODIGO_ATENDIMENTO_AVALIADO: number;
    CODIGO_ATENDIMENTO_PESQUISA: number;
    CODIGO_OPERADOR_AVALIADO: number;
    CODIGO_CLIENTE: number;
    CODIGO_NUMERO: number;
    OPERADOR: string;
    CLIENTE: string;
    CONTATO: string;
    NUMERO: string;
    DATA_INICIO_AVALIADO: Date;
    DATA_FIM_AVALIADO: Date;
    DATA_INICIO_PESQUISA: Date;
    DATA_FIM_PESQUISA: Date;
    NOTA: 1 | 2 | 3 | 4 | 5;
}