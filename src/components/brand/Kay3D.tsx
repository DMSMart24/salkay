"use client";

/**
 * KAY 3D archived for future reactivation.
 * Do not import this module from the production homepage while
 * `kay3dArchived` is true. See src/components/brand/archived-3d/README.md
 */

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { PerspectiveCamera as RigCamera, useGLTF } from "@react-three/drei";
import {
  Suspense,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import {
  ACESFilmicToneMapping,
  Box3,
  Group,
  LinearSRGBColorSpace,
  Matrix4,
  Object3D,
  PerspectiveCamera,
  Quaternion,
  SRGBColorSpace,
  Vector3,
  type Mesh,
  type MeshStandardMaterial,
  type WebGLRenderer,
} from "three";
import { KayErrorBoundary } from "@/components/brand/KayErrorBoundary";
import { KayLookCalibrate, type KayCalibPose } from "@/components/brand/KayLookCalibrate";
import { isKayDebugEnabled, useKayDevice } from "@/components/brand/useKayDevice";
import {
  useKayLook,
  useOptionalKayLook,
  type KayLookTarget,
} from "@/components/brand/useKayLook";
import { kayGlbSrc, kayLook } from "@/lib/kay";
import {
  composeAxisQuaternion,
  composeLookQuaternion,
  kayLookRig,
  type KayLookBone,
} from "@/lib/kay-look";

const BONE_NAMES = [
  "Head",
  "NeckTwist01",
  "NeckTwist02",
  "Spine01",
  "Spine02",
] as const;

const PRESENTATION_YAW = 0.2;
const PRESENTATION_SCALE = 1;
const FRAME_PAD = 1.09;
const FRAME_PAD_MOBILE = 1.12;
const BODY_LOOK_Y = 0.49;

type KayLookTrackName = (typeof BONE_NAMES)[number];

type Kay3DProps = {
  fallback: ReactNode;
  className?: string;
};

type LookState = {
  yaw: number;
  pitch: number;
};

type BoneRest = {
  bone: Object3D;
  rest: Quaternion;
};

type ModelFrame = {
  x: number;
  y: number;
  z: number;
  sizeY: number;
  minY: number;
  maxY: number;
  lookX: number;
  lookY: number;
};

type PresentedFrame = {
  lookX: number;
  centerY: number;
  height: number;
};

function damp(current: number, target: number, lambda: number, dt: number) {
  return current + (target - current) * (1 - Math.exp(-lambda * dt));
}

function findBone(root: Object3D, name: string): Object3D | null {
  const found = root.getObjectByName(name);
  if (!found && process.env.NODE_ENV === "development") {
    console.warn(`[KAY] bone not found: ${name}`);
  }
  return found ?? null;
}

function measureModel(root: Object3D): ModelFrame {
  root.updateMatrixWorld(true);
  const box = new Box3().setFromObject(root);

  if (root.parent) {
    const inverseParent = new Matrix4().copy(root.parent.matrixWorld).invert();
    box.applyMatrix4(inverseParent);
  }

  const size = box.getSize(new Vector3());
  const center = box.getCenter(new Vector3());
  const offsetX = -center.x;
  const offsetY = -box.min.y;
  const offsetZ = -center.z;

  let lookX = 0;
  let lookY = size.y * 0.56;
  const head = root.getObjectByName("Head");
  if (head) {
    const headPoint = new Vector3();
    head.getWorldPosition(headPoint);
    if (root.parent) {
      root.parent.worldToLocal(headPoint);
    }
    lookX = (headPoint.x + offsetX) * 0.12;
    lookY = (headPoint.y + offsetY) * 0.38 + size.y * 0.22;
  }

  return {
    x: offsetX,
    y: offsetY,
    z: offsetZ,
    sizeY: size.y,
    minY: box.min.y,
    maxY: box.max.y,
    lookX,
    lookY,
  };
}

function presentedFrame(frame: ModelFrame): PresentedFrame {
  const minY = frame.y + PRESENTATION_SCALE * frame.minY;
  const maxY = frame.y + PRESENTATION_SCALE * frame.maxY;
  const height = maxY - minY;
  return {
    lookX: frame.lookX * PRESENTATION_SCALE,
    centerY: minY + height * BODY_LOOK_Y,
    height,
  };
}

function frameDistance(height: number, fov: number, pad: number) {
  const halfFov = (fov * Math.PI) / 360;
  return (height * pad) / (2 * Math.tan(halfFov));
}

const _lookTarget = new Quaternion();

function slerpBone(
  entry: BoneRest | undefined,
  yaw: number,
  pitch: number,
  lambda: number,
  dt: number,
) {
  if (!entry) {
    return;
  }

  composeLookQuaternion(_lookTarget, entry.rest, yaw, pitch);
  entry.bone.quaternion.slerp(_lookTarget, 1 - Math.exp(-lambda * dt));
}

function prepareKayTextures(root: Object3D, renderer: WebGLRenderer) {
  const anisotropy = Math.min(16, renderer.capabilities.getMaxAnisotropy());

  root.traverse((object) => {
    const mesh = object as Mesh;
    if (!mesh.isMesh) {
      return;
    }

    const material = mesh.material as MeshStandardMaterial | MeshStandardMaterial[];
    const materials = Array.isArray(material) ? material : [material];

    for (const item of materials) {
      if (item.map) {
        item.map.colorSpace = SRGBColorSpace;
        item.map.anisotropy = anisotropy;
        item.map.generateMipmaps = true;
        item.map.needsUpdate = true;
      }

      if (item.normalMap) {
        item.normalMap.colorSpace = LinearSRGBColorSpace;
        item.normalMap.anisotropy = anisotropy;
      }

      if (item.metalnessMap) {
        item.metalnessMap.colorSpace = LinearSRGBColorSpace;
        item.metalnessMap.anisotropy = anisotropy;
      }

      if (item.roughnessMap) {
        item.roughnessMap.colorSpace = LinearSRGBColorSpace;
        item.roughnessMap.anisotropy = anisotropy;
      }

      if (item.aoMap) {
        item.aoMap.colorSpace = LinearSRGBColorSpace;
      }
    }
  });
}

function KayFramer({ mobile }: { mobile: boolean }) {
  const { scene } = useGLTF(kayGlbSrc);
  const cameraRef = useRef<PerspectiveCamera>(null);

  useLayoutEffect(() => {
    const camera = cameraRef.current;
    if (!camera) {
      return;
    }

    const frame = measureModel(scene);
    const presented = presentedFrame(frame);
    const fov = mobile ? 46 : 42;
    const distance = frameDistance(
      presented.height,
      fov,
      mobile ? FRAME_PAD_MOBILE : FRAME_PAD,
    );
    camera.position.set(
      presented.lookX + (mobile ? 0.03 : 0.05),
      presented.centerY,
      distance,
    );
    camera.lookAt(presented.lookX, presented.centerY, 0);
    camera.updateProjectionMatrix();
  }, [mobile, scene]);

  return (
    <RigCamera
      ref={cameraRef}
      makeDefault
      fov={mobile ? 46 : 42}
      near={0.1}
      far={40}
    />
  );
}

function KayModel({
  look,
  reducedMotion,
  intensity,
  calibRef,
}: {
  look: RefObject<KayLookTarget>;
  reducedMotion: boolean;
  intensity: number;
  calibRef: RefObject<KayCalibPose>;
}) {
  const { scene } = useGLTF(kayGlbSrc);
  const { gl } = useThree();
  const groupRef = useRef<Group>(null);
  const frameRef = useRef<ModelFrame>({
    x: 0,
    y: 0,
    z: 0,
    sizeY: 1.7,
    minY: 0,
    maxY: 1.7,
    lookX: 0,
    lookY: 1.2,
  });
  const lookBones = useRef<Partial<Record<KayLookBone, BoneRest>>>({});
  const spineBones = useRef<Partial<Record<"Spine01" | "Spine02", BoneRest>>>({});
    const current = useRef<LookState>({
    yaw: kayLook.contentRestYaw,
    pitch: 0,
  });

  useLayoutEffect(() => {
    const frame = measureModel(scene);
    frameRef.current = frame;
    if (groupRef.current) {
      groupRef.current.position.set(frame.x, frame.y, frame.z);
      groupRef.current.scale.setScalar(PRESENTATION_SCALE);
    }
  }, [scene]);

  useLayoutEffect(() => {
    prepareKayTextures(scene, gl);
  }, [gl, scene]);

  useEffect(() => {
    const resolvedLook: Partial<Record<KayLookBone, BoneRest>> = {};
    const resolvedSpine: Partial<Record<"Spine01" | "Spine02", BoneRest>> = {};
    const detected: string[] = [];

    for (const name of BONE_NAMES as readonly KayLookTrackName[]) {
      const bone = findBone(scene, name);
      if (!bone) {
        continue;
      }

      const entry = {
        bone,
        rest: bone.quaternion.clone(),
      };
      detected.push(name);

      switch (name) {
        case "Head":
        case "NeckTwist01":
        case "NeckTwist02":
          resolvedLook[name] = entry;
          break;
        case "Spine01":
        case "Spine02":
          resolvedSpine[name] = entry;
          break;
        default: {
          const exhaustive: never = name;
          return exhaustive;
        }
      }

      if (process.env.NODE_ENV === "development") {
        const world = new Quaternion();
        bone.getWorldQuaternion(world);
        console.info(`[KAY] ${name}`, {
          parent: bone.parent?.name ?? null,
          position: bone.position.toArray(),
          rotation: bone.rotation.toArray(),
          quaternion: bone.quaternion.toArray(),
          worldQuaternion: world.toArray(),
        });
      }
    }

    lookBones.current = resolvedLook;
    spineBones.current = resolvedSpine;

    if (process.env.NODE_ENV === "development") {
      console.info("[KAY] bones detected:", detected.join(", ") || "none");
      console.info("[KAY] look axes", {
        yaw: `${kayLookRig.yawAxis}${kayLookRig.yawSign > 0 ? "+" : "-"}`,
        pitch: `${kayLookRig.pitchAxis}${kayLookRig.pitchSign > 0 ? "+" : "-"}`,
        order: kayLookRig.order,
      });
    }
  }, [scene]);

  useFrame(({ clock }, delta) => {
    const dt = Math.min(delta, 0.05);
    const pointer = look.current;
    const calib = calibRef.current;
    const maxYaw = kayLook.maxYaw * intensity;
    const maxPitch = kayLook.maxPitch * intensity;

    const restYaw = kayLook.contentRestYaw;
    const targetYaw =
      restYaw + (pointer.inside ? pointer.x * maxYaw * kayLookRig.yawSign : 0);
    const targetPitch = pointer.inside
      ? pointer.y * maxPitch * kayLookRig.pitchSign
      : 0;

    const response = pointer.inside
      ? kayLook.headResponse
      : kayLook.returnResponse;

    current.current.yaw = damp(current.current.yaw, targetYaw, response, dt);
    current.current.pitch = damp(
      current.current.pitch,
      targetPitch,
      response,
      dt,
    );

    const time = clock.elapsedTime;
    const nearRest =
      Math.abs(current.current.yaw - restYaw) < 0.004 &&
      Math.abs(current.current.pitch) < 0.004;
    const idleScale =
      reducedMotion || pointer.inside || !nearRest || calib ? 0 : 1;
    const idleYaw = Math.sin(time * 0.42) * 0.01 * idleScale;
    const idlePitch = Math.sin(time * 0.73) * 0.008 * idleScale;
    const breathe =
      Math.sin(time * 1.35) * 0.012 * (reducedMotion || pointer.inside ? 0 : 1);
    const bob =
      reducedMotion || pointer.inside
        ? 0
        : Math.sin(time * kayLook.idleBobSpeed) * kayLook.idleBobAmount;

    if (calib) {
      const active = lookBones.current[calib.bone];
      if (active) {
        composeAxisQuaternion(
          _lookTarget,
          active.rest,
          calib.axis,
          kayLookRig.calibRadians * calib.sign,
        );
        active.bone.quaternion.copy(_lookTarget);
      }

      for (const name of ["Head", "NeckTwist02", "NeckTwist01"] as const) {
        if (name === calib.bone) {
          continue;
        }
        const entry = lookBones.current[name];
        if (entry) {
          entry.bone.quaternion.copy(entry.rest);
        }
      }
    } else {
      slerpBone(
        lookBones.current.Head,
        current.current.yaw * kayLook.headWeight + idleYaw,
        current.current.pitch * kayLook.headWeight + idlePitch,
        pointer.inside ? kayLook.headResponse : kayLook.returnResponse,
        dt,
      );
      slerpBone(
        lookBones.current.NeckTwist02,
        current.current.yaw * kayLook.neck02Weight,
        current.current.pitch * kayLook.neck02Weight,
        pointer.inside ? kayLook.neckResponse : kayLook.returnResponse,
        dt,
      );
      slerpBone(
        lookBones.current.NeckTwist01,
        current.current.yaw * kayLook.neck01Weight,
        current.current.pitch * kayLook.neck01Weight,
        pointer.inside ? kayLook.neckResponse : kayLook.returnResponse,
        dt,
      );
    }

    const spine02 = spineBones.current.Spine02;
    if (spine02) {
      composeLookQuaternion(_lookTarget, spine02.rest, 0, breathe);
      spine02.bone.quaternion.slerp(_lookTarget, 1 - Math.exp(-4 * dt));
    }

    const spine01 = spineBones.current.Spine01;
    if (spine01) {
      composeLookQuaternion(_lookTarget, spine01.rest, 0, breathe * 0.45);
      spine01.bone.quaternion.slerp(_lookTarget, 1 - Math.exp(-4 * dt));
    }

    const group = groupRef.current;
    const frame = frameRef.current;
    if (group) {
      group.position.set(frame.x, frame.y + bob, frame.z);
      group.scale.setScalar(PRESENTATION_SCALE);
      group.rotation.set(0, PRESENTATION_YAW, 0);
    }
  });

  return (
    <group ref={groupRef}>
      <primitive object={scene} />
    </group>
  );
}

function KayLights() {
  return (
    <>
      <ambientLight color="#efeae3" intensity={0.34} />
      <hemisphereLight color="#f6f2ea" groundColor="#17191d" intensity={0.26} />
      <directionalLight
        color="#fff6ea"
        intensity={1.9}
        position={[-1.85, 2.55, 3.1]}
      />
      <directionalLight
        color="#fffaf4"
        intensity={0.74}
        position={[-0.2, 1.7, 3.35]}
      />
      <directionalLight
        color="#e4ebf3"
        intensity={0.64}
        position={[2.05, 1.25, 2.35]}
      />
      <directionalLight
        color="#3768FF"
        intensity={0.1}
        position={[1.9, 1.65, -1.75]}
      />
      <directionalLight
        color="#e8eef6"
        intensity={0.2}
        position={[4.4, 1.4, -0.55]}
      />
    </>
  );
}

export function Kay3D({ fallback, className }: Kay3DProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const calibRef = useRef<KayCalibPose>(null);
  const device = useKayDevice();
  const [inView, setInView] = useState(true);
  const [pageVisible, setPageVisible] = useState(true);
  const debug = isKayDebugEnabled();
  const interactive = device.desktop || device.tablet;
  const lookEnabled = interactive && !device.reducedMotion && device.webgl;
  const injectedLook = useOptionalKayLook();
  const localLook = useKayLook(
    stageRef,
    (lookEnabled || debug) && !injectedLook,
  );
  const look = injectedLook ?? localLook;
  const intensity = device.tablet ? kayLook.tabletYawScale : 1;
  const playing = inView && pageVisible;

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(Boolean(entry?.isIntersecting));
      },
      { threshold: 0.12 },
    );
    observer.observe(stage);

    const onVisibility = () => {
      setPageVisible(document.visibilityState === "visible");
    };
    document.addEventListener("visibilitychange", onVisibility);

    const canvas = stage.querySelector("canvas");
    if (canvas) {
      canvas.style.pointerEvents = "none";
      if (canvas.parentElement) {
        canvas.parentElement.style.pointerEvents = "none";
      }
    }

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  if (!device.webgl) {
    return fallback;
  }

  return (
    <div
      ref={stageRef}
      className={className ?? "relative h-full w-full overflow-hidden"}
      style={{ pointerEvents: "none" }}
    >
      <KayErrorBoundary fallback={fallback}>
        <Canvas
          frameloop={playing ? "always" : "never"}
          dpr={device.mobile ? 1 : [1, 2]}
          gl={{
            alpha: true,
            antialias: !device.mobile,
            powerPreference: device.mobile ? "low-power" : "high-performance",
            stencil: false,
            preserveDrawingBuffer: false,
          }}
          onCreated={({ gl }) => {
            gl.outputColorSpace = SRGBColorSpace;
            gl.toneMapping = ACESFilmicToneMapping;
            gl.toneMappingExposure = 0.95;
            gl.setPixelRatio(
              device.mobile ? 1 : Math.min(2, window.devicePixelRatio || 1),
            );
            gl.domElement.style.pointerEvents = "none";
            if (gl.domElement.parentElement) {
              gl.domElement.parentElement.style.pointerEvents = "none";
            }
          }}
          camera={{
            fov: device.mobile ? 46 : 42,
            near: 0.1,
            far: 40,
            position: [0.08, 1.1, 2.05],
          }}
          style={{
            pointerEvents: "none",
            width: "100%",
            height: "100%",
            display: "block",
          }}
        >
          <KayLights />
          <KayFramer mobile={device.mobile} />
          <Suspense fallback={null}>
            <KayModel
              look={look}
              reducedMotion={device.reducedMotion}
              intensity={intensity}
              calibRef={calibRef}
            />
          </Suspense>
        </Canvas>
      </KayErrorBoundary>
      <div className="kay-stage-fade" aria-hidden />
      {debug ? <KayLookCalibrate look={look} poseRef={calibRef} /> : null}
    </div>
  );
}

useGLTF.preload(kayGlbSrc);
