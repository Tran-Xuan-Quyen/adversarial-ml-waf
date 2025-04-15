import * as React from "react";
import { Modal, Card, Tooltip, Button, Row, Col, Input } from "antd";
import "./schedule.scss";
import {
  CarryOutOutlined,
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { Context } from "../../utils/context";
import {
  convertScheduleResultToString,
  convertScheduleStatusToString,
  userRole,
} from "../../constants";
import { useAppDispatch, useAppSelector } from "../../redux/hook";
import {
  acceptSchedule,
  createScheduleByDoctor,
  deleteSchedule,
  getScheduleByDoctorId,
  rejectSchedule,
  resetLoadAcceptScheduleStatus,
  resetLoadDeleteScheduleStatus,
  resetLoadRejectScheduleStatus,
  resetLoadUpdateScheduleResultStatus,
  updateScheduleResult,
} from "../../redux/reducer/scheduleSlice";
import { ApiLoadingStatus } from "../../utils/loadingStatus";
import { showNotiError, showNotiSuccess } from "../notification";
import {
  AcceptScheduleRequest,
  DiagnosisRequest,
  NotificationRequest,
  UpdateResultRequest,
} from "../../api";
import {
  createNotification,
  resetLoadCreateNotification,
} from "../../redux/reducer/notificationScheduleSlice";
import { ModalAddDiagnosis } from "./ModalAddDiagnosis";
import { ModalShowDiagnosis } from "./ModalShowDiagnosis";
import {
  createDiagnosis,
  getDiagnosisByScheduleId,
  resetLoadCreateDiagnosisStatus,
  resetLoadUpdateDiagnosisByScheduleIdStatus,
  updateDiagnosisByScheduleId,
} from "../../redux/reducer/diagnosisSlice";

type AddDiagnosis = {
  open: (data: any[], columns: any[]) => void;
};

type ShowDiagnosis = {
  open: (data: any[]) => void;
};

const ScheduleModalComponent = (props: any) => {
  let listData = props.getListData(props.selectedDate);
  const dispatch = useAppDispatch();
  const scheduleState = useAppSelector((state) => state.schedule);
  const diagnosisState = useAppSelector((state) => state.diagnosis);
  const notificationState = useAppSelector(
    (state) => state.notificationSchedule
  );
  const [statusIcon, setStatusIcon] = React.useState<any>(null);
  const [isOpen, setIsOpen] = React.useState<boolean>(false);
  const [isCancel, setIsCancel] = React.useState<boolean>(false);
  const [isCancelResult, setIsCancelResult] = React.useState<boolean>(false);
  const [data, setData] = React.useState<any>({});
  const [cancelData, setCancelData] = React.useState<any>({});
  const [cancelResultData, setCancelResultData] = React.useState<any>({});
  const [reason, setReason] = React.useState<string>("");
  const [cancelReason, setCancelReason] = React.useState<string>("");
  const [cancelResultReason, setCancelResultReason] =
    React.useState<string>("");
  const modalAddDiagnosisRef = React.useRef<AddDiagnosis>(null);
  const modalShowRef = React.useRef<ShowDiagnosis>(null);

  const handleSubmitDiagnosisFunction = (data: any, type: string) => {
    if (type === "add") {
      dispatch(
        createDiagnosis({
          schedule_id: data.schedule_id,
          information: data.information,
        } as DiagnosisRequest)
      );
      if (
        data.schedule_start_time !== null &&
        data.schedule_start_time !== undefined
      ) {
        dispatch(createScheduleByDoctor(data));
        dispatch(
          createNotification({
            ...data,
            status: 4,
          } as NotificationRequest)
        );
      }
      dispatch(getScheduleByDoctorId());
    }
    if (type === "update") {
      dispatch(updateDiagnosisByScheduleId(data));
    }
  };

  React.useEffect(() => {
    for (const item of listData) {
      if (item.status === convertScheduleStatusToString(1)) {
        setStatusIcon("🟢");
      } else if (item.status === convertScheduleStatusToString(2)) {
        setStatusIcon("⏳");
      } else setStatusIcon("🔴");
    }
  }, [listData]);

  React.useEffect(() => {
    if (
      scheduleState.loadUpdateScheduleResultStatus === ApiLoadingStatus.Success
    ) {
      showNotiSuccess("Bạn xác nhận kết quả lịch khám thành công");
      dispatch(resetLoadUpdateScheduleResultStatus());
      dispatch(getScheduleByDoctorId());
    }
    if (
      scheduleState.loadUpdateScheduleResultStatus ===
        ApiLoadingStatus.Failed &&
      scheduleState.errorMessage
    ) {
      showNotiError(scheduleState.errorMessage);
      dispatch(resetLoadUpdateScheduleResultStatus());
    }
  }, [scheduleState.loadUpdateScheduleResultStatus]);

  React.useEffect(() => {
    if (scheduleState.loadAcceptScheduleStatus === ApiLoadingStatus.Success) {
      showNotiSuccess("Bạn đã chấp nhận lịch khám thành công");
      dispatch(resetLoadAcceptScheduleStatus());
      dispatch(getScheduleByDoctorId());
    }
    if (
      scheduleState.loadAcceptScheduleStatus === ApiLoadingStatus.Failed &&
      scheduleState.errorMessage
    ) {
      showNotiError(scheduleState.errorMessage);
      dispatch(resetLoadAcceptScheduleStatus());
    }
  }, [scheduleState.loadAcceptScheduleStatus]);

  React.useEffect(() => {
    if (scheduleState.loadRejectScheduleStatus === ApiLoadingStatus.Success) {
      showNotiSuccess("Bạn đã từ chối lịch khám thành công");
      dispatch(resetLoadRejectScheduleStatus());
      dispatch(getScheduleByDoctorId());
    }
    if (
      scheduleState.loadRejectScheduleStatus === ApiLoadingStatus.Failed &&
      scheduleState.errorMessage
    ) {
      showNotiError(scheduleState.errorMessage);
      dispatch(resetLoadRejectScheduleStatus());
    }
  }, [scheduleState.loadRejectScheduleStatus]);

  React.useEffect(() => {
    if (diagnosisState.loadCreateDiagnosisStatus === ApiLoadingStatus.Success) {
      showNotiSuccess("Bạn đã tạo chẩn đoán thành công");
      dispatch(resetLoadCreateDiagnosisStatus());
      dispatch(getScheduleByDoctorId());
      listData = props.getListData(props.selectedDate);
    }
    if (
      diagnosisState.loadCreateDiagnosisStatus === ApiLoadingStatus.Failed &&
      diagnosisState.errorMessage
    ) {
      dispatch(resetLoadCreateDiagnosisStatus());
      showNotiError(diagnosisState.errorMessage);
    }
  }, [diagnosisState.loadCreateDiagnosisStatus]);

  React.useEffect(() => {
    if (
      diagnosisState.loadUpdateDiagnosisByScheduleIdStatus ===
      ApiLoadingStatus.Success
    ) {
      showNotiSuccess("Bạn đã chỉnh sửa chẩn đoán thành công");
      dispatch(resetLoadUpdateDiagnosisByScheduleIdStatus());
      dispatch(getScheduleByDoctorId());
    }
    if (
      diagnosisState.loadUpdateDiagnosisByScheduleIdStatus ===
        ApiLoadingStatus.Failed &&
      diagnosisState.errorMessage
    ) {
      dispatch(resetLoadUpdateDiagnosisByScheduleIdStatus());
      showNotiError(diagnosisState.errorMessage);
    }
  }, [diagnosisState.loadUpdateDiagnosisByScheduleIdStatus]);

  React.useEffect(() => {
    if (scheduleState.loadDeleteScheduleStatus === ApiLoadingStatus.Success) {
      showNotiSuccess("Bạn đã hủy lịch khám thành công");
      dispatch(resetLoadDeleteScheduleStatus());
      dispatch(getScheduleByDoctorId());
    }
    if (
      scheduleState.loadDeleteScheduleStatus === ApiLoadingStatus.Failed &&
      scheduleState.errorMessage
    ) {
      dispatch(resetLoadDeleteScheduleStatus());
      showNotiError(scheduleState.errorMessage);
    }
  }, [scheduleState.loadDeleteScheduleStatus]);

  React.useEffect(() => {
    if (notificationState.loadCreateNotification === ApiLoadingStatus.Success) {
      dispatch(resetLoadCreateNotification());
    }
    if (
      notificationState.loadCreateNotification === ApiLoadingStatus.Failed &&
      notificationState.errorMessage
    ) {
      showNotiError(notificationState.errorMessage);
      dispatch(resetLoadCreateNotification());
    }
  }, [notificationState.loadCreateNotification]);

  return (
    <>
      <Modal
        width={"420px"}
        title="Lí do từ chối lịch"
        open={isOpen}
        onOk={async () => {
          try {
            if (!reason.trim()) {
              return alert("Vui lòng nhập lý do trước khi gửi!");
            }
            await dispatch(
              rejectSchedule({
                schedule_id: data.schedule_id,
              } as AcceptScheduleRequest)
            ).unwrap();
            await dispatch(
              createNotification({
                patient_id: data.patient_id,
                schedule_start_time: data.schedule_start_time,
                status: 3,
                reject_reason: reason,
              } as NotificationRequest)
            ).unwrap();
            setIsOpen(false);
          } catch (error) {
            console.error("Lỗi xảy ra:", error);
            showNotiError(error as string);
            setIsOpen(false);
          }
        }}
        okText="Lưu"
        onCancel={() => setIsOpen(false)}
      >
        <Input
          placeholder="Nhập lí do bạn muốn từ chối lịch"
          style={{ marginTop: "10px" }}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        ></Input>
      </Modal>

      <Modal
        width={"420px"}
        title="Lí do hủy lịch"
        open={isCancel}
        onOk={async () => {
          try {
            if (!cancelReason.trim()) {
              return alert("Vui lòng nhập lý do trước khi gửi!");
            }
            await dispatch(deleteSchedule(cancelData.schedule_id)).unwrap();
            await dispatch(
              createNotification({
                patient_id: cancelData.patient_id,
                schedule_start_time: cancelData.schedule_start_time,
                status: 3,
                reject_reason: cancelReason,
              } as NotificationRequest)
            ).unwrap();
            setIsCancel(false);
          } catch (error) {
            console.error("Lỗi xảy ra:", error);
            showNotiError(error as string);
            setIsCancel(false);
          }
        }}
        okText="Lưu"
        onCancel={() => setIsCancel(false)}
      >
        <Input
          placeholder="Nhập lí do bạn muốn hủy lịch"
          style={{ marginTop: "10px" }}
          value={cancelReason}
          onChange={(e) => setCancelReason(e.target.value)}
        ></Input>
      </Modal>

      <Modal
        width={"420px"}
        title="Lí do hủy kết quả lịch"
        open={isCancelResult}
        onOk={async () => {
          try {
            if (!cancelResultReason.trim()) {
              return alert("Vui lòng nhập lý do trước khi gửi!");
            }
            await dispatch(
              updateScheduleResult({
                schedule_id: cancelResultData.schedule_id,
                result: 3,
              } as UpdateResultRequest)
            );
            await dispatch(
              createNotification({
                patient_id: cancelResultData.patient_id,
                schedule_start_time: cancelResultData.schedule_start_time,
                status: 7,
                reject_reason: cancelResultReason,
              } as NotificationRequest)
            ).unwrap();
            setIsCancelResult(false);
          } catch (error) {
            console.error("Lỗi xảy ra:", error);
            showNotiError(error as string);
            setIsCancelResult(false);
          }
        }}
        okText="Lưu"
        onCancel={() => setIsCancelResult(false)}
      >
        <Input
          placeholder="Nhập lí do bạn muốn hủy lịch"
          style={{ marginTop: "10px" }}
          value={cancelResultReason}
          onChange={(e) => setCancelResultReason(e.target.value)}
        ></Input>
      </Modal>

      <Modal
        title={props.title}
        open={props.isOpen}
        onCancel={props.onClose}
        footer={null}
      >
        {listData.length > 0 ? (
          listData.map(
            (
              item: {
                [key: string]: any;
              },
              index: any
            ) => (
              <Card
                key={index}
                className="card-filter"
                actions={[
                  ...(item.result === 2 &&
                  item.status !== convertScheduleStatusToString(2) &&
                  Context.role === userRole.doctor
                    ? [
                        <Tooltip title="Hủy lịch khám" key="delete">
                          <DeleteOutlined
                            onClick={() => {
                              Modal.confirm({
                                title: "Hủy lịch khám",
                                content:
                                  "Bạn có muốn xác nhận hủy lịch khám này không?",
                                footer: (_, { CancelBtn }) => (
                                  <>
                                    <CancelBtn />
                                    <Button
                                      key="accept"
                                      type="primary"
                                      style={{ backgroundColor: "#E53935" }}
                                      onClick={() => {
                                        setIsCancel(true);
                                        setCancelData({
                                          schedule_id: item.schedule_id,
                                          patient_id: item.patient_id,
                                          schedule_start_time:
                                            item.schedule_start_time,
                                        });
                                        Modal.destroyAll();
                                      }}
                                    >
                                      Có
                                    </Button>
                                  </>
                                ),
                              });
                            }}
                          />
                        </Tooltip>,
                      ]
                    : []),
                  ...(item.result !== 3 && item.result !== 4 && item.status !== convertScheduleStatusToString(2)
                    ? [
                        <Tooltip title="Xem chẩn đoán">
                          <EyeOutlined
                            key="show"
                            onClick={() =>
                              modalShowRef.current?.open({
                                schedule_id: item.schedule_id,
                                doctor: item.doctor,
                                patient: item.patient,
                                start_time: item.start_time,
                                end_time: item.end_time,
                              } as any)
                            }
                          />
                        </Tooltip>,
                      ]
                    : []),
                  ...(Context.role === userRole.doctor &&
                  item.result !== 3 &&
                  item.result !== 2
                    ? [
                        <Tooltip title="Cập nhật chẩn đoán" key="edit">
                          <EditOutlined
                            onClick={() => {
                              dispatch(
                                getDiagnosisByScheduleId(item.schedule_id)
                              );
                              modalAddDiagnosisRef.current?.open(
                                {
                                  selected_date: props.selectedDate,
                                  schedule_id: item.schedule_id,
                                  patient_id: item.patient_id,
                                  patient: item.patient,
                                  start_time: item.start_time,
                                  end_time: item.end_time,
                                } as any,
                                props.columns
                              );
                            }}
                          />
                        </Tooltip>,
                      ]
                    : []),
                  ...(Context.role === userRole.doctor &&
                  (item.result === 0 || item.result === 5)
                    ? [
                        <Tooltip
                          title="Hủy kết quả lịch khám"
                          key="edit-result"
                        >
                          <CloseOutlined
                            onClick={() => {
                              Modal.confirm({
                                title: "Hủy kết quả lịch khám",
                                content:
                                  "Bạn có muốn xác nhận rằng lịch khám này KHÔNG diễn ra không?",
                                footer: (_, { CancelBtn }) => (
                                  <>
                                    <CancelBtn />
                                    <Button
                                      key="accept"
                                      type="primary"
                                      style={{ backgroundColor: "#E53935" }}
                                      onClick={() => {
                                        setIsCancelResult(true);
                                        setCancelResultData({
                                          schedule_id: item.schedule_id,
                                          patient_id: item.patient_id,
                                          schedule_start_time:
                                            item.schedule_start_time,
                                        });
                                        Modal.destroyAll();
                                      }}
                                    >
                                      Có
                                    </Button>
                                  </>
                                ),
                              });
                            }}
                          />
                        </Tooltip>,
                      ]
                    : []),
                  ...(Context.role === userRole.doctor && item.type === 2
                    ? [
                        <Tooltip title="Phê duyệt lịch khám" key="accept">
                          <CarryOutOutlined
                            onClick={() => {
                              Modal.confirm({
                                title: "Phê duyệt lịch khám",
                                content:
                                  "Bạn có muốn chấp nhận lịch khám này không?",
                                footer: (_, { CancelBtn }) => (
                                  <>
                                    <CancelBtn />
                                    <Button
                                      key="not-accept"
                                      onClick={() => {
                                        setIsOpen(true);
                                        setData({
                                          schedule_id: item.schedule_id,
                                          patient_id: item.patient_id,
                                          schedule_start_time:
                                            item.schedule_start_time,
                                        });
                                        Modal.destroyAll();
                                      }}
                                    >
                                      Không
                                    </Button>
                                    <Button
                                      key="accept"
                                      type="primary"
                                      onClick={async () => {
                                        try {
                                          await dispatch(
                                            acceptSchedule({
                                              schedule_id: item.schedule_id,
                                            } as AcceptScheduleRequest)
                                          ).unwrap();

                                          await dispatch(
                                            createNotification({
                                              patient_id: item.patient_id,
                                              schedule_start_time:
                                                item.schedule_start_time,
                                              status: 1,
                                            } as NotificationRequest)
                                          ).unwrap();

                                          Modal.destroyAll();
                                        } catch (error) {
                                          console.error("Lỗi xảy ra:", error);
                                          Modal.destroyAll();
                                        }
                                      }}
                                    >
                                      Có
                                    </Button>
                                  </>
                                ),
                              });
                            }}
                          ></CarryOutOutlined>
                        </Tooltip>,
                      ]
                    : []),
                ]}
              >
                <div className="event-details">
                  {Object.entries(item).map(([key, value]) => {
                    if (key === "result") {
                      return (
                        <Row key={key} className="event-row">
                          <Col
                            span={12}
                            className="event-label"
                            style={value === 5 ? { color: "#E53935" } : {}}
                          >
                            {value !== 2 ? "🎯 Kết quả lịch khám:" : ""}
                          </Col>
                          <Col
                            span={12}
                            className="event-value"
                            style={value === 5 ? { color: "#E53935" } : {}}
                          >
                            {value !== 2
                              ? convertScheduleResultToString(value)
                              : ""}
                          </Col>
                        </Row>
                      );
                    }

                    if (["session_string", "status"].includes(key)) {
                      return (
                        <Row key={key} className="event-row">
                          <Col span={12} className="event-label">
                            {key === "session_string" &&
                              "⏰ Thời gian lịch khám:"}
                            {key === "status" &&
                              `${statusIcon} Trạng thái lịch khám:`}
                          </Col>
                          <Col span={12} className="event-value">
                            {value}
                          </Col>
                        </Row>
                      );
                    }

                    if (
                      (Context.role === userRole.admin ||
                        Context.role === userRole.patient) &&
                      key === "doctor"
                    ) {
                      return (
                        <Row key={key} className="event-row">
                          <Col span={12} className="event-label">
                            👨‍⚕️ Bác sĩ:
                          </Col>
                          <Col span={12} className="event-value">
                            {value}
                          </Col>
                        </Row>
                      );
                    }

                    if (
                      (Context.role === userRole.admin ||
                        Context.role === userRole.doctor) &&
                      key === "patient"
                    ) {
                      return (
                        <Row key={key} className="event-row">
                          <Col span={12} className="event-label">
                            🛌 Bệnh nhân:
                          </Col>
                          <Col span={12} className="event-value">
                            {value}
                          </Col>
                        </Row>
                      );
                    }
                  })}
                </div>
              </Card>
            )
          )
        ) : (
          <div>Không có lịch khám</div>
        )}
      </Modal>
      <ModalAddDiagnosis
        ref={modalAddDiagnosisRef}
        title="Chẩn đoán của bác sĩ"
        submitFunction={(data: any, type: any) =>
          handleSubmitDiagnosisFunction(data, type)
        }
      ></ModalAddDiagnosis>
      <ModalShowDiagnosis
        ref={modalShowRef}
        title="Xem chẩn đoán"
      ></ModalShowDiagnosis>
    </>
  );
};

export const ScheduleModal = ScheduleModalComponent;
