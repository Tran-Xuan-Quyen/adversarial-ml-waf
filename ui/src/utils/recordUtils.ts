export const handleRecordName = (recordUrl: string, deviceId: string) => {
  let recordName = recordUrl.split("\\");
  for (const item of recordName) {
    if (
      item.includes(".csv") ||
      item.includes(".txt") ||
      item.includes(".wav")
    ) {
      return item.split(`${deviceId}-`)[1];
    }
  }
};
