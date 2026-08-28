import { Quaternion, Vector3 } from "three";

export const KAY_LOOK_BONES = [
  "Head",
  "NeckTwist02",
  "NeckTwist01",
] as const;

export type KayLookBone = (typeof KAY_LOOK_BONES)[number];
export type KayLookAxis = "x" | "y" | "z";
export type KayLookOrder = "yaw-pitch" | "pitch-yaw";

export const kayLookRig = {
  yawAxis: "y" as KayLookAxis,
  pitchAxis: "x" as KayLookAxis,
  yawSign: 1,
  pitchSign: 1,
  order: "yaw-pitch" as KayLookOrder,
  deadZone: 0.04,
  calibRadians: (8 * Math.PI) / 180,
};

const AXIS_X = new Vector3(1, 0, 0);
const AXIS_Y = new Vector3(0, 1, 0);
const AXIS_Z = new Vector3(0, 0, 1);
const _yaw = new Quaternion();
const _pitch = new Quaternion();
const _axis = new Quaternion();

export function lookAxisVector(axis: KayLookAxis): Vector3 {
  switch (axis) {
    case "x":
      return AXIS_X;
    case "y":
      return AXIS_Y;
    case "z":
      return AXIS_Z;
    default: {
      const exhaustive: never = axis;
      return exhaustive;
    }
  }
}

export function applyDeadZone(value: number, zone: number): number {
  return Math.abs(value) < zone ? 0 : value;
}

export function composeLookQuaternion(
  target: Quaternion,
  rest: Quaternion,
  yaw: number,
  pitch: number,
  order: KayLookOrder = kayLookRig.order,
): Quaternion {
  _yaw.setFromAxisAngle(lookAxisVector(kayLookRig.yawAxis), yaw);
  _pitch.setFromAxisAngle(lookAxisVector(kayLookRig.pitchAxis), pitch);
  target.copy(rest);

  switch (order) {
    case "yaw-pitch":
      target.multiply(_yaw).multiply(_pitch);
      return target;
    case "pitch-yaw":
      target.multiply(_pitch).multiply(_yaw);
      return target;
    default: {
      const exhaustive: never = order;
      return exhaustive;
    }
  }
}

export function composeAxisQuaternion(
  target: Quaternion,
  rest: Quaternion,
  axis: KayLookAxis,
  radians: number,
): Quaternion {
  _axis.setFromAxisAngle(lookAxisVector(axis), radians);
  return target.copy(rest).multiply(_axis);
}
