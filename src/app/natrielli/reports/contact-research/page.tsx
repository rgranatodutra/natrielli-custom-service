"use client";

import { useState, useEffect } from "react";
import styles from "./page.module.css";
import { AutoComplete, Button, Table, DatePicker, Input, Select } from "antd";
import formatPhone from "../../../lib/utils/format-phone.util";
import { ColumnsType } from "antd/es/table";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import type { TooltipItem } from 'chart.js';
import { ContactResearch } from "../../../lib/types/contact-research.type";
import fetchContactResearches from "../../../lib/contact-researches.fetch";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const customlabels = {
    "already-a-customer": "Já sou cliente ativo",
    "recommendation": "Recomendação",
    "email": "E-mail",
    "website": "Site da empresa",
    "facebook": "Facebook",
    "instagram": "Instagram",
    "linkedin": "LinkedIn",
    "other": "Outro",
}

const columns: ColumnsType<ContactResearch> = [
    {
        title: "Cliente",
        dataIndex: "RAZAO",
        key: "RAZAO",
    },
    {
        title: "Ativo",
        dataIndex: "ATIVO",
        key: "ATIVO",
        render: (_, { ATIVO }) => {
            return <span className={`${styles.tag} + ${styles[ATIVO]}`}>{ATIVO === "SIM" ? "Sim" : "Não"}</span>
        }
    },
    {
        title: "CPF/CNPJ",
        dataIndex: "CPF_CNPJ",
        key: "CPF_CNPJ"
    },
    {
        title: "Método de contato",
        dataIndex: "contact_method",
        key: "contact_method",
        render: (_, { contact_method }) => <>{contact_method ? customlabels[contact_method] : "Não respondeu"}</>
    },
    {
        title: "Estado",
        dataIndex: "ESTADO",
        key: "ESTADO",
        render: (text) => <>{formatPhone(text)}</>
    },
    {
        title: "Cidade",
        dataIndex: "CIDADE",
        key: "CIDADE"
    },
    {
        title: "Início avaliação",
        dataIndex: "ask_date",
        key: "ask_date",
        render: (text) => <>{new Date(text).toLocaleString()}</>
    },
    {
        title: "Fim avaliação",
        dataIndex: "answer_date",
        key: "answer_date",
        render: (text) => <>{new Date(text).toLocaleString()}</>
    },
];

const { RangePicker } = DatePicker;

