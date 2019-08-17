import axios, { AxiosInstance } from 'axios';
import { AxiosResponseExtend, IApiOptions } from './interfaces';
import { version } from '../package.json';
import { isJson, isString, param } from './utils';

export default class API {
  private options: IApiOptions = {
    baseURL: 'https://api.smsgold.ru',
    headers: {
      'X-SDK': `Node SDK | ${version}`,
      'X-Service': 'sms'
    }
  };

  get axios(): AxiosInstance {
    return axios.create(this.options);
  }

  get defaultOpts() {
    return {
      headers: { ...this.options.headers }
    };
  }

  setHeader(key: string, value: string | number): API {
    this.options.headers[key] = value;
    return this;
  }

  setToken(value): API {
    this.setHeader('Authorization', `Bearer ${value}`);
    return this;
  }

  /**
   * Разбор ответа
   */
  response(res: AxiosResponseExtend): any {
    let data = ``;

    if (res.hasOwnProperty('data')) {
      data = res.data;
    } else {
      data = res.body;
    }

    if (isString(data) && isJson(data)) {
      return JSON.parse(data);
    }

    return data;
  }

  get(url, query?: { [key: string]: any }) {
    return this.axios.get([url, param(query)].join(''), this.defaultOpts).then(this.response);
  }

  post(url, data, query?: { [key: string]: any }) {
    return this.axios.post([url, param(query)].join(''), data, this.defaultOpts).then(this.response);
  }
}
