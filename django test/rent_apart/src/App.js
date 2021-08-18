import {
  Layout,
  Menu,
  Carousel,
  Row,
  Col,
  Card,
  Spin,
  Select,
  Button,
  Checkbox,
  Slider,
} from "antd";
import {
  DesktopOutlined,
  PieChartOutlined,
  FileOutlined,
  TeamOutlined,
  UserOutlined,
  RightOutlined,
  LeftOutlined,
  CloseSquareOutlined,
} from "@ant-design/icons";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import "./App.css";
import {} from "antd/lib/radio";

const { Header, Content, Sider } = Layout;
const { SubMenu } = Menu;

function App() {
  const [apartBigImg, setApartBigImg] = useState({});
  const [collapsed, setCollapsed] = useState(true);

  const [apartList, setApartList] = useState({ list: [], isLoading: false });

  const onCollapse = () => {
    setCollapsed((prev) => !prev);
  };

  const handleGetApartListClick = () => {
    setApartList((prev) => ({ ...prev, isLoading: true }));
    let params = {
      selectedSections: selectedSections.join(","),
      selectedCity: selectedCity.join(","),
    };
    axios
      .get("http://localhost:8000/rent_apart/", {
        params,
      })
      .then((res) => {
        console.log(res.data);
        setApartList({ list: res.data, isLoading: false });
      });
  };

  const [isCarouselActive, setIsCarouselActive] = useState(false);
  const [currentImgs, setCurrentImgs] = useState({
    list: [],
    isLoading: false,
  });
  const handleCardClick = (apart) => {
    setIsCarouselActive(true);

    console.log(apartBigImg);
    const apartId = apart.id;
    if (apartBigImg[apartId]) {
      setCurrentImgs({ isLoading: false, list: apartBigImg[apartId] });
    } else {
      setCurrentImgs((prev) => ({ ...prev, isLoading: true }));
      console.log("get new big imgs");
      axios
        .get(`http://localhost:8000/rent_apart/apart_detail`, {
          params: { apartDetailUrl: apart.apart_link },
        })
        .then((res) => {
          console.log("got", res);
          setCurrentImgs({ isLoading: false, list: res.data });
          let newImg = {};
          newImg[apartId] = res.data;
          setApartBigImg((prev) => ({ ...prev, ...newImg }));
        });
    }
  };
  const currentImg = useRef();
  const handleSliderChange = (e) => {
    switch (e.target.name) {
      case "prev":
        currentImg.current.prev();
        break;
      case "next":
        currentImg.current.next();
        break;
      default:
        break;
    }
  };

  const useHorizontalScroll = () => {
    const elRef = useRef();
    useEffect(() => {
      const el = elRef.current;
      if (el) {
        const onWheel = (e) => {
          if (e.deltaY === 0) return;
          e.preventDefault();
          el.scrollTo({
            left: el.scrollLeft + e.deltaY,
            behavior: "smooth",
          });
        };
        el.addEventListener("wheel", onWheel);
        return () => el.removeEventListener("wheel", onWheel);
      }
    }, []);
    return elRef;
  };
  const listRef = useHorizontalScroll();

  const sections = [
    { id: "板橋", value: 26 },
    { id: "三重", value: 43 },
    { id: "淡水", value: 50 },
    { id: "中和", value: 38 },
    { id: "永和", value: 37 },
    { id: "新莊", value: 44 },
    { id: "新店", value: 34 },
    { id: "汐止", value: 27 },
    { id: "蘆洲", value: 47 },
    { id: "林口", value: 46 },
    { id: "土城", value: 39 },
    { id: "樹林", value: 41 },
    { id: "五股", value: 48 },
  ];
  const [selectedSections, setSelectedSections] = useState([]);
  const [filteredSectionOptions, setFilteredSectionOptions] =
    useState(sections);
  const handleSectionChange = (selectedOptions) => {
    console.log(selectedOptions);
    setSelectedSections(selectedOptions);
    setFilteredSectionOptions(() =>
      sections.filter((o) => !selectedOptions.includes(o.id))
    );
  };

  const handleListSort = (e) => {
    let { value } = e.currentTarget.attributes["sort-type"];
    let isAsc = value === "ascend" ? 1 : -1;

    setApartList((prev) => ({
      ...prev,
      list: prev.list.sort(
        (a, b) =>
          (parseInt(a.apart_price.split(",").join("")) -
            parseInt(b.apart_price.split(",").join(""))) *
          isAsc
      ),
    }));
  };

  const handleCarouselReset = () => {
    setIsCarouselActive(false);
    setCurrentImgs({ isLoading: false, list: [] });
  };

  const [selectedCity, setSelectedCity] = useState(["1"]);

  const handleCityChange = (selectedOptions) => {
    setSelectedCity(selectedOptions);
  };

  const cityOptions = [
    { label: "台北市", value: "1" },
    { label: "新北市", value: "3" },
  ];

  const [priceRange, setPriceRange] = useState([15000, 25000]);
  const handlePriceRangeChange = (v) => {
    setPriceRange(v);
  };

  const roomOptions = [
    { label: "1房", value: "1" },
    { label: "2房", value: "2" },
    { label: "3房", value: "3" },
    { label: "4房", value: "4" },
    { label: "5房", value: "5" },
  ];
  const [selectedRoomType, setSelectedRoomType] = useState(["1"]);
  const handleRoomOptionChange = (v) => {
    setSelectedRoomType(v);
  };

  const rentedTypeOptions = [
    { label: "整層", value: "1" },
    { label: "套房", value: "2" },
    { label: "分租套房", value: "3" },
  ];
  const [selectedRentedType, setSelectedRentedType] = useState(["1"]);
  const handleRentedTypeOptionChnage = (v) => {
    setSelectedRentedType(v);
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        collapsible
        width={700}
        collapsed={collapsed}
        onCollapse={onCollapse}
      >
        <div className="logo" />
        <Menu theme="dark" defaultSelectedKeys={["1"]} mode="inline">
          <Menu.Item key="1" icon={<PieChartOutlined />}>
            <Checkbox.Group
              options={cityOptions}
              onChange={handleCityChange}
              defaultValue={["1"]}
            />
          </Menu.Item>
          <Menu.Item key="2" icon={<PieChartOutlined />}>
            <Select
              mode="multiple"
              onChange={handleSectionChange}
              style={{ width: "100%" }}
            >
              {filteredSectionOptions.map((section) => (
                <Select.Option key={section.id} value={section.value}>
                  {section.id}
                </Select.Option>
              ))}
            </Select>
          </Menu.Item>
          <Menu.Item key="3" icon={<PieChartOutlined />}>
            <Checkbox.Group
              options={rentedTypeOptions}
              onChange={handleRentedTypeOptionChnage}
              defaultValue={["1"]}
            />
          </Menu.Item>
          <Menu.Item key="4" icon={<PieChartOutlined />}>
            <Checkbox.Group
              options={roomOptions}
              onChange={handleRoomOptionChange}
              defaultValue={["1"]}
            />
          </Menu.Item>
          <Menu.Item key="5" icon={<PieChartOutlined />}>
            <Slider
              range
              defaultValue={priceRange}
              step={1000}
              max={30000}
              min={5000}
              onAfterChange={handlePriceRangeChange}
            />
          </Menu.Item>
        </Menu>
      </Sider>
      <Layout className="site-layout">
        <Header
          className={isCarouselActive ? "main_header active" : "main_header"}
          style={{ padding: 0 }}
        >
          {isCarouselActive && !currentImgs.isLoading ? (
            <>
              <Button
                type="primary"
                name="prev"
                style={{
                  position: "absolute",
                  top: "21%",
                  left: "24%",
                  zIndex: 99999999,
                }}
                onClick={handleSliderChange}
              >
                Prev
              </Button>
              <Carousel className="site-layout-background" ref={currentImg}>
                {currentImgs.list.map((currentImg) => (
                  <div key={currentImg}>
                    <img
                      style={{ margin: "auto" }}
                      alt="example"
                      src={currentImg}
                    />
                  </div>
                ))}
              </Carousel>
              <Button
                type="primary"
                name="next"
                style={{
                  position: "absolute",
                  top: "21%",
                  right: "17%",
                  zIndex: 99999999,
                }}
                onClick={handleSliderChange}
              >
                Next
              </Button>
              <CloseSquareOutlined
                onClick={handleCarouselReset}
                style={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  fontSize: 46,
                  color: "#ebebeb",
                }}
              />
            </>
          ) : currentImgs.isLoading ? (
            <Spin style={{ marginLeft: "48%", marginTop: "7%" }}></Spin>
          ) : (
            ""
          )}
        </Header>
        <Content style={{ margin: "0 16px" }}>
          兩房
          {apartList.list.length > 0 ? (
            <>
              <Button
                onClick={() => {
                  setApartList({ isLoading: false, list: [] });
                }}
              >
                Clear
              </Button>
              <Button onClick={handleListSort} sort-type="ascend">
                價格少至多
              </Button>
              <Button onClick={handleListSort} sort-type="descend">
                價格多至少
              </Button>
            </>
          ) : (
            ""
          )}
          <Row
            wrap={false}
            style={{ overflowX: "scroll", marginTop: 24 }}
            gutter={16}
            ref={listRef}
          >
            {apartList.isLoading ? (
              <Spin />
            ) : apartList.list.length > 0 ? (
              apartList.list.map((apart) => (
                <Col key={apart.id} span={6}>
                  <Card
                    onClick={() => handleCardClick(apart)}
                    style={{ height: "100%" }}
                    hoverable
                    cover={
                      <img
                        alt="example"
                        className="apart_small_img"
                        src={apart.apart_img}
                      />
                    }
                  >
                    <Card.Meta
                      title={apart.room + "|" + apart.apart_price}
                      description={
                        <>
                          <div style={{ height: 75 }}>{apart.apart_title}</div>
                          <hr />
                          {apart.apart_address}
                        </>
                      }
                    />
                  </Card>
                </Col>
              ))
            ) : (
              <Button onClick={handleGetApartListClick}>GET APART</Button>
            )}
          </Row>
        </Content>
      </Layout>
    </Layout>
  );
}

export default App;
