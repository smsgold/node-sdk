export function isString(arg) {
  return typeof arg === 'string';
}

export function isJson(str) {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}

export function isObject(arg) {
  return arg !== null && typeof arg === 'object';
}

/**
 * Генерируем query string на основе json
 * @param json
 * @returns {string}
 */
export function param(json) {
  if (!isObject(json) || Object.keys(json).length === 0) return '';

  return '?' +
    Object.keys(json).map(function(key) {
      return encodeURIComponent(key) + '=' +
        encodeURIComponent(json[key]);
    }).join('&');
}

export function fixPhone(phone: string | number): string {
  phone = String(phone).replace(/\D+/g, '');
  if (phone.startsWith('89')) {
    phone = phone.replace(/^89/, '79');
  }
  return phone;
}
