import { cc } from "./datastudioapp.js";

// https://developers.google.com/datastudio/connector/auth#getauthtype
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const getAuthType = () => {
  return cc.newAuthTypeResponse().setAuthType(cc.AuthType.NONE).build();
};
