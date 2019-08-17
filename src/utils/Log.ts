/**
 Copyright © Oleg Bogdanov
 Developer: Oleg Bogdanov
 Contacts: https://github.com/wormen
 ---------------------------------------------
 https://www.npmjs.com/package/log4js
 */

import * as log4js from 'log4js';
import { DEBUG_LEVEL } from '../constants';

log4js.configure({
  appenders: {
    console: {
      type: 'console',
      layout: {
        type: 'pattern',
        pattern: '%[%d{yyyy-MM-dd hh.mm.ss.SSS} [%p]%] %m'
      }
    }
  },
  categories: {
    default: {
      appenders: ['console'],
      level: DEBUG_LEVEL
    }
  },
  pm2: true
});

let log = log4js.getLogger();

class Log {

  static info(...args): void {
    logFormat('info', ...args);
  }

  static trace(...args): void {
    logFormat('trace', ...args);
  }

  static debug(...args): void {
    logFormat('debug', ...args);
  }

  static warn(...args): void {
    logFormat('warn', ...args);
  }

  static error(...args): void {
    logFormat('error', ...args);
  }

  static fatal(...args): void {
    logFormat('fatal', ...args);
  }
}

export default Log;

function logFormat(level: string, ...args): void {
  let message = args.shift();
  log[level]('[Smsgold SDK]', message, ...args);
}
