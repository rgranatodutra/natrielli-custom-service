"use client";

import { useState, useEffect } from "react";
import fetchAttendanceRatings from "../../../lib/attendance-ratings.fetch";
import styles from "./page.module.css";
import { AutoComplete, Button, Table, DatePicker, Input, Rate } from "antd";
import formatPhone from "../../../lib/utils/format-phone.util";
import { AttendanceRating } from "../../../lib/types/attendance-rating.type";
import { ColumnsType } from "antd/es/table";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import type { TooltipItem } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const columns: ColumnsType<AttendanceRating> = [
    {
        title: "Atendimento",
        dataIndex: "COD_ATENDIMENTO_AVALIADO",
        key: "COD_ATENDIMENTO_AVALIADO",
    },
    {
        title: "Cliente",
        dataIndex: "CLIENTE",
        key: "CLIENTE"
    },
    {
        title: "Contato",
        dataIndex: "CONTATO",
        key: "CONTATO"
    },
    {
        title: "Número",
        dataIndex: "NUMERO",
        key: "NUMERO",
        render: (text) => <>{formatPhone(text)}</>
    },
    {
        title: "Atendente",
        dataIndex: "OPERADOR",
        key: "OPERADOR"
    },
    {
        title: "Avaliação",
        dataIndex: "AVALIACAO",
        key: "AVALIACAO",
        render: (value) => <Rate value={value} disabled />
    },
    {
        title: "Início do atendimento",
        dataIndex: "DATA_INICIO_AVALIADO",
        key: "DATA_INICIO_AVALIADO",
        render: (_, { DATA_INICIO_AVALIADO }) => <>{new Date(DATA_INICIO_AVALIADO).toLocaleString()}</>
    },
    {
        title: "Fim do atendimento",
        dataIndex: "DATA_FIM_AVALIADO",
        key: "DATA_FIM_AVALIADO",
        render: (_, { DATA_FIM_AVALIADO }) => <>{new Date(DATA_FIM_AVALIADO).toLocaleString()}</>
    },
];

const { RangePicker } = DatePicker;

