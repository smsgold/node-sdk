#NodeSDK
Библиотека для работы с [API](http://gitlab.smsgold.ru/root/docs/wikis/Home) SmsGold

### Каналы < CHANNEL >
- SMS - смс сообщения
- VIBER - viber сообщения
- CASCADE - каскад, отправка viber, в случае неудачи, отправляется смс

### Методы

- getToken() - получение OAuth токена
- refreshToken( refreshToken ) - обновление OAuth токена
- getContactGroups() - получение списка групп контактов
- getViberContent() - Получение списка загруженного контента для вайбера
- uploadViberImage() - Загрузка контента для вайбера<br/>
    [fileName] - нзвание файла отображаемого в UI<br/>
    [filePath] - абсолютный путь в вашей вафловой системе<br/>

- getStatus( messageId ) - Получение статуса сообщения<br/>
    [messageId] - ID сообщения

- sendOneMessage({ поля описаны в документации }) - Отправка одиночного сообщения
- sendBathMessage({ поля описаны в документации }) - Пакетная отправка сообщений

### События < EVENTS >
- TOKEN_DATA - данные токен, при получении/обновлении токена
- STATUS_MESSAGE - данные статуса сообщения
- MESSAGE_ID - ID сообщения, срабатывает при отправке одиночных сообщений
- MESSAGE_BATCH - список ID сообщений, срабатывает при пакетной отправке сообщений

### Пример

```JS
const SDK = require('@smsgold/node-sdk');

const client = new SDK.Client({
  userId: 451,
  appId: '5d67decc88e4426a2cdc8321',
  secret: '4701df2b3fbb7c90677c5fc05c6457e9253273a86a94bff2da2dfab1994ed79b',
  scope: '[func:message:denyClone]'
});

client.on(SDK.EVENTS.TOKEN_DATA, (data) => {
  console.log('token data', data);
});

client.on(SDK.EVENTS.STATUS_MESSAGE, (data) => {
  console.log('message status', data);
});

client.on(SDK.EVENTS.MESSAGE_ID, (data) => {
  console.log('one message ID', data);
});

client.on(SDK.EVENTS.MESSAGE_BATCH, (data) => {
  console.log('message list id`s', data);
});

(async () => {
  await client.getToken();

  await client.sendOneMessage({
    channel: SDK.CHANNEL.SMS,
    sms_text: `test-${Date.now()}`,
    sms_sender: 'SmsGold',
    phone: '79141111111'
  })

  await client.sendBathMessage({
    channel: SDK.CHANNEL.SMS,
    sms_text: `test-${Date.now()}`,
    sms_sender: 'SmsGold',
    phones: [
      '79141111111'
    ]
  });
})();
```
