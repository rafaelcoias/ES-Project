import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

export default function HeatMapTest() {
  const heatmapRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    const data = Array.from({ length: 7 * 16 }, (_, i) => ({
      value: Math.floor(Math.random() * 100), // Valor aleatório de 0 a 100
    }));
    if (!heatmapRef.current || !data) return;

  
    const svg = d3.select(heatmapRef.current);

    // Define o tamanho do SVG e a escala para o heatmap
    const width = 1080;
    const height = 720;
    const colorScale = d3.scaleSequential(d3.interpolateMagma).domain([0, 100]);

    // Desenha o heatmap
    svg.attr('width', width).attr('height', height);

    const cellSize = 30; // Tamanho de cada célula no heatmap

    // Desenha os quadrados para cada célula do heatmap
    svg
      .selectAll('rect')
      .data(data)
      .enter()
      .append('rect')
      .attr('x', (d, i) => Math.floor(i / 6) * cellSize) // Posicionamento horizontal baseado no dia da semana
      .attr('y', (d, i) => (i % 7) * cellSize) // Posicionamento vertical baseado na hora
      .attr('width', cellSize)
      .attr('height', cellSize)
      .attr('fill', d => colorScale(d.value)); // Cor baseada no valor

    // Adiciona rótulos de dias da semana e horas
    const daysOfWeek = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
    svg
      .selectAll('.dayLabel')
      .data(daysOfWeek)
      .enter()
      .append('text')
      .text(d => d)
      .attr('x', 0)
      .attr('y', (d, i) => i * cellSize + cellSize / 2)
      .attr('dy', '0.35em')
      .style('text-anchor', 'end')
      .attr('class', 'dayLabel');

    const hours = Array.from(Array(16), (_, i) => i + 8); // Horas de 8 a 23
    svg
      .selectAll('.hourLabel')
      .data(hours)
      .enter()
      .append('text')
      .text(d => `${d}:00`)
      .attr('x', (d, i) => i * cellSize + cellSize / 2)
      .attr('y', -5)
      .style('text-anchor', 'middle')
      .attr('class', 'hourLabel');
  });

  return <svg ref={heatmapRef} />;
}

