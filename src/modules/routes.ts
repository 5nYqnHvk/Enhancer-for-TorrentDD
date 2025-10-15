import { routeLoader } from "../core/router";
import { initFarmModule } from "./ui/farm";
import { initGashaModule } from "./ui/gasha";

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
  ]);
};
