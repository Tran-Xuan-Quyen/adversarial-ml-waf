import * as React from "react";
import { Modal, Form, DatePicker, TimePicker, Row, Col, Select } from "antd";
import dayjs, { Dayjs } from "dayjs";
import { useTranslation } from "react-i18next";
import "./schedule.scss";
import { useAppDispatch, useAppSelector } from "../../redux/hook";
import { ApiLoadingStatus } from "../../utils/loadingStatus";
import { scheduleType } from "../../constants";
import {
  getAvailableDoctorByScheduleTime,
  resetLoadGetAvailableDoctorByScheduleTime,
} from "../../redux/reducer/scheduleSlice";

const ModalComponent = (props: any, ref: any) => {
  const [form] = Form.useForm();
  const dispatch = useAppDispatch();
  const scheduleState = useAppSelector((state) => state.schedule);
  const [data, setData] = React.useState<any>([]);
  const [isOpen, setIsOpen] = React.useState<boolean>(props.isOpen);
  const [isShow, setIsShow] = React.useState<boolean>(false);
  const [selectedDate, setSelectedDate] = React.useState<Dayjs | null>(null);
  const [selectedTime, setSelectedTime] = React.useState<Dayjs | null>(null);
  const [availableDoctor, setAvailableDoctor] = React.useState<any[]>([]);
  const { t } = useTranslation();

  const handleDateTimeSelection = async (date: Dayjs, time: Dayjs) => {
    if (date && time) {
      const dateTime = dayjs(date).hour(time.hour()).minute(time.minute());
      dispatch(getAvailableDoctorByScheduleTime(dateTime.valueOf() / 1000));
    }
  };

  const handleDateChange = (selectedDate: Dayjs | null) => {
    setSelectedDate(selectedDate);
    setAvailableDoctor([]);
    form.setFieldsValue({
      schedule_start_date: selectedDate,
      doctor_id: null,
    });

    if (selectedTime && selectedDate) {
      handleDateTimeSelection(selectedDate, selectedTime);
    }
  };

  const handleTimeChange = (selectedTime: Dayjs | null) => {
    setSelectedTime(selectedTime);
    setAvailableDoctor([]);
    form.setFieldsValue({
      schedule_session: selectedTime,
      doctor_id: null,
    });

    if (selectedTime && selectedDate) {
      handleDateTimeSelection(selectedDate, selectedTime);
    }
  };

  const handleData = (data: any) => {
    let dataSubmit = { ...data };
    if (dataSubmit.schedule_start_time && dataSubmit.schedule_session) {
      const date = dataSubmit.schedule_start_time;
      const time = dataSubmit.schedule_session;
      const dateTime = dayjs(date).hour(time.hour()).minute(time.minute());
      dataSubmit.schedule_start_time = dateTime.valueOf() / 1000;
      dataSubmit.schedule_end_time =
        dataSubmit.schedule_start_time + Number(1800);
    }
    return dataSubmit;
  };

  const handleSubmit = async (values: any) => {
    const payload = {
      ...handleData(values),
    };
    console.log(payload);
    const res = await props?.submitFunction(payload);
    if (!res?.error) {
      setIsOpen(false);
      form.resetFields();
      setSelectedDate(null);
      setSelectedTime(null);
      setAvailableDoctor([]);
      setIsShow(false);
    }
  };

  React.useEffect(() => {
    if (
      scheduleState.loadGetAvailableDoctorByScheduleTime ===
      ApiLoadingStatus.Success
    ) {
      dispatch(resetLoadGetAvailableDoctorByScheduleTime());
      setAvailableDoctor(scheduleState.doctorState);
      setIsShow(true);
    }
  }, [scheduleState.loadGetAvailableDoctorByScheduleTime]);

  React.useImperativeHandle(ref, () => ({
    open: (data: any) => {
      setIsOpen(true);
      setData(data);
      setIsShow(false);
    },
  }));

  return (
    <Modal
      title={props.title}
      open={isOpen}
      width={480}
      okText="Lưu"
      okType="primary"
      onOk={() => form.submit()}
      cancelText="Hủy bỏ"
      onCancel={() => {
        setData([]);
        setIsOpen(false);
        form.resetFields();
        setIsShow(false);
      }}
    >
      <Form
        form={form}
        onFinish={handleSubmit}
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 14 }}
      >
        <Form.Item
          label="Chọn lịch khám"
          name="schedule_start_time"
          key="schedule_start_time"
          style={{ marginTop: "20px"}}
        >
          <Row gutter={10}>
            <Col span={12}>
              <Form.Item
                name="schedule_start_time"
                style={{ marginBottom: "0px" }}
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn ngày",
                  },
                ]}
              >
                <DatePicker
                  format={"DD/MM/YYYY"}
                  placeholder="Ngày khám"
                  disabledDate={(current) => {
                    const tomorrow = dayjs().add(1, "day");
                    const afterTomorrow = tomorrow.add(1, "day");
                    const twoWeeksFromTomorrow = tomorrow.add(14, "day");
                    return (
                      current &&
                      (current.isBefore(afterTomorrow.startOf("day")) ||
                        current.isAfter(twoWeeksFromTomorrow))
                    );
                  }}
                  onChange={handleDateChange}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="schedule_session"
                style={{ marginBottom: "0px" }}
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn ca",
                  },
                ]}
              >
                <TimePicker
                  format="HH:mm"
                  placeholder="Ca khám"
                  minuteStep={30}
                  disabled={!selectedDate}
                  disabledTime={() => ({
                    disabledHours: () => {
                      let hours = [];
                      for (let i = 0; i < 8; i++) hours.push(i);
                      for (let i = 18; i <= 24; i++) hours.push(i);
                      return hours;
                    },
                  })}
                  onChange={handleTimeChange}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form.Item>

        {isShow && (
          <Form.Item
            label="Chọn bác sĩ"
            name="doctor_id"
            key="doctor_id"
            rules={[
              {
                required: true,
                message: "Vui lòng chọn bác sĩ",
              },
            ]}
            style={{ marginBottom: "0px" }}
          >
            <Select
              options={availableDoctor.map((doctor) => ({
                value: doctor.id,
                label: doctor.username,
              }))}
              placeholder="Chọn bác sĩ"
            />
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
};

export const ModalAddSchWithTime = React.forwardRef(ModalComponent);
