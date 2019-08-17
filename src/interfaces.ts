import { AxiosResponse } from 'axios';

export interface IOptions {
  userId: string | number;
  appId: string;
  scope: string;
}

export interface IApiHeaders {
  [key: string]: string | number;
}

export interface IApiOptions {
  baseURL: string;
  headers?: IApiHeaders;
}

export interface AxiosResponseExtend extends AxiosResponse {
  body?: any;
}

export interface IOauthToken {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: string | Date;
}

export interface IMessageStatus {
  deliveryStatus: string;
  deliveryStatusExtend?: string;
}

export interface IMessage {
  hookUrl?: string;
  channel: string;
  sms_text: string;
  viber_text: string;
  sms_sender: string;
  viber_sender: string;
  phone: string;
}

export interface IMessageBatch {
  hookUrl?: string;
  channel: string;
  sms_text: string;
  viber_text: string;
  sms_sender: string;
  viber_sender: string;
  phones?: string[];
  groups?: string[];
  button_text?: string;
  button_link?: string;
  imageViber?: string;
}

export interface IMessageResponse {
  msgId: string;
}

export interface IMessageBatchIMessageBatch {
  idList: string[];
}

export interface IContactGroup {
  codeName: string;
  createdAt: string;
  name: string;
  size: number;
  _id: string;
}

export interface IViberContentItem {
  _id: string;
  created: string;
  file: string;
  imageId: string;
  imageUrl: string;
  name: string;
}
