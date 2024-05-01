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
    const [uniqueItemsDiaSemana, setUniqueItemsDiaSemana] = useState<any>([]);


    const heatmapRef = useRef<SVGSVGElement | null>(null);

    useEffect(() => {
        if (!horariosFile || !salasFile) return;

        setLoading(true);

        const filteredData = horariosFile.slice(1).map((row: any) => ({
            horaInicio: row[6],
            diaSemana: row[5],
        }));

        const occupancyData = Array.from({ length: 32 }, (_, i) => Array(6).fill(0));

        filteredData.forEach((row: any) => {
            const horaInicio = row.horaInicio.split(':').map(Number);
            const horaInicioIndex = Math.floor((horaInicio[0] - 8) * 2 + horaInicio[1] / 30);
            const diaSemanaIndex = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].indexOf(row.diaSemana);
            occupancyData[horaInicioIndex][diaSemanaIndex]++;
        });

        setData(occupancyData);
        setLoading(false);
    }, [horariosFile, salasFile]);

    const generateHeatmap = () => {
        if (!heatmapRef.current || !data) {
            alert('Por favor, faça upload dos dois arquivos antes de gerar o heatmap.');
            return;
        }

        const combinedHoursData = horariosFile.map((row: any) => [row[6], row[7]]).flat();
        const uniqueHoursSet = new Set(combinedHoursData);
        const uniqueHoursArray = Array.from(uniqueHoursSet);

        const columnData: any[] = horariosFile.map((row: any) => row[5]);
        const uniqueItemsDiaSemana = Array.from(new Set(columnData)).slice(1);


        const cellSize = 50; // Tamanho de cada célula no heatmap
        const svg = d3.select(heatmapRef.current);

        const width = (uniqueItemsDiaSemana.length + 1) * cellSize; // Ajusta a largura com base no tamanho de uniqueItemsDiaSemana
        const height = (uniqueHoursArray.length + 1) * cellSize; // Ajusta a altura com base no tamanho de uniqueHoursArray
        const colorScale = d3.scaleSequential(d3.interpolateRdYlBu).domain([0, 100]); // Define a escala de cores

        // Desenha o heatmap
        svg.attr('width', width).attr('height', height);

        svg
            .selectAll('rect')
            .data(data.flat())
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


                <button className="mt-20 px-10 py-3 bg-[var(--blue)] text-white rounded-[13px] hover:bg-[var(--white)] hover:text-[var(--blue)] hover:border-[var(--blue)] border border-transparent transition-all duration-300" onClick={generateHeatmap}>Gerar HeatMap</button>
            </div>
            {loading ? (
                <div>A carregar...</div>
            ) : (
                <svg ref={heatmapRef} />
            )}
        </div>
    );
}