export default function ContactResearchReport() {
    const [data, setData] = useState<Array<ContactResearch>>([]);
    const [filteredData, setFilteredData] = useState<Array<ContactResearch>>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [customers, setCustomers] = useState<Array<string>>([]);
    const [states, setStates] = useState<Array<string>>([]);
    const [cities, setCities] = useState<Array<string>>([]);
    const [filters, setFilters] = useState({
        RAZAO: "",
        CPF_CNPJ: "",
        ATIVO: "",
        ESTADO: [] as string[],
        CIDADE: [] as string[],
        contact_method: [] as string[],
        ask_date_start: "",
        ask_date_end: "",
        answer_date_start: "",
        answer_date_end: "",

    });

    useEffect(() => {
        fetchContactResearches({
            ORDENAR_POR: "ask_date",
            page: "1",
            perPage: "9999999"
        }).then(({ data }) => {
            setData(data);
            setFilteredData(data);
            setTotalItems(data.length);
            setLoading(false);

            const uniqueStates = Array.from(new Set(data.map(item => item.ESTADO)));
            const uniqueCities = Array.from(new Set(data.map(item => item.CIDADE)));
            const uniqueCustomers = Array.from(new Set(data.map(item => item.RAZAO)));

            setStates(uniqueStates);
            setCities(uniqueCities);
            setCustomers(uniqueCustomers);
        });
    }, []);

    const handleFilterSearch = () => {
        setFilteredData(data.filter(item => {
            const conditions = [
                item.RAZAO.toLowerCase().includes(filters.RAZAO.toLowerCase()),
                item.CPF_CNPJ.includes(filters.CPF_CNPJ.replace(/\D/g, "")),
                (filters.ATIVO === item.ATIVO || filters.ATIVO === "TODOS" || filters.ATIVO === ""),
                (filters.ESTADO.length === 0 || filters.ESTADO.includes(item.ESTADO)),
                (filters.CIDADE.length === 0 || filters.CIDADE.includes(item.CIDADE)),
                (filters.contact_method.length === 0 || filters.contact_method.includes(item.contact_method || "NULL")),
                (!filters.ask_date_start || new Date(item.ask_date) >= new Date(filters.ask_date_start)) &&
                (!filters.ask_date_end || new Date(item.ask_date) <= new Date(filters.ask_date_end)),
                (!filters.answer_date_start || new Date(item.answer_date) >= new Date(filters.answer_date_start)) &&
                (!filters.answer_date_end || new Date(item.answer_date) <= new Date(filters.answer_date_end)),
            ];
            return !conditions.includes(false);
        }));
    };

    const handleTableChange = (pagination: any) => {
        setCurrentPage(pagination.current);
    };

    const handleFilterChange = (key: keyof typeof filters) => (value: string | string[]) => {
        setFilters({ ...filters, [key]: value });
    }

    const countContactMethod = (data: Array<ContactResearch>) => {
        const contactMethods: { [key: string]: number } = {};

        data.forEach(item => {
            const customLabel = item.contact_method ? customlabels[item.contact_method] : "Não respondeu";
            if (!contactMethods[customLabel]) {
                contactMethods[customLabel] = 0;
            }
            contactMethods[customLabel]++
        });

        const labels = Object.keys(contactMethods);
        const counts = labels.map(label => contactMethods[label]);

        return { labels, counts };
    };

    const { labels, counts } = countContactMethod(filteredData);

    const dataChart = {
        labels,
        datasets: [
            {
                label: 'Clientes',
                data: counts,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
            },
        ],
    };

    const tooltipCallbacks = {
        label: (tooltipItem: TooltipItem<'bar'>) => {
            const value = tooltipItem.raw as number;
            return `Clientes: ${value}`;
        },
    };

    return (
        <main className={styles.main}>
            <div className={styles["filters-container"]}>
                <AutoComplete
                    options={customers.map(customer => ({ value: customer }))}
                    style={{ width: 400 }}
                    onChange={handleFilterChange("RAZAO")}
                    placeholder="Cliente"
                    value={filters.RAZAO}
                />
                <Input
                    placeholder="CPF/CNPJ"
                    style={{ width: 400 }}
                    value={filters.CPF_CNPJ}
                    onChange={(e) => handleFilterChange("CPF_CNPJ")(e.target.value)}
                />
                <Select
                    placeholder="Ativo"
                    style={{ width: 400 }}
                    value={filters.ATIVO}
                    onChange={(value) => handleFilterChange("ATIVO")(value)}
                >
                    <Select.Option value="SIM">Sim</Select.Option>
                    <Select.Option value="NÃO">Não</Select.Option>
                    <Select.Option value="TODOS">Todos</Select.Option>
                </Select>
                <Select
                    mode="multiple"
                    placeholder="Estado"
                    style={{ width: 400 }}
                    value={filters.ESTADO}
                    onChange={(value) => handleFilterChange("ESTADO")(value)}
                >
                    {states.map(state => (
                        <Select.Option key={state} value={state}>{state}</Select.Option>
                    ))}
                </Select>
                <Select
                    mode="multiple"
                    placeholder="Cidade"
                    style={{ width: 400 }}
                    value={filters.CIDADE}
                    onChange={(value) => handleFilterChange("CIDADE")(value)}
                >
                    {cities.map(city => (
                        <Select.Option key={city} value={city}>{city}</Select.Option>
                    ))}
                </Select>
                <Select
                    mode="multiple"
                    placeholder="Método de contato"
                    style={{ width: 400 }}
                    value={filters.contact_method}
                    onChange={(value) => handleFilterChange("contact_method")(value)}
                >
                    <Select.Option value="email">Email</Select.Option>
                    <Select.Option value="already-a-customer">Já sou cliente ativo</Select.Option>
                    <Select.Option value="recommendation">Recomendação</Select.Option>
                    <Select.Option value="website">Site da empresa</Select.Option>
                    <Select.Option value="facebook">Facebook</Select.Option>
                    <Select.Option value="instagram">Instagram</Select.Option>
                    <Select.Option value="linkedin">LinkedIn</Select.Option>
                    <Select.Option value="other">Outro</Select.Option>
                </Select>

                <RangePicker
                    format="YYYY-MM-DD"
                    onChange={(dates, dateStrings) => {
                        if (dates) {
                            const [startDate, endDate] = dates;

                            setFilters({ ...filters, ask_date_start: startDate?.format('YYYY-MM-DD') || "", ask_date_end: endDate?.format('YYYY-MM-DD') || "" });

                        } else {
                            setFilters({ ...filters, ask_date_start: "", ask_date_end: "" });
                        }
                    }}
                    placeholder={['Início avaliação (min)', 'Início avaliação (max)']}
                    style={{ width: 400 }}
                />
                <RangePicker
                    format="YYYY-MM-DD"
                    onChange={(dates, dateStrings) => {
                        if (dates) {
                            const [startDate, endDate] = dates;
                            setFilters({ ...filters, answer_date_start: startDate?.format('YYYY-MM-DD') || "", answer_date_end: endDate?.format('YYYY-MM-DD') || "" });
                        } else {
                            setFilters({ ...filters, answer_date_start: "", answer_date_end: "" });
                        }
                    }}
                    placeholder={['Fim avaliação (min)', 'Fim avaliação (max)']}
                    style={{ width: 400 }}
                />
                <div style={{ width: 400 }}>
                    <Button
                        type="primary"
                        onClick={handleFilterSearch}
                        style={{ width: 150 }}
                    >
                        Filtrar
                    </Button>
                </div>
            </div>
            <Table
                columns={columns}
                dataSource={filteredData}
                rowKey="CODIGO_ATENDIMENTO"
                tableLayout="auto"
                loading={loading}
                pagination={{
                    current: currentPage,
                    total: totalItems,
                    pageSize: 20,
                }}
                onChange={handleTableChange}

            />
            <div className={styles["chart-container"]}>
                <Bar
                    data={dataChart}
                    options={{
                        responsive: true,
                        plugins: {
                            legend: {
                                position: 'top' as const,
                            },
                            tooltip: {
                                callbacks: tooltipCallbacks,
                            },
                        },
                    }}
                />
            </div>
        </main>
    );
}
