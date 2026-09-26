"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Specimen from "./Specimen";
import { archetype, scoreBehavior, type BehaviorVector, type Signals } from "../lib/behavior";

const initialSignals = (): Signals => ({ clicks: 0, movement: 0, hoverTime: 0, decisions: 0, decisionTime: [], explored: new Set(), revisits: 0, sessionMs: 0, surprises: 0 });

export default function WatchExperiment() {
  const [phase, setPhase] = useState<"intro" | "experiment" | "reveal" | "specimen">("intro");
  const [step, setStep] = useState(0);
  const [choice, setChoice] = useState<string | null>(null);
  const [behavior, setBehavior] = useState<BehaviorVector | null>(null);
  const [hoverStarted, setHoverStarted] = useState<number | null>(null);
  const [pulse, setPulse] = useState(false);
  const signals = useRef<Signals>(initialSignals());
  const startedAt = useRef<number>(Date.now());
  const lastMove = useRef<{ x: number; y: number } | null>(null);
  const decisionStarted = useRef<number>(Date.now());

  useEffect(() => {
    if (phase !== "experiment") return;
    const onMove = (e: PointerEvent) => {
      const last = lastMove.current;
      if (last) signals.current.movement += Math.hypot(e.clientX - last.x, e.clientY - last.y);
      lastMove.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [phase]);

  const finish = () => {
    signals.current.sessionMs = Date.now() - startedAt.current;
    const result = scoreBehavior(signals.current);
    setBehavior(result);
    setPhase("reveal");
    setTimeout(() => setPhase("specimen"), 3900);
  };

  const select = (id: string) => {
    const now = Date.now();
    signals.current.clicks++;
    signals.current.decisions++;
    signals.current.decisionTime.push(now - decisionStarted.current);
    if (signals.current.explored.has(id)) signals.current.revisits++;
    signals.current.explored.add(id);
    if (id === "strange") signals.current.surprises++;
    setChoice(id);
    setPulse(true);
    setTimeout(() => setPulse(false), 500);
    decisionStarted.current = now;
    if (step < 3) setTimeout(() => { setChoice(null); setStep(s => s + 1); }, 650);
    else setTimeout(finish, 900);
  };

  const hoverEnd = () => {
    if (hoverStarted) signals.current.hoverTime += Date.now() - hoverStarted;
    setHoverStarted(null);
  };

  const specimenId = useMemo(() => {
    if (!behavior) return "--------";
    const n = Math.abs(Object.values(behavior).reduce((a, x, i) => a + x * (i + 19), 0));
    return `${Math.floor(n).toString(16).padStart(8, "0").slice(0, 4)}-${Math.floor(n * 7).toString(16).padStart(8, "0").slice(0, 4)}`.toUpperCase();
  }, [behavior]);

  if (phase === "intro") return <main className="screen intro" onClick={() => { startedAt.current = Date.now(); decisionStarted.current = Date.now(); setPhase("experiment"); }}>
    <div className="corner">BEHAVIOR / 001</div>
    <div className="intro-copy">
      <p>DON&apos;T WORRY.</p>
      <h1>I&apos;M NOT WATCHING YOU.</h1>
      <span>...</span>
      <p>PROBABLY.</p>
      <button>ENTER</button>
    </div>
    <div className="hint">CLICK ANYWHERE TO BEGIN</div>
  </main>;

  if (phase === "experiment") {
    const experiments = [
      { eyebrow: "EXPERIMENT 01", title: "WHICH ONE?", items: ["quiet", "strange"] },
      { eyebrow: "EXPERIMENT 02", title: "LOOK AROUND.", items: ["north", "east", "south", "west"] },
      { eyebrow: "EXPERIMENT 03", title: "TAKE YOUR TIME.", items: ["wait", "now"] },
      { eyebrow: "EXPERIMENT 04", title: "AGAIN?", items: ["return", "leave"] },
    ][step];
    return <main className={`screen lab ${pulse ? "pulse" : ""}`}>
      <header><span>{experiments.eyebrow}</span><span>{String(step + 1).padStart(2, "0")} / 04</span></header>
      <section className="experiment-card">
        <div className="experiment-title">{experiments.title}</div>
        <div className={`targets targets-${experiments.items.length}`}>
          {experiments.items.map((id, i) => <button key={id} className={`target t-${i} ${choice === id ? "chosen" : ""}`} onMouseEnter={() => { setHoverStarted(Date.now()); signals.current.explored.add(id); }} onMouseLeave={hoverEnd} onClick={() => select(id)} aria-label={`Choose ${id}`}><span /></button>)}
        </div>
      </section>
      <footer><span>NO INSTRUCTIONS</span><span>INTERACTION RECORDED LOCALLY</span></footer>
    </main>;
  }

  if (phase === "reveal" && behavior) return <main className="screen reveal">
    <div className="reveal-line line-1">WE HAVE BEEN WATCHING.</div>
    <div className="reveal-line line-2">NOT YOU.</div>
    <div className="reveal-line line-3">YOUR BEHAVIOR.</div>
    <div className="reveal-data">OBSERVATION COMPLETE</div>
  </main>;

  return <main className="screen specimen-page">
    <div className="specimen-meta top"><span>SPECIMEN</span><strong>{specimenId}</strong></div>
    <Specimen behavior={behavior!} revealed />
    <div className="profile">
      <p className="eyebrow">BEHAVIORAL DNA</p>
      <h1>{archetype(behavior!)}</h1>
      <div className="metrics">{Object.entries(behavior!).map(([key, value]) => <div className="metric" key={key}><span>{key.replace(/([A-Z])/g, " $1")}</span><div><i style={{ width: `${value}%` }} /></div><b>{value}</b></div>)}</div>
      <button className="again" onClick={() => { signals.current = initialSignals(); startedAt.current = Date.now(); decisionStarted.current = Date.now(); setStep(0); setBehavior(null); setPhase("experiment"); }}>MEASURE ME AGAIN ↗</button>
    </div>
    <div className="specimen-meta bottom"><span>SESSION 01</span><span>BEHAVIOR / 001</span></div>
  </main>;
}