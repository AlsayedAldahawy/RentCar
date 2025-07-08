exports.index = (req, res) => {
  res.send(`
    <html>
      <body>
        <h3>Click to open Swagger Docs:</h3>
        <a href="https://49b6812f-1b1d-4330-89e4-77a9606a47f6-00-l3n7sfutzk4d.janeway.replit.dev/api-docs/#/Cars/" target="_blank">
          Open Swagger Documentation
        </a>
      </body>
    </html>
  `);
};