export default function SatisfactionResearchReport() {
    const [data, setData] = useState<Array<AttendanceRating>>([]);
    const [filteredData, setFilteredData] = useState<Array<AttendanceRating>>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [operators, setOperators] = useState<Array<string>>([]);
    const [customers, setCustomers] = useState<Array<string>>([]);
    const [filters, setFilters] = useState({
        OPERADOR: "",
        CLIENTE: "",
        CONTATO: "",
        NUMERO: "",
        DATA_INICIO_AVALIADO_START: "",
        DATA_INICIO_AVALIADO_END: "",
        DATA_FIM_AVALIADO_START: "",
        DATA_FIM_AVALIADO_END: ""
    });

    useEffect(() => {
        fetchAttendanceRatings({
            ORDENAR_POR: "DATA_INICIO_AVALIADO",
            page: "1",
            perPage: "9999999"
        }).then(({ data }) => {
            setData(data);
            setFilteredData(data);
            setTotalItems(data.length);
            setLoading(false);

            const uniqueOperators = Array.from(new Set(data.map(item => item.OPERADOR)));
            const uniqueCustomers = Array.from(new Set(data.map(item => item.CLIENTE)));
            setOperators(uniqueOperators);
            setCustomers(uniqueCustomers);
        });
    }, []);

    const handleFilterSearch = () => {
        setFilteredData(data.filter(v => {
            const conditions = [
                v.OPERADOR.toLowerCase().includes(filters.OPERADOR.toLowerCase()),
                v.CLIENTE.toLowerCase().includes(filters.CLIENTE.toLowerCase()),
                v.CONTATO.toLowerCase().includes(filters.CONTATO.toLowerCase()),
                v.NUMERO.toLowerCase().includes(filters.NUMERO.toLowerCase()),
                (!filters.DATA_INICIO_AVALIADO_START || new Date(v.DATA_INICIO_AVALIADO) >= new Date(filters.DATA_INICIO_AVALIADO_START)) &&
                (!filters.DATA_INICIO_AVALIADO_END || new Date(v.DATA_INICIO_AVALIADO) <= new Date(filters.DATA_INICIO_AVALIADO_END)),
                (!filters.DATA_FIM_AVALIADO_START || new Date(v.DATA_FIM_AVALIADO) >= new Date(filters.DATA_FIM_AVALIADO_START)) &&
                (!filters.DATA_FIM_AVALIADO_END || new Date(v.DATA_FIM_AVALIADO) <= new Date(filters.DATA_FIM_AVALIADO_END))
            ];
            return !conditions.includes(false);
        }));
    };

    const handleTableChange = (pagination: any) => {
        setCurrentPage(pagination.current);
    };

    const handleFilterChange = (key: keyof typeof filters) => (value: string) => {
        setFilters({ ...filters, [key]: value });
    }

    const calculateAverageRatings = (data: Array<AttendanceRating>) => {
        const operatorRatings: { [key: string]: number[] } = {};

        data.forEach(item => {
            if (!operatorRatings[item.OPERADOR]) {
                operatorRatings[item.OPERADOR] = [];
            }
            operatorRatings[item.OPERADOR].push(item.AVALIACAO);
        });

        const labels = Object.keys(operatorRatings);
        const averages = labels.map(operator => {
            const ratings = operatorRatings[operator];
            const sum = ratings.reduce((acc, rating) => acc + rating, 0);
            return sum / ratings.length;
        });

        return { labels, averages };
    };

    const { labels, averages } = calculateAverageRatings(filteredData);

    const dataChart = {
        labels,
        datasets: [
            {
                label: 'Avaliação Média por Operador',
                data: averages,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
            },
        ],
    };

    const tooltipCallbacks = {
        label: (tooltipItem: TooltipItem<'bar'>) => {
            const value = tooltipItem.raw as number;
            return `Nota Média: ${value.toFixed(2)}`;
        },
    };

    return (
        <main className={styles.main}>
            <div className={styles["filters-container"]}>
                <AutoComplete
                    options={customers.map(customer => ({ value: customer }))}
                    style={{ width: 400 }}
                    onChange={handleFilterChange("CLIENTE")}
                    placeholder="Cliente"
                    value={filters.CLIENTE}
                />
                <AutoComplete
                    options={operators.map(operator => ({ value: operator }))}
                    style={{ width: 400 }}
                    onSelect={handleFilterChange("OPERADOR")}
                    placeholder="Operador"
                    value={filters.OPERADOR}
                />
                <Input
                    placeholder="Contato"
                    style={{ width: 400 }}
                    value={filters.CONTATO}
                    onChange={(e) => handleFilterChange("CONTATO")(e.target.value)}
                />
                <Input
                    placeholder="Número"
                    style={{ width: 400 }}
                    value={filters.NUMERO}
                    onChange={(e) => handleFilterChange("NUMERO")(e.target.value)}
                />
                <RangePicker
                    format="YYYY-MM-DD"
                    onChange={(dates, dateStrings) => {
                        if (dates) {
                            const [startDate, endDate] = dates;

                            setFilters({ ...filters, DATA_INICIO_AVALIADO_START: startDate?.format('YYYY-MM-DD') || "", DATA_INICIO_AVALIADO_END: endDate?.format('YYYY-MM-DD') || "" });

                        } else {
                            setFilters({ ...filters, DATA_INICIO_AVALIADO_START: "", DATA_INICIO_AVALIADO_END: "" });
                        }
                    }}
                    placeholder={['Início (min)', 'Início (max)']}
                    style={{ width: 400 }}
                />
                <RangePicker
                    format="YYYY-MM-DD"
                    onChange={(dates, dateStrings) => {
                        if (dates) {
                            const [startDate, endDate] = dates;
                            setFilters({ ...filters, DATA_FIM_AVALIADO_START: startDate?.format('YYYY-MM-DD') || "", DATA_FIM_AVALIADO_END: endDate?.format('YYYY-MM-DD') || "" });
                        } else {
                            setFilters({ ...filters, DATA_FIM_AVALIADO_START: "", DATA_FIM_AVALIADO_END: "" });
                        }
                    }}
                    placeholder={['Fim (min)', 'Fim (max)']}
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
