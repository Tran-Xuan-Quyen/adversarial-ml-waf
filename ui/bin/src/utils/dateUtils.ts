import dayjs, { Dayjs } from "dayjs";

export const checkDateTypeKey = (key: string) => {
  const dateKeyGroups = [
    "birth",
    "start_date",
    "end_date",
    "start_time",
    "end_time",
    "schedule_start_time",
    "schedule_end_time",
  ];
  return dateKeyGroups.includes(key);
};

export const convertTimeToDate = (time: number) => {
  return dayjs.unix(time).format("DD/MM/YYYY");
};

export const convertTimeToDateTime = (time: number) => {
  return dayjs.unix(time).format("HH:mm DD/MM/YYYY");
};

export const disabledDate = (day: Dayjs, availableSchedule: any[]): boolean => {
  const availableDates = availableSchedule.map((schedule: any) =>
    dayjs(schedule.date).startOf("day").format("YYYY-MM-DD")
  );
  const isAvailable = availableDates.includes(day.format("YYYY-MM-DD"));
  return day < dayjs().startOf("day") || !isAvailable;
};

export const getBusyHours = (
  selectedDate: Dayjs | null,
  availableSchedule: any[]
): number[] => {
  if (!selectedDate) return [];
  const selectedDateString = selectedDate.format("YYYY-MM-DD");
  const day = availableSchedule.find(
    (schedule: any) =>
      dayjs(schedule.date).format("YYYY-MM-DD") === selectedDateString
  );

  const hours = [
    9, 9.5, 10, 10.5, 11, 11.5, 14, 14.5, 15, 15.5, 16, 16.5, 17, 17.5, 18,
    18.5, 19, 19.5, 20, 20.5,
  ];
  const busyHours = hours.filter((busyHour) => !day?.hours.includes(busyHour));

  return day ? busyHours : [];
};

export const disabledTime = (busyHours: number[]) => {
  return {
    disabledHours: () => {
      const fullyBusyHours = busyHours.filter(
        (hour) => busyHours.includes(hour + 0.5) && hour % 1 === 0
      );
      for (let i = 0; i < 9; i++) fullyBusyHours.push(i);
      for (let i = 12; i < 14; i++) fullyBusyHours.push(i);
      for (let i = 21; i <= 24; i++) fullyBusyHours.push(i);
      return fullyBusyHours;
    },
    disabledMinutes: (selectedHour: number) => {
      const isBusyAtHour = busyHours.includes(selectedHour);
      const isBusyAtHalfHour = busyHours.includes(selectedHour + 0.5);
      const disabledMinutes = [];
      if (isBusyAtHour) disabledMinutes.push(0);
      if (isBusyAtHalfHour) disabledMinutes.push(30);
      return disabledMinutes;
    },
  };
};
