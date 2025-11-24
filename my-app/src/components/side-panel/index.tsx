import { DeleteOutlined, PlusCircleOutlined } from "@ant-design/icons";
import { css } from "@emotion/css";
import { Menu, type MenuProps } from "antd";

import { CUSTOM_COLOURS } from "../../lib/colours";

const styles = {
  sidePanel: css`
    width: 100%;
    height: 100%;
    z-index: 100;

    .ant-menu-item {
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
  `,
};

type MenuItem = Required<MenuProps>["items"][number];

interface Props {
  onAddCube: () => void;
  onRemoveCube: () => void;
}

const SidePanel = ({ onAddCube, onRemoveCube }: Props) => {
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
