import * as React from "react";
import { Modal, Form, DatePicker, Select, Row, Col, Input } from "antd";
import dayjs from "dayjs";
import {
  getUserById,
  resetLoadGetUserByIdStatus,
} from "../../redux/reducer/userSlice";
import { useAppDispatch, useAppSelector } from "../../redux/hook";
import { ApiLoadingStatus } from "../../utils/loadingStatus";

const ModalAssign = (props: any, ref: any) => {
  const dispatch = useAppDispatch();
  const userState = useAppSelector((state) => state.user);
  const [form] = Form.useForm();
  const [isOpen, setIsOpen] = React.useState<boolean>(false);
  const [data, setData] = React.useState<any>({});
  const [user, setUser] = React.useState<any>({});

  const handleSubmit = async (values: any) => {
    console.log(values);
    const formattedValues = {
      ...values,
      id: data.id,
      status_id: user.role_id === 1 ? 2 : 1,
      start_time:
        user.role_id !== 1 ? dayjs(values.start_time).valueOf() / 1000 : null,
      end_time:
        user.role_id !== 1 ? dayjs(values.end_time).valueOf() / 1000 : null,
    };
    const response = await props?.submitFunction(formattedValues);
    if (!response?.error) {
      setIsOpen(false);
    }
  };

  React.useImperativeHandle(ref, () => ({
    open: (data: any) => {
      console.log(data);
      setIsOpen(true);
      dispatch(getUserById(data.user_id));
      setData(data);
      const now = dayjs();
      form.setFieldsValue({
        ...data,
        user_id: null,
        start_time: now,
        end_time: now.add(1, "day"),
      });
    },
  }));

  React.useEffect(() => {
    if (userState.loadGetUserByIdStatus == ApiLoadingStatus.Success) {
      setUser(userState.userData);
      dispatch(resetLoadGetUserByIdStatus());
    }
  }, [userState.loadGetUserByIdStatus]);
  const validateMessages = {
    required: "Đây là trường bắt buộc",
  };

  return (
    <Modal
      title={props.title}
      width={"420px"}
      open={isOpen}
      onOk={() => form.submit()}
      onCancel={() => {
        setIsOpen(false);
        form.resetFields();
      }}
      okText="Phân công"
      cancelText="Hủy"
    >
      <Form
        form={form}
        layout="vertical"
        validateMessages={validateMessages}
        onFinish={handleSubmit}
      >
        <Form.Item
          label="Tên thiết bị"
          name="device_name"
          style={{ marginTop: "20px", marginBottom: "8px" }}
        >
          <Input placeholder="Tên thiết bị" disabled />
        </Form.Item>
        <Form.Item
          label="Người phụ trách"
          name="user_id"
          style={{ marginBottom: "8px" }}
          rules={[{ required: true }]}
        >
          <Select
            options={props.userOptions || []}
            placeholder="Vui lòng chọn người dùng"
            onChange={(value) => {
              const selectedUser = props.userOptions.find(
                (user: any) => user.value === value
              );
              dispatch(getUserById(selectedUser.value));
            }}
          />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Thời gian bắt đầu"
              name="start_time"
              rules={[{ required: true }]}
              style={{ marginBottom: "8px" }}
            >
              <DatePicker
                showTime
                format="DD/MM/YYYY HH:mm"
                placeholder="Thời gian bắt đầu"
                disabledDate={(currentDate) => {
                  return currentDate && currentDate.isBefore(dayjs(), "day");
                }}
                disabledTime={() => {
                  return {
                    disabledHours: () => {
                      let array = [];
                      for (let i = 0; i < 9; i++) array.push(i);
                      for (let i = 21; i < 24; i++) array.push(i);
                      return array;
                    },
                  };
                }}
                onChange={(value) => {
                  const endTime = form.getFieldValue("end_time");
                  if (!endTime || dayjs(value).isAfter(dayjs(endTime))) {
                    form.setFieldsValue({ end_time: value });
                  }
                }}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Thời gian kết thúc"
              name="end_time"
              rules={[{ required: true }]}
              style={{ marginBottom: "8px" }}
            >
              <DatePicker
                showTime
                format="DD/MM/YYYY HH:mm"
                placeholder="Thời gian kết thúc"
                disabledDate={(currentDate) => {
                  const startTime = form.getFieldValue("start_time");
                  return (
                    currentDate &&
                    (currentDate.isBefore(dayjs(), "day") ||
                      (startTime &&
                        currentDate.isBefore(dayjs(startTime), "day")))
                  );
                }}
                disabledTime={() => {
                  return {
                    disabledHours: () => {
                      let array = [];
                      for (let i = 0; i < 9; i++) array.push(i);
                      for (let i = 21; i < 24; i++) array.push(i);
                      return array;
                    },
                  };
                }}
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export const ModalAssignDevice = React.forwardRef(ModalAssign);
