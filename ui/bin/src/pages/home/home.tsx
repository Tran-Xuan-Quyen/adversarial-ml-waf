import * as React from "react";
import "./home.scss";
import { Card, Row, Col, Typography } from "antd";

import EChart from "../../components/Chart/EChart";
import LineChart from "../../components/Chart/LineChart";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "../../redux/hook";
import { getStatistic } from "../../redux/reducer/statisticSlice";
import { StatisticResponse } from "../../api";
import { ApiLoadingStatus } from "../../utils/loadingStatus";

const profile = [
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 20 20"
  >
    <circle cx="6" cy="6" r="3" fill="currentColor" />
    <circle cx="14" cy="6" r="3" fill="currentColor" />
    <path
      fill="currentColor"
      d="M14 10c3.31 0 6 1.79 6 4v2h-6v-2c0-1.48-1.21-2.77-3-3.46c.88-.35 1.91-.54 3-.54m-8 0c3.31 0 6 1.79 6 4v2H0v-2c0-2.21 2.69-4 6-4"
    />
  </svg>,
];

const device = [
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
  >
    <g
      fill="none"
      stroke="currentColor"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
    >
      <path stroke-dasharray="6" stroke-dashoffset="6" d="M12 21h5M12 21h-5">
        <animate
          fill="freeze"
          attributeName="stroke-dashoffset"
          dur="0.3s"
          values="6;0"
        />
      </path>
      <path stroke-dasharray="6" stroke-dashoffset="6" d="M12 21v-4">
        <animate
          fill="freeze"
          attributeName="stroke-dashoffset"
          dur="0.3s"
          values="6;0"
        />
      </path>
      <path
        stroke-dasharray="64"
        stroke-dashoffset="64"
        d="M12 17h-9v-12h18v12Z"
      >
        <animate
          fill="freeze"
          attributeName="stroke-dashoffset"
          begin="0.3s"
          dur="0.6s"
          values="64;0"
        />
      </path>
    </g>
  </svg>,
];

const record = [
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
  >
    <g
      fill="none"
      stroke="currentColor"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
    >
      <path d="M3 3v16a2 2 0 0 0 2 2h16" />
      <path d="m19 9l-5 5l-4-4l-3 3" />
    </g>
  </svg>,
];

