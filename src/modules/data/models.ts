export interface UserData {
  userId: number;
  username: string;
  classId: number;
  isPremium: boolean;
}

export type FarmStatus = "empty" | "ready" | "pending" | "spoiled";

export interface FarmPlot {
  id: number;
  harvestTime: number;
  status: FarmStatus;
}

export interface FarmData {
  plots: FarmPlot[];
  quantityReady: number;
  quantityPending: number;
  quantitySpoiled: number;
  quantityEmpty: number;
  resText?: string;
}

// types.ts
export interface TorrentSettings {
  enabledTorrentModule: boolean;
  showTorrentImage: boolean;
  showDownloadButton: boolean;
  showRateButton: boolean;
  updatePeerslist: boolean;
}

export interface FarmSettings {
  enabledFarmModule: boolean;
  autoFarm: boolean;
  notificationFarm: boolean;
  farmUpdateInterval: number;
  minPlotReadyForNotification: number;
}

export interface GashaSettings {
  enabledGashaModule: boolean;
  saveGashaLog: boolean;
  showGashaLog: boolean;
}

export interface BetCardSettings {
  enabledBetCardModule: boolean;
}

export interface OtherSettings {
  licenseKey: string;
  notificationSound: string;
}

export interface Settings {
  torrent: TorrentSettings;
  farm: FarmSettings;
  gasha: GashaSettings;
  betcard: BetCardSettings;
  others: OtherSettings;
}

export interface UserInfo {
  userId: string;
  username: string;
  isPremium: boolean;
}
