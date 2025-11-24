import type { GUI } from "dat.gui";
import {
  Color,
  Mesh,
  MeshPhongMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  WebGLRenderer,
  type Object3DEventMap,
  type PointLight,
  type Scene,
} from "three";

import { CUSTOM_COLOURS } from "../../../lib/colours";

export const initScene = (scene: Scene<Object3DEventMap>) => {
  scene.background = new Color(CUSTOM_COLOURS.scene);
};

export const initLight = (light: PointLight) => {
  light.position.set(-10, 10, -10);
  light.castShadow = true;
  light.shadow.mapSize.width = 1024;
  light.shadow.mapSize.height = 1024;
  light.shadow.camera.near = 0.1;
  light.shadow.camera.far = 1000;
};

export const initCamera = (camera: PerspectiveCamera) => {
  camera.position.set(0, 10, 40);
  camera.lookAt(0, 0, 0);
};

export const initGUI = (gui: GUI, camera: PerspectiveCamera) => {
  gui.add(camera.position, "z", 10, 200, 1).name("Proximity");
  gui.domElement.style.zIndex = '100';
};

export const initPlane = (
  plane: Mesh<PlaneGeometry, MeshPhongMaterial, Object3DEventMap>
) => {
  plane.rotation.set(-Math.PI / 2.1, 0, 0);
  plane.position.y = -5.75;
  plane.receiveShadow = true;
};

export const initRenderer = (
  renderer: WebGLRenderer,
  width: number,
  height: number
) => {
  renderer.setSize(width, height);
  renderer.shadowMap.enabled = true;
};
