export interface RegisterDeviceTokenDTO {
  token: string;
  platform: "android" | "ios" | "web";
}
