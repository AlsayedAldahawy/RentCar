require('dotenv').config();

const serverUrl = process.env.BASE_URL


exports.index = (req, res) => {
  res.send(`
    <html>
      <body>
        <h3>Click to open Swagger Documentations:</h3>
        <a href='${serverUrl}/api-docs' target="_blank">
          Open Swagger Documentation
        </a>
      </body>
    </html>
  `);
};
