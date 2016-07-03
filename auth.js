// Generated by CoffeeScript 1.10.0
(function() {
  var OAuth, accessURL, appName, authorizeURL, bio_data, cb, db, domain, http, key, login, loginCallback, oauth, oauth_secrets, port, requestURL, secret, url;

  http = require('http');

  OAuth = require('oauth').OAuth;

  url = require('url');

  db = low('auth.json');

  db.defaults({
    access_token: [],
    profile_data: []
  }).value();

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

  bio_data = {};

  oauth = new OAuth(requestURL, accessURL, key, secret, "1.0", loginCallback, "HMAC-SHA1");

  login = function(req, res) {
    return oauth.getOAuthRequestToken((function(_this) {
      return function(error, token, tokenSecret, results) {
        oauth_secrets[token] = tokenSecret;
        res.writeHead(302, {
          'Location': authorizeURL + "?oauth_token=" + token + "&name=" + appName + "&expiration=never"
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
        res.end(data);
        bio_data = JSON.parse(data);
        db.get('access_token').push({
          access_token: accessToken
        }).value();
        return db.get('profile_data').push({
          profile_data: bio_data
        }).value();
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
