
import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Friend } from '../types';

interface Props {
  friend: Friend;
  onBack: () => void;
  onAddMoment: (text: string, energy: number) => void;
}

const RelationshipTimeline: React.FC<Props> = ({ friend, onBack, onAddMoment }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMomentText, setNewMomentText] = useState('');
  const [newEnergy, setNewEnergy] = useState(5);

  useEffect(() => {
    if (!containerRef.current) return;
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0) {
          setDimensions({ width: entry.contentRect.width, height: entry.contentRect.height });
        }
      }
    });
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    if (!svgRef.current || dimensions.width === 0 || !friend.timeline.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = dimensions.width;
    const height = dimensions.height;
    const margin = { top: 50, right: 30, bottom: 50, left: 30 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    const events = [...friend.timeline].sort((a, b) => a.timestamp - b.timestamp);

    const xScale = d3.scaleLinear()
      .domain([0, Math.max(1, events.length - 1)])
      .range([0, innerWidth]);

    const yScale = d3.scaleLinear()
      .domain([0, 11])
      .range([innerHeight, 0]);

    const lineGenerator = d3.line<any>()
      .x((d, i) => xScale(i))
      .y(d => yScale(d.energyLevel))
      .curve(d3.curveCatmullRom.alpha(0.5));

    g.append("path")
      .datum(events)
      .attr("fill", "none")
      .attr("stroke", "url(#lineGradient)")
      .attr("stroke-width", 3)
      .attr("d", lineGenerator)
      .attr("stroke-opacity", 0)
      .transition().duration(1000)
      .attr("stroke-opacity", 1);

    const defs = svg.append("defs");
    const gradient = defs.append("linearGradient")
      .attr("id", "lineGradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "100%")
      .attr("y2", "0%");
    gradient.append("stop").attr("offset", "0%").attr("stop-color", "#818cf8"); 
    gradient.append("stop").attr("offset", "100%").attr("stop-color", "#2dd4bf"); 

    const dots = g.selectAll(".dot")
      .data(events)
      .enter().append("g")
      .attr("transform", (d, i) => `translate(${xScale(i)}, ${yScale(d.energyLevel)})`);

    dots.append("circle")
      .attr("r", 8)
      .attr("fill", "rgba(255,255,255,0.2)")
      .attr("class", "animate-pulse");

    dots.append("circle")
      .attr("r", 4)
      .attr("fill", "#fff")
      .attr("stroke", "#0f172a")
      .attr("stroke-width", 2);

    dots.append("text")
      .attr("y", -15)
      .attr("text-anchor", "middle")
      .attr("fill", "#cbd5e1")
      .attr("font-size", "10px")
      .attr("opacity", 0)
      .text(d => new Date(d.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }))
      .transition().delay((d, i) => i * 200).duration(500)
      .attr("opacity", 1);

    dots.append("foreignObject")
      .attr("x", -60)
      .attr("y", 15)
      .attr("width", 120)
      .attr("height", 60)
      .html(d => `<div class="text-[10px] text-slate-400 text-center leading-tight overflow-hidden text-ellipsis h-full">${d.text}</div>`)
      .attr("opacity", 0)
      .transition().delay((d, i) => i * 200 + 300).duration(500)
      .attr("opacity", 1);

  }, [dimensions, friend]);

  const handleSubmitMoment = () => {
    if (!newMomentText.trim()) return;
    onAddMoment(newMomentText, newEnergy);
    setNewMomentText('');
    setShowAddModal(false);
  };

  return (
    <div className="h-full w-full flex flex-col bg-slate-900 animate-fade-in relative">
      <div className="p-4 flex items-center justify-between bg-slate-800/50 backdrop-blur-md z-10 border-b border-slate-800/50">
        <button onClick={onBack} className="flex items-center text-slate-400 hover:text-white transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 mr-1">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Back to Orbit
        </button>
        <h2 className="text-lg text-white font-light">{friend.name}'s Timeline</h2>
        <button onClick={() => setShowAddModal(true)} className="text-indigo-400 hover:text-indigo-300 transition-colors flex items-center text-sm font-semibold bg-indigo-500/10 px-3 py-1.5 rounded-full border border-indigo-500/20">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 mr-1">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Moment
        </button>
      </div>

      <div className="flex-1 p-4 overflow-hidden relative" ref={containerRef}>
        <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
           <div className="w-full h-px bg-slate-500"></div>
        </div>
        {friend.timeline.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 italic space-y-4">
            <p>No moments recorded yet.</p>
            <button onClick={() => setShowAddModal(true)} className="px-6 py-2 bg-slate-800 rounded-full text-slate-300 hover:bg-slate-700 transition-colors">Capture First Moment</button>
          </div>
        ) : (
          <svg ref={svgRef} className="w-full h-full overflow-visible" />
        )}
      </div>
      
      {showAddModal && (
        <div className="absolute inset-0 z-50 bg-[#030712]/95 backdrop-blur-sm p-8 flex flex-col items-center justify-center space-y-8 animate-fade-in">
          <h3 className="text-2xl font-light">Capture a Moment</h3>
          <div className="w-full max-w-md space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">What happened?</label>
              <textarea 
                value={newMomentText}
                onChange={e => setNewMomentText(e.target.value)}
                autoFocus
                className="w-full bg-slate-900 border border-white/5 rounded-2xl p-4 text-sm focus:outline-none focus:border-indigo-500 min-h-[120px]"
                placeholder="A text that felt good, a call, or a realization..."
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between px-2">
                <label className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Vibe Level</label>
                <span className="text-xs text-white">{newEnergy} / 10</span>
              </div>
              <input 
                type="range" min="1" max="10" value={newEnergy} 
                onChange={e => setNewEnergy(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>
            <div className="flex flex-col gap-3">
              <button onClick={handleSubmitMoment} className="w-full py-5 bg-indigo-600 rounded-3xl font-bold uppercase tracking-widest shadow-xl shadow-indigo-900/40">Record Moment</button>
              <button onClick={() => setShowAddModal(false)} className="w-full py-4 text-slate-500 text-[10px] font-bold uppercase tracking-widest hover:text-white">Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="p-4 bg-slate-900 text-center text-xs text-slate-500">
        Fluctuations represent the organic energy of connection.
      </div>
    </div>
  );
};

export default RelationshipTimeline;
