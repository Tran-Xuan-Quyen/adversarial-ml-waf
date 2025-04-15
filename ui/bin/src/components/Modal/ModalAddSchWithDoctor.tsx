import * as React from "react";
import {
  Modal,
  Form,
  DatePicker,
  Input,
  TimePicker,
  Row,
  Col,
  Select,
} from "antd";
import dayjs, { Dayjs } from "dayjs";
import { useTranslation } from "react-i18next";
import "./schedule.scss";
import { useAppDispatch, useAppSelector } from "../../redux/hook";
import { ApiLoadingStatus } from "../../utils/loadingStatus";
import {
  getAvailableScheduleByDoctorId,
  resetLoadGetAvailableScheduleByDoctorId,
} from "../../redux/reducer/scheduleSlice";
import { getAllDoctors } from "../../redux/reducer/userSlice";
import {
  disabledDate,
  disabledTime,
  getBusyHours,
} from "../../utils/dateUtils";
import { scheduleType } from "../../constants";
import { showNotiError } from "../notification";

const ModalComponent = (props: any, ref: any) => {
  const [form] = Form.useForm();
  const dispatch = useAppDispatch();
  const [data, setData] = React.useState<any>([]);
  const doctorState = useAppSelector((state) => state.user);
  const scheduleState = useAppSelector((state) => state.schedule);
  const [isOpen, setIsOpen] = React.useState<boolean>(props.isOpen);
  const [isShow, setIsShow] = React.useState<boolean>(false);
  const [selectedDate, setSelectedDate] = React.useState<Dayjs | null>(null);
  const [doctorDropDown, setDoctorDropDown] = React.useState<any[]>([]);
  const [availableSchedule, setAvailableSchedule] = React.useState<any>([]);

  const { t } = useTranslation();

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
    }
  };

  const handleDoctorSelect = (value: string) => {
    setIsShow(true);
    dispatch(getAvailableScheduleByDoctorId(value));
  };

  React.useEffect(() => {
    if (
      scheduleState.loadGetAvailableScheduleByDoctorId ===
      ApiLoadingStatus.Success
    ) {
      dispatch(resetLoadGetAvailableScheduleByDoctorId());
      setAvailableSchedule(scheduleState.availableSchedule);
    }
    if (
      scheduleState.loadGetAvailableScheduleByDoctorId ===
        ApiLoadingStatus.Failed &&
      scheduleState.errorMessage
    ) {
      showNotiError(scheduleState.errorMessage);
      dispatch(resetLoadGetAvailableScheduleByDoctorId());
      setAvailableSchedule([]);
    }
  }, [scheduleState.loadGetAvailableScheduleByDoctorId]);

  React.useImperativeHandle(ref, () => ({
    open: (data: any) => {
      setIsOpen(true);
      setData(data);
      setIsShow(false);
      dispatch(getAllDoctors());
    },
  }));

  React.useEffect(() => {
    if (doctorState.loadDoctorDataStatus === ApiLoadingStatus.Success) {
      setDoctorDropDown(doctorState.doctorData);
    }
    if (
      doctorState.loadDoctorDataStatus === ApiLoadingStatus.Failed &&
      doctorState.errorMessage
    ) {
      showNotiError(doctorState.errorMessage);
      setDoctorDropDown(doctorState.doctorData);
    }
  }, [doctorState.loadDoctorDataStatus]);

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
      }}
    >
      <Form
        form={form}
        onFinish={handleSubmit}
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 14 }}
      >
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
          style={{ marginTop: "20px" }}
        >
          <Select
            options={doctorDropDown.map((doctor) => ({
              value: doctor.id,
              label: doctor.username,
            }))}
            value={data["doctor_id"]}
            placeholder="Chọn bác sĩ"
            onChange={handleDoctorSelect}
          ></Select>
        </Form.Item>
        {isShow && (
          <>
            <Form.Item
              label="Chọn lịch khám"
              name="schedule_start_time"
              key="schedule_start_time"
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
                      disabledDate={(day) =>
                        disabledDate(day, availableSchedule)
                      }
                      onChange={(date) => {
                        setSelectedDate(date);
                        form.setFieldsValue({
                          schedule_start_time: date,
                        });
                      }}
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
                      disabledTime={() =>
                        disabledTime(
                          getBusyHours(selectedDate, availableSchedule)
                        )
                      }
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Form.Item>
          </>
        )}
      </Form>
    </Modal>
  );
};

export const ModalAddSchWithDoctor = React.forwardRef(ModalComponent);
