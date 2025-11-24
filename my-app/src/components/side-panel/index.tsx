import {
  ClockCircleOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons";
import { css } from "@emotion/css";
import { Menu, Space, Typography, type MenuProps } from "antd";

import { CUSTOM_COLOURS } from "../../lib/colours";

const styles = {
  sidePanel: css`
    width: 100%;
    height: 100%;
    z-index: 100;
    overflow-y: auto;

    .ant-menu-item,
    .ant-menu-submenu-title {
      width: 100%;
      margin: 0;
      border-radius: 0;
      color: ${CUSTOM_COLOURS.menuItemText};
    }

    .ant-menu-item:not(.ant-menu-item-selected):not(
        .ant-menu-submenu-selected
      ):hover {
      background: ${CUSTOM_COLOURS.menuItemBg};
    }

    .ant-menu-sub .ant-menu-item {
      height: 70px;
      cursor: default;
    }
  `,

  activityLog: css`
    background-color: transparent;
    height: 60px;

    .ant-space-item {
      height: 20px;
    }
  `,

  logTypography: css`
    color: ${CUSTOM_COLOURS.menuItemText};
  `,
};

type MenuItem = Required<MenuProps>["items"][number];
export type ActivityLogEntry = {
  id: number;
  timestamp: string;
  description: string;
};

interface Props {
  onAddCube: () => void;
  onRemoveCube: () => void;
  onClearActivityLog: () => void;
  activityLog: ActivityLogEntry[];
}

const SidePanel = ({
  onAddCube,
  onRemoveCube,
  onClearActivityLog,
  activityLog,
}: Props) => {
  const activityLogChildren: MenuItem[] = activityLog.map((log) => ({
    key: log.id,
    label: (
      <Space className={styles.activityLog} vertical size={0}>
        <Typography.Text
          className={styles.logTypography}
          style={{ fontSize: 11, opacity: 0.75 }}
        >
          {log.timestamp}
        </Typography.Text>
        <Typography.Text className={styles.logTypography}>
          {log.description}
        </Typography.Text>
      </Space>
    ),
  }));

  const items: MenuItem[] = [
    {
      key: "add-cube",
      label: "Add a cube",
      icon: <PlusCircleOutlined />,
      onClick: onAddCube,
    },
    {
      key: "remove-cube",
      label: "Remove a cube",
      icon: <DeleteOutlined />,
      onClick: onRemoveCube,
    },
    {
      key: "clear-activity",
      label: "Clear activity",
      icon: <CloseCircleOutlined />,
      onClick: onClearActivityLog,
    },
    {
      key: "activity-log",
      label: "Activity log",
      icon: <ClockCircleOutlined />,
      children: activityLogChildren,
    },
  ];

  return (
    <Menu
      theme="dark"
      items={items}
      className={styles.sidePanel}
      mode="inline"
      selectedKeys={[]}
    />
  );
};

export default SidePanel;
