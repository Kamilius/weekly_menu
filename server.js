'use strict';
var express = require('express'),
    bodyParser = require('body-parser'),
    app = express(),
    passport = require('passport'),
    expressSession = require('express-session'),
    units = require('./routes/units'),
    ingredients = require('./routes/ingredients'),
    recipes = require('./routes/recipes'),
    calendar = require('./routes/calendar'),
    summary = require('./routes/summary'),
    account = require('./routes/account');

app.configure(function() {
  //parse JSON post requests
  app.use(bodyParser.json());

  //set build folder as public
  app.use(express.static(__dirname + '/build'));

  //authentication system settings
  app.use(expressSession({
    secret: 'mySecretKey',
    saveUninitialized: true,
    resave: true
  }));
  app.use(passport.initialize());
  app.use(passport.session());

  app.set('port', (process.env.PORT || 3001));
});


//ROUTING
//-----------------------------------------------------------------
app.get('/', function(req, res) {
  res.sendFile(__dirname + '/build/index.html');
});

app.get('/api/authentication', function(req, res) {
  res.json({ authenticated: req.isAuthenticated() });
});

//Units
app.get('/api/units', account.isAuthenticated, units.getAllUnits);
app.get('/api/units/:id', account.isAuthenticated, units.getUnitById);
app.post('/api/units', account.isAuthenticated, units.editOrCreateUnit);
app.delete('/api/units/:id', account.isAuthenticated, units.deleteUnit);

//Ingredients
app.get('/api/ingredients/', account.isAuthenticated, ingredients.getAllIngredients);
app.get('/api/ingredients/:id', account.isAuthenticated, ingredients.getIngredientById);
app.post('/api/ingredients', account.isAuthenticated, ingredients.editOrCreateIngredient);
app.delete('/api/ingredients/:id', account.isAuthenticated, ingredients.deleteIngredient);

//Recipes
app.get('/api/recipes/', account.isAuthenticated, recipes.getAllRecipes);
app.get('/api/recipes/:id', account.isAuthenticated, recipes.getRecipeById);
//first edit/save phase - editing or creating recipe info
app.post('/api/recipes', account.isAuthenticated, recipes.editOrCreateRecipe);
//second edit/save phase - resaving recipe image file
app.put('/api/recipes/:id', account.isAuthenticated, recipes.saveRecipeImage);
app.delete('/api/recipes/:id', account.isAuthenticated, recipes.deleteRecipe);

//Calendar
app.get('/api/calendar/:date', account.isAuthenticated, calendar.getWeekDaysRecipes);
app.post('/api/calendar/', account.isAuthenticated, calendar.saveRecipeInDay);
app.delete('/api/calendar/:date/:meal/:recipeId', account.isAuthenticated, calendar.deleteRecipeFromDay);

//Weekly ingredient summary
app.get('/api/weekly_summary/:date', account.isAuthenticated, summary.getSummaryByWeekStartDate);

//Account
app.post('/api/login', account.login);
app.post('/api/signup', passport.authenticate('signup'), account.signup);
app.get('/api/signout', account.signout);


//Program entry
//-----------------------------------------------------------------
var server = app.listen(app.get('port'), function() {
  var host = server.address().address,
      port = server.address().port;

  console.log("Listening at http://%s:%s", host, port);
});
