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

export interface TicketData {
  ready: boolean;
  quantityReady: number;
}

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

export interface TicketSettings {
  enabledTicketModule: boolean;
  autoTicket: boolean;
  notificationTicket: boolean;
  ticketUpdateInterval: number;
  minTicketReadyForNotification: number;
}

export interface BetCardSettings {
  enabledBetCardModule: boolean;
  enabledPlaceCardModule: boolean;
}

export interface OtherSettings {
  notificationSound: string;
}

export interface Settings {
  torrent: TorrentSettings;
  farm: FarmSettings;
  gasha: GashaSettings;
  ticket: TicketSettings;
  betcard: BetCardSettings;
  others: OtherSettings;
}

export interface UserInfo {
  userId: string;
  username: string;
  isPremium: boolean;
}

export interface GashaData {
  type: "C" | "G1" | "G2";
  img: string;
  txt: string;
  date: number;
}
