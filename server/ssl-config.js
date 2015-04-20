/**
 * Created by bmartin on 17/04/15.
 */
var path = require('path'),
  fs = require("fs");

exports.privateKey = fs.readFileSync('/Users/bmartin/Documents/wellbe/api/server/ssl/server.key').toString();
exports.certificate = fs.readFileSync('/Users/bmartin/Documents/wellbe/api/server/ssl/server.crt').toString();
exports.passphrase = 'AXAAXA';
