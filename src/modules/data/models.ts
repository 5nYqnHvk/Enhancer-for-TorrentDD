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
  nextMs: number; // 0 = ready now
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
  enabledBoardStats: boolean;
  enabledCardRealtime: boolean;
}

export interface EbetSettings {
  enabledEbetModule: boolean;
  enabledHoverDetails: boolean;
}

export interface BankSettings {
  enabledBankModule: boolean;
}

export interface ChatSettings {
  enabledChatModule: boolean;
  enabledIframeBoss: boolean;
  sortUserOnline: boolean;
  enabledImagePreview: boolean;
}

export interface OtherSettings {
  notificationSound: string;
}

export interface HomeSettings {
  enabledHomeModule: boolean;
}

export interface RankingSettings {
  enabledRankingModule: boolean;
}

export interface MarketSettings {
  enabledMarketModule: boolean;
}

export interface InboxSettings {
  enabledInboxModule: boolean;
}

export interface InventorySettings {
  enabledInventoryModule: boolean;
}

export interface MarketplaceSettings {
  enabledMarketplaceModule: boolean;
}

export interface Settings {
  torrent: TorrentSettings;
  farm: FarmSettings;
  gasha: GashaSettings;
  ticket: TicketSettings;
  betcard: BetCardSettings;
  ebet: EbetSettings;
  bank: BankSettings;
  chat: ChatSettings;
  others: OtherSettings;
  home: HomeSettings;
  ranking: RankingSettings;
  market: MarketSettings;
  inbox: InboxSettings;
  inventory: InventorySettings;
  marketplace: MarketplaceSettings;
}

export interface ProfileData {
  realUploadGB: number;
  fileUpload: number;
  ratio: number;
  weeksJoined: number;
  currentClass: string;
}

export interface UserInfo {
  userId: string;
  username: string;
  isPremium: boolean;
}

export interface GashaData {
  type:
    | "pet_box_1"
    | "pet_box_2"
    | "pet_box_3"
    | "pet_box_4"
    | "ticket_pet_box_1"
    | "unknown";
  cls: "A" | "B" | "S" | "SS" | "zen" | "coin" | "icon" | "no";
  img: string;
  txt: string;
  date: number;
}
