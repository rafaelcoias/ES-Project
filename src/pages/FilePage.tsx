import React, { useEffect, useState } from "react";
import { exportExcel, exportJson } from "../export";
import ExportIcon from "../content/imgs/icons/download.png";
import { useNavigate, useParams } from "react-router-dom";
import * as XLSX from "xlsx";

/**
 * Componente para exibir uma página com detalhes de um arquivo específico.
 *
 * Este componente é responsável por exibir os detalhes de um arquivo, permitindo ao usuário visualizar,
 * filtrar e exportar os dados do arquivo em formato JSON ou Excel.
 *
 * @returns {JSX.Element} O componente FilePage.
 */
export default function FilePage() {
  const navigate = useNavigate();

  // Vamos buscar o nome do ficheiro que esta no URL
  const { name = "" } = useParams<string>();

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
  //Aramzena a linha selecionada
  const [editRow, setEditRow] = useState(-1);
  //Utilizado para armazenar os valores dos inputs de edição
  const [inputValues, setInputValues] = useState<any[]>([]);


  // Este useEffect só vai correr 1 vez, quando a página renderiza.
  // Serve para ir buscar o ficheiro ao backend e ler o ficheiro excel
  useEffect(() => {
    const readExcelFile = async () => {
      try {
        // Ir buscar o ficheiro ao backend
        const response = await fetch(`/file/${name}`);
        if (!response.ok) {
          console.error("Erro ao ir buscar o ficheiro");
          alert("Erro ao ir buscar o ficheiro!");
          return;
        }
        const blob = await response.blob();
        // Usar FileReader para ler o ficheiro excel
        const reader = new FileReader();
        reader.onload = (e) => {
          const arrayBuffer = e.target?.result as ArrayBuffer;
          const data = new Uint8Array(arrayBuffer);
          const workbook = XLSX.read(data, { type: "array" });
          const worksheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[worksheetName];
          let jsonData = XLSX.utils.sheet_to_json(worksheet);
          // Remover espacos em branco para nao haver problemas com os filtros
          jsonData = jsonData.map((row: any) => {
            const trimmedRow: any = {};
            Object.keys(row).forEach((key) => {
              trimmedRow[key.trim()] = row[key];
            });
            return trimmedRow;
          });
          setFileData(jsonData);
        };
        // Em caso de erro ao ler o ficheiro
        reader.onerror = (error) => {
          console.error("Erro ao ler o ficheiro:", error);
          alert("Erro ao ler o ficheiro!");
        };
        reader.readAsArrayBuffer(blob);
      } catch (error) {
        console.error("Erro ao ler o ficheiro:", error);
        alert("Erro ao ler o ficheiro!");
      }
    };
    readExcelFile();
  }, [name, rowsToDisplay]);

  useEffect(() => {
    // Função para colocar o mês primeiro que o dia, para assim conseguirmos usar o Date
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
        const rowData = row["Data da aula"];
        // Ignora se não for uma data válida
        if (!rowData || !isValidDate(rowData)) return;
        const date = convertDate(rowData);
        if (date.getTime() < older.getTime()) older = date;
      });
      const firstWeek = older;

      // Formula para calcular a semana do ano
      /**
       * Função para calcular a semana do ano com base na data fornecida.
       *
       * @param {Object} row - O objeto contendo os dados da linha, geralmente representando uma entrada de calendário.
       * @returns {number | string} A semana do ano calculada ou uma string de erro se a data não for válida.
       */
      function getSemanaAno(row: any) {
        if (!row || !row["Data da aula"]) return;
        const dateString = row["Data da aula"].toString();
        const [day, month] = dateString.split("/");
        const date = new Date(
          new Date().getFullYear(),
          parseInt(month) - 1,
          parseInt(day)
        );
        const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
        const pastDaysOfYear =
          (date.getTime() - firstDayOfYear.getTime()) / 86400000;
        const semanaAno =
          Math.ceil((pastDaysOfYear + firstDayOfYear.getDay()) / 7) - 1;
        if (isNaN(semanaAno)) return "Erro";
        return semanaAno;
      }

      // Formula para calcular a semana letiva
      /**
       * Função para calcular a semana letiva com base na data fornecida.
       *
       * @param {Object} row - O objeto contendo os dados da linha, geralmente representando uma entrada de calendário.
       * @param {Date} firstWeek - A primeira semana do ano para calcular a semana letiva.
       * @returns {number | string} A semana letiva calculada ou uma string de erro se a data não for válida.
       */
      function getSemanaLetiva(row: any) {
        if (!row || !row["Data da aula"]) return;
        const dateString = row["Data da aula"].toString();
        const [day, month, year] = dateString.split("/");
        const date = new Date(`${month}/${day}/${year}`);
        if (!firstWeek) return;
        const diffMilliseconds = date.getTime() - firstWeek.getTime();
        const semanaLetiva = Math.ceil(
          diffMilliseconds / (7 * 24 * 60 * 60 * 1000)
        );
        if (isNaN(semanaLetiva)) return "Erro";
        return semanaLetiva;
      }

      // Adicionar a semana do ano e a semana letiva a cada linha
      /**
       * Cria um novo array de dados com informações adicionais sobre a semana letiva e o ano para cada linha de dados.
       *
       * @param {Array} fileData - O array de objetos contendo os dados originais.
       * @param {function} getSemanaLetiva - A função responsável por calcular a semana letiva.
       * @param {function} getSemanaAno - A função responsável por calcular a semana do ano.
       * @returns {Array} - Um novo array de objetos com informações adicionais sobre a semana letiva e o ano.
       */
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
    if (fileData) getFirstWeek();
  }, [fileData]);

  // Filtrar sempre que os filtros ou os dados da tabela mudam
  useEffect(() => {
    // Logica para filtrar os dados
    const newData = tableData?.filter((row: any) => {
      return Object.keys(filtros).every((key) => {
        const filterValue = filtros[key];
        if (!filterValue) return true;
        // Se o valor da celula for null ou undefined, não fazemos match, para evitar erros
        const rowValue = row[key] ? row[key].toString().toLowerCase() : "";
        // Se o valor da celula incluir o valor do filtro, fazemos match
        return rowValue.includes(filterValue.toLowerCase());
      });
    });
    setFilteredData(newData);
  }, [filtros, tableData]);

  // Esta função chama a função de exportar em json.
  // A função exportJson recebe um array de objectos (cada elemento do array é uma linha de excel)
  /**
   * Função para exportar os dados para um arquivo JSON.
   *
   * @param {Array} tableData - O array de objetos contendo os dados a serem exportados.
   * @param {string} name - O nome do arquivo a ser exportado.
   * @returns {void} - Esta função não retorna nenhum valor.
   */
  function handleExportJson() {
    exportJson(tableData, name);
  }

  // Esta função chama a função de exportar.
  // A função exportExcel recebe um array de objectos (cada elemento do array é uma linha de excel)
  /**
   * Função para exportar os dados para um arquivo Excel.
   *
   * @param {Array} tableData - O array de objetos contendo os dados a serem exportados.
   * @param {string} name - O nome do arquivo a ser exportado.
   * @returns {void} - Esta função não retorna nenhum valor.
   */
  function handleExportExcel() {
    exportExcel(tableData, name);
  }

  const handleEdit=(rowIndex:number)=>{
    setEditRow(rowIndex);
    // Define os valores iniciais dos campos de entrada com base nos valores atuais da linha
    setInputValues(filteredData[rowIndex]);
  }

 // Função para sair do modo de edição e atualizar a linha
  const handleUpdate = (rowIndex: number) => {
    // Obtém a linha a ser atualizada
    const updatedRow = inputValues;

    // Cria uma cópia dos dados filtrados para evitar mutações diretas no estado
    const updatedData = [...filteredData];

    // Atualiza os valores na linha com os valores dos campos de entrada
    updatedData[rowIndex] = updatedRow;

    // Atualiza o estado com os dados atualizados
    setTableData(updatedData);

    // Limpa o estado de edição
    setEditRow(-1);
  };

  // Função para atualizar os valores durante o modo de edição
  const handleInputChange = (key: string, value: string) => {
    // Atualiza o estado dos valores de entrada com a nova alteração
    setInputValues((prevInputValues) => ({
      ...prevInputValues,
      [key]: value,
    }));
  };
  
  const handleUpdateFile = () => {
    // Verifique se há um arquivo selecionado para atualizar
    if (!tableData || tableData.length === 0) {
      alert("Nenhum arquivo disponível para atualizar");
      return;
    }
  
    // Implemente a lógica para apagar o arquivo atual
    fetch(`/file/${name}`, {
      method: "DELETE"
    })
      .then(response => {
        if (response.ok) {
          // O arquivo foi apagado com sucesso, agora você pode criar um novo com os dados atualizados
          // Implemente a lógica para criar o novo arquivo com os dados atualizados
          createNewFileWithUpdatedData();
        } else {
          console.error("Erro ao apagar o arquivo:", response.statusText);
          alert("Erro ao apagar o arquivo!");
        }
      })
      .catch(error => {
        console.error("Erro ao apagar o arquivo:", error);
        alert("Erro ao apagar o arquivo!");
      });
  };
  
  const createNewFileWithUpdatedData = () => {
    // Criar um novo Workbook
    const wb = XLSX.utils.book_new();

    // Converter os dados para o formato de planilha
    const ws = XLSX.utils.json_to_sheet(tableData);

    // Adicionar a planilha ao Workbook
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

    // Converter o Workbook em um Blob
    const wbBlob = new Blob([XLSX.write(wb, { bookType: 'xlsx', type: 'binary' })], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

    // Criar um FormData e adicionar o Blob
    const formData = new FormData();
    formData.append("file", wbBlob, `${name.split(".")[0]}.csv`);

    // Enviar a requisição para o servidor
    fetch("/upload", {
        method: "POST",
        body: formData,
    })
    .then(response => {
        if (response.ok) {
            alert("Ficheiro adicionado!");
        } else {
            alert("Upload do ficheiro falhou!");
        }
    })
    .catch(error => {
        console.error("Upload do ficheiro falhou:", error);
        alert("Upload do ficheiro falhou!");
    });
}


  
  // Se ainda não houver ficheiro, aparece uma mensagem a dizer que está a carregar
  if (!filteredData) {
    return (
      <div className="w-full h-screen pt-[5rem] px-[4vw] flex flex-col gap-8 text-[var(--blue)]">
        <h1 className="text-[2rem] font-bold text-black animate-bounce">
          A carregar...
        </h1>
      </div>
    );
  }

  // Usamos <table> para criar uma tabela
  // Usamos <thead> para criar o header da tabela
  // Usamos <th> para criar uma célula de header na tabela
  // Usamos <tbody> para criar o corpo da tabela
  // Usamos <tr> para criar uma linha na tabela
  // Usamos <td> para criar uma célula na tabela

  // Aqui estará tudo o que será apresentado na página FilePage.
  return (
    <div className="w-full min-h-screen pt-[5rem] px-[4vw] flex flex-col gap-8 text-[var(--blue)]">
      <button
        onClick={() => navigate(-1)}
        className="absolute top-8 left-[4vw] font-mybold text-black"
      >
        ⬅ VOLTAR
      </button>
      <div className="flex flex-col items-center justify-between gap-8 mil:flex-row">
        <h1 className="text-[1.2rem] seis:text-[2rem] font-bold text-black">
          Ficheiro <span className="text-[var(--blue)]">{name}</span>
        </h1>
        <div className="flex flex-col gap-4 border-2 border-black p-5 w-[18rem] rounded-[20px]">
          <div className="flex items-center justify-center w-full gap-4 text-center">
            <img src={ExportIcon} alt="icon" className="w-6" />
            Exportar ficheiro
          </div>
          <div className="flex justify-center gap-4">
            <button
              className="w-[8rem] px-4 py-1 rounded-full bg-[var(--blue)] text-white hover:border-black border-[transparent] border-[2px]"
              onClick={handleExportJson}
            >
              JSON
            </button>
            <button
              className="w-[8rem] px-4 py-1 rounded-full bg-[var(--blue)] text-white  hover:border-black border-[transparent] border-[2px]"
              onClick={handleExportExcel}
            >
              Excel
            </button>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <p>Número de linhas a mostrar</p>
        <select
          name="rowsNumber"
          value={rowsToDisplay}
          onChange={(e) => setRowsToDisplay(parseInt(e.target.value))}
          className="w-[18rem] p-2 bg-[transparent] border-[1px] border-black rounded-[20px] cursor-pointer"
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
        <button
          onClick={() => {handleUpdateFile() }}
          className="px-3 py-1 bg-[var(--blue)] text-white hover:border-black border-[transparent] border-[2px] rounded-[20px] ml-auto"
        >
          Gravar Localmente
        </button>
      </div>
      <div className="relative w-full overflow-x-auto mb-[2rem] h-[35rem] bg-white">
        <table className="w-full text-left text-[.8rem] text-black">
          {/* Header da tabela */}
          <thead>
            <tr className="uppercase bg-white">
              {tableData &&
                tableData[0] &&
                Object.keys(tableData[0]).map((value: any, index: number) => (
                  <th key={index} className="sticky top-0">
                    <div className="border-[1px] border-black p-2 min-w-[10rem] bg-[white]">
                      <p className="whitespace-nowrap">{value}</p>
                      <input
                        type="text"
                        placeholder={`Filtrar ${value}`}
                        value={filtros[value] || ""}
                        onChange={(e) =>
                          setFiltros({ ...filtros, [value]: e.target.value })
                        }
                        className="input"
                      />
                    </div>
                  </th>
                ))}
                {/* Adicionar coluna "EDITAR" no final da tabela */}
              <th className="sticky top-0">
              <div className="border-[1px] border-black p-6 min-w-[10rem] bg-[white]">
                <p className="whitespace-nowrap text-center">EDITAR</p>
              </div>
              </th>
            </tr>
          </thead>
          {/* Body/informação da tabela */}
          <tbody>
            {filteredData && filteredData.length > 0 ? (
              filteredData
                .slice(0, rowsToDisplay)
                .map((row: any, rowIndex: number) => (
                  <tr
                    key={rowIndex}
                    className={`hover:bg-[#d8d8d8] cursor-pointer ${
                      rowIndex % 2 === 0 && "bg-[#eeeeee]"
                    }`}
                  >
                    {rowIndex === editRow ? (
                      // Se rowIndex === editRow, renderize inputs para cada valor da linha
                      Object.keys(row).map((key: any, colIndex: number) => (
                        <td
                          key={colIndex}
                          className="p-2 border-[1px] border-black whitespace-nowrap"
                        >
                          <input
                            type="text"
                            value={inputValues[key] || ""}
                            onChange={(e) => handleInputChange(key, e.target.value)}
                          />
                        </td>

                      ))
                    ) : (
                      // Caso contrário, renderize os valores normais da linha
                      Object.values(row).map((value: any, colIndex: number) => (
                        <td
                          key={colIndex}
                          className="p-2 border-[1px] border-black whitespace-nowrap"
                        >
                          {value}
                        </td>
                      ))
                    )}
                    {/* Adicione o botão de edição na última coluna */}
                    <td className="p-2 border-[1px] border-black whitespace-nowrap">
                      {rowIndex === editRow ? (
                        // Se rowIndex === editRow, renderize o botão de "Update"
                        <button
                          onClick={() => handleUpdate(rowIndex)}
                          className="px-4 py-1 bg-green-500 text-white hover:bg-white hover:text-green-500 rounded-md"
                        >
                          Update
                        </button>
                      ) : (
                        // Caso contrário, renderize o botão de "Edit"
                        <button
                          onClick={() => handleEdit(rowIndex)}
                          className="px-4 py-1 bg-blue-500 text-white hover:bg-white hover:text-blue-500 rounded-md"
                        >
                          Edit
                        </button>
                      )}
                    </td>
                  </tr>
                ))
            ) : (
              <tr className="absolute top-1/2 left-1/2 translate-x-[-50%] translate-y-[-50%]">
                <td
                  colSpan={Object.keys(tableData[0]).length + 1}
                  className="text-center text-[1.2rem]"
                >
                  Sem resultados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
