/* eslint-env node */
/* eslint-disable no-console */
import "https";
import "querystring";
import "fs";

import express, { Request, Response, NextFunction } from "express";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import session from "express-session";

import sqlite3 from "sqlite3";
sqlite3.verbose();
const db = new sqlite3.Database("bets.sqlite");

import passport from "passport";
const SlackStrategy = require("passport-slack").Strategy;
const {
  DISABLE_NEW_BETS,
  SESSION_SECRET,
  CLIENT_ID,
  CLIENT_SECRET,
  SLACK_TEAM_ID
} = process.env;

if (!SESSION_SECRET) {
  throw Error("SESSION_SECRET should be set");
}
if (!CLIENT_ID) {
  throw Error("CLIENT_ID should be set");
}
if (!CLIENT_SECRET) {
  throw Error("CLIENT_SECRET should be set");
}
if (!SLACK_TEAM_ID) {
  throw Error("SLACK_TEAM_ID should be set");
}

type DoneFunction = (err: any, user?: Object) => void;

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

function createUser(login: string, done: DoneFunction) {
  const token = Math.random()
    .toString(36)
    .slice(-8);

  db
    .prepare(
      'INSERT INTO users(login, token, created) VALUES(?,?,STRFTIME("%s", CURRENT_TIMESTAMP))'
    )
    .run(login, token, (err: Error | null) => {
      if (err) {
        done("DB insert error");
      } else {
        done(null, {
          token,
          login
        });
      }
    });
}

function createOrGetUser(login: string, done: DoneFunction) {
  db.get("SELECT token FROM users WHERE login = ?", login, (err, row) => {
    if (err) {
      done("DB select error");
    }
    if (row) {
      // user found
      done(null, {
        token: row.token,
        login
      });
    } else {
      createUser(login, done);
    }
  });
}

passport.use(
  new SlackStrategy(
    {
      clientID: CLIENT_ID,
      clientSecret: CLIENT_SECRET
    },
    (
      accessToken: string,
      refreshToken: string,
      profile: { user: { id: string } },
      done: (err: any, user?: any) => void
    ) => {
      createOrGetUser(profile.user.id, done);
    }
  )
);

const app = express();
app.use(cookieParser());
app.use(bodyParser.json());
app.use(express.static("build"));
app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false
  })
);
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

// path to start the OAuth flow
app.get("/auth/slack", passport.authorize("slack"));

// OAuth callback url
app.get(
  "/auth/slack/callback",
  passport.authenticate("slack", { failureRedirect: "/" }),
  (req, res) => {
    res.redirect("/");
  }
);

// TODO - implement tokens as passport strategy
function checkAuth(req: Request, res: Response, next: NextFunction) {
  if (req.user) {
    // authenticated with cookie
    next();
    return;
  }
  const token = req.query.token || req.body.token;
  if (!token) {
    res.status(500).send("no token and no login");
    return;
  }

  db.get("SELECT login FROM users WHERE token = ?", token, (err, row) => {
    if (err) {
      console.log("user lookup failed");
      res.status(500).send(err);
      return;
    }

    if (!row) {
      console.log("user not found");
      res.status(500).send("user not found, token is invalid");
      return;
    }
    req.user = {
      login: row.login,
      token
    };
    next();
  });
}

app.get("/api/list", checkAuth, (req: Request, res: Response) => {
  const login = req.user!.login;
  const bets: Object[] = [];
  let error: Error | undefined = undefined;
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
    (err, row) => {
      if (err) {
        error = err;
        return;
      }
      bets.push({
        topic_id: row.topic_id,
        title: row.title,
        count: row.c,
        self_confidence: row.self_confidence || null,
        topic_created: row.topic_created,
        last_bet_created: row.last_bet_created
      });
    },
    err => {
      if (err || error) {
        res.status(500).send(err || error);
      } else {
        res.json(bets);
      }
    }
  );
});

app.post("/api/append", checkAuth, (req, res) => {
  if (DISABLE_NEW_BETS) {
    res.status(500).send("New bets are disabled");
    return;
  }
  const login = req.user!.login;
  const topicId = req.body.topic_id;
  let confidence = req.body.confidence;
  confidence = parseInt(confidence, 10);
  if (confidence < 1 || confidence > 99) {
    res.status(500).send("Confidence must be an integer in [1,99] interval");
    return;
  }
  db
    .prepare(
      `
      INSERT INTO bets(topic_id, confidence, author, created)
      VALUES(?,?,?,STRFTIME("%s", CURRENT_TIMESTAMP))
  `
    )
    .run([topicId, confidence, login], err => {
      if (err) {
        console.log("insert into bets failed");
        res.status(500).send(err);
        return;
      }

      console.log("inserted into bets");
      res.json({ status: "ok" });
    });
});

app.post("/api/add", checkAuth, (req, res) => {
  if (DISABLE_NEW_BETS) {
    res.status(500).send("New bets are disabled");
    return;
  }
  const login = req.user!.login;
  const title = req.body.title;
  if (title.length < 8) {
    res.status(500).send("title is too short");
    return;
  }
  const confidence = req.body.confidence;
  if (confidence < 50 || confidence > 99) {
    res.status(500).send("Confidence must be an integer in [50,99] interval");
    return;
  }

  db
    .prepare(
      `
    INSERT INTO topics(title, created)
    VALUES(?,STRFTIME("%s", CURRENT_TIMESTAMP))
  `
    )
    .run(title, function(err) {
      if (err) {
        console.log("insert into topics failed");
        res.status(500).send(err);
        return;
      }

      console.log("inserted into topics");
      const topicId = this.lastID;
      db
        .prepare(
          `
        INSERT INTO bets(topic_id, confidence, author, created)
        VALUES(?,?,?,STRFTIME("%s", CURRENT_TIMESTAMP))
      `
        )
        .run([topicId, confidence, login], insertErr => {
          if (insertErr) {
            console.log(`bets insert failed: ` + insertErr);
            db
              .prepare("DELETE FROM topics WHERE topic_id=?")
              .run([topicId], deleteErr => {
                if (deleteErr) {
                  console.log("cleanup failed");
                }
              });
            res.status(500).send(err);
            return;
          }

          console.log("inserted into bets");
          res.json({ status: "ok" });
        });
    });
});

app.get("/api/check-auth", checkAuth, (req, res) => {
  res.json(req.user);
});

app.get("/api/logout", (req, res) => {
  req.logout();
  res.json({ "logged-out": true });
});

if (process.env.DEV_MODE) {
  app.get("/api/fakeuser", (req, res) => {
    const login = req.query.login;
    if (!RegExp(/^[a-zA-Z0-9_]+$/).test(login)) {
      res
        .status(500)
        .send("login should be alphanumerical (with possible underscores)");
      return;
    }
    createUser(login, (err, user) => {
      if (err) {
        res.status(500).send(err);
        return;
      }
      res.json(user);
    });
  });
}

const PORT: number = parseInt(process.env.PORT || "") || 3001;
app.listen(PORT, "localhost", () => {
  console.log(`App is listening on http://localhost:${PORT}`);
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
