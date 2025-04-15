import { Descriptions, Drawer, Table } from "antd";
import { useEffect, useState } from "react";
import "./Drawer.scss";

interface Props {
  title: string;
  data: { [key: string]: any };
  isOpen: boolean;
  closed: () => void;
  customData: React.JSX.Element;
  customDetail?: { [key: string]: any };
  labels: { [key: string]: string };
}
const DrawerComponent = (props: Props) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [data, setData] = useState<{ [key: string]: any }>({});

  useEffect(() => {
    setIsOpen(props?.isOpen);
    setData(props?.data);
  }, [props]);

  return (
    <>
      <Drawer
        closable
        destroyOnClose
        title={props?.title}
        placement="right"
        open={isOpen}
        onClose={() => {
          props?.closed();
          return setIsOpen(false);
        }}
      >
        {props?.customData}
        <Descriptions column={1}>
          {Object.keys(props.labels).map((key: string) => {
            const label = props.labels[key];
            const customKey = props.customDetail
              ? Object.keys(props?.customDetail)
              : undefined;
            if (label) {
              if (customKey?.includes(key)) {
                return (
                  <Descriptions.Item label={label} key={label}>
                    {props.customDetail?.[key]}
                  </Descriptions.Item>
                );
              } else {
                return (
                  <Descriptions.Item label={label} key={label}>
                    {data[key]}
                  </Descriptions.Item>
                );
              }
            }
          })}
        </Descriptions>
      </Drawer>
    </>
  );
};
export const DrawerSide = DrawerComponent;
