import { routeLoader } from "../core/router";
import { initbetCardModule } from "./ui/betCard";
import { initFarmModule } from "./ui/farm";
import { initGashaModule } from "./ui/gasha";
import { initPlaceCardModule } from "./ui/placeCard";
import { initTicketModule } from "./ui/ticket";
import { initTorrentModule } from "./ui/torrent";

export const initRoutes = async () => {
  await routeLoader([
    {
      name: "Farm",
      match: /^\/farm\.php$/,
      init: async () => initFarmModule(),
    },
    {
      name: "Gasha",
      match: /^\/(gashapon|ticket-gashapon1|ticket-gashapon2)\.php$/,
      init: async () => initGashaModule(),
    },
    {
      name: "Ticket",
      match: /^\/ticket\.php$/,
      init: async () => initTicketModule(),
    },
    {
      name: "PlaceCard",
      match: /^\/card_vs_player\.php\?mod=create$/,
      init: async () => initPlaceCardModule(),
    },
    {
      name: "BetCard",
      match: /^\/card_vs_player\.php(?:\?page=.*)?$/,
      init: async () => initbetCardModule(),
    },
    {
      name: "Torrent",
      match: /^\/(browse|browse18)\.php(?:\?.*)?$/,
      init: async () => initTorrentModule(),
    },
    {
      name: "Torrent",
      match: /^\/(details)\.php(?:\?[&]?id=.*)?$/,
      init: async () => initTorrentModule(),
    },
  ]);
};
