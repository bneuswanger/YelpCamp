if (process.env.NODE_ENV !== "production") {
  require('dotenv').config();
}

const express = require("express");
const path = require("path"); //Node module that provides utilities for working with file and directory paths. https://nodejs.org/api/path.html#path
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const flash = require("connect-flash");
const session = require("express-session");
const ExpressError = require("./utils/ExpressError");
const methodOverride = require("method-override"); //allows put/patch/delete etc. from HTML; modifieds POST method
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");
const mongoSanitize = require('express-mongo-sanitize');

const userRoutes = require("./routes/users");
const campgroundRoutes = require("./routes/campgrounds");
const reviewRoutes = require("./routes/reviews");

mongoose.connect("mongodb://localhost:27017/yelp-camp"); //Colt had 3 options set to true here (useNewUrlParser, useCreateIndex and useUnifiedTopology) but they are no longer necessary with the current version of Express

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});

const app = express();

app.engine("ejs", ejsMate);
app.set("view engine", "ejs"); //tells Express to use ejs as the view engine
app.set("views", path.join(__dirname, "views")); //tells Express to use the /views folder in the project directory

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public"))); //this tells Express to use anything in the public folder
const sessionConfig = {
  name: 'session', //if not set, a default will apply that is easily trolled for by hackers. not trying to hide this, just not leave it as default
  secret: "thisshouldbeabettersecret", //this will change at production time

  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true, //security measure, although this seems to be the default now
    // secure: true, //if true, this cookie will only work over https.  BREAKs locally b/c localhost is not https.  Use this for production mode
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};
app.use(session(sessionConfig)); //this needs to come before app.use(passport.session())
app.use(flash());
app.use(mongoSanitize());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser()); //serializing refers to storing and unstoring a user in a session
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => { //we have access to these 'locals' in every single template
  //make sure this comes before route handlers
  // console.log(req.session)
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

app.get("/fakeUser", async (req, res) => {
  const user = new User({ email: "bryan@gmail.com", username: "bryan" });
  const newUser = await User.register(user, "keenai12");
  res.send(newUser);
});

app.use("/", userRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/reviews", reviewRoutes);

// Read Route: Display the Homepage
app.get("/", (req, res) => {
  res.render("home");
});

// Error Route: Catch-all for any routes not defined
app.all("*", (req, res, next) => {
  next(new ExpressError("Page Not Found", 404));
});

// Error Route: Catch-all for any error; Displays Error page
app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "Oh no, something went wrong!";
  res.status(statusCode).render("error.ejs", { err }); //.ejs is not necessary, but I like to include it for clarity
});

// Tells Express which port to listen on
app.listen(3000, () => {
  console.log("Server live on port: 3000");
});
//
