var express = require('express');
var bodyParser = require('body-parser');

var cors = require('cors');
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('bets.sqlite');

function initDB() {
  db.run(`
    CREATE TABLE IF NOT EXISTS users(
      login TEXT PRIMARY KEY,
      token TEXT,
      created NOT NULL
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS topics(
      topic_id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      created NOT NULL,
      UNIQUE(title)
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS bets(
      bet_id INTEGER PRIMARY KEY AUTOINCREMENT,
      topic_id INTEGER NOT NULL,
      confidence INTEGER NOT NULL,
      author TEXT NOT NULL,
      created NOT NULL,
      UNIQUE(topic_id, author)
    )
  `);
}
initDB();

var app = express();
app.use(bodyParser.json());
// app.use(express.static('static'));

function checkToken(req, res, cb) {
  var token = req.query.token || req.body.token;
  if (!token) {
    res.status(500).send('no token');
    return;
  }
  db.get(
    'SELECT login FROM users WHERE token = ?',
    token,
    function(err, row) {
      if (err) {
        console.log('user lookup failed');
        res.status(500).send(err);
        return;
      }

      if (!row) {
        console.log('user not found');
        res.status(500).send('user not found, token is invalid');
        return;
      }

      var login = row.login;
      cb(login);
    }
  );
}

app.get('/api/list', cors(), function(req, res) {
  // TODO - load from DB
  var bets = [];
  var error = undefined;
  checkToken(req, res, function(login) {
    db.each(
      `
        SELECT
          topics.topic_id AS topic_id,
          topics.title AS title,
          COUNT(1) AS c,
          SUM(CASE bets.author WHEN ? THEN bets.confidence ELSE 0 END) AS self_confidence,
          topics.created AS topic_created,
          MAX(bets.created) AS last_bet_created
        FROM topics, bets
        WHERE topics.topic_id = bets.topic_id
        GROUP BY topics.topic_id
        ORDER BY last_bet_created DESC
      `,
      login,
      function(err, row) {
        if (err) {
          error = err;
          return;
        }
        bets.push({
          topic_id: row.topic_id,
          title: row.title,
          count: row.c,
          self_confidence: (row.self_confidence || null),
          topic_created: row.topic_created,
          last_bet_created: row.last_bet_created,
        });
      },
      function (err) {
        if (err || error) {
          res.status(500).send(err || error);
        }
        else {
          res.json(bets);
        }
      }
    );
  });
});

app.options('/api/append', cors());
app.post('/api/append', cors(), function(req, res) {
  var topic_id = req.body.topic_id;
  var confidence = req.body.confidence;
  confidence = parseInt(confidence);
  if (confidence < 50 || confidence > 99) {
    res.status(500).send('Confidence must be an integer in [50,99] interval');
    return;
  }
  var token = req.body.token;
  checkToken(req, res, function(login) {
    db.prepare('INSERT INTO bets(topic_id, confidence, author, created) VALUES(?,?,?,STRFTIME("%s", CURRENT_TIMESTAMP))').run(
      topic_id, confidence, login,
      function(err) {
        if (err) {
          console.log('insert into bets failed');
          res.status(500).send(err);
          return;
        }

        console.log('inserted into bets');
        res.json({ status: 'ok' });
      }
    );
  });
});

app.options('/api/add', cors());
app.post('/api/add', cors(), function(req, res) {
  var title = req.body.title;
  if (title.length < 8) {
    res.status(500).send('title is too short');
    return;
  }
  var confidence = req.body.confidence;

  checkToken(req, res, function(login) {
    db.prepare('INSERT INTO topics(title, created) VALUES(?,STRFTIME("%s", CURRENT_TIMESTAMP))').run(
      title,
      function(err) {
        if (err) {
          console.log('insert into topics failed');
          res.status(500).send(err);
          return;
        }

        console.log('inserted into topics');
        var topic_id = this.lastID;
        db.prepare('INSERT INTO bets(topic_id, confidence, author, created) VALUES(?,?,?,STRFTIME("%s", CURRENT_TIMESTAMP))').run(
          topic_id, confidence, login,
          function(err) {
            if (err) {
              console.log('bets insert failed');
              db.prepare('DELETE FROM topic WHERE topic_id=?').run(topic_id, function(err) {
                console.log('cleanup failed');
              });
              res.status(500).send(err);
              return;
            }

            console.log('inserted into bets');
            res.json({ status: 'ok' });
          }
        );
      }
    );
  });
});

app.options('/api/login', cors());
app.get('/api/check-token', cors(), function(req, res) {
  checkToken(req, res, function(login) {
    res.json({ login: login });
  });
});

app.options('/api/login', cors());
app.post('/api/login', cors(), function(req, res) {
  var login = req.body.login;
  if (!RegExp(/^[a-zA-Z0-9_]+$/).test(login)) {
    res.status(500).send('login should be alphanumerical (with possible underscores)');
    return;
  }
  var token = Math.random().toString(36).slice(-8);

  db.prepare('INSERT INTO users(login, token, created) VALUES(?,?,STRFTIME("%s", CURRENT_TIMESTAMP))').run(
    login, token,
    function(err) {
      if (err) {
        res.status(500).send(err);
      }
      else {
        res.json({ login: login, token: token });
      }
    }
  );
});

app.listen(8000, 'localhost', function () {
  console.log('App is listening on http://localhost:8000');
});

/*

  # backend

  ### POST /add
  { text: 'something', confidence: 80, token: 'asdfasdfasdf' }

  Response: 'ok'

  ### POST /append
  { id: 123, confidence: 70, token: 'asdfasdfasdf' }

  Response: 'ok'

  ### GET /list?token=adsf

  Response:
  [
  { id: 1, text: 'something', count: 3 },
  { id: 2, text: 'blah', count: 1 }
  ]

  ### POST /login
  { login: 'somebody' }

  Response:
  { token: 'aoerawoerua' }

  ### GET /check-token?token=adsf

  Response:
  { status: 'ok' }
  or an error
*/
