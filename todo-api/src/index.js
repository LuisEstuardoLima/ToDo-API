'use strict';

const createApp = require('./app');

const PORT = process.env.PORT || 8080;
const app = createApp();

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Todo API escuchando en el puerto ${PORT}`);
});
