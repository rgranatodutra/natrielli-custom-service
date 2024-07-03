export type ContactMethod = 'email' | 'recommendation' | 'website' | 'facebook' | 'instagram' | 'linkedin' | 'other' | 'already-a-customer';

export interface ContactResearch {
    id: number;
    attendance_id: number;
    customer_id: number;
    contact_method: ContactMethod | null;
    ask_date: Date;
    answer_date: Date;
    RAZAO: string;
    ATIVO: "SIM" | "NAO";
    CPF_CNPJ: string;
    ESTADO: string;
    CIDADE: string;
}