/* eslint-disable no-param-reassign,consistent-return */
const _ = require('lodash');
const jwt = require('jsonwebtoken');
const debug = require('debug')('steemconnect:middleware');
const { decryptMessage, isDifferentHost } = require('../lib/utils');
const PermissionList = require('../lib/permissions');
const { getPermissionFromDB, getApp } = require('../db/utils');

function verifyAuth(req, res, next) {
  if (req.cookies.auth && typeof req.headers.authorization === 'undefined') {
    req.headers.authorization = `Bearer ${req.cookies.auth}`;
  }
  if (typeof req.headers.authorization !== 'undefined' && (req.headers.authorization.search('Bearer ') === 0)) {
    const auth = req.headers.authorization.substring('Bearer '.length);
    jwt.verify(auth, process.env.JWT_SECRET, (err, jwtData) => {
      if (err) {
        return res.sendStatus(401);
      }
      let message = decryptMessage(jwtData.secret, process.env.JWT_SECRET);
      message = JSON.parse(message);
      if (message.username === jwtData.username) {
        _.each(jwtData, (value, key) => {
          req[key] = value;
        });
        _.each(message, (value, key) => {
          req[key] = value;
        });
        return next();
      }
    });
  } else {
    return res.sendStatus(401);
  }
}

function checkOrigin(req, res, next) {
  const { appUserName } = req.params || {};
  const origin = req.get('origin');

  if (!appUserName) {
    res.status(500).send('Invalid AppUserName send requests as /api/appName');
  } else if (isDifferentHost(origin)) {
    return getApp(appUserName)
      .then((app) => {
        const inDevMode = app.env === 'dev';
        if (!app.origins) { throw new Error('App does not have origins defined'); }

        // Remove trailing slash from app.origins
        const acceptedOrigins = app.origins.map(acceptedOrigin => acceptedOrigin.replace(/\/$/, ''));
        let allowUrl = acceptedOrigins.indexOf(origin) >= 0;
        if (inDevMode === true && !allowUrl) {
          allowUrl =
            origin.indexOf('http://localhost') === 0 ||
            origin.indexOf('http://127.0.0.1') === 0;
        }

        if (allowUrl) {
          next();
        } else {
          throw new Error('Origin does not match from list of allowed origin');
        }

        return null;
      }).catch((err) => {
        debug(err);
        if (err.message === 'User not found') {
          res.status(500).send('AppName not found');
        } else {
          res.status(500).send(err && err.toString());
        }
      });
  } else {
    /* For request made from steemconnect website */
    return next();
  }
}

function checkPermission(req, res, next) {
  const { appUserName } = req.params || {};
  const reqFromSteemConnect = !isDifferentHost(req.get('origin'));

  const username = req.username;
  getPermissionFromDB(username, appUserName).then((permissions) => {
    req.permissions = permissions;
    const requestPath = req.path;
    if (requestPath === '/verify') {
      return next();
    }

    if (!permissions && !reqFromSteemConnect) {
      throw new Error('Unauthorized');
    }
    permissions = _.map((permissions || []), v => PermissionList[v]);
    const selectedQuery = _.find(permissions, p => (p.paths.indexOf(requestPath) >= 0));
    if (selectedQuery || reqFromSteemConnect) {
      next();
    } else {
      return res.status(401).json({ error: 'Not permitted', acceptedPermissions: req.permissions || [] });
    }
  }).catch((err) => {
    debug(err);
    res.status(500).send(err && err.toString());
  });
}

module.exports = {
  verifyAuth,
  checkOrigin,
  checkPermission,
};
