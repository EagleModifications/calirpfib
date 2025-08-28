const express = require("express");
const session = require("express-session");
const passport = require("passport");
const { Strategy } = require("passport-discord");
const fetch = require("node-fetch"); // optional in Node 18+
const { Client, Events, GatewayIntentBits } = require("discord.js");
const path = require("path");
const { token } = require("./config.json");

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once(Events.ClientReady, readyClient => {
  console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

const app = express();

// --- CONFIG ---
const CLIENT_ID = "1410608101807357952";
const CLIENT_SECRET = "LWoDc5f7vHpA1iHtJB8U9EM6bDich5nd";
const CALLBACK_URL = "https://calirpfib.onrender.com/callback";
const GUILD_ID = "1410607101054816388";
const REQUIRED_ROLE_ID = "1410607189739049082";

// Setup session
app.use(
  session({
    secret: "supersecret",
    resave: false,
    saveUninitialized: false,
  })
);

// Setup passport
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

passport.use(
  new Strategy(
    {
      clientID: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
      callbackURL: CALLBACK_URL,
      scope: ["identify", "guilds", "guilds.members.read"],
    },
    (accessToken, refreshToken, profile, done) => {
      profile.accessToken = accessToken;
      return done(null, profile);
    }
  )
);

app.use(passport.initialize());
app.use(passport.session());

// Set view engine
app.set("view engine", "ejs");

// --- ROUTES ---

// Homepage
app.get("/", (req, res) => {
  res.render("index", { user: req.user });
});

// Login route
app.get("/login", passport.authenticate("discord"));

// Discord callback
app.get(
  "/callback",
  passport.authenticate("discord", { failureRedirect: "/" }),
  (req, res) => {
    res.redirect("/dashboard");
  }
);

// Dashboard after login
app.get("/dashboard", (req, res) => {
  if (!req.isAuthenticated()) return res.redirect("/login");
  res.render("dashboard", { user: req.user });
});

// Logout route
app.get("/logout", (req, res, next) => {
  req.logout(err => {
    if (err) return next(err);
    req.session.destroy(err => {
      if (err) console.error(err);
      res.clearCookie("connect.sid");
      res.redirect("/");
    });
  });
});

// Serve view.htm
app.get("/home", (req, res) => {
  if (!req.isAuthenticated()) return res.redirect("/login");
  res.render("home", req.query);
});

// Middleware: check role
async function checkRole(req, res, next) {
  if (!req.isAuthenticated()) return res.redirect("/login");

  try {
    const response = await fetch(
      `https://discord.com/api/v10/guilds/${GUILD_ID}/members/${req.user.id}`,
      {
        headers: { Authorization: `Bearer ${req.user.accessToken}` },
      }
    );

    if (!response.ok) {
      return res.status(response.status).send("Failed to fetch member info.");
    }

    const member = await response.json();

    if (member.roles && member.roles.includes(REQUIRED_ROLE_ID)) {
      return next(); // allow access
    } else {
      return res.status(403).send("Access denied. You don’t have the role.");
    }
  } catch (err) {
    console.error(err);
    return res.status(500).send("Error checking role.");
  }
}

// Protected route
app.get('/', (req, res) => res.render('home', { user: req.user }));
app.get('/gallery', (req, res) => res.render('gallery', { user: req.user }));
app.get('/videos', (req, res) => res.render('videos', { user: req.user }));
app.get('/contact', (req, res) => res.render('contact', { user: req.user }));
app.get('/register', (req, res) => res.render('register', { user: req.user }));
app.get('/Secure', (req, res) => res.render('Secure', { user: req.user }));
app.get('/sop', (req, res) => res.render('sop', { user: req.user }));
app.get('/System', (req, res) => res.render('System', { user: req.user }));
app.get('/login', passport.authenticate('discord'));
app.get('/login', (req, res) => {
  req.logout(() => {
    req.session.destroy(() => res.redirect('/'));
  });
});

// Start server
app.listen(3000, () => console.log("Server running at http://localhost:3000"));

client.login(token);
