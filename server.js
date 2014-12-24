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

var isAuthenticated = function (req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.json({ message: 'Ви не авторизовані.' });
};

//ROUTING
//-----------------------------------------------------------------
app.get('/', function(req, res) {
  res.sendFile(__dirname + '/build/index.html');
});

app.get('/api/authentication', function(req, res) {
  res.json({ authenticated: req.isAuthenticated() });
});

//Units
app.get('/api/units', isAuthenticated, units.getAllUnits);
app.get('/api/units/:id', isAuthenticated, units.getUnitById);
app.post('/api/units', isAuthenticated, units.editOrCreateUnit);
app.delete('/api/units/:id', isAuthenticated, units.deleteUnit);

//Ingredients
app.get('/api/ingredients/', isAuthenticated, ingredients.getAllIngredients);
app.get('/api/ingredients/:id', isAuthenticated, ingredients.getIngredientById);
app.post('/api/ingredients', isAuthenticated, ingredients.editOrCreateIngredient);
app.delete('/api/ingredients/:id', isAuthenticated, ingredients.deleteIngredient);

//Recipes
app.get('/api/recipes/', isAuthenticated, recipes.getAllRecipes);
app.get('/api/recipes/:id', isAuthenticated, recipes.getRecipeById);
//first edit/save phase - editing or creating recipe info
app.post('/api/recipes', isAuthenticated, recipes.editOrCreateRecipe);
//second edit/save phase - resaving recipe image file
app.put('/api/recipes/:id', isAuthenticated, recipes.saveRecipeImage);
app.delete('/api/recipes/:id', isAuthenticated, recipes.deleteRecipe);

//Calendar
app.get('/api/calendar/:date', isAuthenticated, calendar.getWeekDaysRecipes);
app.post('/api/calendar/', isAuthenticated, calendar.saveRecipeInDay);
app.delete('/api/calendar/:date/:meal/:recipeId', isAuthenticated, calendar.deleteRecipeFromDay);

//Weekly ingredient summary
app.get('/api/weekly_summary/:date', isAuthenticated, summary.getSummaryByWeekStartDate);

//Account
app.post('/api/login', account.login);
app.post('/api/signup', passport.authenticate('signup'), account.signup);
app.get('/api/signout', account.signout);


//Program entry
//-----------------------------------------------------------------
app.set('port', (process.env.PORT || 3001));

var server = app.listen(app.get('port'), function() {
  var host = server.address().address,
      port = server.address().port;

  console.log("Listening at http://%s:%s", host, port);
});
