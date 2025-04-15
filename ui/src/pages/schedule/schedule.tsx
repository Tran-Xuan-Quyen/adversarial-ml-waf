import * as React from "react";
import type { CalendarProps } from "antd";
import { Badge, Button, Calendar, ConfigProvider } from "antd";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import viVN from "antd/lib/locale/vi_VN";
import {
  createScheduleByPatient,
  getAllSchedules,
  getScheduleByDoctorId,
  getScheduleByPatientId,
  resetLoadCreateScheduleByDoctorStatus,
  resetLoadCreateScheduleByPatientStatus,
  setClickedNotificationDate,
} from "../../redux/reducer/scheduleSlice";
import { useAppDispatch, useAppSelector } from "../../redux/hook";
import { ApiLoadingStatus } from "../../utils/loadingStatus";
import { checkDateTypeKey } from "../../utils/dateUtils";
import { ScheduleModal } from "../../components/Modal/ScheduleModal";
import {
  convertScheduleStatusToString,
  scheduleType,
  userRole,
} from "../../constants";
import { SelectInfo } from "antd/es/calendar/generateCalendar";
import { NotificationRequest } from "../../api";
import { PlusOutlined } from "@ant-design/icons";
import { ModalAddSchWithDoctor } from "../../components/Modal/ModalAddSchWithDoctor";
import { Context } from "../../utils/context";
import { ModalAddSchWithTime } from "../../components/Modal/ModalAddSchWithTime";
import { showNotiError, showNotiSuccess } from "../../components/notification";
import { createNotification } from "../../redux/reducer/notificationScheduleSlice";

type AddSchedule = {
  open: (data: any[]) => void;
};

