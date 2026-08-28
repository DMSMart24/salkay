"use client";

import { useEffect, useState, type RefObject } from "react";
import type { KayLookTarget } from "@/components/brand/useKayLook";
import {
  KAY_LOOK_BONES,
  kayLookRig,
  type KayLookAxis,
  type KayLookBone,
} from "@/lib/kay-look";

export type KayCalibPose = {
  bone: KayLookBone;
  axis: KayLookAxis;
  sign: 1 | -1;
} | null;

const AXES: KayLookAxis[] = ["x", "y", "z"];

type KayLookCalibrateProps = {
  look: RefObject<KayLookTarget>;
  poseRef: RefObject<KayCalibPose>;
};

export function KayLookCalibrate({ look, poseRef }: KayLookCalibrateProps) {
  const [pose, setPose] = useState<KayCalibPose>(null);
  const [pointer, setPointer] = useState("out");

  useEffect(() => {
    poseRef.current = pose;
  }, [pose, poseRef]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      const point = look.current;
      setPointer(
        point.inside
          ? `${point.x.toFixed(2)} ${point.y.toFixed(2)}`
          : "out",
      );
    }, 120);

    return () => window.clearInterval(timer);
  }, [look]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" || event.key === "0") {
        setPose(null);
        return;
      }

      const axis =
        event.key === "x" || event.key === "X"
          ? "x"
          : event.key === "y" || event.key === "Y"
            ? "y"
            : event.key === "z" || event.key === "Z"
              ? "z"
              : null;
      if (!axis) {
        return;
      }

      setPose({
        bone: "Head",
        axis,
        sign: event.shiftKey ? -1 : 1,
      });
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="pointer-events-auto absolute top-3 left-3 z-20 max-w-[16rem] rounded-lg border border-line bg-canvas/85 p-3 font-mono text-[10px] text-fg/85 backdrop-blur-sm">
      <p className="label text-cyan">KAY calibrate</p>
      <p className="mt-2 text-muted">pointer {pointer}</p>
      <p className="mt-1 text-faint">
        Head X/Y/Z · Shift = minus · Esc reset
      </p>
      <div className="mt-3 grid gap-2">
        {KAY_LOOK_BONES.map((bone) => (
          <div key={bone}>
            <p className="text-faint">{bone}</p>
            <div className="mt-1 flex flex-wrap gap-1">
              {AXES.flatMap((axis) =>
                ([-1, 1] as const).map((sign) => (
                  <button
                    key={`${bone}-${axis}-${sign}`}
                    type="button"
                    className="rounded border border-line px-1.5 py-0.5 hover:border-cyan"
                    onClick={() => setPose({ bone, axis, sign })}
                  >
                    {sign > 0 ? "+" : "−"}
                    {axis.toUpperCase()}
                  </button>
                )),
              )}
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        className="mt-3 rounded border border-line px-2 py-1 hover:border-cyan"
        onClick={() => setPose(null)}
      >
        Reset rest
      </button>
      {pose ? (
        <p className="mt-2 text-cyan">
          {pose.bone} {pose.sign > 0 ? "+" : "−"}
          {pose.axis.toUpperCase()} 8°
        </p>
      ) : null}
      <p className="mt-2 text-faint">
        yaw {kayLookRig.yawAxis.toUpperCase()}
        {kayLookRig.yawSign > 0 ? "+" : "−"} · pitch{" "}
        {kayLookRig.pitchAxis.toUpperCase()}
        {kayLookRig.pitchSign > 0 ? "+" : "−"}
      </p>
    </div>
  );
}
