export type BehaviorVector = {
  exploration: number;
  focus: number;
  curiosity: number;
  patience: number;
  hesitation: number;
  repetition: number;
  interactionSpeed: number;
  persistence: number;
};

export type Signals = {
  clicks: number;
  movement: number;
  hoverTime: number;
  decisions: number;
  decisionTime: number[];
  explored: Set<string>;
  revisits: number;
  sessionMs: number;
  surprises: number;
};

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));
const avg = (xs: number[]) => xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0;

export function scoreBehavior(s: Signals): BehaviorVector {
  const decisionAvg = avg(s.decisionTime);
  const speed = Math.min(100, s.movement / Math.max(1, s.sessionMs / 1000) * 7);
  const exploration = Math.min(100, s.explored.size * 12 + Math.min(30, s.movement / 250));
  const focus = Math.max(0, 100 - exploration * 0.35 + Math.min(35, s.hoverTime / 1800));
  const curiosity = Math.min(100, s.surprises * 20 + s.revisits * 4 + s.explored.size * 5);
  const patience = Math.min(100, Math.max(0, s.sessionMs / 1800) + s.hoverTime / 120);
  const hesitation = Math.min(100, decisionAvg / 25);
  const repetition = Math.min(100, s.revisits * 13);
  const interactionSpeed = clamp(speed);
  const persistence = Math.min(100, s.clicks * 7 + s.sessionMs / 1500);

  return {
    exploration: clamp(exploration),
    focus: clamp(focus),
    curiosity: clamp(curiosity),
    patience: clamp(patience),
    hesitation: clamp(hesitation),
    repetition: clamp(repetition),
    interactionSpeed,
    persistence: clamp(persistence),
  };
}

export function archetype(v: BehaviorVector) {
  const candidates = [
    ["THE EXPLORER", v.exploration + v.curiosity],
    ["THE OBSERVER", v.focus + v.patience],
    ["THE SEEKER", v.persistence + v.exploration],
    ["THE LOOP", v.repetition * 1.8],
    ["THE IMPULSE", v.interactionSpeed + (100 - v.hesitation)],
    ["THE DEEP DIVE", v.focus + v.patience + v.persistence * 0.5],
  ] as const;
  return candidates.sort((a, b) => b[1] - a[1])[0][0];
}