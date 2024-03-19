import React, { useEffect, useState } from 'react';
import { exportExcel, exportJson } from '../export';
import ExportIcon from '../content/imgs/icons/download.png'
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import * as XLSX from 'xlsx';

export default function FilePage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { file } = location.state?.file;

    // Vamos buscar o nome do ficheiro que esta no URL
    const { name } = useParams();

    // Variaveis
    // Informacao do ficheiro sem alteracoes
    const [fileData, setFileData] = useState<any>(null);
    // Informacao do ficheiro com semana ano e semana letiva
    const [tableData, setTableData] = useState<any>(null);
    // Informacao do ficheiro filtrada
    const [filteredData, setFilteredData] = useState<any>(null);
    // Filtros para a tabela
    const [filtros, setFiltros] = useState<any>({});
    // Numero de linhas a mostrar
    const [rowsToDisplay, setRowsToDisplay] = useState<number>(20);

    useEffect(() => {
        const readExcelFile = async () => {
            try {
                // Ir buscar o ficheiro ao Github e transformar em JSON
                const response = await fetch(file.url);
                const arrayBuffer = await response.arrayBuffer();
                const data = new Uint8Array(arrayBuffer);
                const decoder = new TextDecoder('utf-8');
                const text = decoder.decode(data);
                const workbook = XLSX.read(text, { type: 'binary' });
                const worksheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[worksheetName];
                let jsonData = XLSX.utils.sheet_to_json(worksheet);
                // Remover os espaços em branco (usando o trim)
                // dos nomes das colunas. Isto estava a dar problemas 
                // com os filtros que nao tinham espacos em branco
                jsonData = jsonData.map((row: any, index: number) => {
                    const trimmedRow: any = {};
                    Object.keys(row).forEach((key) => {
                        trimmedRow[key.trim()] = row[key];
                    });
                    return trimmedRow;
                });
                setFileData(jsonData);
            } catch (error) {
                console.error("Error reading file:", error);
                alert('Erro ao ler o ficheiro!');
            }
        };
        readExcelFile();
    }, [file, rowsToDisplay]);

    useEffect(() => {
        // Função para ir buscar a primeira semana do ano
        const convertDate = (dateStr: string) => {
            const parts = dateStr.toString().split("/");
            return new Date(`${parts[1]}/${parts[0]}/${parts[2]}`);
        };
        // Função para verificar se a data está no formato dd/mm/yyyy
        const isValidDate = (dateStr: string) => {
            return dateStr.toString().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
        };

        // Função para ir buscar a primeira e a última semana do ano
        const getFirstWeek = () => {
            if (!fileData || fileData.length === 0) return;

            let older = new Date();
            fileData.forEach((row: any) => {
                const rowData = row['Data da aula'];
                // Ignora se não for uma data válida
                if (!rowData || !isValidDate(rowData)) return;
                const date = convertDate(rowData);
                if (date.getTime() < older.getTime())
                    older = date;
            });
            const firstWeek = older;

            // Formula para calcular a semana do ano
            function getSemanaAno(row: any) {
                if (!row || !row['Data da aula']) return;
                const dateString = (row['Data da aula']).toString();
                const [day, month] = dateString.split('/');
                const date = new Date(new Date().getFullYear(), parseInt(month) - 1, parseInt(day));
                const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
                const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
                const semanaAno = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay()) / 7) - 1;
                if (isNaN(semanaAno)) return 'Erro';
                return semanaAno;
            }

            // Formula para calcular a semana letiva
            function getSemanaLetiva(row: any) {
                if (!row || !row['Data da aula']) return;
                const dateString = row['Data da aula'].toString();
                const [day, month, year] = dateString.split('/');
                const date = new Date(`${month}/${day}/${year}`);
                if (!firstWeek) return;
                const diffMilliseconds = date.getTime() - firstWeek.getTime();
                const semanaLetiva = Math.ceil(diffMilliseconds / (7 * 24 * 60 * 60 * 1000));
                if (isNaN(semanaLetiva)) return 'Erro';
                return semanaLetiva;
            }

            // Adicionar a semana do ano e a semana letiva a cada linha
            const newData = fileData?.map((row: any) => {
                return {
                    "semana Letiva": getSemanaLetiva(row),
                    "semana Ano": getSemanaAno(row),
                    ...row,
                };
            });

            // Guardar os dados na tabela
            setTableData(newData);
            setFilteredData(newData);
        };
        if (fileData)
            getFirstWeek();
    }, [fileData]);

    // Filtrar sempre que os filtros ou os dados da tabela mudam
    useEffect(() => {
        // Logica para filtrar os dados
        const newData = tableData?.filter((row: any) => {
            return Object.keys(filtros).every((key) => {
                const filterValue = filtros[key];
                if (!filterValue) return true;
                // Se o valor da celula for null ou undefined, não fazemos match, para evitar erros
                const rowValue = row[key] ? row[key].toString().toLowerCase() : '';
                // Se o valor da celula incluir o valor do filtro, fazemos match
                return rowValue.includes(filterValue.toLowerCase());
            });
        });
        setFilteredData(newData);
    }, [filtros, tableData]);

    // Esta função chama a função de exportar em json.
    // A função exportJson recebe um array de objectos (cada elemento do array é uma linha de excel)
    function handleExportJson() {
        exportJson(tableData, name);
    }

    // Esta função chama a função de exportar.
    // A função exportExcel recebe um array de objectos (cada elemento do array é uma linha de excel)
    function handleExportExcel() {
        exportExcel(tableData, name);
    }

    if (!filteredData) {
        return (
            <div className='w-full h-screen pt-[5rem] px-[4vw] flex flex-col gap-8 text-[var(--blue)]'>
                <h1 className='text-[2rem] font-bold text-black animate-bounce'>A carregar...</h1>
            </div>
        )
    }

    // Usamos <table> para criar uma tabela
    // Usamos <thead> para criar o header da tabela
    // Usamos <th> para criar uma célula de header na tabela
    // Usamos <tbody> para criar o corpo da tabela
    // Usamos <tr> para criar uma linha na tabela
    // Usamos <td> para criar uma célula na tabela

    // Aqui estará tudo o que será apresentado na página FilePage.
    return (
        <div className='w-full min-h-screen pt-[5rem] px-[4vw] flex flex-col gap-8 text-[var(--blue)]'>
            <button onClick={() => navigate(-1)} className='absolute top-8 left-[4vw] font-mybold text-black'>⬅ VOLTAR</button>
            <div className='flex flex-col items-center justify-between gap-8 mil:flex-row'>
                <h1 className='text-[1.2rem] seis:text-[2rem] font-bold text-black'>Ficheiro <span className='text-[var(--blue)]'>{name}</span></h1>
                <div className='flex flex-col gap-4 border-2 border-black p-5 w-[18rem] rounded-[20px]'>
                    <div className='flex items-center justify-center w-full gap-4 text-center'>
                        <img src={ExportIcon} alt="icon" className='w-6' />
                        Exportar ficheiro
                    </div>
                    <div className='flex justify-center gap-4'>
                        <button className='w-[8rem] px-4 py-1 rounded-full bg-[var(--blue)] text-white' onClick={handleExportJson}>JSON</button>
                        <button className='w-[8rem] px-4 py-1 rounded-full bg-[var(--blue)] text-white' onClick={handleExportExcel}>Excel</button>
                    </div>
                </div>
            </div>
            <div className='flex flex-col gap-2'>
                <p>Número de linhas a mostrar</p>
                <select
                    name="rowsNumber"
                    value={rowsToDisplay}
                    onChange={(e) => setRowsToDisplay(parseInt(e.target.value))}
                    className='w-[18rem] p-2 bg-[transparent] border-[1px] border-black rounded-[20px] cursor-pointer'
                >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={30}>30</option>
                    <option value={40}>40</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                    <option value={200}>200</option>
                    <option value={500}>500</option>
                </select>
            </div>
            <div className='relative w-full overflow-x-auto mb-[2rem] h-[35rem] bg-white'>
                <table className='w-full text-left text-[.8rem] text-black'>
                    {/* Header da tabela */}
                    <thead>
                        <tr className='uppercase bg-white'>
                            {
                                tableData && tableData[0] && Object.keys(tableData[0]).map((value: any, index: number) => (
                                    <th key={index} className='sticky top-0'>
                                        <div className='border-[1px] border-black p-2 min-w-[10rem] bg-[white]'>
                                            <p className='whitespace-nowrap'>{value}</p>
                                            <input
                                                type="text"
                                                placeholder={`Filtrar ${value}`}
                                                value={filtros[value] || ''}
                                                onChange={(e) => setFiltros({ ...filtros, [value]: e.target.value })}
                                                className='input'
                                            />
                                        </div>
                                    </th>
                                ))
                            }
                        </tr>
                    </thead>
                    {/* Body/informação da tabela */}
                    <tbody>
                        {
                            filteredData && filteredData.length > 0 ?
                                filteredData.slice(0, rowsToDisplay).map((row: number, index: number) => (
                                    <tr key={index} className={` hover:bg-[#d8d8d8] cursor-pointer ${index % 2 === 0 && 'bg-[#eeeeee]'}`}>
                                        {Object.values(row).map((value: any, index: number) => (
                                            <td key={index} className='p-2 border-[1px] border-black whitespace-nowrap'>{value}</td>
                                        ))}
                                    </tr>
                                ))
                                :
                                <tr className='absolute top-1/2 left-1/2 translate-x-[-50%] translate-y-[-50%]'>
                                    <td colSpan={Object.keys(tableData[0]).length} className='text-center text-[1.2rem]'>Sem resultados</td>
                                </tr>
                        }
                    </tbody>
                </table>
            </div>
        </div>
    );
}

