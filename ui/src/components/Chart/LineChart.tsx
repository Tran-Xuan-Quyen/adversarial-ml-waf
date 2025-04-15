import ReactApexChart from "react-apexcharts";
import { Typography } from "antd";
import lineChart from "./configs/lineChart";

interface LineChartProps {
  recordArray: any[];
}

const LineChart = ({ recordArray }: LineChartProps) => {
  const { Title } = Typography;
  
  return (
    <>
      <div className="linechart">
        <div>
          <Title level={5}>Số lượng bản ghi mới theo từng tháng</Title>
        </div>
      </div>
      <ReactApexChart
        className="full-width"
        options={lineChart.options}
        series={recordArray}
        type="area"
        height={350}
        width={"600px"}
      />
    </>
  );
};

export default LineChart;
