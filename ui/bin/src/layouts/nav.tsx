import { Layout, theme, Menu } from "antd";
import * as React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getRoutesByRole } from "./routes.type";
import { UserOutlined, HomeOutlined, SettingOutlined, InfoCircleOutlined } from "@ant-design/icons";
import "./nav.scss";
import { useTranslation } from "react-i18next";
import logo from "../assets/logo.png";
import { Context } from "../utils/context";

const { Sider } = Layout;

export const Nav = () => {
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [selectedKey, setSelectedKey] = React.useState<any>("/");
  const { pathname } = useLocation();
  React.useEffect(() => {
    setSelectedKey(pathname);
  }, [pathname]);
  return (
    <Sider width={200} style={{ background: colorBgContainer }}>
      <div className="brand">
        <img alt="ecg healthcare" src={logo} />
      </div>

      <Menu
        mode={"inline"}
        selectedKeys={selectedKey}
        defaultSelectedKeys={["/"]}
        className="menu-sidebar"
      >
        <Menu.Item className="menu-item" key="/" onClick={() => navigate("/")}>
          <span className="menu-item-box-icon">
            <HomeOutlined />
          </span>
          <span>Trang chủ</span>
        </Menu.Item>
        <Menu.Item className="menu-item-header" key="6">
          Quản lý hệ thống
        </Menu.Item>

        {Object.values(getRoutesByRole(Context.role)).map((item: any) => (
          <Menu.Item
            key={item.key}
            className="menu-item"
            onClick={() => navigate(item.url)}
          >
            <span className="menu-item-box-icon">
              <item.icon />
            </span>
            <span>{item.label}</span>
          </Menu.Item>
        ))}
        <Menu.Item className="menu-item-header" key="5">
        Quản lý tài khoản
        </Menu.Item>
        <Menu.Item
          className="menu-item"
          key="/account"
          onClick={() => navigate("/account")}
        >
          <span className="menu-item-box-icon">
            <UserOutlined />
          </span>
          <span>Thông tin tài khoản</span>
        </Menu.Item>
        <Menu.Item
          className="menu-item"
          key="/setting"
          onClick={() => {
            window.location.href = `${Context.aboutUs}`
          }}
        >
          <span className="menu-item-box-icon">
          <InfoCircleOutlined />
          </span>
          <span>Về chúng tôi</span>
        </Menu.Item>
        <Menu.Item
          className="menu-item"
          key="/setting"
          onClick={() => navigate("/")}
        >
          <span className="menu-item-box-icon">
            <SettingOutlined />
          </span>
          <span>Cài đặt</span>
        </Menu.Item>
      </Menu>
    </Sider>
  );
};
