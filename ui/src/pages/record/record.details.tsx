import * as React from "react";
import { useAppDispatch, useAppSelector } from "../../redux/hook";
import { DrawerSide } from "../../components/Drawer/Drawer";
import { getRecordById } from "../../redux/reducer/recordSlice";
import { ApiLoadingStatus } from "../../utils/loadingStatus";
import { DesktopOutlined } from "@ant-design/icons";
import { Avatar, Divider, Table } from "antd";
import { useTranslation } from "react-i18next";
import { convertTimeToDateTime } from "../../utils/dateUtils";
import { handleRecordName } from "../../utils/recordUtils";

const RecordDetailComponent = (props: any, ref: any) => {
  const dispatch = useAppDispatch();
  const [isOpen, setIsOpen] = React.useState<boolean>(false);
  const [data, setData] = React.useState<any>([]);
  const [idSelect, setIdSelect] = React.useState<string>("");
  const { t } = useTranslation();
  const dataState = useAppSelector((state) => state.record);

  React.useImperativeHandle(ref, () => ({
    open: (id: string) => {
      setIsOpen(true);
      if (id !== idSelect) {
        setIdSelect(id);
        dispatch(getRecordById(id));
      }
    },
  }));

  React.useEffect(() => {
    if (dataState.loadGetRecordByIdStatus === ApiLoadingStatus.Success) {
      const record = dataState.recordData;
      const rawData = {
        data_rec_url: handleRecordName(record.data_rec_url, record.device_id),
        patient: record.patient,
        device_name: record.device_name,
        start_time: convertTimeToDateTime(record.start_time),
        end_time: convertTimeToDateTime(record.end_time),
      };
      setData(rawData);
    }
  }, [dataState.loadGetRecordByIdStatus]);

  const labelsInfo = {
    data_rec_url: "Tên bản ghi",
    patient: "Tên bệnh nhân",
    device_name: "Tên thiết bị",
    start_time: "Thời gian bắt đầu phiên đo",
    end_time: "Thời gian kết thúc phiên đo",
  };

  const customData = (
    <>
      <Avatar size={60} icon={<DesktopOutlined />} />
      <p className="site-description-item-profile-p">Thông tin cụ thể</p>

      <Divider />
    </>
  );

  return (
    <>
      <DrawerSide
        closed={() => setIsOpen(false)}
        isOpen={isOpen}
        title="Thông tin chi tiết bản ghi"
        data={data}
        labels={labelsInfo}
        customData={customData}
      />
    </>
  );
};

export const RecordDetail = React.forwardRef(RecordDetailComponent);
