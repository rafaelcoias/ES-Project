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

    const [semana, setSemana] = useState<any>(null);

    const heatmapRef = useRef<SVGSVGElement | null>(null);


    const generateHeatmap = () => {
        if (!heatmapRef.current || !data) {
            alert('Por favor, faça upload dos dois arquivos antes de gerar o heatmap.');
            return;
        }

        const dados = horariosFile.filter((row: any) => {
            // Acesso ao valor da primeira coluna de "row"
            const primeiraColuna = row[0];
            // Verifica se o valor da primeira coluna é igual a "semana"
            return primeiraColuna === semana;
        });
        
        setData(dados); // Aqui você define a variável "data"

        // Agora, calcule as contagens de ocorrências de horas
        const combinedHoursData = dados.map((row: any) => [row[8], row[9]]).flat();
        const uniqueHoursSet = new Set(combinedHoursData);
        const uniqueHoursArray = Array.from(uniqueHoursSet);

        const columnData: any[] = dados.map((row: any) => row[7]).flat();
        const uniqueItemsDiaSemana = Array.from(new Set(columnData)).slice(1);

        // Inicializa a matriz de contagem
        const counts: number[][] = Array.from({ length: uniqueHoursArray.length }, () => Array(uniqueItemsDiaSemana.length).fill(''));
        console.log(counts);
        // Percorre os dados e conta as ocorrências de horas em cada dia da semana
        dados.forEach((row: any) => {
            const diaSemana = row[7].toString();
            const horaInicio = row[8].toString();
            const horaFim = row[9].toString();

            counts[diaSemana][horaInicio]++;
            counts[diaSemana][horaFim]++;
        });

        //  console.log(counts);

        // A matriz "counts" agora contém o número de vezes que cada hora aparece em cada dia da semana

        const cellSize = 50; // Tamanho de cada célula no heatmap
        const svg = d3.select(heatmapRef.current);

        const width = (uniqueItemsDiaSemana.length + 1) * cellSize; // Ajusta a largura com base no tamanho de uniqueItemsDiaSemana
        const height = (uniqueHoursArray.length + 1) * cellSize; // Ajusta a altura com base no tamanho de uniqueHoursArray
        const colorScale = d3.scaleSequential(d3.interpolateRdYlBu).domain([0, 100]); // Define a escala de cores

        // Desenha o heatmap
        svg.attr('width', width).attr('height', height);

        svg
            .selectAll('rect')
            .data(counts.flat())
            .enter()
            .append('rect')
            .attr('x', (_, i) => (Math.floor(i / uniqueItemsDiaSemana.length) + 1) * cellSize) // Ajusta o posicionamento horizontal
            .attr('y', (_, i) => (i % uniqueHoursArray.length) * cellSize) // Ajusta o posicionamento vertical
            .attr('width', cellSize)
            .attr('height', cellSize)
            .attr('fill', d => colorScale(d));

        svg
            .selectAll('.dayLabel')
            .data(uniqueItemsDiaSemana)
            .enter()
            .append('text')
            .text(d => d)
            .attr('x', 0)
            .attr('y', (_, i) => (i + 1) * cellSize + cellSize / 2)
            .attr('dy', '0.35em')
            .style('text-anchor', 'end')
            .attr('class', 'dayLabel');

        svg
            .selectAll('.hourLabel')
            .data(uniqueHoursArray)
            .enter()
            .append('text')
            .text(d => `${d}:00`)
            .attr('x', (_, i) => i * cellSize + cellSize / 2)
            .attr('y', -5)
            .style('text-anchor', 'middle')
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


                <button className="mt-20 px-10 py-3 bg-[var(--blue)] text-white rounded-[13px] hover:bg-[var(--white)] hover:text-[var(--blue)] hover:border-[var(--blue)] border border-transparent transition-all duration-300" onClick={() => { generateHeatmap(); setSemana(1); }}>Gerar HeatMap</button>
            </div>
            {loading ? (
                <div>A carregar...</div>
            ) : (
                <svg ref={heatmapRef} />
            )}
        </div>
    );
}
