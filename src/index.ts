import * as fs from 'fs';
import { EventEmitter } from 'events';
import {
  IMessage,
  IMessageBatch,
  IMessageBatchIMessageBatch,
  IMessageResponse,
  IMessageStatus,
  IOauthToken,
  IOptions,
  IContactGroup, IViberContentItem
} from './interfaces';
import API from './Api';
import { CHANNEL, EVENTS, STATUS, STATUS_EXTEND } from './constants';
import { fixPhone } from './utils';
import Log from './utils/Log';
import { PropertyError, SmsgoldSdkError } from './Errors';

const defaulOptions: IOptions = {
  userId: 0,
  appId: '',
  scope: ''
};

export default class SmsgoldSdk extends EventEmitter {
  private api: API = new API();

  constructor(private options: IOptions = defaulOptions) {
    super();

    this.init();

    this.on(EVENTS.TOKEN_DATA, (data: IOauthToken) => {
      this.api.setToken(data.accessToken);
    });
  }

  private init() {
    if (!this.options.scope || String(this.options.scope).length === 0) {
      throw Log.error(new PropertyError('scope'));
    }

    if (!this.options.appId || String(this.options.appId).length === 0) {
      throw Log.error(new PropertyError('appId'));
    }

    if (
      !this.options.userId ||
      [0, '0'].includes(this.options.userId)
    ) {
      throw Log.error(new PropertyError('userId'));
    }
  }

  /**
   * Полчение токена
   * http://gitlab.smsgold.ru/root/docs/wikis/Auth
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
   * http://gitlab.smsgold.ru/root/docs/wikis/Auth
   */
  refreshToken(refreshToken: string): Promise<IOauthToken> {
    const { appId, scope } = this.options;
    return this.api.get(`/oauth/refreshToken/${this.options.userId}`, {
      appId,
      scope,
      token: refreshToken
    }).then(data => {
      this.emit(EVENTS.TOKEN_DATA, data);
      return data;
    });
    // todo сохраняем токены в локальную БД
  }

  /**
   * Список групп контков
   */
  getContactGroups(): Promise<IContactGroup[]> {
    return this.api.get('/sms/v1/contacts/getGroups');
  }

  /**
   * Получение списка загруженного контентаа для вайбера
   */
  getViberContent(): Promise<IViberContentItem[]> {
    return this.api.get('/sms/v1/userdata/viberContents');
  }

  /**
   * Загрузка контента для вайбера
   * @param fileName - нзвание файла отображаемого в UI
   * @param filePath
   */
  async uploadViberImage(fileName: string, filePath: string): Promise<void> {

    if (!fs.existsSync(filePath)) {
      throw Log.error(new SmsgoldSdkError('File not fount'));
    }

    const getFileData = (): any => new Promise((resolve, reject) => {
      fs.readFile(filePath, (err, data) => {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });

    const file = await getFileData();
    if (file) {
      this.api.post('/upload/v1', {
        fileName,
        file
      }, { type: 'viber' });
    } else {
      throw Log.error(new SmsgoldSdkError('Error reading file'));
    }
  }

  /**
   * Получение статуса сообщения
   * http://gitlab.smsgold.ru/root/docs/wikis/messages/get-status
   * @param messageId
   */
  getStatus(messageId: string): Promise<IMessageStatus> {
    return this.api.get(`/sms/v1/message/getStatus/${messageId}`)
      .then(data => {
        this.emit(EVENTS.STATUS_ID, data);
        return data;
      });
  }

  /**
   * Отправка одиночного сообщения
   * http://gitlab.smsgold.ru/root/docs/wikis/messages/send#%D0%BE%D1%82%D0%BF%D1%80%D0%B0%D0%B2%D0%BA%D0%B0-%D0%BE%D0%B4%D0%B8%D0%BD%D0%BE%D1%87%D0%BD%D1%8B%D1%85-%D1%81%D0%BE%D0%BE%D0%B1%D1%89%D0%B5%D0%BD%D0%B8%D0%B9
   * @param msg
   */
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

  /**
   * Пакетная отправка сообщений
   * http://gitlab.smsgold.ru/root/docs/wikis/messages/send#%D0%BF%D0%B0%D0%BA%D0%B5%D1%82%D0%BD%D0%B0%D1%8F-%D0%BE%D1%82%D0%BF%D1%80%D0%B0%D0%B2%D0%BA%D0%B0-%D1%81%D0%BE%D0%BE%D0%B1%D1%89%D0%B5%D0%BD%D0%B8%D0%B9
   * @param msg
   */
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
  EVENTS,
  STATUS,
  STATUS_EXTEND
};
