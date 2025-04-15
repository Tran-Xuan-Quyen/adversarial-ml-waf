import React, { useEffect, useState } from "react";
import { Col, Modal, Row, Slider } from "antd";
import LineChart from "../LineChart/LineChart";
import { useTranslation } from "react-i18next";
import { SliderSingleProps } from "antd/lib";
import { useAppDispatch, useAppSelector } from "../../redux/hook";
import { setSamples } from "../../redux/reducer/recordSlice";

interface DataPoint {
  value: number;
  warning: number;
}

interface ChartData {
  data: DataPoint[];
}

interface RawData {
  "PPG (a.u)": ChartData;
  "PCG (mV)": ChartData;
  "ECG (mV)": ChartData;
  frequency: number;
}

const ModalChartComponent = (props: any, ref: any) => {
  const dispatch = useAppDispatch();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [data, setData] = useState<any>(null);
  const recordState = useAppSelector((state) => state.record);
  const { t } = useTranslation();

  React.useImperativeHandle(ref, () => ({
    open: (id: string) => {
      setIsOpen(true);
    },
  }));

  const generateECGData = (): DataPoint[] => {
    const frequency = 100; // Tần số lấy mẫu ECG
    const samples = recordState.samples;

    return Array.from({ length: samples }, (_, i) => {
      const time = i / frequency;
      const phase = time % 1;

      const ecgValue =
        phase >= 0.16 && phase < 0.18
          ? -0.25 * Math.exp(-Math.pow((phase - 0.17) / 0.004, 2)) // Q ~ -0.25 mV
          : phase >= 0.18 && phase < 0.22
          ? 1.8 * Math.exp(-Math.pow((phase - 0.2) / 0.008, 2)) // R ~ 1.8 mV
          : phase >= 0.22 && phase < 0.24
          ? -0.8 * Math.exp(-Math.pow((phase - 0.23) / 0.006, 2)) // S ~ -0.8 mV
          : phase >= 0.3 && phase < 0.4
          ? 0.4 * Math.exp(-Math.pow((phase - 0.35) / 0.04, 2)) // T ~ 0.4 mV
          : phase >= 0.08 && phase < 0.12
          ? 0.2 * Math.exp(-Math.pow((phase - 0.1) / 0.015, 2)) // P ~ 0.2 mV
          : phase >= 0.42 && phase < 0.46
          ? 0.1 * Math.exp(-Math.pow((phase - 0.44) / 0.008, 2)) // U ~ 0.1 mV
          : 0;

      // **Nhiễu Gaussian (~±0.02 mV)**
      const noise = (Math.random() - 0.5) * 0.04;

      // **Nhiễu cao tần (~±0.02 mV)**
      const highFreqNoise =
        0.02 * Math.sin(50 * Math.PI * time) * (Math.random() - 0.5);

      // **Tổng hợp tín hiệu ECG**
      const ecgWithNoise = ecgValue + noise + highFreqNoise;

      return { value: parseFloat(ecgWithNoise.toFixed(3)), warning: 0 };
    });
  };

  const generatePPGData = () => {
    const frequency = 100; // Tần số lấy mẫu (Hz)
    const duration = 10; // Thời gian đo (giây)
    const samples = duration * frequency;
    const cycle = 1.0; // Chu kỳ 1 giây (~60 BPM)

    let ppgData = [];

    for (let i = 0; i < samples; i++) {
      const time = (i / frequency) % cycle; // Thời gian trong chu kỳ

      // **Dạng sóng PPG với biên độ hợp lý**
      const baseWave =
        30 * Math.sin(2 * Math.PI * time + Math.sin(4 * Math.PI * time));

      // **Hiệu ứng biến dạng**
      const distortion =
        15 * Math.sin(3 * Math.PI * time) * Math.exp(-3 * time);

      // **Thêm nhiễu để mô phỏng tín hiệu thực tế**
      const noise = (Math.random() - 0.5) * 5;
      const highFreqNoise =
        3 * Math.sin(50 * Math.PI * time) * (Math.random() - 0.5);

      // **Tổng hợp tín hiệu**
      let ppgValue = baseWave + distortion + noise + highFreqNoise;

      // **Dịch lên giá trị dương và chuẩn hóa về a.u**
      ppgValue = ppgValue - Math.min(ppgValue, -30) + 40; // Offset để đảm bảo luôn dương

      // **Giảm số lượng mẫu trong vùng trũng**
      if (ppgValue > 45 || i % 5 === 0) {
        ppgData.push({ value: parseFloat(ppgValue.toFixed(3)), warning: 0 });
      }
    }

    return ppgData;
  };

  const generatePCGData = (): DataPoint[] => {
    const frequency = 150; // Tần số mẫu (Hz)
    const samples = recordState.samples;

    // Hệ số điều chỉnh biên độ để phản ánh đơn vị Volt
    const amplitudeScale = 20; // 20mV là mức phổ biến

    return Array.from({ length: samples }, (_, i) => {
      const time = i / frequency;
      const phase = time % 1;

      // Mô phỏng tiếng tim S1 (First Heart Sound)
      const s1_wave =
        phase >= 0 && phase < 0.05
          ? 0.7 * Math.exp(-Math.pow((phase - 0.025) / 0.012, 2)) +
            0.3 * Math.sin(80 * Math.PI * phase) // Dao động nhanh hơn
          : phase >= 0.05 && phase < 0.1
          ? -0.5 * Math.exp(-Math.pow((phase - 0.075) / 0.012, 2)) +
            0.2 * Math.sin(70 * Math.PI * phase) // Hiệu ứng rung sau S1
          : 0;

      // Mô phỏng âm thổi (murmur)
      const murmur =
        phase >= 0.15 && phase < 0.35
          ? 0.1 *
            Math.sin(100 * Math.PI * phase) *
            Math.exp(-Math.pow((phase - 0.25) / 0.05, 2)) // Dao động tần số cao, lan rộng
          : 0;

      // Mô phỏng tiếng tim S2 (Second Heart Sound)
      const s2_wave =
        phase >= 0.5 && phase < 0.55
          ? 0.5 * Math.exp(-Math.pow((phase - 0.525) / 0.012, 2)) +
            0.2 * Math.sin(80 * Math.PI * phase) // Biên độ thấp hơn S1
          : phase >= 0.55 && phase < 0.6
          ? -0.4 * Math.exp(-Math.pow((phase - 0.575) / 0.012, 2)) +
            0.15 * Math.sin(70 * Math.PI * phase) // Hiệu ứng rung sau S2
          : 0;

      // Nhiễu nền tự nhiên hơn
      const noise =
        (Math.random() - 0.5) * 0.02 + 0.02 * Math.sin(10 * Math.PI * time);

      // Tính giá trị cuối cùng & nhân với hệ số biên độ (V)
      const valueInV = (s1_wave + murmur + s2_wave + noise) * amplitudeScale;

      return {
        value: parseFloat(valueInV.toFixed(3)),
        warning: 0,
      };
    });
  };

  const generateData = (): RawData => {
    return {
      "PPG (a.u)": { data: generatePPGData() },
      "PCG (mV)": { data: generatePCGData() },
      "ECG (mV)": { data: generateECGData() },
      frequency: 250,
    };
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        const fakeData = generateData();
        setData(fakeData);
      }, 500);
    }
  }, [isOpen, recordState.samples]);

  const handleCancel = () => {
    setIsOpen(false);
    setData(null);
  };
  const marks: SliderSingleProps["marks"] = {
    100: "100",
    200: "200",
    300: "300",
    400: "400",
    500: "500",
    600: "600",
    700: "700",
    800: "800",
    900: "900",
    1000: "1000",
  };

  return (
    <Modal
      title={props.title}
      open={isOpen}
      onCancel={handleCancel}
      width={1000}
      centered
      footer={null}
    >
      <LineChart rawData={data} />
      <Row gutter={3}>
        <Col span={7} style={{ marginTop: "10px" }}>
          Điều chỉnh số lượng mẫu hiển thị:
        </Col>
        <Col span={17} style={{ marginTop: "6px" }}>
          <Slider
            marks={marks}
            step={100}
            defaultValue={100}
            min={100}
            max={1000}
            onChange={(value) => dispatch(setSamples(value))}
          />
        </Col>
      </Row>
    </Modal>
  );
};

export const ModalChart = React.forwardRef(ModalChartComponent);
