import { createSlice } from "@reduxjs/toolkit";
import { ApiLoadingStatus } from "../../utils/loadingStatus";
import { createAsyncThunkWrap } from "../handler";
import { Service, StatisticResponse } from "../../api";

interface IStatisticState {
  statistic: StatisticResponse;
  loadGetStatistic: ApiLoadingStatus;
  errorMessage: string | undefined;
}

const initialState: IStatisticState = {
  statistic: {} as StatisticResponse,
  loadGetStatistic: ApiLoadingStatus.None,
  errorMessage: undefined,
};

export const getStatistic = createAsyncThunkWrap("/statistic", async () => {
  return await Service.statisticService.getStatistic();
});

export const statisticSlice = createSlice({
  name: "statistic",
  initialState,
  reducers: {
    resetLoadGetStatistic: (state) => {
      state.loadGetStatistic = ApiLoadingStatus.None;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getStatistic.pending, (state, action) => {
        state.loadGetStatistic = ApiLoadingStatus.Loading;
      })
      .addCase(getStatistic.fulfilled, (state, action) => {
        state.statistic = action.payload;
        state.loadGetStatistic = ApiLoadingStatus.Success;
      })
      .addCase(getStatistic.rejected, (state, action) => {
        state.statistic = {} as StatisticResponse;
        state.errorMessage = (<any>action.payload)?.message;
        state.loadGetStatistic = ApiLoadingStatus.Failed;
      });
  },
});

export const { resetLoadGetStatistic } = statisticSlice.actions;
export default statisticSlice.reducer;
