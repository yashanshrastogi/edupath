"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect } from "react";

function useAnimatedNumber(value: number) {
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { stiffness: 120, damping: 20, mass: 0.6 });
  const rounded = useTransform(spring, (latest) => Math.round(latest));

  useEffect(() => {
    mv.set(value);
  }, [mv, value]);

  return rounded;
}

type Props = {
  label: string;
  value: number | string;
  sub?: string;
  color?: string;
};

export function StatMetric({ label, value, sub, color }: Props) {
  const canAnimate = typeof value === "number" && Number.isFinite(value);
  const animated = useAnimatedNumber(canAnimate ? value : 0);

  return (
    <div
      className="rounded-xl p-4"
      style={{
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div className="text-xs font-semibold mb-1" style={{ color: "var(--text-muted)" }}>
        {label}
      </div>
      <div className="text-2xl font-extrabold font-display" style={{ color: color ?? "#8b5cf6" }}>
        {canAnimate ? <motion.span>{animated}</motion.span> : <span>{value}</span>}
      </div>
      {sub ? (
        <div className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
          {sub}
        </div>
      ) : null}
    </div>
  );
}

