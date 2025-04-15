
import { createAsyncThunk } from "@reduxjs/toolkit";

export interface IExceptionModel {
  requestId: string;
  timestamp: string;
  statusCode: number;
  errorCode: string;
}

export const createAsyncThunkWrap = <TReturn, TData = void>(
  key: string,
  action: (param: TData) => Promise<TReturn>
) => {
  return createAsyncThunk(key, async (thunkArg: TData, { rejectWithValue }) => {
    try {
      window.localStorage.setItem("context.lastActivityTime", Date.now().toString());
      return await action(thunkArg);
    } catch (e: any) {
      // todo: common error handler, eg. 401
      const exceptionModel: IExceptionModel = JSON.parse(e.response);

      if (exceptionModel.statusCode === 401) {
        const event:any = new Event("session-timeout");
        event.key= "session-timeout";
        window.dispatchEvent(event);
      }

      return rejectWithValue(exceptionModel);
    }
  });
};
