import axios, {AxiosInstance} from 'axios';
import {AxiosResponseExtend, IApiOptions} from './interfaces';
import {version} from '../package.json';
import {isJson, isString, param} from './utils';

export default class API {
  private options: IApiOptions = {
    baseURL: process.env.API_HOST || 'https://api.smsgold.ru',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'X-SDK': `Node SDK | ${version}`,
      'X-Service': 'sms'
    }
  };

  get axios(): AxiosInstance {
    return axios.create(this.options);
  }

  get defaultOpts() {
    return {
      headers: {...this.options.headers}
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

  useService(serviceName) {
    this.options.headers['X-Service'] = serviceName;
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

  get(url, query?: {[key: string]: any}): Promise<any> {
    return this.axios.get([this.options.baseURL, url, param(query)].join(''), this.defaultOpts).then(this.response);
  }

  post(url, data, query?: {[key: string]: any}): Promise<any> {
    return this.axios.post([this.options.baseURL, url, param(query)].join(''), data, this.defaultOpts).then(this.response);
  }

  upload(url, data, query?: {[key: string]: any}): Promise<any> {
    let opts = this.defaultOpts;
    opts.headers['Content-Type'] = 'multipart/form-data';
    return this.axios.post([this.options.baseURL, url, param(query)].join(''), data, opts).then(this.response);
  }
}
