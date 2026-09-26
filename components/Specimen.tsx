"use client";

import { useMemo } from "react";
import type { BehaviorVector } from "../lib/behavior";

function hash(v: BehaviorVector) {
  return Math.abs(Object.values(v).reduce((a, n, i) => a + n * (i + 11), 17));
}

export default function Specimen({ behavior, revealed }: { behavior: BehaviorVector; revealed: boolean }) {
  const seed = useMemo(() => hash(behavior), [behavior]);
  const particles = useMemo(() => Array.from({ length: 44 }, (_, i) => {
    const angle = (i / 44) * Math.PI * 2;
    const radius = 90 + ((seed + i * 31) % 110);
    return { i, x: Math.cos(angle) * radius, y: Math.sin(angle) * radius, delay: ((seed + i * 7) % 900) / 1000 };
  }), [seed]);

  return <div className={`specimen ${revealed ? "is-revealed" : ""}`} style={{ ["--tempo" as string]: `${0.8 + behavior.interactionSpeed / 150}s` }}>
    <div className="specimen-core" />
    <div className="specimen-ring ring-one" />
    <div className="specimen-ring ring-two" />
    <div className="specimen-ring ring-three" />
    {particles.map(p => <i key={p.i} className="particle" style={{ left: `calc(50% + ${p.x}px)`, top: `calc(50% + ${p.y}px)`, animationDelay: `${p.delay}s` }} />)}
  </div>;
}