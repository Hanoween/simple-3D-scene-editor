import { css } from "@emotion/css";
import { GUI } from "dat.gui";
import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import {
  AmbientLight,
  BoxGeometry,
  DoubleSide,
  Mesh,
  MeshPhongMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  PointLight,
  Scene,
  Vector3,
  WebGLRenderer,
  type Object3DEventMap,
} from "three";

import {
  initCamera,
  initGUI,
  initLight,
  initPlane,
  initRenderer,
  initScene,
  intersect,
  makeCubeAABB,
} from "./lib/utils";
import { CUSTOM_COLOURS } from "../../lib/colours";

const styles = {
  canvas: css`
    display: block;
    width: 100%;
    height: 100%;
  `,
};

const LOCAL_STORAGE_KEY = "scene-editor-cubes";

type SerializedCube = {
  size: number;
  x: number;
  y: number;
  z: number;
  color: number;
};

// singleton instances
const scene = new Scene();
const ambientLight = new AmbientLight(CUSTOM_COLOURS.ambientLight, 0.5);
const pointLight = new PointLight(CUSTOM_COLOURS.pointLight, 0.5);
const camera = new PerspectiveCamera(45, 1, 0.1, 1000);

export interface SceneHandleRef {
  addCube: () => Vector3;
  removeCube: () => Vector3 | null;
}

interface Props {
  ref: React.RefObject<SceneHandleRef | null>;
}

