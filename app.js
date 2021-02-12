const express = require('express');
const server = express()
const hostname = '127.0.0.1';
const port = 3000;
const { Console } = require('console');

const fileMerger = require('./modules/tcx-merger.js');

server.get('/', (req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.send('Hello World!')
});

server.get('/generate_file', (req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-disposition', 'attachment; filename=merged_file.tcx');
  res.setHeader('Content-type', 'text/xml');

  let xmlFile = fileMerger.call();

  // on dirait que l'elevation est pas correcte, il faudrait voir si on doit pas aussi parser du stuff du fichier .gpx
  res.send(xmlFile);
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});