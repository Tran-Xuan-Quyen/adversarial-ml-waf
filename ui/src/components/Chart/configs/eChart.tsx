import { ApexOptions } from "apexcharts";

const eChart = {
  options: {
    chart: {
      type: "bar",
      width: "100%",
      height: "auto",
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "70%",
        borderRadius: 5,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 1,
      colors: ["transparent"],
    },
    grid: {
      show: true,
      borderColor: "#ccc",
      strokeDashArray: 2,
    },
    xaxis: {
      categories: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
      labels: {
        show: true,
        align: "center",
        style: {
          colors: "#fff",
        },
      },
    },
    yaxis: {
      labels: {
        show: true,
        align: "right",
        style: {
          colors: "#fff",
        },
      },
    },
    tooltip: {
      y: {
        formatter: function (val: number) {
          return `${val}`;
        },
      },
    },
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "center",
      floating: true,
      labels: {
        colors: "#fff",
      },
    },
  } as ApexOptions,
};

export default eChart;
