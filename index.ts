import express = require('express');

const app: express.Application = express();

app.use('/static', express.static('static'));

app.get('/index', function (req, res) {
  res.send(`
  <!DOCTYPE html>
  <html lang="en">
      <head>
          <link rel="stylesheet" href="https://unpkg.com/@atlaskit/css-reset@2.0.0/dist/bundle.css" media="all">
          <script src="https://connect-cdn.atl-paas.net/all.js" async></script>
      </head>
      <body>
          <section id="content" class="ac-content">
              <h1>Proof of Concept Page</h1>
              This page is dynamically generated from node.js
          </section>
      </body>
  </html>
  `);
});

app.use(function(req, res){
    res.send("Oopsie");
});

app.listen(8000, function () {
  console.log('App listening on port 8000!');
});