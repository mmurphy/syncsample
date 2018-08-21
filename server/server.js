'use strict';

var sync = require('fh-sync');
var cors = require('cors');
var express = require('express');
var bodyParser = require('body-parser');
var async = require('async');

// Sync framework requires mongodb and redis to be running
var mongodbConnectionString = process.env.MONGO_CONNECTION_URL || 'mongodb://127.0.0.1:27017/sync';
var redisUrl = process.env.REDIS_CONNECTION_URL || 'redis://127.0.0.1:6379';

function main() {
  async.series([
    connectSyncDb,
    initialiseSyncDataset,
    startApplicationServer
  ], function (err) {
    if (err) {
      console.log('error starting sync server:');
      throw err;
    }
  });
}

function startApplicationServer (cb) {
  var app = express();

  //middleware
  app.use(bodyParser.json());
  app.use(cors());
  app.post('/sync/:datasetId', syncHandler);

  app.get('/', function (req, res) {
    res.send('This page is intentionally left blank');
  });

  app.get('/healthz', function (req, res) {
    res.json({msg: "Health Check ok", status: "OK", services: {db:{status: "UNKNOWN"},redis:{status: "UNKNOWN"}}});
  });

  app.listen(3000, function () {
    console.log('\nExample app listening on port 3000!');
    console.log('\nRunthe following from a terminal to get records via sync:');
    console.log('curl http://localhost:3000/sync/messages -X POST --data \'{"fn": "syncRecords"}\' -H "content-type:application/json"\n')
    return cb();
  });
}

/**
 * Sync express api required for sync clients
 * All sync clients will call that endpoint to sync data
 */
function syncHandler(req, res) {
  var dataset_id = req.params.datasetId;
  var params = req.body;

  // Invoke action in sync for specific dataset
  sync.invoke(dataset_id, params, function (err, result) {
    if (err) {
      res.status(500).json(err.toString());
      return;
    }
    return res.json(result)
  });
}

function connectSyncDb (cb) {
  var mongoOptions = {};
  sync.connect(mongodbConnectionString, mongoOptions, redisUrl, cb);
}

function initialiseSyncDataset (cb) {
  // See documentation for more options
  var options = {
    syncFrequency: 10 // seconds
  };

  // Following example will sync for single domain object called messages
  var datasetId = "messages";

  console.log("Init sync data handlers for dataset");
  sync.init(datasetId, options, function (err) {
    if (err) {
      cb(err);
    } else {
      cb();
    }
  });
}

main();