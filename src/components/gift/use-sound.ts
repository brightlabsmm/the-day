"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Ctx = AudioContext;
type Drone = { oscs: OscillatorNode[]; master: GainNode };

/**
 * Small synthesised sounds (no audio files): a singing-bowl chime when a gift
 * opens, and an optional soft ambient pad. Audio only starts after the
 * visitor taps something, as browsers require.
 *
 * Laptop and phone speakers play very little below about 200 Hz, so both
 * sounds include higher partials, not just a low note.
 */
export function useSanctuarySound() {
  const ctxRef = useRef<Ctx | null>(null);
  const droneRef = useRef<Drone | null>(null);
  const [ambient, setAmbient] = useState(false);

  const ctx = useCallback((): Ctx | null => {
    try {
      if (!ctxRef.current) {
        const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (!AC) return null;
        ctxRef.current = new AC();
      }
      if (ctxRef.current.state === "suspended") void ctxRef.current.resume();
      return ctxRef.current;
    } catch {
      return null;
    }
  }, []);

  /** A bowl-like strike: the note plus its 2nd and 3rd partials, each fading at its own pace. */
  const chime = useCallback(
    (from = 528, length = 2.4) => {
      const ac = ctx();
      if (!ac) return;
      const now = ac.currentTime;
      const out = ac.createGain();
      out.gain.value = 0.55;
      out.connect(ac.destination);
      [
        { mult: 1, peak: 0.34, decay: length },
        { mult: 2.01, peak: 0.16, decay: length * 0.7 },
        { mult: 3.02, peak: 0.07, decay: length * 0.45 },
      ].forEach(({ mult, peak, decay }) => {
        const osc = ac.createOscillator();
        const gain = ac.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(from * mult, now);
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(peak, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + decay);
        osc.connect(gain).connect(out);
        osc.start(now);
        osc.stop(now + decay + 0.05);
      });
    },
    [ctx],
  );

  const stopDrone = useCallback(() => {
    const d = droneRef.current;
    if (!d) return;
    try {
      const t = d.master.context.currentTime;
      d.master.gain.cancelScheduledValues(t);
      d.master.gain.setTargetAtTime(0, t, 0.3);
      d.oscs.forEach((o) => o.stop(t + 1.5));
    } catch {}
    droneRef.current = null;
  }, []);

  /** Starts or stops a soft pad (174 Hz with a fifth and octaves above it). Returns whether it is now on. */
  const toggleAmbient = useCallback(() => {
    if (droneRef.current) {
      stopDrone();
      setAmbient(false);
      return false;
    }
    const ac = ctx();
    if (!ac) return false;
    const master = ac.createGain();
    master.gain.setValueAtTime(0, ac.currentTime);
    master.gain.linearRampToValueAtTime(0.16, ac.currentTime + 1.5);
    master.connect(ac.destination);

    const oscs: OscillatorNode[] = [];
    [
      { f: 174, g: 0.5 },
      { f: 261, g: 0.32 },
      { f: 348, g: 0.5 },
      { f: 522, g: 0.28 },
    ].forEach(({ f, g }, i) => {
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.type = "sine";
      osc.frequency.value = f;
      gain.gain.value = g;
      // A slow wobble in each voice, so the pad breathes instead of sitting flat.
      const lfo = ac.createOscillator();
      const depth = ac.createGain();
      lfo.frequency.value = 0.12 + i * 0.05;
      depth.gain.value = g * 0.4;
      lfo.connect(depth).connect(gain.gain);
      lfo.start();
      osc.connect(gain).connect(master);
      osc.start();
      oscs.push(osc, lfo);
    });
    droneRef.current = { oscs, master };
    setAmbient(true);
    return true;
  }, [ctx, stopDrone]);

  useEffect(
    () => () => {
      stopDrone();
      void ctxRef.current?.close().catch(() => {});
    },
    [stopDrone],
  );

  return { chime, ambient, toggleAmbient };
}
