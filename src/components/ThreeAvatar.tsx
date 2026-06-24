import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Product, ColorOption } from "../types";
import { RefreshCw, Compass } from "lucide-react";

interface ThreeAvatarProps {
  avatar: { id: string; name: string; faceColor: string; lipsColor: string };
  abaya: Product;
  abayaColor: ColorOption;
  hijab: Product;
  hijabColor: ColorOption;
  size: "M" | "L" | "XL" | "XXL";
  viewMode: "front" | "side" | "back" | "360";
  niqabEnabled: boolean;
  sleeveEmbellishment: "classic" | "royal_gold" | "crystal_sequin" | "lace_trim";
  includePin: boolean;
}

export default function ThreeAvatar({
  avatar,
  abaya,
  abayaColor,
  hijab,
  hijabColor,
  size,
  viewMode,
  niqabEnabled,
  sleeveEmbellishment,
  includePin,
}: ThreeAvatarProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [rotationAngle, setRotationAngle] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const modelGroupRef = useRef<THREE.Group | null>(null);
  const headMeshRef = useRef<THREE.Mesh | null>(null);
  const lipsMeshRef = useRef<THREE.Mesh | null>(null);
  const abayaMeshRef = useRef<THREE.Mesh | null>(null);
  const abayaLeftSleeveRef = useRef<THREE.Mesh | null>(null);
  const abayaRightSleeveRef = useRef<THREE.Mesh | null>(null);
  const hijabMeshRef = useRef<THREE.Mesh | null>(null);
  const hijabShroudRef = useRef<THREE.Mesh | null>(null);
  const hijabPanelRef = useRef<THREE.Mesh | null>(null);
  const niqabGroupRef = useRef<THREE.Group | null>(null);
  const pinGroupRef = useRef<THREE.Group | null>(null);
  const cuffLeftRef = useRef<THREE.Group | null>(null);
  const cuffRightRef = useRef<THREE.Group | null>(null);

  const abayaBasePositionsRef = useRef<THREE.BufferAttribute | null>(null);
  const shroudBasePositionsRef = useRef<THREE.BufferAttribute | null>(null);
  const panelBasePositionsRef = useRef<THREE.BufferAttribute | null>(null);

  const dragStartRef = useRef<{ x: number; rotY: number }>({ x: 0, rotY: 0 });

  const SIZE_SCALES = {
    M: { scaleX: 1.0, scaleY: 1.0, scaleZ: 1.0 },
    L: { scaleX: 1.08, scaleY: 1.02, scaleZ: 1.08 },
    XL: { scaleX: 1.16, scaleY: 1.04, scaleZ: 1.16 },
    XXL: { scaleX: 1.24, scaleY: 1.06, scaleZ: 1.24 },
  };

  useEffect(() => {
    if (!mountRef.current) return;
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight || 500;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 15, 65);
    camera.lookAt(0, 10, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.appendChild(renderer.domElement);

    const modelGroup = new THREE.Group();
    modelGroup.position.set(0, -6, 0);
    scene.add(modelGroup);
    modelGroupRef.current = modelGroup;

    // Professional Studio Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 0.65));
    const mainLight = new THREE.DirectionalLight(0xffffff, 1.25);
    mainLight.position.set(15, 30, 25);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.set(1024, 1024);
    scene.add(mainLight);

    const rimLight = new THREE.DirectionalLight(0xfcf2d8, 0.8);
    rimLight.position.set(-20, 20, -15);
    scene.add(rimLight);

    const fillLight = new THREE.PointLight(0xdbeafe, 0.5, 100);
    fillLight.position.set(-15, 8, 20);
    scene.add(fillLight);

    // Elegant Gold Stand
    const standGroup = new THREE.Group();
    const baseMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(8, 9, 1, 32),
      new THREE.MeshStandardMaterial({ color: 0x141416, roughness: 0.35, metalness: 0.85 })
    );
    baseMesh.position.y = -6.5;
    standGroup.add(baseMesh);

    const poleMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.3, 0.3, 18, 16),
      new THREE.MeshStandardMaterial({ color: 0xe1b168, metalness: 0.95, roughness: 0.1 })
    );
    poleMesh.position.y = 2.5;
    standGroup.add(poleMesh);
    scene.add(standGroup);

    // ----------------------------------------------------
    // HIGH-FIDELITY AVATAR (SCULPTED proportions + shaders)
    // ----------------------------------------------------
    const bodyGroup = new THREE.Group();
    modelGroup.add(bodyGroup);

    // Advanced Skin Physical Shader
    const skinMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(avatar.faceColor),
      roughness: 0.28,
      metalness: 0.0,
      clearcoat: 0.15,
      clearcoatRoughness: 0.4,
      sheen: 0.75,
      sheenColor: new THREE.Color(0xffb5b5),
    });

    // Slender Neck
    const neckMesh = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.4, 4.5, 32), skinMaterial);
    neckMesh.position.set(0, 21.2, 0);
    bodyGroup.add(neckMesh);

    // Sculpted Head Geometry (chin taper + cheekbones)
    const headGeo = new THREE.SphereGeometry(3.5, 32, 32);
    const hPos = headGeo.attributes.position;
    for (let i = 0; i < hPos.count; i++) {
      let x = hPos.getX(i);
      let y = hPos.getY(i);
      let z = hPos.getZ(i);
      if (y < 0) {
        const factor = (y / 3.5) + 1.0;
        x *= (0.62 + 0.38 * factor);
        z *= (0.75 + 0.25 * factor);
      } else {
        x *= (1.0 - 0.06 * Math.pow(y / 3.5, 2));
      }
      y *= 1.1;
      hPos.setX(i, x);
      hPos.setY(i, y);
      hPos.setZ(i, z);
    }
    headGeo.computeVertexNormals();
    const headMesh = new THREE.Mesh(headGeo, skinMaterial);
    headMesh.position.set(0, 24.8, 0);
    bodyGroup.add(headMesh);
    headMeshRef.current = headMesh;

    // Sculpted Facial Features Group
    const faceGroup = new THREE.Group();
    faceGroup.position.set(0, 24.8, 3.25);
    bodyGroup.add(faceGroup);

    // Elegant Nose Group
    const noseGroup = new THREE.Group();
    const bridge = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.22, 1.4, 8), skinMaterial);
    bridge.scale.set(1, 1, 0.6);
    bridge.position.set(0, 0, 0.2);
    bridge.rotation.x = -0.1;
    noseGroup.add(bridge);

    const tip = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 16), skinMaterial);
    tip.position.set(0, -0.6, 0.32);
    noseGroup.add(tip);

    const leftNostril = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), skinMaterial);
    leftNostril.position.set(-0.18, -0.65, 0.22);
    noseGroup.add(leftNostril);

    const rightNostril = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), skinMaterial);
    rightNostril.position.set(0.18, -0.65, 0.22);
    noseGroup.add(rightNostril);

    noseGroup.position.set(0, -0.1, 0.1);
    faceGroup.add(noseGroup);

    // Multi-layer almond eyes (Glossy Cornea + Sparkles)
    const createEyeMesh = (offsetX: number, rotateY: number) => {
      const eyeGroup = new THREE.Group();
      
      const sclera = new THREE.Mesh(
        new THREE.SphereGeometry(0.52, 16, 16),
        new THREE.MeshStandardMaterial({ color: 0xfbfbfb, roughness: 0.1 })
      );
      sclera.scale.set(1.0, 0.65, 0.45);
      eyeGroup.add(sclera);

      const iris = new THREE.Mesh(
        new THREE.CylinderGeometry(0.26, 0.26, 0.08, 16),
        new THREE.MeshStandardMaterial({ color: 0x422d25, roughness: 0.15 })
      );
      iris.rotateX(Math.PI / 2);
      iris.position.set(0, 0, 0.3);
      eyeGroup.add(iris);

      const pupil = new THREE.Mesh(
        new THREE.CylinderGeometry(0.11, 0.11, 0.09, 16),
        new THREE.MeshBasicMaterial({ color: 0x0a0706 })
      );
      pupil.rotateX(Math.PI / 2);
      pupil.position.set(0, 0, 0.31);
      eyeGroup.add(pupil);

      const cornea = new THREE.Mesh(
        new THREE.SphereGeometry(0.53, 16, 16),
        new THREE.MeshPhysicalMaterial({
          color: 0xffffff, transparent: true, opacity: 0.95, transmission: 0.98, roughness: 0.01, ior: 1.33, thickness: 0.05
        })
      );
      cornea.scale.set(1.01, 0.66, 0.46);
      eyeGroup.add(cornea);

      const sparkle = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), new THREE.MeshBasicMaterial({ color: 0xffffff }));
      sparkle.position.set(0.12, 0.12, 0.44);
      eyeGroup.add(sparkle);

      eyeGroup.position.set(offsetX, 0.3, -0.15);
      eyeGroup.rotation.y = rotateY;
      faceGroup.add(eyeGroup);
    };

    createEyeMesh(-1.05, 0.18);
    createEyeMesh(1.05, -0.18);

    // Defined Eyelashes & Eyebrows
    const hairMat = new THREE.MeshBasicMaterial({ color: 0x120c0b });
    const createTubeCurve = (points: THREE.Vector3[], radius: number, mat: THREE.Material) => {
      const curve = new THREE.CatmullRomCurve3(points);
      return new THREE.Mesh(new THREE.TubeGeometry(curve, 16, radius, 8, false), mat);
    };

    faceGroup.add(createTubeCurve([new THREE.Vector3(-1.6, 0.52, -0.1), new THREE.Vector3(-1.05, 0.78, 0.05), new THREE.Vector3(-0.4, 0.58, -0.1)], 0.06, hairMat));
    faceGroup.add(createTubeCurve([new THREE.Vector3(0.4, 0.58, -0.1), new THREE.Vector3(1.05, 0.78, 0.05), new THREE.Vector3(1.6, 0.52, -0.1)], 0.06, hairMat));

    // Arched Eyebrows
    faceGroup.add(createTubeCurve([new THREE.Vector3(-1.6, 0.95, -0.1), new THREE.Vector3(-1.05, 1.15, 0.05), new THREE.Vector3(-0.45, 0.88, -0.1)], 0.06, hairMat));
    faceGroup.add(createTubeCurve([new THREE.Vector3(0.45, 0.88, -0.1), new THREE.Vector3(1.05, 1.15, 0.05), new THREE.Vector3(1.6, 0.95, -0.1)], 0.06, hairMat));

    // Hair Wisps framing the hijab
    const wispMat = new THREE.MeshStandardMaterial({ color: 0x1d1412, roughness: 0.35, metalness: 0.1 });
    bodyGroup.add(createTubeCurve([new THREE.Vector3(-1.4, 25.9, 3.1), new THREE.Vector3(-2.2, 24.9, 3.4), new THREE.Vector3(-2.6, 23.7, 2.7)], 0.05, wispMat));
    bodyGroup.add(createTubeCurve([new THREE.Vector3(1.4, 25.9, 3.1), new THREE.Vector3(2.2, 24.9, 3.4), new THREE.Vector3(2.6, 23.7, 2.7)], 0.05, wispMat));

    // Cheeks blush
    const blushGeo = new THREE.SphereGeometry(0.48, 16, 16);
    blushGeo.scale(1.1, 0.75, 0.1);
    const blushMat = new THREE.MeshBasicMaterial({ color: 0xf43f5e, transparent: true, opacity: 0.28 });
    const blushL = new THREE.Mesh(blushGeo, blushMat); blushL.position.set(-1.3, -0.25, -0.15); faceGroup.add(blushL);
    const blushR = new THREE.Mesh(blushGeo, blushMat); blushR.position.set(1.3, -0.25, -0.15); faceGroup.add(blushR);

    // Lips
    const lipsGeo = new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3([new THREE.Vector3(-0.65, -0.65, -0.1), new THREE.Vector3(0, -0.85, 0.14), new THREE.Vector3(0.65, -0.65, -0.1)]),
      20, 0.12, 8, false
    );
    const lipsMesh = new THREE.Mesh(lipsGeo, new THREE.MeshStandardMaterial({ color: new THREE.Color(avatar.lipsColor), roughness: 0.35 }));
    faceGroup.add(lipsMesh);
    lipsMeshRef.current = lipsMesh;

    // Sculpted Hourglass Torso
    const bodyFormGeo = new THREE.CylinderGeometry(3.0, 4.6, 15, 32, 10);
    const bPos = bodyFormGeo.attributes.position;
    for (let i = 0; i < bPos.count; i++) {
      let x = bPos.getX(i);
      let y = bPos.getY(i);
      let z = bPos.getZ(i);
      const waist = 0.75 + 0.25 * Math.pow((y + 1.0) / 8.5, 2);
      if (y > 2.0) z += Math.sin(((y - 2.0) / 5.5) * Math.PI) * 0.95;
      x *= waist;
      z *= waist;
      bPos.setX(i, x);
      bPos.setZ(i, z);
    }
    bodyFormGeo.computeVertexNormals();
    const bodyFormMesh = new THREE.Mesh(bodyFormGeo, new THREE.MeshStandardMaterial({ color: 0x111115, roughness: 0.55, metalness: 0.1 }));
    bodyFormMesh.position.set(0, 12, 0);
    bodyGroup.add(bodyFormMesh);

    // ----------------------------------------------------
    // ABAYA OUTING GOWN
    // ----------------------------------------------------
    const abayaGroup = new THREE.Group();
    modelGroup.add(abayaGroup);

    const activeAbayaFabric = abaya.fabrics[0] || { sheen: 0.2, drapeFactor: 1.3 };
    const isOrganza = abaya.id === "gown_eliza_organza";
    const isKaftan = abaya.id === "abaya_sorrento_silk";
    const isVelvet = abaya.id === "abaya_royal_velvet";

    const abayaMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(abayaColor.hex),
      roughness: isVelvet ? 0.8 : Math.max(0.05, 1.0 - activeAbayaFabric.sheen),
      metalness: isVelvet ? 0.05 : (activeAbayaFabric.sheen > 0.6 ? 0.35 : 0.0),
      side: THREE.DoubleSide,
      transparent: isOrganza,
      opacity: isOrganza ? 0.82 : 1.0
    });

    const abayaGownGeo = new THREE.CylinderGeometry(4.2, 8.8, 22, 32, 10, true);
    const abayaPos = abayaGownGeo.attributes.position;
    const abayaDrape = activeAbayaFabric.drapeFactor;
    for (let i = 0; i < abayaPos.count; i++) {
      const x = abayaPos.getX(i);
      const y = abayaPos.getY(i);
      const z = abayaPos.getZ(i);
      const hFact = (y - 11) / -22;
      if (hFact > 0) {
        const angle = Math.atan2(z, x);
        const wave = Math.sin(angle * 12) * 0.95 * abayaDrape * hFact;
        abayaPos.setX(i, x + Math.cos(angle) * wave);
        abayaPos.setZ(i, z + Math.sin(angle) * wave);
      }
    }
    abayaGownGeo.computeVertexNormals();
    abayaBasePositionsRef.current = abayaGownGeo.attributes.position.clone() as THREE.BufferAttribute;

    const abayaMesh = new THREE.Mesh(abayaGownGeo, abayaMaterial);
    abayaMesh.position.set(0, 11, 0);
    abayaGroup.add(abayaMesh);
    abayaMeshRef.current = abayaMesh;

    // Sleeves
    const sleeveGeo = isKaftan 
      ? new THREE.CylinderGeometry(1.3, 3.2, 11, 16, 5, true)
      : new THREE.CylinderGeometry(1.4, 1.8, 11, 12);
    
    const leftSleeve = new THREE.Mesh(sleeveGeo.clone(), abayaMaterial);
    leftSleeve.position.set(-5.6, 15.5, 0); leftSleeve.rotation.set(0, 0.2, 0.5);
    abayaGroup.add(leftSleeve);
    abayaLeftSleeveRef.current = leftSleeve;

    const rightSleeve = new THREE.Mesh(sleeveGeo, abayaMaterial);
    rightSleeve.position.set(5.6, 15.5, 0); rightSleeve.rotation.set(0, -0.2, -0.5);
    abayaGroup.add(rightSleeve);
    abayaRightSleeveRef.current = rightSleeve;

    const cuffLeft = new THREE.Group(); cuffLeft.position.set(-2.6, 10.8, 1.1); cuffLeft.rotation.z = 0.5; abayaGroup.add(cuffLeft); cuffLeftRef.current = cuffLeft;
    const cuffRight = new THREE.Group(); cuffRight.position.set(2.6, 10.8, 1.1); cuffRight.rotation.z = -0.5; abayaGroup.add(cuffRight); cuffRightRef.current = cuffRight;

    if (isVelvet) {
      const goldCuffMat = new THREE.MeshStandardMaterial({ color: 0xe1b168, metalness: 0.9, roughness: 0.15 });
      cuffLeft.add(new THREE.Mesh(new THREE.CylinderGeometry(1.85, 1.85, 0.5, 16), goldCuffMat));
      cuffRight.add(new THREE.Mesh(new THREE.CylinderGeometry(1.85, 1.85, 0.5, 16), goldCuffMat));
    }

    // ----------------------------------------------------
    // HIJAB WRAPS
    // ----------------------------------------------------
    const hijabGroup = new THREE.Group();
    modelGroup.add(hijabGroup);

    const activeHijabFabric = hijab.fabrics[0] || { sheen: 0.1, drapeFactor: 1.5 };
    const hijabMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(hijabColor.hex),
      roughness: Math.max(0.1, 1.0 - activeHijabFabric.sheen),
      metalness: activeHijabFabric.sheen > 0.6 ? 0.2 : 0.0,
      side: THREE.DoubleSide,
    });

    const hijabCowlGeo = new THREE.SphereGeometry(3.9, 32, 32);
    const cowlPos = hijabCowlGeo.attributes.position;
    for (let i = 0; i < cowlPos.count; i++) {
      const x = cowlPos.getX(i);
      const y = cowlPos.getY(i);
      const z = cowlPos.getZ(i);
      if (z > 1.2 && y > -1.0 && Math.abs(x) < 2.6) {
        cowlPos.setZ(i, z - 1.2);
        cowlPos.setX(i, x * 0.9);
      }
    }
    hijabCowlGeo.computeVertexNormals();
    const hijabMesh = new THREE.Mesh(hijabCowlGeo, hijabMaterial);
    hijabMesh.position.set(0, 24.85, 0.05);
    hijabGroup.add(hijabMesh);
    hijabMeshRef.current = hijabMesh;

    // Shoulder Shroud
    const shroudGeo = new THREE.CylinderGeometry(2.5, 7.5, 7, 32, 10, true);
    const shroudPos = shroudGeo.attributes.position;
    const hijabDrape = activeHijabFabric.drapeFactor;
    for (let i = 0; i < shroudPos.count; i++) {
      const x = shroudPos.getX(i);
      const y = shroudPos.getY(i);
      const z = shroudPos.getZ(i);
      const hFact = (y - 3.5) / -7;
      if (hFact > 0) {
        const angle = Math.atan2(z, x);
        const wave = Math.sin(angle * 10) * 0.7 * hijabDrape * hFact;
        shroudPos.setX(i, x + Math.cos(angle) * wave);
        shroudPos.setZ(i, z + Math.sin(angle) * wave);
      }
    }
    shroudGeo.computeVertexNormals();
    shroudBasePositionsRef.current = shroudGeo.attributes.position.clone() as THREE.BufferAttribute;

    const hijabShroud = new THREE.Mesh(shroudGeo, hijabMaterial);
    hijabShroud.position.set(0, 20.5, 0);
    hijabGroup.add(hijabShroud);
    hijabShroudRef.current = hijabShroud;

    // Hanging Shawl Panel
    const panelGeo = new THREE.CylinderGeometry(2.0, 3.8, 12, 16, 8, true);
    panelGeo.scale(1.0, 1.0, 0.3);
    const panelPos = panelGeo.attributes.position;
    for (let i = 0; i < panelPos.count; i++) {
      const x = panelPos.getX(i);
      const y = panelPos.getY(i);
      const z = panelPos.getZ(i);
      panelPos.setZ(i, z + Math.sin(x * 2.0) * 0.25 * ((y - 6) / -12));
    }
    panelGeo.computeVertexNormals();
    panelBasePositionsRef.current = panelGeo.attributes.position.clone() as THREE.BufferAttribute;

    const hijabPanel = new THREE.Mesh(panelGeo, hijabMaterial);
    hijabPanel.position.set(-2.5, 14.5, 3.8);
    hijabPanel.rotation.set(0, 0.35, 0.22);
    hijabGroup.add(hijabPanel);
    hijabPanelRef.current = hijabPanel;

    // Optional Niqab
    const niqabGroup = new THREE.Group();
    niqabGroup.position.set(0, 23.9, 3.4);
    hijabGroup.add(niqabGroup);
    niqabGroupRef.current = niqabGroup;

    const mask = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.6, 4, 16, 4, true), hijabMaterial);
    mask.scale.set(1, 1, 0.5); mask.position.set(0, -1.8, 0.2); niqabGroup.add(mask);

    const goldTrimMat = new THREE.MeshStandardMaterial({ color: 0xe1b168, metalness: 0.9, roughness: 0.2 });
    const trim = new THREE.Mesh(new THREE.CylinderGeometry(2.41, 2.41, 0.1, 16, 1, true), goldTrimMat);
    trim.scale.set(1, 1, 0.51); trim.position.set(0, 0.1, 0.2); niqabGroup.add(trim);

    // Golden Pin
    const pinGroup = new THREE.Group();
    pinGroup.position.set(1.8, 20.2, 4.3);
    modelGroup.add(pinGroup);
    pinGroupRef.current = pinGroup;

    const pinStem = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.5, 8), goldTrimMat); pinStem.rotation.z = -0.5; pinGroup.add(pinStem);
    const roseBud = new THREE.Mesh(new THREE.SphereGeometry(0.3, 12, 12), goldTrimMat); roseBud.position.set(0.3, 0.4, 0); pinGroup.add(roseBud);

    // ----------------------------------------------------
    // REALISTIC WIND PHYSICS & ANIMATION LOOP
    // ----------------------------------------------------
    let reqId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      reqId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Dynamic wind waves simulation
      if (abayaMeshRef.current && abayaBasePositionsRef.current) {
        const geom = abayaMeshRef.current.geometry;
        const pos = geom.attributes.position;
        const base = abayaBasePositionsRef.current;
        const count = pos.count;
        for (let i = 0; i < count; i++) {
          const bx = base.getX(i); const by = base.getY(i); const bz = base.getZ(i);
          const hFact = (by - 11) / -22;
          if (hFact > 0.05) {
            const angle = Math.atan2(bz, bx);
            const wind = Math.sin(elapsed * 2.2 + by * 0.25 + angle * 2.5) * 0.14 * hFact;
            const wave = Math.sin(angle * 12) * 0.95 * abayaDrape * hFact + wind;
            pos.setX(i, bx + Math.cos(angle) * wave);
            pos.setZ(i, bz + Math.sin(angle) * wave);
          }
        }
        pos.needsUpdate = true;
        geom.computeVertexNormals();
      }

      if (hijabShroudRef.current && shroudBasePositionsRef.current) {
        const geom = hijabShroudRef.current.geometry;
        const pos = geom.attributes.position;
        const base = shroudBasePositionsRef.current;
        const count = pos.count;
        for (let i = 0; i < count; i++) {
          const bx = base.getX(i); const by = base.getY(i); const bz = base.getZ(i);
          const hFact = (by - 3.5) / -7;
          if (hFact > 0.1) {
            const angle = Math.atan2(bz, bx);
            const breeze = Math.sin(elapsed * 2.8 + by * 0.4 + angle * 3.0) * 0.12 * hFact;
            const wave = Math.sin(angle * 10) * 0.7 * hijabDrape * hFact + breeze;
            pos.setX(i, bx + Math.cos(angle) * wave);
            pos.setZ(i, bz + Math.sin(angle) * wave);
          }
        }
        pos.needsUpdate = true;
        geom.computeVertexNormals();
      }

      if (hijabPanelRef.current && panelBasePositionsRef.current) {
        const geom = hijabPanelRef.current.geometry;
        const pos = geom.attributes.position;
        const base = panelBasePositionsRef.current;
        const count = pos.count;
        for (let i = 0; i < count; i++) {
          const bx = base.getX(i); const by = base.getY(i); const bz = base.getZ(i);
          const wind = Math.sin(elapsed * 2.4 + by * 0.35) * 0.18 * ((by - 6) / -12);
          pos.setZ(i, bz + Math.sin(bx * 2.0) * 0.25 * ((by - 6) / -12) + wind);
        }
        pos.needsUpdate = true;
        geom.computeVertexNormals();
      }

      if (modelGroup) {
        if (autoRotate && !isDragging) {
          modelGroup.rotation.y += 0.005;
        } else {
          modelGroup.rotation.y = THREE.MathUtils.lerp(modelGroup.rotation.y, rotationAngle, 0.15);
        }
        modelGroup.position.y = -6.0 + Math.sin(elapsed * 1.8) * 0.06;
        if (pinGroup && includePin) pinGroup.position.y = 20.2 + Math.sin(elapsed * 2.5) * 0.04;
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight || 500;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(reqId);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
          else obj.material.dispose();
        }
      });
      renderer.dispose();
    };
  }, []);

  // Update complexions
  useEffect(() => {
    const skinColor = new THREE.Color(avatar.faceColor);
    sceneRef.current?.traverse((obj) => {
      if (obj instanceof THREE.Mesh && obj.material && "color" in obj.material) {
        const mat = obj.material as THREE.MeshStandardMaterial;
        if (obj !== headMeshRef.current && mat.color.getHexString() === new THREE.Color(avatar.faceColor).getHexString()) {
          mat.color.copy(skinColor);
        }
      }
    });
    if (headMeshRef.current && headMeshRef.current.material) {
      ((headMeshRef.current.material) as THREE.MeshStandardMaterial).color.copy(skinColor);
    }
    if (lipsMeshRef.current && lipsMeshRef.current.material) {
      ((lipsMeshRef.current.material) as THREE.MeshStandardMaterial).color.copy(new THREE.Color(avatar.lipsColor));
    }
  }, [avatar]);

  // Update Gown colors & drape factor
  useEffect(() => {
    const abayaColorVal = new THREE.Color(abayaColor.hex);
    const activeAbayaFabric = abaya.fabrics[0] || { sheen: 0.2, drapeFactor: 1.3 };
    const roughness = abaya.id === "abaya_royal_velvet" ? 0.8 : Math.max(0.05, 1.0 - activeAbayaFabric.sheen);
    const metalness = abaya.id === "abaya_royal_velvet" ? 0.05 : (activeAbayaFabric.sheen > 0.6 ? 0.35 : 0.0);

    [abayaMeshRef.current, abayaLeftSleeveRef.current, abayaRightSleeveRef.current].forEach((mesh) => {
      if (mesh && mesh.material) {
        const mat = mesh.material as THREE.MeshStandardMaterial;
        mat.color.copy(abayaColorVal);
        mat.roughness = roughness;
        mat.metalness = metalness;
      }
    });
  }, [abaya, abayaColor]);

  // Update Hijab colors & drape factor
  useEffect(() => {
    const hijabColorVal = new THREE.Color(hijabColor.hex);
    const activeHijabFabric = hijab.fabrics[0] || { sheen: 0.1, drapeFactor: 1.5 };
    const roughness = Math.max(0.1, 1.0 - activeHijabFabric.sheen);
    const metalness = activeHijabFabric.sheen > 0.6 ? 0.2 : 0.0;

    [hijabMeshRef.current, hijabShroudRef.current, hijabPanelRef.current].forEach((mesh) => {
      if (mesh && mesh.material) {
        const mat = mesh.material as THREE.MeshStandardMaterial;
        mat.color.copy(hijabColorVal);
        mat.roughness = roughness;
        mat.metalness = metalness;
      }
    });

    if (niqabGroupRef.current) {
      niqabGroupRef.current.traverse((obj) => {
        if (obj instanceof THREE.Mesh && obj.geometry.type !== "CylinderGeometry") {
          if (obj.material) {
            const mat = obj.material as THREE.MeshStandardMaterial;
            mat.color.copy(hijabColorVal);
            mat.roughness = roughness;
            mat.metalness = metalness;
          }
        }
      });
    }
  }, [hijab, hijabColor]);

  useEffect(() => {
    if (modelGroupRef.current) {
      const config = SIZE_SCALES[size];
      modelGroupRef.current.scale.set(config.scaleX, config.scaleY, config.scaleZ);
    }
  }, [size]);

  useEffect(() => {
    if (niqabGroupRef.current) niqabGroupRef.current.visible = niqabEnabled;
  }, [niqabEnabled]);

  useEffect(() => {
    if (pinGroupRef.current) pinGroupRef.current.visible = includePin && viewMode !== "back";
  }, [includePin, viewMode]);

  useEffect(() => {
    const buildCuffs = (group: THREE.Group | null) => {
      if (!group) return;
      while (group.children.length > 0) group.remove(group.children[0]);
      if (sleeveEmbellishment === "classic") return;

      const goldMat = new THREE.MeshStandardMaterial({ color: 0xe1b168, metalness: 0.9, roughness: 0.1 });
      const crystalMat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.2, roughness: 0.1, transparent: true, opacity: 0.8 });
      const laceMat = new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.5, side: THREE.DoubleSide });

      if (sleeveEmbellishment === "royal_gold") {
        group.add(new THREE.Mesh(new THREE.CylinderGeometry(1.65, 1.65, 0.4, 16), goldMat));
      } else if (sleeveEmbellishment === "crystal_sequin") {
        group.add(new THREE.Mesh(new THREE.CylinderGeometry(1.68, 1.68, 0.25, 16), crystalMat));
      } else if (sleeveEmbellishment === "lace_trim") {
        group.add(new THREE.Mesh(new THREE.CylinderGeometry(1.7, 1.9, 0.8, 16, 1, true), laceMat));
      }
    };
    buildCuffs(cuffLeftRef.current);
    buildCuffs(cuffRightRef.current);
  }, [sleeveEmbellishment]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      rotY: modelGroupRef.current ? modelGroupRef.current.rotation.y : 0,
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStartRef.current.x;
    const targetRotation = dragStartRef.current.rotY + deltaX * 0.015;
    setRotationAngle(targetRotation);
    if (modelGroupRef.current) modelGroupRef.current.rotation.y = targetRotation;
  };

  const handleMouseUpOrLeave = () => setIsDragging(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 0) return;
    setIsDragging(true);
    dragStartRef.current = {
      x: e.touches[0].clientX,
      rotY: modelGroupRef.current ? modelGroupRef.current.rotation.y : 0,
    };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length === 0) return;
    const deltaX = e.touches[0].clientX - dragStartRef.current.x;
    const targetRotation = dragStartRef.current.rotY + deltaX * 0.015;
    setRotationAngle(targetRotation);
    if (modelGroupRef.current) modelGroupRef.current.rotation.y = targetRotation;
  };

  return (
    <div className="w-full h-full flex flex-col justify-between relative select-none">
      <div
        ref={mountRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleMouseUpOrLeave}
        className="w-full flex-1 min-h-[360px] cursor-grab active:cursor-grabbing relative overflow-hidden rounded-2xl border-2 border-dashed border-[#E1B168]/20 bg-[#E1B168]/5"
      >
        <div className="absolute top-4 left-4 bg-black/60 border border-white/5 py-1 px-2.5 rounded-xl flex items-center gap-1.5 text-[9px] text-[#E1B168] font-mono pointer-events-none uppercase">
          <Compass size={12} className={autoRotate ? "animate-spin" : ""} />
          <span>Interactive 360° Try-On</span>
        </div>

        {!autoRotate && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30 animate-pulse">
            <span className="text-[10px] text-neutral-400 font-mono tracking-widest uppercase">
              ← Drag horizontally to rotate →
            </span>
          </div>
        )}
      </div>

      <div className="bg-neutral-950/40 border border-white/5 p-2 rounded-xl flex items-center justify-between mt-2">
        <label className="text-[9px] font-mono text-neutral-400 uppercase flex items-center gap-1.5 cursor-pointer">
          <input
            type="checkbox"
            checked={autoRotate}
            onChange={(e) => setAutoRotate(e.target.checked)}
            className="w-3.5 h-3.5 accent-[#E1B168] rounded border-white/10"
          />
          Auto-Spin Model
        </label>

        <button
          onClick={() => {
            setRotationAngle(0);
            if (modelGroupRef.current) modelGroupRef.current.rotation.y = 0;
          }}
          className="text-[9px] font-mono text-neutral-300 hover:text-white flex items-center gap-1 bg-white/5 px-2 py-1 rounded border border-white/5 transition-all"
        >
          <RefreshCw size={9} />
          Reset Camera
        </button>
      </div>
    </div>
  );
}
