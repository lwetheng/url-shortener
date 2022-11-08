const express = require('express');
const app = express();
const port = 3000;

app.get('/', function(request, response){
    response.sendFile('index.html',{ root: __dirname });
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  })

console.log("YOU STARTED URL-SHORTENER")