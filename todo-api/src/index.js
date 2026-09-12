'use strict';

const createApp = require('./app');

const PORT = process.env.PORT || 8080;
const APP_VERSION = process.env.APP_VERSION || '1.0';
const app = createApp();

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`TodoList API v${APP_VERSION} escuchando en el puerto ${PORT}`);
});
