import { useState, useEffect, useRef, useMemo } from "react";
import classes from "../../assets/views/Weather.module.css";
import * as d3 from "d3";

export function LinePlot({
  data,
  width = 300,
  height = 180,
  marginTop = 10,
  marginRight = 30,
  marginBottom = 30,
  marginLeft = 50,
}) {
  const x = d3.scaleLinear(
    [0, data.length - 1],
    [marginLeft, width - marginRight],
  );
  const y = d3.scaleLinear(d3.extent(data), [height - marginBottom, marginTop]);
  const line = d3.line((d, i) => x(i), y).curve(d3.curveBasis);

  const gx = useRef();
  const gy = useRef();

  useEffect(() => void d3.select(gx.current).call(d3.axisBottom(x)), [gx, x]);
  useEffect(() => void d3.select(gy.current).call(d3.axisLeft(y)), [gy, y]);

  return (
    <svg width={width} height={height}>
      <g ref={gx} transform={`translate(0,${height - marginBottom})`} />
      <g ref={gy} transform={`translate(${marginLeft},0)`} />
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        d={line(data)}
      />
      <g fill="transparent" stroke="currentColor" strokeWidth="0">
        {data.map((d, i) => (
          <circle key={i} cx={x(i)} cy={y(d)} r="2.5" />
        ))}
      </g>
    </svg>
  );
}
