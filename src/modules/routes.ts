import { routeLoader } from "../core/router";
import { initFarmButton } from "./ui/farm";

export const initRoutes = async () => {
  await routeLoader([
    {
      name: "Farm",
      match: /^\/farm\.php$/,
      init: async () => initFarmButton(),
    },
  ]);
};
