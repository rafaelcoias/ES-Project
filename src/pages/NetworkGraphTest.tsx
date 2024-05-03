import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

export default function NetworkGraphTest() {
    const ref = useRef(null);

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
    
    useEffect(() => {
        const data = {
            nodes: [
                { id: 'Aula 1' },
                { id: 'Aula 2' },
                { id: 'Aula 3' },
                { id: 'Aula 4' },
                { id: 'Aula 5' },
            ],
            links: [
                { source: 'Aula 1', target: 'Aula 2' },
                { source: 'Aula 2', target: 'Aula 3' },
                { source: 'Aula 3', target: 'Aula 4' },
                { source: 'Aula 4', target: 'Aula 5' },


            ],
        };
        
        const svg = d3.select(ref.current)
            .attr('width', 800)
            .attr('height', 600);
    
            const simulation = d3.forceSimulation(data.nodes)
            .force('link', d3.forceLink(data.links).id(d => d.id).distance(100)) // aumenta a distância entre nós conectados
            .force('charge', d3.forceManyBody().strength(-2000))
            .force('center', d3.forceCenter(800 / 2, 600 / 2));
        
    
        const link = svg.append('g')
            .selectAll('line')
            .data(data.links)
            .join('line')
            .attr('stroke', '#999')
            .attr('stroke-opacity', 0.6)
            .attr('stroke-width', d => Math.sqrt(d.value));
    
        const node = svg.append('g')
            .selectAll('circle')
            .data(data.nodes)
            .join('circle')
            .attr('r', 10)
            .attr('fill', '#69b3a2')
            .call(drag(simulation));
    
        const labels = svg.append('g')
            .selectAll('text')
            .data(data.nodes)
            .join('text')
            .text(d => d.id)
            .attr('x', d => d.x)
            .attr('y', d => d.y)
            .attr('font-family', 'sans-serif')
            .attr('font-size', '10px')
            .attr('fill', 'black');
    
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
    
        return () => simulation.stop();
    }, []);
    
    return (
        <svg ref={ref}></svg>
    );
};