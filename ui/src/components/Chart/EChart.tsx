import ReactApexChart from "react-apexcharts";
import { Row, Col, Typography } from "antd";
import eChart from "./configs/eChart";
import "./chart.scss";
import { useTranslation } from "react-i18next";

interface EChartProps {
  userArray: any[];
  dataArray: any[];
}

function EChart({ userArray, dataArray }: EChartProps) {
  const { Title, Paragraph } = Typography;
  return (
    <>
      <div id="chart">
        <ReactApexChart
          className="bar-chart"
          options={eChart.options}
          series={userArray}
          type="bar"
          height={220}
          width="400px"
        />
      </div>
      <div className="chart-vistior">
        <Title level={5}>Số lượng người dùng trong hệ thống</Title>
        <Paragraph className="lastweek">
          Biểu đồ thể hiện số lượng người dùng trong hệ thống (gồm bác sĩ và
          bệnh nhân) theo từng tháng
        </Paragraph>
        <Row>
          {dataArray.map((v, index) => (
            <Col xs={6} xl={6} sm={6} md={6} key={index}>
              <div className="chart-visitor-count">
                <Title level={4}>{v.Title}</Title>
                <span>{v.user}</span>
              </div>
            </Col>
          ))}
        </Row>
      </div>
    </>
  );
}

export default EChart;
