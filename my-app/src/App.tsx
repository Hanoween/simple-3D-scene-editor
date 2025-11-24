import { css } from "@emotion/css";
import { Layout } from "antd";
import { useRef } from "react";

import Scene, { type SceneHandleRef } from "./components/scene";
import SidePanel from "./components/side-panel";

const styles = {
  container: css`
    height: 100vh;
    width: 100vw;
  `,
};

function App() {
  const sceneRef = useRef<SceneHandleRef | null>(null);

  const handleAddCube = () => {
    sceneRef.current?.addCube();
  };

  return (
    <Layout className={styles.container}>
      <Layout.Sider width={180}>
        <SidePanel onAddCube={handleAddCube} />
      </Layout.Sider>
      <Layout.Content>
        <Scene ref={sceneRef} />
      </Layout.Content>
    </Layout>
  );
}

export default App;
