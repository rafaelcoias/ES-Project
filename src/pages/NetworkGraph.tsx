import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import * as XLSX from 'xlsx';
import { useNavigate } from "react-router-dom";
import { isTimeRangeInside } from "../js/auxilioNetworkGraph.js";

export default function NetworkGraph() {
    const networkGraphRef = useRef(null);
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
    const drag = (simulation) => {
        function dragstarted(event) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            event.subject.fx = event.subject.x;
            event.subject.fy = event.subject.y;
        }

        function dragged(event) {
            event.subject.fx = event.x;
            event.subject.fy = event.y;
        }

        function dragended(event) {
            if (!event.active) simulation.alphaTarget(0);
            event.subject.fx = null;
            event.subject.fy = null;
        }

        return d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended);
    }




    const generateNetworGraph = () => {
        //verificar se os ficheiro existem 
        if (!networkGraphRef.current || !horariosFile) {
            alert('Por favor, faça upload do arquivo antes de gerar o NetworkGraph.');
            return;
        }

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



        setData(dados);

        const turnos = dados.map((row: any) => row[4]).flat();
        const uniqueTurnosSet = new Set(turnos);
        const uniqueTurnosArray = Array.from(uniqueTurnosSet);

        const checkTurnos = uniqueTurnosArray.map((turno: any) => {
            const rowsSemTurno = dados.filter(row => {
                const colunaSemana = parseInt(row[0]);
                return colunaSemana === numSemana && row[4] !== turno;
            });
            const rowsDoTurno = dados.filter(row => {
                const colunaSemana = parseInt(row[0]);
                return colunaSemana === numSemana && row[4] === turno;
            });

            const matchingRows = rowsSemTurno.filter(rowSemTurno =>
                rowsDoTurno.some(rowDoTurno =>
                    rowSemTurno[10] === rowDoTurno[10] && rowSemTurno[12] === rowDoTurno[12] &&
                    isTimeRangeInside(rowSemTurno[8], rowSemTurno[9], rowDoTurno[8], rowDoTurno[9])
                )
            );
            return { turno, matchingRows };
        });

        const allNodeIds = new Set([
            ...checkTurnos.map(obj => obj.turno),
            ...checkTurnos.flatMap(obj => obj.matchingRows.map(row => row[12]))
        ]);

        const network = {
            nodes: Array.from(allNodeIds).map(id => ({ id })),
            links: checkTurnos.flatMap(obj => obj.matchingRows.map(row => ({ source: obj.turno, target: row[4] }))),
        };

        d3.select(networkGraphRef.current).selectAll("*").remove();

        const width = 1600;
        const height = 1200;
        const svg = d3.select(networkGraphRef.current)
            .attr('width', width)
            .attr('height', height);


        // Crie um novo Set com os IDs de todos os nós que aparecem em um link
        const linkedNodeIds = new Set([
            ...network.links.map(link => link.source),
            ...network.links.map(link => link.target)
        ]);

        // Filtra os nós para incluir apenas aqueles cujo ID aparece em linkedNodeIds
        const linkedNodes = network.nodes.filter(node => linkedNodeIds.has(node.id));

        // Use linkedNodes em vez de network.nodes ao criar a simulação
        const simulation = d3.forceSimulation(linkedNodes)
            .force('link', d3.forceLink(network.links).id(d => d.id).distance(10)) // aumenta a distância entre nós conectados
            .force('charge', d3.forceManyBody().strength(-5))
            .force('center', d3.forceCenter(width / 2, height / 2));

        // Use linkedNodes em vez de network.nodes ao criar os elementos SVG
        const node = svg.append('g')
            .selectAll('circle')
            .data(linkedNodes)
            .join('circle')
            .attr('r', 10)
            .attr('fill', '#69b3a2')
            .call(drag(simulation));

        const labels = svg.append('g')
            .selectAll('text')
            .data(linkedNodes)
            .join('text')
            .text(d => d.id)
            .attr('x', d => d.x)
            .attr('y', d => d.y)
            .attr('font-family', 'sans-serif')
            .attr('font-size', '10px')
            .attr('fill', 'black');


        const link = svg.append('g')
            .selectAll('line')
            .data(network.links)
            .join('line')
            .attr('stroke', '#999')
            .attr('stroke-opacity', 0.6)
            .attr('stroke-width', d => Math.sqrt(d.value));



        simulation.on('tick', () => {
            link
                .attr('x1', d => d.source.x)
                .attr('y1', d => d.source.y)
                .attr('x2', d => d.target.x)
                .attr('y2', d => d.target.y);

            node
                .attr('cx', d => d.x)
                .attr('cy', d => d.y);

            labels
                .attr('x', d => d.x + 10) // offset the label a bit to the right of the node
                .attr('y', d => d.y);
        });

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
                    NetworkGraph
                </h1>
                <div className="absolute top-8 left-[4vw] font-mybold text-black">
                    <button
                        onClick={() => navigate(-1)}
                        className="absolute top-8 left-[4vw] font-mybold text-black"
                    >  ⬅VOLTAR
                    </button>
                </div>
                <div className="mt-[45px] flex justify-center items-center flex-col">
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
                        <button className="mt-20 px-10 py-3 bg-[var(--blue)] text-white rounded-[13px] hover:bg-[var(--white)] hover:text-[var(--blue)] hover:border-[var(--blue)] border border-transparent transition-all duration-300" onClick={() => { generateNetworGraph() }}>Gerar NetworGraph</button>
                    </>
                )}
                {loading ? (
                    <div>A carregar...</div>
                ) : (
                    <div>
                        <br />
                        <svg ref={networkGraphRef} />
                        <br />
                        <br />
                    </div>
                )}
            </div>
        </div>
    );
};