export const Schedule: React.FC = () => {
  const dispatch = useAppDispatch();
  const dataState = useAppSelector((state) => state.schedule);
  const [isOpen, setIsOpen] = React.useState<boolean>(false);
  const [selectedDate, setSelectedDate] = React.useState<Dayjs | null>(null);
  const [data, setData] = React.useState<any[]>([]);
  const modalAddSchWithDoctorRef = React.useRef<AddSchedule>(null);
  const modalAddSchWithTimeRef = React.useRef<AddSchedule>(null);

  const columns = [
    {
      title: "Thông tin chẩn đoán",
      dataIndex: "information",
      key: "information",
      type: "text",
      isEdit: true,
    },
    {
      title: "Lịch tái khám",
      dataIndex: "schedule_start_time",
      key: "schedule_start_time",
      type: "date",
      isEdit: true,
    },
    {
      title: "Loại lịch tái khám",
      dataIndex: "schedule_type_id",
      key: "schedule_type_id",
      type: "select",
      dataSelect: scheduleType,
      isEdit: true,
    },
  ];

  React.useEffect(() => {
    if (Context.role === userRole.admin) {
      dispatch(getAllSchedules());
    }
    if (Context.role === userRole.doctor) {
      dispatch(getScheduleByDoctorId());
    }
    if (Context.role === userRole.patient) {
      dispatch(getScheduleByPatientId());
    }
  }, []);

  React.useEffect(() => {
    if (dataState.loadDataStatus === ApiLoadingStatus.Success) {
      const rawData = dataState.data.map((schedule) => handleData(schedule));
      setData(rawData);
    }
    if (
      dataState.loadDataStatus === ApiLoadingStatus.Failed &&
      dataState.errorMessage
    ) {
      setData([]);
    }
  }, [dataState]);

  React.useEffect(() => {
    if (dataState.clickedNotificationDate) {
      setSelectedDate(dataState.clickedNotificationDate as Dayjs);
      setIsOpen(true);
      dispatch(setClickedNotificationDate(null));
    }
  }, [dataState.clickedNotificationDate]);

  const handleData = (data: any) => {
    const scheduleData = { ...data };
    Object.keys(data).forEach((key) => {
      if (checkDateTypeKey(key)) {
        const dateObj = dayjs.unix(data[key]);
        scheduleData[key] = dateObj.format("HH:mm MM/DD/YYYY");
        scheduleData.date = dateObj.date();
        scheduleData.month = dateObj.month();
        scheduleData.year = dateObj.year();
        scheduleData.time = Number(dateObj.format("HHmm"));
      }
    });
    return scheduleData;
  };

  const getListData = (value: Dayjs) => {
    const result = value
      ? data
          .filter(
            (item) =>
              item.date === value.date() &&
              item.month === value.month() &&
              item.year === value.year()
          )
          .map((schedule) => ({
            type: schedule.status_id,
            schedule_id: schedule.id,
            session_string: `Từ ${dayjs(schedule.schedule_start_time).format(
              "HH:mm"
            )} đến ${dayjs(schedule.schedule_end_time).format("HH:mm")}`,
            start_time: dayjs(schedule.schedule_start_time).format("HH:mm"),
            end_time: dayjs(schedule.schedule_end_time).format("HH:mm"),
            time: Number(dayjs(schedule.schedule_start_time).format("HHmm")),
            doctor: schedule.doctor_name,
            patient: schedule.patient_name,
            status: convertScheduleStatusToString(schedule.status_id),
            result: schedule.schedule_result,
            doctor_id: schedule.doctor_id,
            patient_id: schedule.patient_id,
            schedule_start_time: dayjs(
              schedule.schedule_start_time,
              "HH:mm MM/DD/YYYY"
            ).unix(),
          }))
      : [];
    return result.sort((a, b) => a.time - b.time);
  };

  const dateCellRender = (value: Dayjs) => {
    const listData = getListData(value);

    if (listData.length === 0) {
      return null;
    }

    const count = {
      morning: 0,
      afternoon: 0,
      evening: 0,
    };

    let checkWarningSchedule: Array<boolean> = [false, false, false];
    listData.forEach((item) => {
      const time = item.time;
      if (time < 1200) {
        count.morning++;
        if (item.result === 5) checkWarningSchedule[0] = true;
      } else if (time >= 1200 && time < 1900) {
        count.afternoon++;
        if (item.result === 5) checkWarningSchedule[1] = true;
      } else {
        count.evening++;
        if (item.result === 5) checkWarningSchedule[2] = true;
      }
    });

    return (
      <ul className="events">
        <Badge
          color={"orange"}
          text={
            <span
              style={
                checkWarningSchedule[0]
                  ? { color: "#E53935", fontWeight: "bold" }
                  : {}
              }
            >
              Số ca sáng: {count.morning} {checkWarningSchedule[0] ? "!!!" : ""}
            </span>
          }
        />
        <Badge
          color={"green"}
          text={
            <span
              style={
                checkWarningSchedule[1]
                  ? { color: "#E53935", fontWeight: "bold" }
                  : {}
              }
            >
              Số ca chiều: {count.afternoon}{" "}
              {checkWarningSchedule[1] ? "!!!" : ""}
            </span>
          }
        />
        <Badge
          color={"purple"}
          text={
            <span
              style={
                checkWarningSchedule[2]
                  ? { color: "#E53935", fontWeight: "bold" }
                  : {}
              }
            >
              Số ca tối: {count.evening} {checkWarningSchedule[2] ? "!!!" : ""}
            </span>
          }
        />
      </ul>
    );
  };

  const cellRender: CalendarProps<Dayjs>["cellRender"] = (current, info) => {
    if (info.type === "date") return dateCellRender(current);
    return info.originNode;
  };

  const onDateSelect = (value: Dayjs, selectInfo: SelectInfo) => {
    if (selectInfo.source === "date") {
      setSelectedDate(value);
      setIsOpen(true);
      if (Context.role === userRole.doctor) dispatch(getScheduleByDoctorId());
      if (Context.role === userRole.patient) dispatch(getScheduleByPatientId());
    }
  };

  const handleSubmitAddScheduleFunction = (data: any) => {
    dispatch(createScheduleByPatient(data));
    dispatch(
      createNotification({
        ...data,
        status: 2,
      } as NotificationRequest)
    );
  };

  React.useEffect(() => {
    if (
      dataState.loadCreateScheduleByDoctorStatus === ApiLoadingStatus.Success
    ) {
      showNotiSuccess("Bạn đã tạo lịch khám thành công");
      dispatch(resetLoadCreateScheduleByDoctorStatus());
      dispatch(getScheduleByDoctorId());
    }
    if (
      dataState.loadCreateScheduleByDoctorStatus === ApiLoadingStatus.Failed &&
      dataState.errorMessage
    ) {
      showNotiError(dataState.errorMessage);
      dispatch(resetLoadCreateScheduleByDoctorStatus());
    }
  }, [dataState.loadCreateScheduleByDoctorStatus]);

  React.useEffect(() => {
    if (
      dataState.loadCreateScheduleByPatientStatus === ApiLoadingStatus.Success
    ) {
      showNotiSuccess("Bạn đã đặt lịch khám thành công");
      dispatch(resetLoadCreateScheduleByPatientStatus());
      dispatch(getScheduleByPatientId());
    }
    if (
      dataState.loadCreateScheduleByPatientStatus === ApiLoadingStatus.Failed &&
      dataState.errorMessage
    ) {
      showNotiError(dataState.errorMessage);
      dispatch(resetLoadCreateScheduleByPatientStatus());
    }
  }, [dataState.loadCreateScheduleByPatientStatus]);

  return (
    <>
      {Context.role === userRole.patient && (
        <>
          {" "}
          <Button
            icon={<PlusOutlined />}
            onClick={() => modalAddSchWithDoctorRef.current?.open({} as any)}
            style={{ marginRight: "8px" }}
          >
            Đặt lịch khám theo bác sĩ
          </Button>
          <Button
            icon={<PlusOutlined />}
            onClick={() => modalAddSchWithTimeRef.current?.open({} as any)}
          >
            Đặt lịch khám theo thời gian
          </Button>{" "}
        </>
      )}
      <ConfigProvider locale={viVN}>
        <Calendar cellRender={cellRender} onSelect={onDateSelect} />
        <ScheduleModal
          title={`Lịch khám ngày ${selectedDate?.format("DD-MM-YYYY")}`}
          isOpen={isOpen}
          selectedDate={selectedDate}
          data={data}
          getListData={getListData}
          columns={columns}
          onClose={() => setIsOpen(false)}
        />
      </ConfigProvider>
      <ModalAddSchWithDoctor
        ref={modalAddSchWithDoctorRef}
        title="Đặt lịch theo bác sĩ"
        submitFunction={(data: any) => handleSubmitAddScheduleFunction(data)}
      ></ModalAddSchWithDoctor>
      <ModalAddSchWithTime
        ref={modalAddSchWithTimeRef}
        title="Đặt lịch theo thời gian"
        submitFunction={(data: any) => handleSubmitAddScheduleFunction(data)}
      ></ModalAddSchWithTime>
    </>
  );
};
