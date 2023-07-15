import aspida from "aspida-google-apps-script";
import api from "../api/$api";

export const kureOpendataClientWithToken = (token: string) => {
  const $client = api(
    aspida(UrlFetchApp.fetch, {
      headers: {
        "ecp-api-token": token,
      },
    })
  );

  return $client;
};
