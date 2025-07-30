require('dotenv').config();

const app = require('./src/app');
const PORT = process.env.PORT;
const BASE_URL = process.env.BASE_URL

app.listen(PORT, () => {
  console.log(`Server is running on ${BASE_URL}`);
});
