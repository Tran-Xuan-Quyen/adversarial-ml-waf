import * as React from "react";
import { Modal, Form } from "antd";
import { useTranslation } from "react-i18next";
import "./schedule.scss";
import { useAppDispatch, useAppSelector } from "../../redux/hook";
import {
  getDiagnosisByScheduleId,
  resetLoadGetDiagnosisByScheduleIdStatus,
} from "../../redux/reducer/diagnosisSlice";
import { ApiLoadingStatus } from "../../utils/loadingStatus";
import { DiagnosisResponse } from "../../api";
import { Context } from "../../utils/context";
import { userRole } from "../../constants";

const ModalComponent = (props: any, ref: any) => {
  const [form] = Form.useForm();
  const [data, setData] = React.useState<any>([]);
  const [isOpen, setIsOpen] = React.useState<boolean>(props.isOpen);
  const dispatch = useAppDispatch();
  const diagnosisState = useAppSelector((state) => state.diagnosis);
  const [diagnosis, setDiagnosis] = React.useState<DiagnosisResponse>(
    {} as DiagnosisResponse
  );
  const { t } = useTranslation();

  React.useImperativeHandle(ref, () => ({
    open: (data: any) => {
      setIsOpen(true);
      setData(data);
    },
  }));

  React.useEffect(() => {
    dispatch(getDiagnosisByScheduleId(data.schedule_id));
  }, [data.schedule_id]);

  React.useEffect(() => {
    if (
      diagnosisState.loadGetDiagnosisByScheduleIdStatus ===
      ApiLoadingStatus.Success
    ) {
      dispatch(resetLoadGetDiagnosisByScheduleIdStatus());
      setDiagnosis(diagnosisState.diagnosis);
    }
    if (
      diagnosisState.loadGetDiagnosisByScheduleIdStatus ===
      ApiLoadingStatus.Failed
    ) {
      dispatch(resetLoadGetDiagnosisByScheduleIdStatus());
      setDiagnosis({} as DiagnosisResponse);
    }
  }, [diagnosisState.loadGetDiagnosisByScheduleIdStatus]);

  return (
    <Modal
      title={props.title}
      open={isOpen}
      footer={null}
      width={450}
      onCancel={() => {
        setData([]);
        setIsOpen(false);
      }}
      className={props.className}
    >
      <Form form={form} labelCol={{ span: 12 }} wrapperCol={{ span: 14 }}>
        {(Context.role === userRole.doctor ||
          Context.role === userRole.admin) && (
          <Form.Item
            label="Bệnh nhân"
            style={{ marginBottom: "2px", marginTop: "12px" }}
          >
            <div>{data.patient}</div>
          </Form.Item>
        )}
        {(Context.role === userRole.patient ||
          Context.role === userRole.admin) && (
          <Form.Item label="Bác sĩ" style={{ marginBottom: "2px" }}>
            <div>{data.doctor}</div>
          </Form.Item>
        )}
        <Form.Item label="Thời gian khám" style={{ marginBottom: "4px" }}>
          <div>
            Từ {data.start_time} đến {data.end_time}
          </div>
        </Form.Item>
        <Form.Item label="Thông tin chẩn đoán" style={{ marginBottom: "2px" }}>
          <div>
            {Object.keys(diagnosis).length !== 0
              ? diagnosis.information
              : "Không tìm thấy thông tin chẩn đoán"}
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export const ModalShowDiagnosis = React.forwardRef(ModalComponent);
