import { css } from "@emotion/css";
import { Layout } from "antd";
import { useRef, useState } from "react";

import Scene, { type SceneHandleRef } from "./components/scene";
import SidePanel, { type ActivityLogEntry } from "./components/side-panel";

const styles = {
  container: css`
    height: 100vh;
    width: 100vw;
  `,
};

function App() {
  const sceneRef = useRef<SceneHandleRef | null>(null);
  const [activityLog, setActivityLog] = useState<ActivityLogEntry[]>([]);

  const addLogEntry = (description: string) => {
    const entry: ActivityLogEntry = {
      id: Date.now(),
      timestamp: new Date().toLocaleString(),
      description,
    };

    setActivityLog((prev) => [entry, ...prev]);
  };

  const handleAddCube = () => {
    const position = sceneRef.current?.addCube();

    if (!position) {
      throw new Error("Position undefined");
    }

    addLogEntry(
      `Added a cube at (${position.x.toFixed(2)}, ${position.y.toFixed(
        2
      )}, ${position.z.toFixed(2)})`
    );
  };

  const handleRemoveCube = () => {
    const position = sceneRef.current?.removeCube();

    if (position === undefined) {
      throw new Error("Position undefined");
    }
    if (position) {
      addLogEntry(
        `Removed a cube at (${position.x.toFixed(2)}, ${position.y.toFixed(
          2
        )}, ${position.z.toFixed(2)})`
      );
    }
  };

  const handleClearActivityLog = () => {
    setActivityLog([]);
  };

  return (
    <Layout className={styles.container}>
      <Layout.Sider width={340}>
        <SidePanel
          onAddCube={handleAddCube}
          onRemoveCube={handleRemoveCube}
          onClearActivityLog={handleClearActivityLog}
          activityLog={activityLog}
        />
      </Layout.Sider>
      <Layout.Content>
        <Scene ref={sceneRef} />
      </Layout.Content>
    </Layout>
  );
}

export default App;
