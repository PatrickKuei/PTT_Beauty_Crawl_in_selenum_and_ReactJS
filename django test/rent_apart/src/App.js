import { Layout, Menu, Carousel, Row, Col, Card } from "antd";
import {
  DesktopOutlined,
  PieChartOutlined,
  FileOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

const { Header, Content, Sider } = Layout;
const { SubMenu } = Menu;

function App() {
  const [apartList, setApartList] = useState([]);
  const [collapsed, setCollapsed] = useState(false);

  const onCollapse = () => {
    setCollapsed((prev) => !prev);
  };

  useEffect(() => {
    axios.get("http://localhost:8000/rent_apart/").then((res) => {
      console.log(res.data);
      setApartList(res.data);
    });
  }, []);

  const contentStyle = {
    height: "160px",
    color: "#fff",
    lineHeight: "160px",
    textAlign: "center",
    background: "#364d79",
  };
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider collapsible collapsed={collapsed} onCollapse={onCollapse}>
        <div className="logo" />
        <Menu theme="dark" defaultSelectedKeys={["1"]} mode="inline">
          <Menu.Item key="1" icon={<PieChartOutlined />}>
            Option 1
          </Menu.Item>
          <Menu.Item key="2" icon={<DesktopOutlined />}>
            Option 2
          </Menu.Item>
          <SubMenu key="sub1" icon={<UserOutlined />} title="User">
            <Menu.Item key="3">Tom</Menu.Item>
            <Menu.Item key="4">Bill</Menu.Item>
            <Menu.Item key="5">Alex</Menu.Item>
          </SubMenu>
          <SubMenu key="sub2" icon={<TeamOutlined />} title="Team">
            <Menu.Item key="6">Team 1</Menu.Item>
            <Menu.Item key="8">Team 2</Menu.Item>
          </SubMenu>
          <Menu.Item key="9" icon={<FileOutlined />}>
            Files
          </Menu.Item>
        </Menu>
      </Sider>
      <Layout className="site-layout">
        <Header className="main_header" style={{ padding: 0 }}>
          <Carousel className="site-layout-background">
            <div>
              <h3 style={contentStyle}>1</h3>
            </div>
            <div>
              <h3 style={contentStyle}>2</h3>
            </div>
            <div>
              <h3 style={contentStyle}>3</h3>
            </div>
          </Carousel>
        </Header>
        <Content style={{ margin: "0 16px" }}>
          <Row wrap={false} style={{ overflowX: "scroll" }} gutter={16}>
            {apartList.map((apart) => (
              <Col style={{ width: 300 }}>
                <Card
                  style={{ height: "100%" }}
                  hoverable
                  cover={<img alt="example" src={apart.apart_img} />}
                >
                  <Card.Meta
                    title={apart.apart_title}
                    description="www.instagram.com"
                  />
                </Card>
              </Col>
            ))}
          </Row>
        </Content>
      </Layout>
    </Layout>
  );
}

export default App;