const SceneEditor = ({ ref }: Props) => {
  const hasRunSaveOnceRef = useRef(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rendererRef = useRef<WebGLRenderer | null>(null);
  const planeRef = useRef<Mesh<
    PlaneGeometry,
    MeshPhongMaterial,
    Object3DEventMap
  > | null>(null);
  const [cubes, setCubes] = useState<Mesh<BoxGeometry, MeshPhongMaterial>[]>(
    []
  );

  const handleAddCube = useCallback((): Vector3 => {
    const renderer = rendererRef.current;
    const plane = planeRef.current;

    if (!renderer || !plane) {
      throw new Error("Error while adding cube.");
    }

    const cubeSize = Math.ceil(Math.random() * 3);
    const cubeGeometry = new BoxGeometry(cubeSize, cubeSize, cubeSize);
    const cubeMaterial = new MeshPhongMaterial({
      color: Math.random() * 0xffffff,
    });
    const cube = new Mesh(cubeGeometry, cubeMaterial);
    cube.castShadow = true;

    // choose a coordinate on the plane to drop off the cube
    const planeCoordinates = plane.geometry.parameters;
    const viableWidthHalf = planeCoordinates.width / 2 - cubeSize / 2; // subtract half of cube length to avoid overflow
    const viableHeightHalf = planeCoordinates.height / 2 - cubeSize / 2;
    const selectedPlaneX = (Math.random() * 2 - 1) * viableWidthHalf;
    const selectedPlaneY = (Math.random() * 2 - 1) * viableHeightHalf;
    const localPoint = new Vector3(selectedPlaneX, selectedPlaneY, 0);

    // coordinate on the plane relative to the canvas
    const worldPoint = plane.localToWorld(localPoint);

    cube.position.copy(worldPoint);
    cube.position.y += cubeSize / 2; // elevate cube to avoid collision with plane

    let cubeY = cube.position.y;
    const cubeHalf = cubeSize / 2;

    // AABB vs AABB intersection
    // source: 3D collision detection on https://developer.mozilla.org
    let changed = true;
    while (changed) {
      changed = false;

      for (const existingCube of cubes) {
        const existingCubeDimension = existingCube.geometry.parameters.width;
        const existingCubeHalf = existingCubeDimension / 2;

        const cubePosition = new Vector3(
          cube.position.x,
          cubeY,
          cube.position.z
        ); // calculate new Y

        const existingBox = makeCubeAABB(
          existingCube.position,
          existingCubeHalf
        );
        const newBox = makeCubeAABB(cubePosition, cubeHalf);

        if (intersect(newBox, existingBox)) {
          // push new cube just above this existing one
          const aboveY = existingBox.maxY + cubeHalf;
          if (aboveY > cubeY) {
            cubeY = aboveY;
            changed = true;
            break;
          }
        }
      }
    }

    cube.position.y = cubeY;
    setCubes((prev) => [...prev, cube]);

    scene.add(cube);
    renderer.render(scene, camera);

    return cube.position;
  }, [cubes]);

  const handleRemoveCube = useCallback((): Vector3 | null => {
    const renderer = rendererRef.current;
    if (!renderer) {
      throw new Error("Error while removing cube.");
    }

    if (cubes.length === 0) {
      return null;
    }

    // find cubes that don't have another cube on top of them
    // this it to ensure that no cube is "flying"
    const removable = cubes.filter((cube) => {
      const cubeSize = cube.geometry.parameters.width;
      const cubeHalf = cubeSize / 2;
      const box = makeCubeAABB(cube.position, cubeHalf);

      const hasCubeAbove = cubes.some((otherCube) => {
        if (otherCube === cube) return false;

        const otherSize = otherCube.geometry.parameters.width;
        const otherHalf = otherSize / 2;
        const otherBox = makeCubeAABB(otherCube.position, otherHalf);

        return (
          intersect(box, otherBox) && otherCube.position.y > cube.position.y
        );
      });

      return !hasCubeAbove;
    });

    // select a random cube among those with no cube on top
    const index = Math.floor(Math.random() * removable.length);
    const cubeToRemove = removable[index];

    scene.remove(cubeToRemove);
    renderer.render(scene, camera);

    setCubes((prevCubes) => prevCubes.filter((cube) => cube !== cubeToRemove));

    return cubeToRemove.position;
  }, [cubes]);

  // attach methods to the ref so we can call functions in parent component
  // allows encapsulation
  useImperativeHandle(ref, () => ({
    addCube: handleAddCube,
    removeCube: handleRemoveCube,
  }));

  // paint the canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = canvas?.parentElement;

    if (canvas && container) {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;

      const gui = new GUI();
      const planeGeometry = new PlaneGeometry(width * 0.015, height * 0.015);
      const plane = new Mesh(
        planeGeometry,
        new MeshPhongMaterial({ color: CUSTOM_COLOURS.plane, side: DoubleSide })
      );
      const renderer = new WebGLRenderer({
        canvas,
        antialias: true,
      });
      rendererRef.current = renderer;
      planeRef.current = plane;

      // initiate attributes of elements that are part of the scene
      initScene(scene);
      initLight(pointLight);
      initCamera(camera);
      initGUI(gui, camera, renderer, scene);
      initPlane(plane);
      initRenderer(renderer, width, height);

      // add elements to the scene
      scene.add(ambientLight);
      scene.add(pointLight);
      scene.add(plane);

      // retrieve cubes from local storage to paint the scene
      const savedCubes = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedCubes) {
        const parsedCubes: SerializedCube[] = JSON.parse(savedCubes);
        const loadedCubes: Mesh<BoxGeometry, MeshPhongMaterial>[] = [];

        for (const cubeData of parsedCubes) {
          const cubeGeometry = new BoxGeometry(
            cubeData.size,
            cubeData.size,
            cubeData.size
          );
          const cubeMaterial = new MeshPhongMaterial({
            color: cubeData.color,
          });

          const cube = new Mesh(cubeGeometry, cubeMaterial);
          cube.castShadow = true;
          cube.position.set(cubeData.x, cubeData.y, cubeData.z);

          scene.add(cube);
          loadedCubes.push(cube);
        }
        setCubes(loadedCubes);
      }

      // paint the scene
      renderer.render(scene, camera);

      // update scene on window resize
      const handleResize = () => {
        const newWidth = container.clientWidth;
        const newHeight = container?.clientHeight;

        camera.aspect = newWidth / newHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(newWidth, newHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        plane.geometry = new PlaneGeometry(newWidth * 0.015, newHeight * 0.015);

        renderer.render(scene, camera);
      };

      handleResize();

      window.addEventListener("resize", handleResize);
      return () => {
        window.removeEventListener("resize", handleResize);
        gui.destroy();
        renderer.dispose();
        scene.clear();
      };
    }
  }, []);

  useEffect(() => {
    // skip first time to avoid overwriting local storage with []
    if (!hasRunSaveOnceRef.current) {
      hasRunSaveOnceRef.current = true;
      return;
    }

    // store each cube in the local storage
    const serialized: SerializedCube[] = cubes.map((cube) => {
      const size = cube.geometry.parameters.width;
      const { x, y, z } = cube.position;
      const color = cube.material.color.getHex();

      return { size, x, y, z, color };
    });

    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(serialized));
  }, [cubes]);

  return <canvas className={styles.canvas} ref={canvasRef} />;
};

export default SceneEditor;
