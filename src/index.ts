import * as fs from 'fs';
import {EventEmitter} from 'events';
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
import {CHANNEL, EVENTS, STATUS, STATUS_EXTEND} from './constants';
import {fixPhone} from './utils';
import Log from './utils/Log';
import {PropertyError, SmsgoldSdkError} from './Errors';

const defaulOptions: IOptions = {
  userId: 0,
  appId: '',
  scope: '',
  secret: ''
};

class SmsgoldSdk extends EventEmitter {
  private api: API = new API();

  constructor(private options: IOptions = defaulOptions) {
    super();

    this.init();

    this.on(EVENTS.TOKEN_DATA, (data: IOauthToken) => {
      this.api.setToken(data.accessToken);
    });
  }

  private init() {
    if (!this.options.secret || String(this.options.secret).length === 0) {
      return Log.error(new PropertyError('secret'));
    }

    if (!this.options.scope || String(this.options.scope).length === 0) {
      return Log.error(new PropertyError('scope'));
    }

    if (!this.options.appId || String(this.options.appId).length === 0) {
      return Log.error(new PropertyError('appId'));
    }

    if (
      !this.options.userId ||
      [0, '0'].includes(this.options.userId)
    ) {
      Log.error(new PropertyError('userId'));
    }
  }

  /**
   * Полчение токена
   * http://gitlab.smsgold.ru/root/docs/wikis/Auth
   */
  getToken(): Promise<IOauthToken> {
    const {appId, scope, secret} = this.options;
    return this.api.get(`/oauth/getToken/${this.options.userId}`, {
      appId,
      scope,
      secret
    }).then(data => {
      this.emit(EVENTS.TOKEN_DATA, data);
      return data;
    });
  }

  /**
   * Обновление токена
   * http://gitlab.smsgold.ru/root/docs/wikis/Auth
   */
  refreshToken(refreshToken: string): Promise<IOauthToken> {
    const {appId, scope} = this.options;
    return this.api.get(`/oauth/refreshToken/${this.options.userId}`, {
      appId,
      scope,
      token: refreshToken
    }).then(data => {
      this.emit(EVENTS.TOKEN_DATA, data);
      return data;
    });
  }

  /**
   * Список групп контков
   */
  getContactGroups(): Promise<IContactGroup[]> {
    return this.api.get('/sms/v1/contacts/getGroups');
  }

  /**
   * Получение списка загруженного контента для вайбера
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
      return Log.error(new SmsgoldSdkError('File not fount'));
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
      await this.api.upload('/upload/v1', {
        fileName,
        file
      }, {type: 'viber'});
    } else {
      Log.error(new SmsgoldSdkError('Error reading file'));
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
        this.emit(EVENTS.STATUS_MESSAGE, data);
        return data;
      });
  }

  /**
   * Отправка одиночного сообщения
   * http://gitlab.smsgold.ru/root/docs/wikis/messages/send#%D0%BE%D1%82%D0%BF%D1%80%D0%B0%D0%B2%D0%BA%D0%B0-%D0%BE%D0%B4%D0%B8%D0%BD%D0%BE%D1%87%D0%BD%D1%8B%D1%85-%D1%81%D0%BE%D0%BE%D0%B1%D1%89%D0%B5%D0%BD%D0%B8%D0%B9
   * @param msg
   */
  sendOneMessage(msg: IMessage): Promise<IMessageResponse> {
    const phone = fixPhone(msg.phone || '');

    if (String(phone).length < 11) {
      Log.error(new PropertyError('phone'));
      return;
    }

    this.api.useService('sms');
    return this.api.post('/sms/v1/message/sendOne', Object.assign({
      channel: CHANNEL.SMS,
      sms_text: '',
      viber_text: '',
      sms_sender: 'SmsGold',
      viber_sender: '',
      phone: ''
    }, msg, {phone}))
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
    const phones = (msg.phones || [])
      .map(phone => fixPhone(phone || ''))
      .filter(phone => String(phone).length >= 11);

    if (phones.length > 1e4) {
      Log.error(new SmsgoldSdkError('Maximum number of phone numbers 10000'));
      return;
    }

    this.api.useService('sms');
    return this.api.post('/sms/v1/message/sendBatch', Object.assign({
      channel: CHANNEL.SMS,
      sms_text: '',
      viber_text: '',
      sms_sender: 'SmsGold',
      viber_sender: '',
      phones,
      groups: [],
      button_text: '',
      button_link: '',
      imageViber: ''
    }, msg)).then(data => {
      this.emit(EVENTS.MESSAGE_BATCH, data);
      return data;
    });
  }
}

export const Client = SmsgoldSdk;
export {
  CHANNEL,
  EVENTS,
  STATUS,
  STATUS_EXTEND
};
