import React, { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import * as d3 from 'd3';
import { useNavigate } from "react-router-dom";
export default function HeatMapGenerator() {
    const navigate = useNavigate();
    const [horariosFile, setHorariosFile] = useState<any>(null);
    const [salasFile, setSalasFile] = useState<any>(null);
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    //guardar nome do ficheiro horario
    const [horariosFileName, setHorariosFileName] = useState<string>("");
    //guardar nome do ficheiro sala
    const [salasFileName, setSalasFileName] = useState<string>("");

    const [semana, setSemana] = useState<any>(1);

    const heatmapRef = useRef<SVGSVGElement | null>(null);


    const generateHeatmap = () => {
        if (!heatmapRef.current || !salasFile || !horariosFile) {
            alert('Por favor, faça upload dos dois arquivos antes de gerar o heatmap.');
            return;
        }

        const numSemana = parseInt(semana);
        const dados = horariosFile.filter((row: any) => {
            const primeiraColuna = parseInt(row[0]);
            return primeiraColuna === numSemana;
        });


        setData(dados); // Aqui você define a variável "data"

        // Agora, calcule as contagens de ocorrências de horas
        const combinedHoursData = dados.map((row: any) => [row[8], row[9]]).flat();
        const uniqueHoursSet = new Set(combinedHoursData);
        let uniqueHoursArray = Array.from(uniqueHoursSet);
        uniqueHoursArray.sort();
        const columnData: any[] = dados.map((row: any) => row[7]).flat();
        const uniqueItemsDiaSemana = Array.from(new Set(columnData));
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
            .attr('x', (_, i) => (i + 1) * cellSize + cellSize/2) // Ajusta o posicionamento horizontal
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
            .attr('y', (_, i) => (i + 1) * cellSize + cellSize/2 ) // Ajusta o posicionamento vertical
            .attr('dy', '0.35em') // Desloca o texto verticalmente para alinhá-lo corretamente dentro da célula.
            .style('text-anchor', 'end') // Alinha o texto à direita.
            .attr('class', 'hourLabel');
        

    };



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
            convertExcelToJson(file, setSalasFile);
        } else {
            alert("Por favor escolha um ficheiro com formato excel.");
        }
    };

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
        <div className="flex flex-col items-center justify-center">
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
                            {!salasFile ? (
                                <input type="file" id="sala" accept=".csv,.xlsx" onChange={handleSalaFileChange} className="text-lg" />
                            ) : (
                                <div className="flex items-center">
                                    <div>{salasFileName}</div>
                                    <button onClick={() => setSalasFile(null)} className="ml-5 px-2 py-1 bg-[var(--blue)] text-white rounded-md hover:bg-white hover:text-[var(--blue)] transition-all duration-300">↺</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex flex-col gap-4 border-2 border-black p-8 rounded-[30px]">
                    <p className="text-center text-lg font-bold">Definir Semana
                    </p>
                    <input type="number" min="1" value={semana} onChange={(e) => setSemana(e.target.value)} className="text-lg" />
                </div>

                <button className="mt-20 px-10 py-3 bg-[var(--blue)] text-white rounded-[13px] hover:bg-[var(--white)] hover:text-[var(--blue)] hover:border-[var(--blue)] border border-transparent transition-all duration-300" onClick={() => { generateHeatmap() }}>Gerar HeatMap</button>
            </div>
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
    );
}
