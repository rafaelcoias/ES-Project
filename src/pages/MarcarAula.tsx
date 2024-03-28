import React, { useState, useEffect } from 'react';
import * as XLSX from "xlsx";
export default function MarcarAula() {
    //guardar as informações do ficheiro horario
    const [horariosFile, setHorariosFile] = useState<any>(null);
    //guardar nome do ficheiro horario
    const [horariosFileName, setHorariosFileName] = useState<string>("");
    //guardar nome do ficheiro sala
    const [salasFileName, setSalasFileName] = useState<string>("");
    //guardar as informações do ficheiro sala
    const [salaFile, setSalaFile] = useState<any>(null);
    //saber se já fez o upload dos dois ficheiros
    const [uploading, setUploading] = useState<boolean>(false);

    //escolha do curso
    const [uniqueItemsCurso, setUniqueItemsCurso] = useState<any>([]);
    const [selectedItemCurso, setSelectedItemCurso] = useState<any>('');

    //escolha da UC
    const [uniqueItemsUC, setUniqueItemsUC] = useState<any>([]);
    const [selectedItemUC, setSelectedItemUC] = useState<any>('');

    //escolha da Turma
    const [uniqueItemsTurma, setUniqueItemsTurma] = useState<any>([]);
    const [selectedItemTurma, setSelectedItemTurma] = useState<any>(null);
    
  

    // Função para lidar com a mudança de arquivo de horários
    const handleHorariosFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files ? event.target.files[0] : null;
        if (
            file &&
            (file.name.endsWith(".csv") ||
                file.name.endsWith(".xls") ||
                file.name.endsWith(".xlsx") ||
                file.name.endsWith(".xlsm"))
        ) {
            setHorariosFileName(file.name);
            convertExcelToJson(file, setHorariosFile);
        } else {
            alert("Por favor escolha um ficheiro com formato excel.");
        }
    };
  
    // Função para lidar com a mudança de arquivo de sala
    const handleSalaFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files ? event.target.files[0] : null;
        if (
            file &&
            (file.name.endsWith(".csv") ||
                file.name.endsWith(".xls") ||
                file.name.endsWith(".xlsx") ||
                file.name.endsWith(".xlsm"))
        ) {
            setSalasFileName(file.name);
            convertExcelToJson(file, setSalaFile);
        } else {
            alert("Por favor escolha um ficheiro com formato excel.");
        }
    };

    const convertExcelToJson = (file: any, setDataCallback: React.Dispatch<React.SetStateAction<any[]>>) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const arrayBuffer = e.target?.result as ArrayBuffer;
            const data = new Uint8Array(arrayBuffer);
            const workbook = XLSX.read(data, { type: "array" });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, {
                header: 1,
                defval: ""
            });
            setDataCallback(jsonData);
        };
        reader.readAsArrayBuffer(file);
    };
    

    const handleContinuar=() =>{
        if(horariosFile && salaFile){
            setUploading(true);
            const columnData: any[] = horariosFile.flatMap((row: any) => {
                // Faz o split por vírgula em cada string dentro de row[0]
                return row[0].split(',').map((item: string) => item.trim());
            });
            if (Array.isArray(columnData)) {
                const uniqueItems = Array.from(new Set(columnData)).sort((a, b) => a.localeCompare(b));
                setUniqueItemsCurso(uniqueItems);
                setSelectedItemCurso(uniqueItems[0]); // Seleciona o primeiro item
            } else {
                alert("Erro ao processar os dados do arquivo de horários.");
            }
        }else{
            alert("Por favor preencha todos os campos");
        }
    }

    useEffect(() => {
        mostrarUC();
    }, [selectedItemCurso]);

    const mostrarUC = () => {
        if (horariosFile) {
            const filteredData: any[] = horariosFile.filter((row: any) => row[0].includes(selectedItemCurso));
            const columnData: any[] = filteredData.map((row: any) => row[1]);
            if (Array.isArray(columnData)) {
                const uniqueItems = Array.from(new Set(columnData));
                setUniqueItemsUC(uniqueItems);
                setSelectedItemUC(uniqueItems[0]); // Seleciona o primeiro item
            } else {
                alert("Erro ao processar os dados do arquivo de horários.");
            }
        } else {
            alert("Não há dados disponíveis para mostrar UCs.");
        }
    };


    useEffect(()=>{
        mostrarTurmas();
    },[selectedItemUC]);
    
    const mostrarTurmas = () => {
        if (horariosFile && salaFile && selectedItemUC && selectedItemCurso) {
            const filteredDataUC: any[] = horariosFile.filter((row: any) =>row[1].includes(selectedItemUC) );
            const filteredDataCurso: any[] = filteredDataUC.filter((row: any) =>  row[0].includes(selectedItemCurso));
            const columnData: any[] = filteredDataCurso.map((row: any) => row[3]);
            if (Array.isArray(columnData)) {
                const uniqueItems = Array.from(new Set(columnData));
                setUniqueItemsTurma(uniqueItems);
                setSelectedItemTurma(uniqueItems[0]); // Seleciona o primeiro item
            } else {
                alert("Erro ao processar os dados do arquivo de horários.");
            }
        } else {
            alert("Não há dados disponíveis para mostrar Turmas.");
        }
    };
    
  
    if (!uploading) {
    return (
        <div>
        <div>
            <label htmlFor="horarios">Upload de Horários:</label>
            {!horariosFile? (
                <input type="file" id="horarios" accept=".csv,.xlsx" onChange={handleHorariosFileChange} />
            ) : (
                <div>{horariosFileName}</div>
            )}
            
        </div>
        <div>
            <label htmlFor="sala">Upload de Sala:</label>
            {!salaFile? (
                <input type="file" id="sala" accept=".csv,.xlsx" onChange={handleSalaFileChange} />
            ) : (
                <div>{salasFileName}</div>
            )}
            </div>
        <button onClick={handleContinuar}>Continuar</button>
        </div>
    );
    }

    return(
        <div>
            <div>
            <label htmlFor="selectedItemCurso">Selecione um curso:</label>
            <select id="selectedItemCurso" value={selectedItemCurso} onChange={(e) => {setSelectedItemCurso(e.target.value); mostrarUC();}} >
                {uniqueItemsCurso.map((item: string, index: number) => (
                <option key={index} value={item}>{item}</option>
                ))}
            </select>
            </div>

            <div>
                <label htmlFor="selectedItemUC">Selecione uma UC:</label>
                {selectedItemCurso!=="Curso"?(
                    <select id="selectedItemUC" value={selectedItemUC} onChange={(e) =>{ setSelectedItemUC(e.target.value); mostrarTurmas();}}>
                    {uniqueItemsUC.map((item: string, index: number) => (
                        <option key={index} value={item}>{item}</option>
                    ))}
                    </select>
                ):(
                    <div></div>
                )}
            </div>

            <div>
            <label htmlFor="selectedItemTurma">Selecione as Turmas:</label>
                {selectedItemCurso!=="Curso" && selectedItemTurma!==null?(
                    <select id="selectedItemTurma" value={selectedItemTurma} onChange={(e) => setSelectedItemTurma(e.target.value)}>
                    {uniqueItemsTurma.map((item: string, index: number) => (
                        <option key={index} value={item}>{item}</option>
                    ))}
                    </select>
                ):(
                    <div></div>
                )}
            </div>

        </div>
        )
    
};