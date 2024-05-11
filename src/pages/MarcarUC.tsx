import React, { useState, useEffect } from 'react';
import * as XLSX from "xlsx";
import { useNavigate } from "react-router-dom";
import { generateDatasFromTo, titleCase, getDayOfTheWeek, generateRandomString, generateTimeSlots } from "../js/auxilioMarcarUC";
import { gerarHorasPossiveis } from '../js/auxilioEscolhaAula';

export default function MarcarUC() {

    const navigate = useNavigate();
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

    //escolha capacidade
    const [selectedItemCapacidade, setSelectedItemCapacidade] = useState<number>(0);

    //escolha sala
    const [uniqueItemsSala, setUniqueItemsSala] = useState<any>([]);
    const [selectedItemSala, setSelectedItemSala] = useState<any>('Tipo de Sala');
    //escolha capacidade/sala
    const [selectedCap_Sala, setSelectedCap_Sala] = useState<any>(null);

    //fazer o ver possibilidades
    const [verPossibilidades, setVerPossibilidades] = useState<boolean>(false);

    // Adicione um novo estado para controlar a exibição dos campos
    const [showFields, setShowFields] = useState<boolean>(false);
    // Adicione um novo estado para armazenar o valor do campo de entrada de texto
    const [ucName, setUcName] = useState<string>("");
    // Adicione um novo estado para armazenar o valor do dropdown
    const [ucOption, setUcOption] = useState<string>("");

    //Escolha do periodo das aulas para os de Diurno
    const [ucTime, setUcTime] = useState<string>("manha");

    //Num de aulas para a UC
    const [selectedAulasTotais, setSelectedAulasTotais] = useState<number>(0);
    const [selectedAulasSemanais, setSelectedAulasSemanais] = useState<number>(0);
    const [selectedTotal_Sem, setSelectedTotal_Sem] = useState<any>(null);

    const [novasAulas, setNovasAulas] = useState<any[][]>([]);

    const [uniqueItemsCurso, setUniqueItemsCurso] = useState<any>([]);
    const [selectedItemCurso, setSelectedItemCurso] = useState<any>('');

    const [numEstudantes, setNumEstudantes] = useState<number>(0);

    /**
    * Função para lidar com a mudança de arquivo de horários.
    * Converte o arquivo Excel para JSON e define os dados resultantes no estado.
    *
    * @param {React.ChangeEvent<HTMLInputElement>} event - O evento de mudança que ocorre quando um arquivo é selecionado.
    * @returns {void} - Esta função não retorna nenhum valor.
    */
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

    /**
     * Função para lidar com a mudança de arquivo de sala.
     * Converte o arquivo Excel para JSON e define os dados resultantes no estado.
     *
     * @param {React.ChangeEvent<HTMLInputElement>} event - O evento de mudança que ocorre quando um arquivo é selecionado.
     * @returns {void} - Esta função não retorna nenhum valor.
     */
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

    /**
     * Função para converter um arquivo Excel em JSON.
     *
     * @param {any} file - O arquivo Excel a ser convertido.
     * @param {React.Dispatch<React.SetStateAction<any[]>>} setDataCallback - O callback para definir os dados resultantes no estado.
     * @returns {void} - Esta função não retorna nenhum valor.
     */
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

    /**
     * Função para lidar com o botão de continuar.
     * Realiza algumas verificações e atualiza o estado com base nos arquivos de horários e sala selecionados.
     *
     * @returns {void} - Esta função não retorna nenhum valor.
     */
    const handleContinuar = () => {
        if (horariosFile && salaFile) {
            setUploading(true);

            const headerRow = salaFile[0]; // Linha do cabeçalho
            const columnDataSala: any[] = salaFile.slice(1).map((row: any) => {
                let salaWithName: string = row[1]; // Nome inicial da sala
                for (let i = 1; i < row.length; i++) {
                    if (row[i] === 'X') {
                        salaWithName += ';' + headerRow[i]; // Adiciona o nome da coluna se houver 'X'
                    }
                }
                return salaWithName;
            });
            if (Array.isArray(columnDataSala)) {
                const soNome = columnDataSala.map((row: any) => row.toString().split(";")[0]);

                const uniqueItems = Array.from(new Set(soNome));
                setUniqueItemsSala(uniqueItems);
                setSelectedItemSala(uniqueItems[0]); // Seleciona o primeiro item
            }

            const columnData = horariosFile.map((row: any) => row[2]);
            const uniqueItems = Array.from(new Set(columnData));
            setUniqueItemsCurso(uniqueItems);
            setSelectedItemCurso(uniqueItems[0]); // Seleciona o primeiro item

            setShowFields(true);
        } else {
            alert("Por favor preencha todos os campos");
        }
    }

    useEffect(() => {
        //verificacoes dos inputs 
        if (ucName.length == 0) {
            alert("Por favor insira o nome da nova UC")
            return;
        }

        if (selectedItemCurso === 'Curso') {
            alert("Por favor selecione um curso")
            return;
        }
        if (selectedCap_Sala === 'capacidade') {
            if (selectedItemCapacidade === 0) {
                alert("Por favor selecione a capacidade da sala")
                return;
            }
        } else if (selectedCap_Sala === 'espaco') {
            if (selectedItemSala === 'Tipo de Sala') {
                alert("Por favor selecione o espaço da sala")
                return;
            }
        }

        if (selectedTotal_Sem === 'total') {
            if (selectedAulasTotais === 0) {
                alert("Por favor selecione o número de aulas totais da UC")
                return;
            }
        } else if (selectedTotal_Sem === 'semana') {
            if (selectedAulasSemanais === 0) {
                alert("Por favor selecione o número de aulas semanais da UC")
                return;
            }
        }
        const nomeUc = titleCase(ucName);
        setUcName(nomeUc);

        //criar opcoes
        const maxSemanas = horariosFile.slice(1).reduce((max, row) => {
            const value = row[0];
            if (value !== 'Erro' && !isNaN(value) && value > max) {
                return value;
            }
            return max;
        }, -Infinity);
        //do total-> calcula-se quantas aulas por semana
        const numSemanasCalculadas = selectedTotal_Sem === 'total' ? Math.ceil(selectedAulasTotais / Math.ceil(maxSemanas / 2)) : null;

        const numAulasPorSemana = selectedTotal_Sem === 'semana' ? selectedAulasSemanais : null;


        const salaUnica = selectedCap_Sala === 'espaco' ? selectedItemSala : null;
        const arraySalas = selectedCap_Sala === 'capacidade' ? (() => {
            const allSalas = salaFile.filter(row => row[2] >= selectedItemCapacidade);
            const allSalasOnlyName = allSalas.map((row: any) => row[1]);
            return Array.from(new Set(allSalasOnlyName));
        })() : null;

        //gerar opcoes
        let possibilidades = horariosFile[0];
        const turma = horariosFile.filter((row: any[]) => row[2] === selectedItemCurso)
        const uniqueTrumas = Array.from(new Set<any[]>(turma))
        const randomTurma = uniqueTrumas[Math.floor(Math.random() * uniqueTrumas.length)];

        const dias = generateDatasFromTo('01/01/2022', '31/12/2024');
        if (numSemanasCalculadas && salaUnica) {
            let restante = Array.from({ length: possibilidades.length }, () => Array(selectedAulasTotais));
            const caracterizacaoSala = horariosFile.filter(row => row[12] === salaUnica)
            const caracterizacaoSalaUniqueArray: any[][] = Array.from(new Set(caracterizacaoSala));
            const caracterizacaoSalaUnique = caracterizacaoSalaUniqueArray[Math.floor(Math.random() * caracterizacaoSalaUniqueArray.length)]
            const turno = generateRandomString()
            for (let i = 0; i < numSemanasCalculadas; i++) {
                const randomDia = dias[Math.floor(Math.random() * dias.length)]
                const data = randomDia.split('/')
                const diaDaSemana = getDayOfTheWeek(parseInt(data[0]), parseInt(data[1]), parseInt(data[2]))
                const horas = generateTimeSlots(ucTime.toString())
                const r = Math.floor(Math.random() * 2)
                restante[i][0] = ''
                restante[i][1] = ''
                restante[i][2] = selectedItemCurso
                restante[i][3] = nomeUc
                restante[i][4] = turno
                restante[i][5] = randomTurma[5]
                restante[i][6] = numEstudantes
                restante[i][7] = diaDaSemana
                restante[i][8] = horas[r][0]
                restante[i][9] = horas[r][1]
                restante[i][10] = randomDia
                restante[i][11] = caracterizacaoSalaUnique[11]
                restante[i][12] = salaUnica
            }
            possibilidades = possibilidades.concat(restante);
            if (ucOption === 'Diurno + PL') {
                let restantePL = Array.from({ length: possibilidades.length }, () => Array(selectedAulasTotais));
                const caracterizacaoSala = horariosFile.filter(row => row[12] === salaUnica)
                const caracterizacaoSalaUniqueArray: any[][] = Array.from(new Set(caracterizacaoSala));
                const caracterizacaoSalaUnique = caracterizacaoSalaUniqueArray[Math.floor(Math.random() * caracterizacaoSalaUniqueArray.length)][11]
                const turnoPL = generateRandomString()
                for (let i = 0; i < numSemanasCalculadas; i++) {
                    const randomDia = dias[Math.floor(Math.random() * dias.length)]
                    const data = randomDia.split('/')
                    const diaDaSemana = getDayOfTheWeek(parseInt(data[0]), parseInt(data[1]), parseInt(data[2]))
                    const horas = generateTimeSlots('noite')
                    const r = Math.floor(Math.random() * 2)
                    restantePL[i][0] = ''
                    restantePL[i][1] = ''
                    restantePL[i][2] = selectedItemCurso
                    restantePL[i][3] = nomeUc
                    restantePL[i][4] = turnoPL
                    restantePL[i][5] = randomTurma[5]
                    restantePL[i][6] = numEstudantes
                    restantePL[i][7] = diaDaSemana
                    restantePL[i][8] = horas[r][0]
                    restantePL[i][9] = horas[r][1]
                    restantePL[i][10] = randomDia
                    restantePL[i][11] = caracterizacaoSalaUnique
                    restantePL[i][12] = salaUnica
                }
                possibilidades = possibilidades.concat(restantePL)
            }
            setNovasAulas(possibilidades)



        } else if (numSemanasCalculadas && arraySalas) {
            let restante = Array.from({ length: possibilidades.length }, () => Array(selectedAulasTotais));
            const salaRandom = arraySalas[Math.floor(Math.random() * arraySalas.length)]
            const caracterizacaoSala = horariosFile.filter(row => row[12] === salaRandom)
            const caracterizacaoSalaUniqueArray: any[][] = Array.from(new Set(caracterizacaoSala));
            const caracterizacaoSalaUnique = caracterizacaoSalaUniqueArray[Math.floor(Math.random() * caracterizacaoSalaUniqueArray.length)][11]
            const turno = generateRandomString()
            for (let i = 0; i < numSemanasCalculadas; i++) {
                const randomDia = dias[Math.floor(Math.random() * dias.length)]
                const data = randomDia.split('/')
                const diaDaSemana = getDayOfTheWeek(parseInt(data[0]), parseInt(data[1]), parseInt(data[2]))
                const horas = generateTimeSlots(ucTime.toString())
                const r = Math.floor(Math.random() * 2)
                restante[i][0] = ''
                restante[i][1] = ''
                restante[i][2] = selectedItemCurso
                restante[i][3] = nomeUc
                restante[i][4] = turno
                restante[i][5] = randomTurma[5]
                restante[i][6] = numEstudantes
                restante[i][7] = diaDaSemana
                restante[i][8] = horas[r][0]
                restante[i][9] = horas[r][1]
                restante[i][10] = randomDia
                restante[i][11] = caracterizacaoSalaUnique
                restante[i][12] = salaRandom
            }
            possibilidades = possibilidades.concat(restante)
            if (ucOption === 'Diurno + PL') {
                let restantePL = Array.from({ length: possibilidades.length }, () => Array(selectedAulasTotais));
                const caracterizacaoSala = horariosFile.filter(row => row[12] === salaUnica)
                const caracterizacaoSalaUniqueArray: any[][] = Array.from(new Set(caracterizacaoSala));
                const caracterizacaoSalaUnique = caracterizacaoSalaUniqueArray[Math.floor(Math.random() * caracterizacaoSalaUniqueArray.length)][11]
                const turnoPL = generateRandomString()
                for (let i = 0; i < numSemanasCalculadas; i++) {
                    const randomDia = dias[Math.floor(Math.random() * dias.length)]
                    const data = randomDia.split('/')
                    const diaDaSemana = getDayOfTheWeek(parseInt(data[0]), parseInt(data[1]), parseInt(data[2]))
                    const horas = generateTimeSlots(ucTime.toString())
                    const r = Math.floor(Math.random() * 2)
                    restantePL[i][0] = ''
                    restantePL[i][1] = ''
                    restantePL[i][2] = selectedItemCurso
                    restantePL[i][3] = nomeUc
                    restantePL[i][4] = turnoPL
                    restantePL[i][5] = randomTurma[5]
                    restantePL[i][6] = numEstudantes
                    restantePL[i][7] = diaDaSemana
                    restantePL[i][8] = horas[r][0]
                    restantePL[i][9] = horas[r][1]
                    restantePL[i][10] = randomDia
                    restantePL[i][11] = caracterizacaoSalaUnique
                    restantePL[i][12] = salaRandom
                }
                possibilidades = possibilidades.concat(restantePL)
            }
            setNovasAulas(possibilidades)



        } else if (numAulasPorSemana && salaUnica) {
            let restante = Array.from({ length: possibilidades.length }, () => Array(selectedAulasSemanais));
            const caracterizacaoSala = horariosFile.filter(row => row[12] === salaUnica)
            const caracterizacaoSalaUniqueArray: any[][] = Array.from(new Set(caracterizacaoSala));
            const caracterizacaoSalaUnique = caracterizacaoSalaUniqueArray[Math.floor(Math.random() * caracterizacaoSalaUniqueArray.length)][11]
            const turno = generateRandomString()
            for (let i = 0; i < numAulasPorSemana; i++) {
                const randomDia = dias[Math.floor(Math.random() * dias.length)]
                const data = randomDia.split('/')
                const diaDaSemana = getDayOfTheWeek(parseInt(data[0]), parseInt(data[1]), parseInt(data[2]))
                const horas = generateTimeSlots(ucTime.toString())
                const r = Math.floor(Math.random() * 2)
                restante[i][0] = ''
                restante[i][1] = ''
                restante[i][2] = selectedItemCurso
                restante[i][3] = nomeUc
                restante[i][4] = turno
                restante[i][5] = randomTurma[5]
                restante[i][6] = numEstudantes
                restante[i][7] = diaDaSemana
                restante[i][8] = horas[r][0]
                restante[i][9] = horas[r][1]
                restante[i][10] = randomDia
                restante[i][11] = caracterizacaoSalaUnique
                restante[i][12] = salaUnica
            }
            possibilidades = possibilidades.concat(restante)
            if (ucOption === 'Diurno + PL') {
                let restantePL = Array.from({ length: possibilidades.length }, () => Array(selectedAulasSemanais));
                const caracterizacaoSala = horariosFile.filter(row => row[12] === salaUnica)
                const caracterizacaoSalaUniqueArray: any[][] = Array.from(new Set(caracterizacaoSala));
                const caracterizacaoSalaUnique = caracterizacaoSalaUniqueArray[Math.floor(Math.random() * caracterizacaoSalaUniqueArray.length)][11]
                const turnoPL = generateRandomString()
                for (let i = 0; i < numAulasPorSemana; i++) {
                    const randomDia = dias[Math.floor(Math.random() * dias.length)]
                    const data = randomDia.split('/')
                    const diaDaSemana = getDayOfTheWeek(parseInt(data[0]), parseInt(data[1]), parseInt(data[2]))
                    const horas = generateTimeSlots('noite')
                    const r = Math.floor(Math.random() * 2)
                    restantePL[i][0] = ''
                    restantePL[i][1] = ''
                    restantePL[i][2] = selectedItemCurso
                    restantePL[i][3] = nomeUc
                    restantePL[i][4] = turnoPL
                    restantePL[i][5] = randomTurma[5]
                    restantePL[i][6] = numEstudantes
                    restantePL[i][7] = diaDaSemana
                    restantePL[i][8] = horas[r][0]
                    restantePL[i][9] = horas[r][1]
                    restantePL[i][10] = randomDia
                    restantePL[i][11] = caracterizacaoSalaUnique
                    restantePL[i][12] = salaUnica
                }
                possibilidades = possibilidades.concat(restantePL)
            }
            setNovasAulas(possibilidades)
        } else if (numAulasPorSemana && arraySalas) {
            let restante = Array.from({ length: possibilidades.length }, () => Array(selectedAulasSemanais));
            const salaRandom = arraySalas[Math.floor(Math.random() * arraySalas.length)]
            const caracterizacaoSala = horariosFile.filter(row => row[12] === salaRandom)
            const caracterizacaoSalaUniqueArray: any[][] = Array.from(new Set(caracterizacaoSala));
            const caracterizacaoSalaUnique = caracterizacaoSalaUniqueArray[Math.floor(Math.random() * caracterizacaoSalaUniqueArray.length)][11]
            const turno = generateRandomString()
            for (let i = 0; i < numAulasPorSemana; i++) {
                const randomDia = dias[Math.floor(Math.random() * dias.length)]
                const data = randomDia.split('/')
                const diaDaSemana = getDayOfTheWeek(parseInt(data[0]), parseInt(data[1]), parseInt(data[2]))
                const horas = generateTimeSlots(ucTime.toString())
                const r = Math.floor(Math.random() * 2)
                restante[i][0] = ''
                restante[i][1] = ''
                restante[i][2] = selectedItemCurso
                restante[i][3] = nomeUc
                restante[i][4] = turno
                restante[i][5] = randomTurma[5]
                restante[i][6] = numEstudantes
                restante[i][7] = diaDaSemana
                restante[i][8] = horas[r][0]
                restante[i][9] = horas[r][1]
                restante[i][10] = randomDia
                restante[i][11] = caracterizacaoSalaUnique
                restante[i][12] = salaRandom
            }
            possibilidades = possibilidades.concat(restante)
            if (ucOption === 'Diurno + PL') {
                let restantePL = Array.from({ length: possibilidades.length }, () => Array(selectedAulasSemanais));
                const caracterizacaoSala = horariosFile.filter(row => row[12] === salaUnica)
                const caracterizacaoSalaUniqueArray: any[][] = Array.from(new Set(caracterizacaoSala));
                const caracterizacaoSalaUnique = caracterizacaoSalaUniqueArray[Math.floor(Math.random() * caracterizacaoSalaUniqueArray.length)][11]
                const turnoPL = generateRandomString()
                for (let i = 0; i < numAulasPorSemana; i++) {
                    const randomDia = dias[Math.floor(Math.random() * dias.length)]
                    const data = randomDia.split('/')
                    const diaDaSemana = getDayOfTheWeek(parseInt(data[0]), parseInt(data[1]), parseInt(data[2]))
                    const horas = generateTimeSlots(ucTime.toString())
                    const r = Math.floor(Math.random() * 2)
                    restantePL[i][0] = ''
                    restantePL[i][1] = ''
                    restantePL[i][2] = selectedItemCurso
                    restantePL[i][3] = nomeUc
                    restantePL[i][4] = turnoPL
                    restantePL[i][5] = randomTurma[5]
                    restantePL[i][6] = numEstudantes
                    restantePL[i][7] = diaDaSemana
                    restantePL[i][8] = horas[r][0]
                    restantePL[i][9] = horas[r][1]
                    restantePL[i][10] = randomDia
                    restantePL[i][11] = caracterizacaoSalaUnique
                    restantePL[i][12] = salaRandom
                }
                possibilidades = possibilidades.concat(restantePL)
            }
            setNovasAulas(possibilidades)
        }
    }, [verPossibilidades]);

    ////////////////////////////////PAGINA HTML/////////////////////////////////

    if (!uploading) {
        return (
            <div className="flex flex-col items-center justify-center">
                <div className="absolute top-8 left-[4vw] font-mybold text-black">
                    <button
                        onClick={() => navigate(-1)}
                        className="absolute top-8 left-[4vw] font-mybold text-black"
                    >  ⬅VOLTAR
                    </button>
                </div>

                <div className="mt-[300px] flex justify-center items-center flex-col">
                    <div className="flex gap-4">
                        <div className="flex flex-col gap-4 border-2 border-black p-8 rounded-[30px]">
                            <p className="text-center text-lg font-bold">
                                <span className="text-black">+</span> Upload de Horários
                            </p>
                            {!horariosFile ? (
                                <input type="file" id="horarios" accept=".csv,.xlsx" onChange={handleHorariosFileChange} className="text-lg" />
                            ) : (
                                <div className="flex items-center">
                                    <div>{horariosFileName}</div>
                                    <button onClick={() => setHorariosFile(null)} className="ml-5 px-2 py-1 bg-[var(--blue)] text-white rounded-md hover:bg-white hover:text-[var(--blue)] transition-all duration-300">↺</button>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col gap-4 border-2 border-black p-8 rounded-[30px]">
                            <p className="text-center text-lg font-bold">
                                <span className="text-black">+</span> Upload de Sala
                            </p>
                            {!salaFile ? (
                                <input type="file" id="sala" accept=".csv,.xlsx" onChange={handleSalaFileChange} className="text-lg" />
                            ) : (
                                <div className="flex items-center">
                                    <div>{salasFileName}</div>
                                    <button onClick={() => setSalaFile(null)} className="ml-5 px-2 py-1 bg-[var(--blue)] text-white rounded-md hover:bg-white hover:text-[var(--blue)] transition-all duration-300">↺</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>


                <button className="mt-20 px-10 py-3 bg-[var(--blue)] text-white rounded-[13px] hover:bg-[var(--white)] hover:text-[var(--blue)] hover:border-[var(--blue)] border border-transparent transition-all duration-300" onClick={handleContinuar}>Continuar</button>
            </div>
        );
    }


    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <div className="absolute top-8 left-4 font-mybold text-black">
                <button
                    onClick={() => navigate(-1)}
                    className="absolute top-8 left-[4vw] font-mybold text-black"
                >  ⬅VOLTAR
                </button>
            </div>

            <div className="flex flex-col items-center justify-center h-screen ">
                <h1 className="text-[1.5rem] quatro:text-[2rem] font-bold text-[var(--blue)]">
                    Marcar Nova UC
                </h1>
                <div className="w-[800px] border-2 border-black p-8 rounded-3xl">
                    {/* Adicione os campos aqui */}
                    {showFields && (
                        <div>
                            <label htmlFor="ucName">Nome da nova UC:</label>
                            <input type="text" id="ucName" value={ucName} onChange={(e) => setUcName(e.target.value)} />

                            <label htmlFor="ucOption">Opção:</label>
                            <select id="ucOption" value={ucOption} onChange={(e) => setUcOption(e.target.value)}>
                                <option value="Diurno">Diurno</option>
                                <option value="Diurno + PL">Diurno + PL</option>
                            </select>
                            <label htmlFor="ucTime">Horário Diurno:</label>
                            <select id="ucTime" value={ucTime} onChange={(e) => setUcTime(e.target.value)}>
                                <option value="manha">Manhãs</option>
                                <option value="tarde">Tardes</option>
                            </select>
                            <div className="mb-4 flex justify-between">
                                <label htmlFor="selectedItemCurso" >Selecione um curso:</label>
                                <select className="w-[320px] select-text" id="selectedItemCurso" value={selectedItemCurso || ''} onChange={(e) => { setSelectedItemCurso(e.target.value); }} >
                                    {uniqueItemsCurso.map((item: string, index: number) => (
                                        <option key={index} value={item}>{item}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="mb-4 flex justify-between">
                                <label htmlFor="optionCap_Sala">Número de estudantes:</label>
                                <input
                                    className='w-[320px] select-text border border-black rounded-md pl-2 text-right' type='number' id='numEstudantes' value={numEstudantes || 0} min='0'
                                    onChange={(e) => {
                                        setNumEstudantes(parseInt(e.target.value));
                                    }}
                                />
                            </div>
                            <div className="mb-4 flex justify-between">
                                <label htmlFor="optionCap_Sala">Escolha um espaço/capacidade:</label>
                                <select className="w-[320px] select-text" id="optionCap_Sala" value={selectedCap_Sala || ''} onChange={(e) => setSelectedCap_Sala(e.target.value)}>
                                    <option value="espaco">Espaço</option>
                                    <option value="capacidade">Capacidade</option>
                                </select>
                            </div>
                            <div className='mb-4 flex justify-between'>
                                {selectedCap_Sala === 'capacidade' ? (
                                    <>
                                        <label htmlFor='selectedItemCapacidade'>Capacidade:</label>
                                        <input
                                            className='w-[320px] select-text border border-black rounded-md pl-2 text-right' type='number' id='selectedItemCapacidade' value={selectedItemCapacidade || 0} min='0'
                                            onChange={(e) => {
                                                setSelectedItemCapacidade(parseInt(e.target.value));
                                                setSelectedItemSala('Tipo de Sala');
                                            }}
                                        />
                                    </>
                                ) : (
                                    <>
                                        <label htmlFor='selectedItemSala'>Espaco:</label>
                                        <select className='w-[320px] select-text' id='selectedItemSala' value={selectedItemSala || ''}
                                            onChange={(e) => {
                                                setSelectedItemSala(e.target.value);
                                                setSelectedItemCapacidade(0);
                                            }}
                                        >
                                            <option value='Tipo de Sala'>Tipo de Sala</option>
                                            {uniqueItemsSala.map((item: string, index: number) => (
                                                <option key={index} value={item}>
                                                    {item}
                                                </option>
                                            ))}
                                        </select>
                                    </>
                                )}
                            </div>

                            <div className="mb-4 flex justify-between">
                                <label htmlFor="optionCap_Sala">Escolha um critério para o nº de aulas:</label>
                                <select className="w-[320px] select-text" id="optionCap_Sala" value={selectedTotal_Sem || ''} onChange={(e) => setSelectedTotal_Sem(e.target.value)}>
                                    <option value="total">Nº de Aulas Totais</option>
                                    <option value="semana">Aulas por Semana</option>
                                </select>
                            </div>
                            <div className='mb-4 flex justify-between'>
                                {selectedTotal_Sem === 'total' ? (
                                    <>
                                        <label htmlFor='selectedItemTotalAulas'>Nº de Aulas Totais:</label>
                                        <input
                                            className='w-[320px] select-text border border-black rounded-md pl-2 text-right' type='number' id='selectedAulasTotais' value={selectedAulasTotais || 0} min='0'
                                            onChange={(e) => {
                                                setSelectedAulasTotais(parseInt(e.target.value));
                                                setSelectedAulasSemanais(0);
                                            }}
                                        />
                                    </>
                                ) : (
                                    <>
                                        <label htmlFor='selectedItemCapacidade'>Numero de Aulas por Semana:</label>
                                        <input
                                            className='w-[320px] select-text border border-black rounded-md pl-2 text-right' type='number' id='selectedAulasSemanais' value={selectedAulasSemanais || 0} min='0'
                                            onChange={(e) => {
                                                setSelectedAulasSemanais(parseInt(e.target.value));
                                                setSelectedAulasTotais(0);
                                            }}
                                        />
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </div>

            </div>
            <div className="col-span-3 flex justify-center">
                <button onClick={() => setVerPossibilidades(!verPossibilidades)} className="mt-16 px-8 py-3 bg-[var(--blue)] text-white rounded-[13px] hover:bg-[var(--white)] hover:text-[var(--blue)] hover:border-[var(--blue)] border border-transparent transition-all duration-300">
                    Criar UC
                </button>
            </div>
            {novasAulas && novasAulas.length > 0 && (
                <table>
                    <thead>
                        <tr>
                            {novasAulas[0].map((header, index) => (
                                <th key={index}>{header}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {novasAulas.slice(1).map((row, rowIndex) => (
                            <tr key={rowIndex}>
                                {row.map((cell, cellIndex) => (
                                    <td key={cellIndex}>{cell}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    )


};
