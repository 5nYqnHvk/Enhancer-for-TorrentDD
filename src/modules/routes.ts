import { routeLoader } from "../core/router";
import { initHomeModule } from "./ui/home";
import { initFarmModule } from "./ui/farm";
import { initGashaModule } from "./ui/gasha";
import { initTicketModule } from "./ui/ticket";
import { initPlaceCardModule } from "./ui/placeCard";
import { initbetCardModule } from "./ui/betCard";
import { initEbetModule } from "./ui/ebet";
import { initBankModule } from "./ui/bank";
import { initTorrentModule } from "./ui/torrent";
import { initChatModule } from "./ui/chat";
import { initRankingModule } from "./ui/ranking";
import { initMarketModule } from "./ui/market";
import { initInboxModule } from "./ui/inbox";
import { initInventoryModule } from "./ui/inventory";
import { initMarketplaceModule } from "./ui/marketplace";

export const initRoutes = async () => {
  await routeLoader([
    {
      name: "Home",
      match: /^\/(home|index)\.php(?:\?.*)?$|^\/$/,
      init: initHomeModule,
    },
    {
      name: "Farm",
      match: /^\/farm\.php$/,
      init: initFarmModule,
    },
    {
      name: "Gasha",
      match: /^\/gashapon\.php(?:\?box_name=.*)?$/,
      init: initGashaModule,
    },
    {
      name: "Ticket",
      match: /^\/ticket\.php$/,
      init: initTicketModule,
    },
    {
      name: "PlaceCard",
      match: /^\/card_vs_player\.php\?mod=create$/,
      init: initPlaceCardModule,
    },
    {
      name: "BetCard",
      match: /^\/card_vs_player\.php(?:\?(?:page=.*|mod=board.*))?$/,
      init: initbetCardModule,
    },
    {
      name: "Ebet",
      match: /^\/ebet\.php$/,
      init: initEbetModule,
    },
    {
      name: "Bank",
      match: /^\/bank\.php$/,
      init: initBankModule,
    },
    {
      name: "Torrent",
      match: /^\/(browse|browse18|details)\.php(?:\?.*)?$/,
      init: initTorrentModule,
    },
    {
      name: "Chat",
      match: /^\/chat\.php(?:\?.*)?$/,
      init: initChatModule,
    },
    {
      name: "Ranking",
      match: /^\/ranking\.php(?:\?.*)?$/,
      init: initRankingModule,
    },
    {
      name: "Market",
      match: /^\/market\.php(?:\?.*)?$/,
      init: initMarketModule,
    },
    {
      name: "Inbox",
      match: /^\/inbox\.php(?:\?.*)?$/,
      init: initInboxModule,
    },
    {
      name: "Inventory",
      match: /^\/inventory\.php(?:\?.*)?$/,
      init: initInventoryModule,
    },
    {
      name: "Marketplace",
      match: /^\/marketplace\.php(?:\?.*)?$/,
      init: initMarketplaceModule,
    },
  ]);
};
