import React, { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import * as d3 from 'd3';
import { useNavigate } from "react-router-dom";
export default function HeatMapGenerator() {
    const navigate = useNavigate();
    const [horariosFile, setHorariosFile] = useState<any>(null);
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    //guardar nome do ficheiro horario
    const [horariosFileName, setHorariosFileName] = useState<string>("");
    const [semana, setSemana] = useState<any>(1);

    const heatmapRef = useRef<SVGSVGElement | null>(null);

    const [uniqueItemsSala, setUniqueItemsSala] = useState<any>([]);
    const [selectedItemSala, setSelectedItemSala] = useState<any>(null);

    const [upload, setUpload] = useState<any>(false)

    const generateHeatmap = () => {
        //verificar se os ficheiro existem 
        if (!heatmapRef.current || !horariosFile) {
            alert('Por favor, faça upload do arquivo antes de gerar o heatmap.');
            return;
        }

        //Extrair a semana 
        const numSemana = parseInt(semana);

        //Dependendo do tipo de sala o filtro é por todoas as salas de for "Tip de Sala" ou pela especifica escolhida
        const dados = selectedItemSala === 'Tipo de Sala' ? horariosFile.filter((row: any) => {
            const colunaSemana = parseInt(row[0]);
            return colunaSemana === numSemana;
        }) : horariosFile.filter((row: any) => {
            const colunaSemana = parseInt(row[0]);
            const colunaSala = row[12];
            return colunaSemana === numSemana && colunaSala === selectedItemSala;
        });


        setData(dados); // Aqui você define a variável "data"

        // Guardar toadas as horas a mostar e ordenar
        const combinedHoursData = dados.map((row: any) => [row[8], row[9]]).flat();
        const uniqueHoursSet = new Set(combinedHoursData);
        let uniqueHoursArray = Array.from(uniqueHoursSet);
        uniqueHoursArray.sort();


        //guardar todos os dias de semana e ordenar
        const columnData: any[] = dados.map((row: any) => row[7]).flat();
        let uniqueItemsDiaSemana = Array.from(new Set(columnData));

        let order = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'SÃ¡b'];

        uniqueItemsDiaSemana.sort((a, b) => order.indexOf(a) - order.indexOf(b));

        // Inicializa a matriz de contagem
        const rows1 = uniqueHoursArray.length;
        const columns1 = uniqueItemsDiaSemana.length;
        let counts = Array.from(Array(rows1), () => new Array(columns1).fill(0));

        // Percorre os dados e conta as ocorrências de horas em cada dia da semana
        dados.forEach((row: any) => {
            const diaSemana = uniqueItemsDiaSemana.indexOf(row[7].toString());
            const horaInicio = uniqueHoursArray.indexOf(row[8].toString());
            const horaFim = uniqueHoursArray.indexOf(row[9].toString());
            counts[horaInicio][diaSemana]++;
            counts[horaFim][diaSemana]++;
        });

        // A matriz "counts" agora contém o número de vezes que cada hora aparece em cada dia da semana

        const cellSize = 50; // Tamanho de cada célula no heatmap
        const svg = d3.select(heatmapRef.current);

        const width = (uniqueItemsDiaSemana.length + 1) * cellSize; // Ajusta a largura com base no tamanho de uniqueItemsDiaSemana
        const height = (uniqueHoursArray.length + 1) * cellSize; // Ajusta a altura com base no tamanho de uniqueHoursArray
        const colorScale = d3.scaleSequential(d3.interpolateRdYlBu).domain([50, 0]); // Define a escala de cores

        d3.select(heatmapRef.current).selectAll("*").remove();
        //Desenha o heatmap
        svg.attr('width', width).attr('height', height);

        svg
            .selectAll('rect')
            .data(counts.flat())
            .enter()
            .append('rect')
            .attr('x', (_, i) => ((i % uniqueItemsDiaSemana.length) + 1) * cellSize) // Ajusta o posicionamento horizontal
            .attr('y', (_, i) => (Math.floor(i / uniqueItemsDiaSemana.length) + 1) * cellSize) // Ajusta o posicionamento vertical
            .attr('width', cellSize)
            .attr('height', cellSize)
            .attr('fill', d => colorScale(d));


        svg
            .selectAll('.dayLabel')
            .data(uniqueItemsDiaSemana)
            .enter()
            .append('text')
            .text(d => d)
            .attr('x', (_, i) => (i + 1) * cellSize + cellSize / 2) // Ajusta o posicionamento horizontal
            .attr('y', 10) // Ajusta o posicionamento vertical
            .attr('dy', '0.35em') // Desloca o texto verticalmente para alinhá-lo corretamente dentro da célula.
            .style('text-anchor', 'middle') // Centraliza o texto.
            .attr('class', 'dayLabel');

        svg
            .selectAll('.hourLabel')
            .data(uniqueHoursArray)
            .enter()
            .append('text')
            .text(d => {
                const parts = d.split(':');
                return `${parts[0]}:${parts[1]}`; // Retorna apenas as horas e minutos
            })
            .attr('x', 50) // Ajusta o posicionamento horizontal
            .attr('y', (_, i) => (i + 1) * cellSize + cellSize / 2) // Ajusta o posicionamento vertical
            .attr('dy', '0.35em') // Desloca o texto verticalmente para alinhá-lo corretamente dentro da célula.
            .style('text-anchor', 'end') // Alinha o texto à direita.
            .attr('class', 'hourLabel');

    };

    useEffect(() => {
        if (horariosFile) {
            setUpload(true);
            const colunas = horariosFile.map((row: any) => row[12]).slice(1);

            if (Array.isArray(colunas)) {
                const uniqueItems = Array.from(new Set(colunas));
                setUniqueItemsSala(uniqueItems);
                setSelectedItemSala("Tipo de Sala"); // Seleciona o primeiro item
            }
        }
    }, [horariosFile]);

    /**
    * Manipula a mudança de arquivo de horários.
    * 
    * @param {React.ChangeEvent<HTMLInputElement>} event - O evento de mudança de input.
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
    * Converte um arquivo Excel para JSON e atualiza o estado de dados utilizando a função de retorno de chamada.
    *
    * @param {any} file - O arquivo Excel a ser convertido.
    * @param {React.Dispatch<React.SetStateAction<any>>} setDataCallback - A função de retorno de chamada para atualizar o estado de dados.
    */
    const convertExcelToJson = (file: any, setDataCallback: React.Dispatch<React.SetStateAction<any>>) => {
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

    return (
        <div className="w-full min-h-screen py-[5rem] px-[8vw] flex flex-col gap-8 text-[var(--blue)]">

            <div className="flex flex-col items-center justify-center">
                <h1 className="text-[1.5rem] quatro:text-[2rem] font-bold">
                    HeatMap
                </h1>
                <div className="absolute top-8 left-[4vw] font-mybold text-black">
                    <button
                        onClick={() => navigate(-1)}
                        className="absolute top-8 left-[4vw] font-mybold text-black"
                    >  ⬅VOLTAR
                    </button>
                </div>
                <div className="mt-[45px] flex justify-center items-center flex-col ">
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
                    </div>
                </div>
                {upload && (
                    <>
                        <div className="flex flex-col gap-4 border-2 border-black p-8 rounded-[30px] mt-10 w-[350px]">
                            <div className='flex justify-between'>
                                <label htmlFor='selectedItemSala'>Semana:</label>
                                <input type="number" min="1" value={semana} onChange={(e) => setSemana(e.target.value)} className="text-lg w-[150px] text-black text-right" />
                            </div>
                            <div className='flex justify-between'>
                                <label htmlFor='selectedItemSala'>Espaco:</label>
                                <select className="w-[150px] select-text" id="selectedItemSala" value={selectedItemSala || ''} onChange={(e) => { setSelectedItemSala(e.target.value) }}>
                                    <option value="Tipo de Sala">Tipo de Sala</option>
                                    {uniqueItemsSala.map((item: string, index: number) => (
                                        <option key={index} value={item}>{item}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <button className="mt-10 px-10 py-3 bg-[var(--blue)] text-white rounded-[13px] hover:bg-[var(--white)] hover:text-[var(--blue)] hover:border-[var(--blue)] border border-transparent transition-all duration-300" onClick={() => { generateHeatmap() }}>Gerar HeatMap</button>
                    </>
                )}
                {loading ? (
                    <div>A carregar...</div>
                ) : (
                    <div>
                        <br />
                        <svg ref={heatmapRef} />
                        <br />
                        <br />
                    </div>
                )}
            </div>
        </div>
    );

}
