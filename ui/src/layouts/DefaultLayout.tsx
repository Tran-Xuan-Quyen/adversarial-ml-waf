import { Layout, Col, theme } from "antd";
import { HashRouter, useLocation } from "react-router-dom";
import { Nav } from "./nav";
import { Routes } from "./routes";
import { HeaderBar } from "./header";
import "./layout.scss";
import { routeMapping } from "./routes.type";
const { Header, Content } = Layout;

export const DefaultLayout = () => {
  const { pathname } = useLocation();
  const isFullPage: string[] = [
    routeMapping.LoginFailed.url,
    routeMapping.ErrorPage.url,
    routeMapping.Login.url,
  ];
  return (
    <div className="App">
      {isFullPage.includes(pathname) ? (
        <>
          {" "}
          <Routes />{" "}
        </>
      ) : (
        <Layout style={{ height: "100vh" }}>
          <Nav />
          <Layout>
            <Header style={{ backgroundColor: "#f5f5f5" }}>
              <HeaderBar />
            </Header>
            <Layout>
              <Content className="main-content">
                <Col span={22} offset={1} className="children-content">
                  <div className="content content2">
                    <Routes />
                  </div>
                </Col>
              </Content>
            </Layout>
          </Layout>
        </Layout>
      )}
    </div>
  );
};
