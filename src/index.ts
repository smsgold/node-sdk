import { EventEmitter } from 'events';
import {
  IMessage,
  IMessageBatch,
  IMessageBatchIMessageBatch,
  IMessageResponse,
  IMessageStatus,
  IOauthToken,
  IOptions
} from './interfaces';
import API from './Api';
import { CHANNEL, EVENTS } from './constants';
import { fixPhone } from './utils';

/**
 * todo
 * загрузк контента для вайбера
 * получение вайбер контентаа
 * регистрация шаблона для ВК
 * получение списка шаблонов ВК
 * отправк сообщений ВК
 */
export default class SmsgoldSdk extends EventEmitter {
  private api: API = new API();

  constructor(private options: IOptions) {
    super();
  }

  /**
   * Полчение токена
   */
  getToken(): Promise<IOauthToken> {
    const { appId, scope } = this.options;
    return this.api.get(`/oauth/getToken/${this.options.userId}`, {
      appId,
      scope
    }).then(data => {
      this.emit(EVENTS.TOKEN_DATA, data);
      return data;
    });
    // todo сохраняем токены в локальную БД
  }

  /**
   * Обновление токена
   */
  refreshToken(): Promise<IOauthToken> {
    const { appId, scope } = this.options;
    return this.api.get(`/oauth/refreshToken/${this.options.userId}`, {
      appId,
      scope
    }).then(data => {
      this.emit(EVENTS.TOKEN_DATA, data);
      return data;
    });
    // todo сохраняем токены в локальную БД
  }

  /**
   * Получение статуса сообщения
   * @param messageId
   */
  getStatus(messageId: string): Promise<IMessageStatus> {
    return this.api.get(`/sms/v1/message/getStatus/${messageId}`)
      .then(data => {
        this.emit(EVENTS.STATUS_ID, data);
        return data;
      });
  }

  sendOneMessage(msg: IMessage): Promise<IMessageResponse> {
    return this.api.post('/sms/v1/message/sendOne', Object.assign({
      channel: CHANNEL.SMS,
      sms_text: '',
      viber_text: '',
      sms_sender: '',
      viber_sender: '',
      phone: ''
    }, msg, { phone: fixPhone(msg.phone || '') }))
      .then(data => {
        this.emit(EVENTS.MESSAGE_ID, data.msgId);
        return data;
      });
  }

  sendBathMessage(msg: IMessageBatch): Promise<IMessageBatchIMessageBatch> {
    return this.api.post('/sms/v1/message/sendBatch', Object.assign({
      channel: CHANNEL.SMS,
      sms_text: '',
      viber_text: '',
      sms_sender: '',
      viber_sender: '',
      phones: (msg.phones || [])
        .filter(phone => String(phone).length >= 11)
        .map(phone => fixPhone(phone || '')),
      groups: [],
      button_text: '',
      button_link: '',
      imageViber: ''
    }, msg));
  }
}

export {
  CHANNEL,
  EVENTS
};
