import React, { useEffect, useRef, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  CategoryScale,
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
} from "chart.js";
import zoomPlugin from "chartjs-plugin-zoom";
import { Button } from "antd";
import { useAppSelector } from "../../redux/hook";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  zoomPlugin,
  Tooltip
);

const totalPointsArray = (length: number) => Array.from(Array(length).keys());

const colorArray = [
  "rgb(242, 93, 101)",
  "rgb(49, 145, 255)",
  "rgb(77, 219, 154)",
];

const borderColorArray = [
  "rgb(242, 93, 101)",
  "rgb(49, 145, 255)",
  "rgb(77, 219, 154)",
];

interface DataPoint {
  value: number;
  warning?: number;
}

interface RawData {
  [key: string]: {
    data: DataPoint[];
  };
}

interface LineChartProps {
  rawData: RawData | null;
}

const LineChart: React.FC<LineChartProps> = ({ rawData }) => {
  const chartRef = useRef<any>(null);
  const recordState = useAppSelector((state) => state.record);
  const [yScale, setYScale] = useState<Record<string, any>>({});
  const [datasets, setDataSets] = useState<any[]>([]);

  const handleResetZoom = () => {
    if (chartRef && chartRef.current) {
      chartRef.current.resetZoom();
    }
  };

  const pointColor = (
    data: DataPoint[] | undefined,
    baseColor: string
  ): string[] => {
    if (!data) return [];
    return data.map((item) => (item?.warning === 1 ? "red" : baseColor));
  };

  const handleDataValue = (data: DataPoint[]): number[] => {
    return data.map((item) => item?.value);
  };

  useEffect(() => {
    if (rawData) {
      const label = Object.keys(rawData)
        .map((key, index) => {
          const data = rawData[key]?.data;
          if (!data) return null;

          const pointColorChart = pointColor(data, colorArray[index]);

          return {
            label: key,
            data: handleDataValue(data),
            borderColor: borderColorArray[index],
            pointBorderColor: pointColorChart,
            backgroundColor: pointColorChart,
            yAxisID: key,
            stepped: false,
          };
        })
        .filter(Boolean);

      setDataSets(label);

      const scale: Record<string, any> = {};
      Object.keys(rawData).forEach((key) => {
        if (rawData[key]?.data) {
          scale[key] = {
            title: {
              display: true,
              text: key,
            },
            position: "left",
            stack: "demo",
            stackWeight: 1,
            fixedrange: true,
          };
        }
      });

      setYScale(scale);
    } else {
      setDataSets([]);
      setYScale({});
    }
  }, [rawData]);

  const dataChart = {
    labels: totalPointsArray(recordState.samples),
    datasets,
  };

  const optionChart = {
    plugins: {
      title: {
        display: true,
        text: "Đồ thị chỉ số tim mạch",
        font: {
          size: 14,
        },
        padding: {
          bottom: 10,
        },
      },
      tooltip: {
        enabled: true,
      },
      zoom: {
        zoom: {
          wheel: {
            enabled: true,
          },
          pinch: {
            enabled: true,
          },
          mode: "x" as "x" | "y" | "xy",
        },
        pan: {
          enabled: true,
          mode: "x" as "x" | "y" | "xy",
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Số mẫu",
        },
        max: recordState.samples,
      },
      ...yScale,
    },
    elements: {
      point: {
        radius: 0,
      },
    },
    responsive: true,
    animation: {
      duration: 1000,
      easing: "easeOutQuart" as any,
    },
  };

  return (
    <>
      <Button
        size="small"
        style={{ marginTop: "10px" }}
        onClick={handleResetZoom}
      >
        Reset zoom
      </Button>
      <Line ref={chartRef} data={dataChart} options={optionChart} />
    </>
  );
};

export default LineChart;
