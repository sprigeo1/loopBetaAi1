import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { LearningModule } from '../types';

interface Props {
  modules: LearningModule[];
  onModuleClick?: (module: LearningModule) => void;
}

// MapNode interface with explicit x and y for simulation
interface MapNode extends LearningModule, d3.SimulationNodeDatum {
  radius: number;
  x: number;
  y: number;
}

const FriendshipMap: React.FC<Props> = ({ modules, onModuleClick }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!containerRef.current) return;
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0 && entry.contentRect.height > 0) {
          setDimensions({
            width: entry.contentRect.width,
            height: entry.contentRect.height
          });
        }
      }
    });
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    if (!svgRef.current || dimensions.width === 0) return;

    const width = dimensions.width;
    const height = dimensions.height;
    
    // Virtual world size - moderately larger than visible screen
    const worldWidth = width * 1.2;
    const worldHeight = height * 1.2;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Create a zoom container
    const g = svg.append("g");

    // Initialize Zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 3])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    svg.call(zoom);

    const defs = svg.append("defs");
    
    // Star Glow Filter
    const filter = defs.append("filter").attr("id", "starGlow");
    filter.append("feGaussianBlur").attr("stdDeviation", "2.5").attr("result", "blur");
    const feMerge = filter.append("feMerge");
    feMerge.append("feMergeNode").attr("in", "blur");
    feMerge.append("feMergeNode").attr("in", "SourceGraphic");

    // Prepare node data in a tighter cluster
    const nodesData: MapNode[] = modules.map((m, i) => ({
      ...m,
      radius: m.status === 'COMPLETED' ? 14 : 8,
      // Tighter spiral to start
      x: (worldWidth / 2) + (Math.cos(i) * (i * 35 + 20)),
      y: (worldHeight / 2) + (Math.sin(i) * (i * 35 + 20))
    }));

    // Links between consecutive modules
    const linksData = nodesData.slice(0, -1).map((_, i) => ({
      source: i,
      target: i + 1
    }));

    const linkContainer = g.append("g").attr("class", "links");
    const nodeContainer = g.append("g").attr("class", "nodes");

    // Adjusted force simulation for a more intimate layout
    const simulation = d3.forceSimulation<MapNode>(nodesData)
      .force("center", d3.forceCenter(worldWidth / 2, worldHeight / 2))
      // Reduced repulsion significantly to pull items closer (from -1200 to -400)
      .force("charge", d3.forceManyBody().strength(-400))
      // Collide radius tuned to allow proximity while protecting text (from +85 to +72)
      .force("collide", d3.forceCollide<MapNode>(d => d.radius + 72))
      // Stronger centering force to create a unified cluster (from 0.04 to 0.12)
      .force("x", d3.forceX(worldWidth / 2).strength(0.12))
      .force("y", d3.forceY(worldHeight / 2).strength(0.12))
      .stop();

    // Settle layout
    for (let i = 0; i < 300; ++i) simulation.tick();

    // Constellation lines
    const links = linkContainer.selectAll("line")
      .data(linksData)
      .enter().append("line")
      .attr("x1", (d: any) => nodesData[d.source].x)
      .attr("y1", (d: any) => nodesData[d.source].y)
      .attr("x2", (d: any) => nodesData[d.target].x)
      .attr("y2", (d: any) => nodesData[d.target].y)
      .attr("stroke", "rgba(99, 102, 241, 0.2)")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "4,4");

    // Draw Stars
    const starGroups = nodeContainer.selectAll(".star-node")
      .data(nodesData)
      .enter().append("g")
      .attr("class", "star-node")
      .style("cursor", "pointer")
      .attr("transform", d => `translate(${d.x}, ${d.y})`)
      .attr("opacity", d => d.status === 'COMPLETED' ? 0.4 : 1)
      .on("click", (event, d) => onModuleClick?.(d));

    // Outer subtle glow circle
    starGroups.append("circle")
      .attr("r", d => d.radius + 12)
      .attr("fill", d => d.status === 'COMPLETED' ? "rgba(99, 102, 241, 0.05)" : "rgba(255, 255, 255, 0.03)")
      .attr("class", d => d.status === 'AVAILABLE' ? "animate-pulse" : "");

    // Main star circle
    starGroups.append("circle")
      .attr("r", d => d.radius)
      .attr("fill", d => d.status === 'COMPLETED' ? "#1e293b" : "#6366f1")
      .attr("stroke", d => d.status === 'LOCKED' ? "rgba(255,255,255,0.1)" : "#fff")
      .attr("stroke-width", 2)
      .attr("filter", d => d.status === 'AVAILABLE' ? "url(#starGlow)" : "");

    // Activity Icons
    starGroups.append("text")
      .attr("y", 4)
      .attr("text-anchor", "middle")
      .attr("font-size", d => d.radius > 10 ? "14px" : "10px")
      .attr("opacity", d => d.status === 'LOCKED' ? 0.3 : 1)
      .text(d => d.icon);

    // Module Title Labels
    starGroups.append("text")
      .attr("y", d => d.radius + 28)
      .attr("text-anchor", "middle")
      .attr("fill", d => d.status === 'COMPLETED' ? "#475569" : "#fff")
      .attr("font-size", "10px")
      .attr("font-weight", "800")
      .attr("class", "uppercase tracking-[0.25em] pointer-events-none")
      .style("text-shadow", "0 2px 8px rgba(0,0,0,0.9)")
      .text(d => d.title);

    // Subtitle labels
    starGroups.append("text")
      .attr("y", d => d.radius + 42)
      .attr("text-anchor", "middle")
      .attr("fill", "#64748b")
      .attr("font-size", "8px")
      .attr("font-weight", "600")
      .attr("class", "uppercase tracking-widest pointer-events-none")
      .text(d => d.subtitle);

    // Initial camera position centered on the cluster
    const initialTransform = d3.zoomIdentity
      .translate(width / 2 - (worldWidth / 2) * 0.85, height / 2 - (worldHeight / 2) * 0.85)
      .scale(0.85);
    svg.call(zoom.transform, initialTransform);

  }, [modules, dimensions, onModuleClick]);

  return (
    <div ref={containerRef} className="w-full h-full min-h-[500px] relative bg-[#030712] overflow-hidden cursor-grab active:cursor-grabbing">
      {/* Background stars for depth */}
      <div className="absolute inset-0 opacity-20 pointer-events-none z-0">
        {Array.from({ length: 120 }).map((_, i) => (
          <div 
            key={i} 
            className="absolute bg-white rounded-full animate-pulse" 
            style={{ 
              width: Math.random() * 2 + 'px', 
              height: Math.random() * 2 + 'px', 
              top: Math.random() * 100 + '%', 
              left: Math.random() * 100 + '%',
              animationDelay: Math.random() * 5 + 's',
              opacity: Math.random() * 0.7 + 0.3
            }} 
          />
        ))}
      </div>
      
      <div className="absolute top-6 left-6 z-20 pointer-events-none">
        <div className="bg-slate-900/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/5 flex items-center gap-3">
          <span className="text-[9px] uppercase tracking-widest font-bold text-slate-500">Navigation</span>
          <span className="text-[9px] text-indigo-400 font-bold uppercase tracking-widest animate-pulse">Drag to pan • Scroll to zoom</span>
        </div>
      </div>

      <svg ref={svgRef} className="w-full h-full relative z-10 block" />
    </div>
  );
};

export default FriendshipMap;