export const Home: React.FC = () => {
  const dispatch = useAppDispatch();
  const { Title } = Typography;
  const { t } = useTranslation();
  const [count, setCount] = React.useState<any>([]);
  const dataState = useAppSelector((state) => state.statistic);
  const [statistic, setStatistic] = React.useState<StatisticResponse>(
    {} as StatisticResponse
  );
  const [dataArray, setDataArray] = React.useState<any>([]);
  const [userArray, setUserArray] = React.useState<any>([]);
  const [recordArray, setRecordArray] = React.useState<any>([]);

  const countData = (array: any[], type: string) => {
    let result: number = 0;

    for (const item of array) {
      result += item[type];
    }
    return result;
  };

  const dataThisMonth = (array: any, type: string): number => {
    const currentMonth = new Date().getMonth() + 1;
    for (const item of array) {
      if (item.month === currentMonth) return item[type];
    }
    return 0;
  };

  const calculatePercentage = (
    array: any[],
    currentMonth: number,
    countField: string
  ) => {
    let length: number = array.length;
    for (let i = 0; i < length; i++) {
      if (array[i].month === currentMonth) {
        if (array[i][countField] > 0 && !array[i - 1]) {
          return "+100%";
        }
        if (array[i - 1] && array[i - 1][countField] !== array[i][countField]) {
          let result = Math.floor(
            ((array[i][countField] - array[i - 1][countField]) * 100) /
              array[i - 1][countField]
          );
          return result > 0 ? `+${result}%` : `${result}%`;
        }
        return "";
      }
      if (array[i].month === currentMonth - 1 && !array[i + 1]) {
        return "-100%";
      }
    }
  };

  const getPersent = (title: string) => {
    const currentMonth = new Date().getMonth() + 1;
    if (title === "doctors") {
      if (Array.isArray(statistic.doctor_array)) {
        return calculatePercentage(
          statistic.doctor_array,
          currentMonth,
          "doctor_count"
        );
      }
    }

    if (title === "patients") {
      if (Array.isArray(statistic.patient_array)) {
        return calculatePercentage(
          statistic.patient_array,
          currentMonth,
          "patient_count"
        );
      }
    }

    if (title === "devices") {
      if (Array.isArray(statistic.device_array)) {
        return calculatePercentage(
          statistic.device_array,
          currentMonth,
          "device_count"
        );
      }
    }

    if (title === "records") {
      if (Array.isArray(statistic.record_array)) {
        return calculatePercentage(
          statistic.record_array,
          currentMonth,
          "record_count"
        );
      }
    }
  };

  React.useEffect(() => {
    dispatch(getStatistic());
  }, []);

  React.useEffect(() => {
    if (dataState.loadGetStatistic === ApiLoadingStatus.Success) {
      setStatistic(dataState.statistic);

      let records = dataState.statistic.record_array;
      let recordsResult = new Array(12).fill(0);
      for (let i = 0; i < 11; i++) {
        if (records[i])
          recordsResult[records[i].month - 1] = records[i].record_count;
      }
      setRecordArray([
        {
          name: "Số bản ghi",
          data: recordsResult,
          offsetY: 0,
        },
      ]);

      let doctorsData = new Array();
      let doctors = dataState.statistic.doctor_array;
      let doctorsResult = new Array(12).fill(0);
      for (let i = 0; i < 11; i++) {
        if (doctors[i])
          doctorsResult[doctors[i].month - 1] = doctors[i].doctor_count;
      }
      for (let i = 0; i <= 11; i++) {
        let totalDoctors = doctorsResult[i];
        for (let j = 0; j < i; j++) {
          totalDoctors = totalDoctors + doctorsResult[j];
        }
        doctorsData.push(totalDoctors);
      }

      let patientsData = new Array();
      let patients = dataState.statistic.patient_array;
      let patientsResult = new Array(12).fill(0);
      for (let i = 0; i < 11; i++) {
        if (patients[i])
          patientsResult[patients[i].month - 1] = patients[i].patient_count;
      }
      for (let i = 0; i <= 11; i++) {
        let totalPatients = patientsResult[i];
        for (let j = 0; j < i; j++) {
          totalPatients = totalPatients + patientsResult[j];
        }
        patientsData.push(totalPatients);
      }

      setUserArray([
        {
          name: "Bác sĩ",
          data: doctorsData,
          color: "#00D1B2",
        },
        {
          name: "Bệnh nhân",
          data: patientsData,
          color: "#FFA500",
        },
      ]);

      setDataArray([
        {
          Title: countData(dataState.statistic.patient_array, "patient_count"),
          user: "Bệnh nhân",
        },
        {
          Title: countData(dataState.statistic.doctor_array, "doctor_count"),
          user: "Bác sĩ",
        },
        {
          Title: countData(dataState.statistic.device_array, "device_count"),
          user: "Thiết bị",
        },
        {
          Title: countData(dataState.statistic.record_array, "record_count"),
          user: "Bản ghi",
        },
      ]);
    }
  }, [dataState.loadGetStatistic]);

  React.useEffect(() => {
    if (dataState.loadGetStatistic === ApiLoadingStatus.Success) {
      const updatedCount = [
        {
          today: "Bác sĩ",
          title: Array.isArray(statistic.doctor_array)
            ? dataThisMonth(statistic.doctor_array, "doctor_count")
            : 0,
          persent: getPersent("doctors"),
          icon: profile,
          bnb: getPersent("doctors")?.startsWith("-") ? "redtext" : "bnb2",
        },
        {
          today: "Bệnh nhân",
          title: Array.isArray(statistic.patient_array)
            ? dataThisMonth(statistic.patient_array, "patient_count")
            : 0,
          persent: getPersent("patients"),
          icon: profile,
          bnb: getPersent("patients")?.startsWith("-") ? "redtext" : "bnb2",
        },
        {
          today: "Số thiết bị",
          title: Array.isArray(statistic.device_array)
            ? dataThisMonth(statistic.device_array, "device_count")
            : 0,
          persent: getPersent("devices"),
          icon: device,
          bnb: getPersent("devices")?.startsWith("-") ? "redtext" : "bnb2",
        },
        {
          today: "Số bản ghi",
          title: Array.isArray(statistic.record_array)
            ? dataThisMonth(statistic.record_array, "record_count")
            : 0,
          persent: getPersent("records"),
          icon: record,
          bnb: getPersent("records")?.startsWith("-") ? "redtext" : "bnb2",
        },
      ];
      setCount(updatedCount);
    }
  }, [dataState, t]);

  return (
    <>
      <div className="layout-content">
        <Row className="rowgap-vbox" gutter={[24, 0]}>
          {count.map((c: any, index: any) => (
            <Col
              key={index}
              xs={24}
              sm={24}
              md={12}
              lg={6}
              xl={6}
              className="mb-24"
            >
              <Card
                bordered={false}
                className="circlebox"
                size={"small"}
                style={{ marginBottom: "10px", marginTop: "-10px" }}
              >
                <div className="number">
                  <Row align="middle" gutter={[20, 0]}>
                    <Col xs={17} style={{paddingLeft: '15px'}}>
                      <span>{c.today}</span>
                      <Title level={3}>
                        {c.title} <small className={c.bnb}>{c.persent}</small>
                      </Title>
                    </Col>
                    <Col xs={3}>
                      <div className="icon-box">{c.icon}</div>
                    </Col>
                  </Row>
                </div>
              </Card>
            </Col>
          ))}
        </Row>

        <Row gutter={[24, 0]}>
          <Col xs={24} sm={24} md={12} lg={12} xl={10} className="mb-24">
            <Card bordered={false} className="circlebox h-full">
              <EChart userArray={userArray} dataArray={dataArray} />
            </Card>
          </Col>
          <Col xs={24} sm={24} md={12} lg={12} xl={14} className="mb-24">
            <Card bordered={false} className="circlebox h-full">
              <LineChart recordArray={recordArray} />
            </Card>
          </Col>
        </Row>
      </div>
    </>
  );
};
