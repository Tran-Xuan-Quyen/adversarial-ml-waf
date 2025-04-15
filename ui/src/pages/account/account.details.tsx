import React from "react";
import {
  Row,
  Col,
  Image,
  Upload,
  Form,
  Input,
  Select,
  DatePicker,
  Button,
} from "antd";
import avatarDemo from "../../assets/avatar.svg";
import dayjs from "dayjs";
import "./account.details.scss";
import { convertGenderToString, convertRoleToString } from "../../constants";
import { useTranslation } from "react-i18next";
import { getUserById } from "../../redux/reducer/userSlice";
import { useAppDispatch, useAppSelector } from "../../redux/hook";
import { ApiLoadingStatus } from "../../utils/loadingStatus";
import { UserResponse } from "../../api";
import { Context } from "../../utils/context";

export function Detail() {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const [accountData, setData] = React.useState<UserResponse>(
    {} as UserResponse
  );
  const dataState = useAppSelector((state) => state.user);

  React.useEffect(() => {
    dispatch(getUserById("user-info"));
  }, []);

  React.useEffect(() => {
    if (dataState.loadGetUserByIdStatus === ApiLoadingStatus.Success) {
      setData(dataState.userData);
    }
  }, [dataState.loadGetUserByIdStatus]);

  return (
    <div className="account-info">
      <Row gutter={[24, 24]}>
        <Col xs={24} sm={8} className="profile-section">
          <div className="avatar">
            <Image width={120} src={avatarDemo} preview={false} />
          </div>
          <div className="avatar-name">
            {accountData.username || "Tên tài khoản"}
          </div>
          <div className="upload-btn">
            <Upload
              name="avatar"
              listType="picture-card"
              className="avatar-uploader"
              showUploadList={false}
              action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
            >
              <Button>{t("Upload Avatar")}</Button>
            </Upload>
          </div>
        </Col>

        <Col xs={24} sm={16} className="form-section">
          <Form layout="vertical">
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Form.Item
                  label={"Tên người dùng"}
                  style={{ marginBottom: "25px" }}
                >
                  <Input value={accountData.username} name="name" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label={"Giới tính"}>
                  <Input
                    value={convertGenderToString(accountData.gender)}
                    name="gender"
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Form.Item
                  label={"Số điện thoại"}
                  style={{ marginBottom: "25px" }}
                >
                  <Input value={accountData.phone_number} name="name" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label={"Ngày tháng năm sinh"}>
                  <DatePicker
                    format={"DD/MM/YYYY"}
                    name="ngày sinh"
                    value={dayjs()}
                    onChange={(date, dateString) => {}}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Form.Item label="Thông tin" style={{ marginBottom: "25px" }}>
                  <Input
                    value={accountData.information}
                    name="email"
                    disabled
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label={"Vai trò người dùng"}>
                  <Input
                    value={convertRoleToString(Number(Context.role))}
                    name="role"
                    disabled
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Form.Item
                  label={"Mật khẩu truy cập"}
                  name="password"
                  style={{ marginBottom: "25px" }}
                  rules={[
                    {
                      required: true,
                      message: "Please input your password!",
                    },
                  ]}
                >
                  <Input.Password defaultValue={"12345678"} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="confirm"
                  label="Nhập lại mật khẩu (nếu muốn thay đổi)"
                  dependencies={["password"]}
                  rules={[
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue("password") === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(
                          new Error(
                            "The new password that you entered do not match!"
                          )
                        );
                      },
                    }),
                  ]}
                >
                  <Input.Password />
                </Form.Item>
              </Col>
            </Row>
            <Row className="btn-row">
              <Col>
                <Button type="primary" className="account-submit-button">
                  Lưu
                </Button>
              </Col>
            </Row>
          </Form>
        </Col>
      </Row>
    </div>
  );
}
