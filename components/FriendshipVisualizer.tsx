
import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Friend } from '../types';

interface Props {
  friends: Friend[];
  userAvatarId: string;
  onFriendClick?: (friendId: string) => void;
  isHighlighted?: boolean;
}

const FriendshipVisualizer: React.FC<Props> = ({ friends, userAvatarId, onFriendClick, isHighlighted }) => {
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
    const svg = d3.select(svgRef.current);
    
    svg.selectAll("*").remove(); // Clear previous

    const centerX = width / 2;
    const centerY = height / 2;

    const defs = svg.append("defs");
    
    // Core Background Glow
    const radialGrad = defs.append("radialGradient")
      .attr("id", "coreGlow")
      .attr("cx", "50%").attr("cy", "50%").attr("r", "50%");
    radialGrad.append("stop").attr("offset", "0%").attr("stop-color", "rgba(99, 102, 241, 0.4)");
    radialGrad.append("stop").attr("offset", "100%").attr("stop-color", "rgba(15, 23, 42, 0)");

    // Interactive Glow Filter
    const filter = defs.append("filter").attr("id", "glowPulse");
    filter.append("feGaussianBlur").attr("stdDeviation", "3.5").attr("result", "coloredBlur");
    const feMerge = filter.append("feMerge");
    feMerge.append("feMergeNode").attr("in", "coloredBlur");
    feMerge.append("feMergeNode").attr("in", "SourceGraphic");

    // Static Infinity Path Trace
    const scaleX = Math.min(width, 400) / 400; 
    const scaleY = Math.min(height, 200) / 200;
    const infinityPath = d3.line().curve(d3.curveBasis)([
      [centerX - 120 * scaleX, centerY],
      [centerX - 60 * scaleX, centerY - 60 * scaleY],
      [centerX, centerY],
      [centerX + 60 * scaleX, centerY + 60 * scaleY],
      [centerX + 120 * scaleX, centerY],
      [centerX + 60 * scaleX, centerY - 60 * scaleY],
      [centerX, centerY],
      [centerX - 60 * scaleX, centerY + 60 * scaleY],
      [centerX - 120 * scaleX, centerY]
    ] as [number, number][]);

    svg.append("path")
      .attr("d", infinityPath)
      .attr("fill", "none")
      .attr("stroke", "rgba(255,255,255,0.05)")
      .attr("stroke-width", 1.5);

    // --- User Node ("You") ---
    const userG = svg.append("g")
      .style("cursor", "pointer")
      .on("click", () => onFriendClick?.('SELF'));

    // Persistent Interactive Glow for You
    userG.append("circle")
      .attr("cx", centerX)
      .attr("cy", centerY)
      .attr("r", 40)
      .attr("fill", "url(#coreGlow)")
      .attr("class", "animate-pulse");

    userG.append("circle")
      .attr("cx", centerX)
      .attr("cy", centerY)
      .attr("r", 16)
      .attr("fill", "#fff")
      .attr("filter", "url(#glowPulse)");

    userG.append("text")
      .attr("x", centerX)
      .attr("y", centerY + 35)
      .attr("text-anchor", "middle")
      .attr("fill", "#fff")
      .attr("font-size", "12px")
      .attr("font-weight", "600")
      .style("letter-spacing", "0.05em")
      .text("YOU");

    // --- Friend Nodes ---
    friends.forEach((friend, i) => {
      const angle = (i / friends.length) * 2 * Math.PI - (Math.PI / 2);
      const orbitDistance = 100 + (100 - friend.orbitDistance) * 1.2;
      const x = centerX + Math.cos(angle) * orbitDistance;
      const y = centerY + Math.sin(angle) * orbitDistance;
      const radius = 12 + (friend.relationshipStrength / 8);

      // Connection Line
      svg.append("line")
        .attr("x1", centerX).attr("y1", centerY)
        .attr("x2", x).attr("y2", y)
        .attr("stroke", "rgba(255,255,255,0.15)")
        .attr("stroke-dasharray", "3,3");

      const g = svg.append("g")
        .style("cursor", "pointer")
        .on("click", () => onFriendClick?.(friend.id));

      // Glow cue for friend
      g.append("circle")
        .attr("cx", x).attr("cy", y)
        .attr("r", radius + 15)
        .attr("fill", "rgba(99, 102, 241, 0.1)")
        .attr("class", "animate-pulse");

      g.append("circle")
        .attr("cx", x).attr("cy", y)
        .attr("r", radius)
        .attr("fill", userAvatarId === 'sunset' ? '#fb7185' : '#6366f1')
        .attr("filter", "url(#glowPulse)");

      g.append("text")
        .attr("x", x).attr("y", y + radius + 18)
        .attr("text-anchor", "middle")
        .attr("fill", "#94a3b8")
        .attr("font-size", "11px")
        .text(friend.name.toUpperCase());
    });

  }, [friends, userAvatarId, dimensions, onFriendClick]);

  return (
    <div ref={containerRef} className={`w-full h-full min-h-[300px] flex items-center justify-center relative overflow-hidden transition-all duration-700 ${isHighlighted ? 'bg-indigo-900/10' : ''}`}>
       <svg ref={svgRef} className="w-full h-full absolute inset-0" />
    </div>
  );
};

export default FriendshipVisualizer;
