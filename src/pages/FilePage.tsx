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
    const [tableData, setTableData] = useState<any>(null);
    const [filteredData, setFilteredData] = useState<any>(null);
    const [filtros, setFiltros] = useState<any>({});

    useEffect(() => {
        const readExcelFile = async () => {
            try {
                // Ir buscar o ficheiro ao Github e transformar em JSON
                const response = await fetch(file.url);
                const arrayBuffer = await response.arrayBuffer();
                const data = new Uint8Array(arrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });
                const worksheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[worksheetName];
                let jsonData = XLSX.utils.sheet_to_json(worksheet);
                // Remover os espaços em branco dos nomes das colunas
                // Isto estava a dar problemas com os filtros
                jsonData = jsonData.map((row: any) => {
                    const trimmedRow: { [key: string]: any } = {};
                    Object.keys(row).forEach((key) => {
                        trimmedRow[key.trim()] = row[key];
                    });
                    return trimmedRow;
                });
                setTableData(jsonData);
                setFilteredData(jsonData);
            } catch (error) {
                console.error("Error reading file:", error);
                alert('Erro ao ler o ficheiro!');
            }
        };
        if (file && file.url)
            readExcelFile();
    }, [file]);

    // Filtrar sempre que os filtros ou os dados da tabela mudam
    useEffect(() => {
        // Logica para filtrar os dados
        const newData = tableData?.filter((row: any, index:number) => {
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

    // Função que renderiza o header da tabela
    // Usamos <tr> para criar uma linha na tabela
    // Usamos <th> para criar uma célula de header na tabela
    const renderTableHeader = () => {
        if (tableData) {
            const headerRow = Object.keys(tableData[0]);
            return (
                <tr className='bg-white border-[1px] border-black rounded-[10px] text-black uppercase'>
                    {headerRow.map((value, index) => (
                        <th key={index} className='p-2 border-[1px] border-black'>
                            <p>{value}</p>
                            <input
                                type="text"
                                placeholder={`Filtrar ${value}`}
                                value={filtros[value] || ''}
                                onChange={(e) => setFiltros({ ...filtros, [value]: e.target.value })}
                                className='input'
                            />
                        </th>
                    ))}
                </tr>
            );
        }
    };

    // Função que renderiza as linhas da tabela
    // Usamos <tr> para criar uma linha na tabela
    // Usamos <td> para criar uma célula na tabela
    const renderTableRows = () => {
        if (!filteredData) return null;
        return filteredData.map((row: number, index: number) => (
            <tr key={index} className={` border-[1px] border-black hover:bg-[#c5c5c5] ${index % 2 === 0 && 'bg-white'}`}>
                {Object.values(row).map((value, index) => (
                    <td key={index} className='p-2 border-[1px] border-black'>{value}</td>
                ))}
            </tr>
        ));
    };

    // Aqui estará tudo o que será apresentado na página FilePage.
    return (
        <div className='w-full h-screen pt-[5rem] px-[8vw] flex flex-col gap-8 text-[var(--blue)]'>
            <button onClick={() => navigate(-1)} className='absolute top-8 left-[8vw] font-mybold text-black'>⬅ VOLTAR</button>
            <div className='flex flex-col items-center justify-between gap-8 seis:flex-row'>
                <h1 className='text-[2rem] font-bold text-black'>Ficheiro <span className='text-[var(--blue)]'>{name}</span></h1>
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
            <div className='w-full'>
                <table className='w-full text-sm text-left text-gray-500'>
                    <thead className='rounded-[10px]'>
                        {renderTableHeader()}
                    </thead>
                    <tbody>
                        {renderTableRows()}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

