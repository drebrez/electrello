// Generated by CoffeeScript 1.10.0
(function() {
  var OAuth, Trello, accessURL, appName, authorizeURL, bio_data, boardIDs, board_data, board_description, board_id, board_info, board_lists, board_names, cb, db, domain, http, key, login, loginCallback, low, oauth, oauth_secrets, org_id, org_info, org_members, org_names, organizationIDs, port, requestURL, secret, url;

  http = require('http');

  OAuth = require('oauth').OAuth;

  url = require('url');

  low = require('lowdb');

  db = low('auth.json');

  db.defaults({
    access_token: [],
    profile_data: [],
    board_names: [],
    organizations: []
  }).value();

  Trello = require("node-trello");

  domain = "127.0.0.1";

  port = 6080;

  requestURL = "https://trello.com/1/OAuthGetRequestToken";

  accessURL = "https://trello.com/1/OAuthGetAccessToken";

  authorizeURL = "https://trello.com/1/OAuthAuthorizeToken";

  appName = "Electrello";

  key = "f4c23306bf38a3ec4ca351f999ee05d3";

  secret = "8a0ab7a904d8e36924324c1605cb13a1985883b3f0bf08786e931398a2f7b822";

  loginCallback = "http://" + domain + ":" + port + "/cb";

  oauth_secrets = {};

  bio_data = [];

  board_data = [];

  boardIDs = [];

  organizationIDs = [];

  board_names = {};

  board_id = [];

  board_info = [];

  board_description = {};

  board_lists = [];

  org_info = [];

  org_names = [];

  org_id = [];

  org_members = [];

  oauth = new OAuth(requestURL, accessURL, key, secret, "1.0", loginCallback, "HMAC-SHA1");

  login = function(req, res) {
    return oauth.getOAuthRequestToken((function(_this) {
      return function(error, token, tokenSecret, results) {
        oauth_secrets[token] = tokenSecret;
        res.writeHead(302, {
          'Location': authorizeURL + "?oauth_token=" + token + "&name=" + appName + "&expiration=never&scope=read,write"
        });
        return res.end();
      };
    })(this));
  };

  cb = function(req, res) {
    var query, token, tokenSecret, verifier;
    query = url.parse(req.url, true).query;
    token = query.oauth_token;
    tokenSecret = oauth_secrets[token];
    verifier = query.oauth_verifier;
    return oauth.getOAuthAccessToken(token, tokenSecret, verifier, function(error, accessToken, accessTokenSecret, results) {
      return oauth.getProtectedResource("https://api.trello.com/1/members/me/", "GET", accessToken, accessTokenSecret, function(error, data, response) {
        var get_board_data, get_organization_data, i, o, t, trelloToken;
        res.end(data);
        bio_data = JSON.parse(data);
        db.get('access_token').push({
          access_token: accessToken
        }).value();
        db.get('profile_data').push({
          profile_data: bio_data
        }).value();
        boardIDs = bio_data['idBoards'];
        organizationIDs = bio_data['idOrganizations'];
        trelloToken = accessToken;
        t = new Trello("f4c23306bf38a3ec4ca351f999ee05d3", trelloToken);
        get_organization_data = function(organizationIDs) {};
        o = 0;
        while (o < organizationIDs.length) {
          t.get('/1/organizations/' + organizationIDs[o] + '?members=all&member_fields=username,fullName', function(err, data) {
            if (err) {
              throw err;
            }
            org_info = data;
            org_names = org_info['name'];
            org_id = org_info['id'];
            org_members = org_info['members'];
            return db.get('organizations').push({
              id: org_id,
              name: org_names,
              members: org_members
            }).value();
          });
          o++;
        }
        get_board_data = function(boardIDs) {};
        i = 0;
        while (i < boardIDs.length) {
          t.get('/1/boards/' + boardIDs[i] + '?lists=open&list_fields=name', function(err, data) {
            if (err) {
              throw err;
            }
            board_info = data;
            board_names = board_info['name'];
            board_id = board_info['id'];
            board_lists = board_info['lists'];
            return db.get('board_names').push({
              id: board_id,
              name: board_names,
              lists: board_lists
            }).value();
          });
          i++;
        }
      });
    });
  };

  http.createServer(function(req, res) {
    if (/^\/login/.test(req.url)) {
      return login(req, res);
    } else if (/^\/cb/.test(req.url)) {
      return cb(req, res);
    } else {
      return res.end("Don't know about that");
    }
  }).listen(port, domain);

  console.log("Server running at " + domain + ":" + port + "; hit " + domain + ":" + port + "/login");

}).call(this);
