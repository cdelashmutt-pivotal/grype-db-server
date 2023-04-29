'use strict';

const express = require('express');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto')

// Constants
const directoryPath = process.env.DB_PATH || path.join(__dirname, "db");
const dbFileRE = /vulnerability-db_v([0-9])_[^_]*_[^\.]*\.tar\.gz/;
const PORT = 8080;
const HOST = '0.0.0.0';

// App
const app = express();
app.set('trust proxy', true)

var fileInfo=[];

app.get('/listing.json', (req, res) => {
  const proxyHost = req.headers["x-forwarded-host"];
  const host = proxyHost ? proxyHost : req.headers.host;
  res.setHeader('Content-Type', 'application/json');
  const nowString = new Date().toISOString();
  var listing = {"available": {}};
  fileInfo.forEach( file => {
    listing.available[file.version] = [{
      "built": nowString,
      "version": file.version,
      "checksum": "sha256:" + file.hash,
      "url": `${req.protocol}://${host}/${file.file}`
    }];
  });
  res.json(listing);
});

console.log("Building listing.json")
fs.readdir(directoryPath, function (err, files) {
  //handling error
  if (err) {
      return console.log('Unable to scan directory: ' + err);
  } 
  //listing all files using forEach
  files.forEach(function (file) {
    var match = file.match(dbFileRE);
    if(match) {
      var buff = fs.readFileSync(path.join(directoryPath,file));
      var hash = crypto.createHash("sha256").update(buff).digest("hex");
      fileInfo[fileInfo.length] = {
        "file": file,
        "version": parseInt(match[1]),
        "hash": hash
      }
    }
  });
});

app.get('/*', function(req, res){
  const file = `${directoryPath}/${req.path}`;
  res.download(file); // Set disposition and send it.
});

app.listen(PORT, HOST, () => {
  console.log(`Running on http://${HOST}:${PORT}`);
});