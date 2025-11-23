import { css } from "@emotion/css";
import { GUI } from "dat.gui";
import { useEffect, useRef } from "react";
import {
  AmbientLight,
  BoxGeometry,
  DoubleSide,
  Mesh,
  MeshLambertMaterial,
  MeshPhongMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  PointLight,
  Scene,
  WebGLRenderer,
} from "three";

import {
  initCamera,
  initGUI,
  initLight,
  initPlane,
  initRenderer,
  initScene,
} from "./lib/utils";
import { CUSTOM_COLOURS } from "../../lib/colours";

const styles = {
  canvas: css`
    position: block;
    width: 100vw;
    height: 100vh;
  `,
};

const SceneEditor = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const width = window.innerWidth;
  const height = window.innerHeight;

  const scene = new Scene();
  const ambientLight = new AmbientLight(CUSTOM_COLOURS.ambientLight, 0.5);
  const pointLight = new PointLight(CUSTOM_COLOURS.pointLight, 0.5);
  const gui = new GUI();
  const camera = new PerspectiveCamera(45, width / height, 0.1, 1000);
  const planeGeometry = new PlaneGeometry(22, 22);
  const plane = new Mesh(
    planeGeometry,
    new MeshPhongMaterial({ color: CUSTOM_COLOURS.plane, side: DoubleSide })
  );

  useEffect(() => {
    if (canvasRef.current) {
      const renderer = new WebGLRenderer({
        canvas: canvasRef.current,
        antialias: true,
      });

      // initiate attributes of elements that are part of the scene
      initScene(scene);
      initLight(pointLight);
      initCamera(camera);
      initGUI(gui, camera);
      initPlane(plane);
      initRenderer(renderer, width, height);

      // add elements to the scene
      scene.add(ambientLight);
      scene.add(pointLight);
      scene.add(plane);

      // paint the scene
      renderer.render(scene, camera);

      // update scene on window resize
      const handleResize = () => {
        const newWidth = window.innerWidth;
        const newHeight = window.innerHeight;

        camera.aspect = newWidth / newHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(newWidth, newHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.render(scene, camera);
      };

      window.addEventListener("resize", handleResize);
      return () => {
        window.removeEventListener("resize", handleResize);
        gui.destroy();
        renderer.dispose();
      };
    }
  }, []);

  return <canvas className={styles.canvas} ref={canvasRef} />;
};

export default SceneEditor;
