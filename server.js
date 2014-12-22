'use strict';
var express = require('express'),
    bodyParser = require('body-parser'),
    app = express(),
    passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    bCrypt = require('bcrypt-nodejs'),
    expressSession = require('express-session'),
    db = require('./server/database');

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

//retrieve all items of passed collection ordered by name
function getAllUnits(response) {
  db.Unit.findAll({ order: ['name'] }).success(function(items) {
    response.json(items);
  });
}
function getUnitById(response, id) {
  db.Unit.find(id).success(function(item) {
    response.json(item);
  });
}

//Units
app.get('/api/units', function(req, res) {
  getAllUnits(res);
});
app.get('/api/units/:id', function(req, res) {
  getUnitById(res, req.params.id);
});
app.post('/api/units', isAuthenticated, function(req, res) {
  db.Unit.findOrCreate({ where: { id: req.body.id }, defaults: req.body }).success(function(unit, created) {
    if(!created) {
      unit.name = req.body.name;
      unit.save().success(function() {
        getAllUnits(res);
      });
    } else {
      getAllUnits(res);
    }
  });
});
app.delete('/api/units/:id', isAuthenticated, function(req, res) {
  db.Unit.find(req.params.id).success(function(unit) {
    if(unit) {
      unit.getIngredients().success(function(ingredients) {
        if(ingredients.length > 0) {
          res.json({
            message: "error",
            ingredients: ingredients.map(function(ingr) {
              return ingr.name;
            })
          });
        } else {
          unit.destroy().success(function() {
            getAllUnits(res);
          });
        }
      })
    } else {
      getAllUnits(res);
    }
  });
});

function getAllIngredients(response) {
  db.Ingredient.findAll({ include: [ db.Unit ], order: ['name'] }).success(function(items) {
    response.json(items.map(function(item) {
      return {
        id: item.id,
        name: item.name,
        unit: {
          id: item.Unit.id,
          name: item.Unit.name
        }
      };
    }));
  });
}

function getIngredientById(response, id) {
  db.Ingredient.find(id).success(function(item) {
    response.json({
      id: item.id,
      name: item.name,
      unit: {
        id: item.Unit.id,
        name: item.Unit.name
      }
    });
  });
}

//Ingredients
app.get('/api/ingredients/', function(req, res) {
  getAllIngredients(res);
});
app.get('/api/ingredients/:id', function(req, res) {
  getIngredientById(res, req.params.id);
});
app.post('/api/ingredients', isAuthenticated, function(req, res) {
  db.Unit.find(req.body.unit.id).success(function(unit) {
    db.Ingredient
      .findOrCreate({
        where: { id: req.body.id },
        defaults: { name: req.body.name }
      }).success(function(ingredient, created) {
        if(!created) {
          ingredient.name = req.body.name;
        }
        ingredient.setUnit(unit).success(function() {
          ingredient.save().success(function() {
            getAllIngredients(res);
          });
        });
      });
  });
});

app.delete('/api/ingredients/:id', isAuthenticated, function(req, res) {
  db.Ingredient.find(req.params.id).success(function(ingredient) {
    if(ingredient) {
      ingredient.destroy().success(function() {
        getAllIngredients(res, Ingredient);
      });
    } else {
      getAllIngredients(res, Ingredient);
    }
  });
});

function recipesToJSON(recipes) {
  return recipes.map(function(recipe) {
    return {
      id: recipe.id,
      name: recipe.name,
      description: recipe.description,
      ingredients: recipe.Ingredients.map(function(ingr) {
        return {
          id: ingr.id,
          name: ingr.name,
          amount: +ingr.IngredientsRecipe.amount,
          unit: {
            id: ingr.Unit.id,
            name: ingr.Unit.name
          }
        }
      })
    };
  })
}

function getAllRecipes(response) {
  db.Recipe.findAll({
    include: [{
      model: db.Ingredient,
      include: [ db.Unit ]
    }],
    order: ['name']
  }).success(function(recipes) {
    response.json(recipesToJSON(recipes));
  });
}

function getRecipeById(response, id) {
  db.Recipe.find({
    where:  {
      id: id
    },
    include: [{
      model: db.Ingredient,
      include: [ db.Unit ]
    }]
  }).success(function(recipe) {
    response.json({
      id: recipe.id,
      name: recipe.name,
      description: recipe.description,
      ingredients: recipe.Ingredients.map(function(ingr) {
        return {
          id: ingr.id,
          name: ingr.name,
          amount: +ingr.IngredientsRecipe.amount,
          unit: {
            id: ingr.Unit.id,
            name: ingr.Unit.name
          }
        }
      })
    });
  });
}

//Recipes
app.get('/api/recipes/', function(req, res) {
  getAllRecipes(res);
});
app.get('/api/recipes/:id', function(req, res) {
  getRecipeById(res, req.params.id);
});
app.post('/api/recipes', isAuthenticated, function(req, res) {
  var newIngredients = req.body.ingredients;
  db.Ingredient.findAll({
    where: {
      id: req.body.ingredients.map(function(ingr) {
        return ingr.id;
      })
    }
  }).success(function(ingredients) {
    if(ingredients.length > 0) {
      db.Recipe.findOrCreate({ where: { id: req.body.id } })
        .success(function(recipe, created) {
          recipe.name = req.body.name;
          recipe.description = req.body.description;
          for(var i = 0, len = ingredients.length; i < len; i++) {
            for(var j = 0, newLen = newIngredients.length; j < newLen; j++) {
              if(ingredients[i].id === newIngredients[j].id) {
                ingredients[i].IngredientsRecipes = { amount: parseFloat(newIngredients[j].amount) };
                break;
              }
            }
          }
          recipe.setIngredients(ingredients).success(function() {
            recipe.save().success(function() {
              getAllRecipes(res);
            });
          });
        })
    }
  }).error(function(err) {
    getAllRecipes(res);
  });
});
app.delete('/api/recipes/:id', isAuthenticated, function(req, res) {
  db.Recipe.find(req.params.id).success(function(recipe) {
    if(recipe) {
      db.Day.destroy({ where: { RecipeId: recipe.id }}).success(function() {
        recipe.destroy().success(function() {
          getAllRecipes(res);
        });
      });
    } else {
      getAllRecipes(res);
    }
  });
});

function daysToJSON(days) {
  return days.map(function(day) {
    return {
      id: day.id,
      meal: day.meal,
      date: day.date,
      recipe: {
        id: day.Recipe.id,
        name: day.Recipe.name,
        description: day.Recipe.description,
        ingredients: day.Recipe.Ingredients.map(function(ingr) {
          return {
            id: ingr.id,
            name: ingr.name,
            amount: +ingr.IngredientsRecipe.amount,
            units: ingr.Unit.name
          }
        })
      }
    };
  });
}

//Calendar
function getWeek(response, date) {
  //get seven days starting from 'date'
  db.Day.findAll({
    where: {
      date: {
        gte: new Date(date),
        lte: new Date(new Date(date).setDate(date.getDate() + 6))
      }
    },
    order: 'date',
    include: [{
      model: db.Recipe,
      include: [{
          model: db.Ingredient,
          include: [ db.Unit ]
      }]
    }]
  }).success(function(days) {
    response.json(daysToJSON(days));
  });
}

app.get('/api/calendar/:date', function(req, res) {
  getWeek(res, new Date(req.params.date));
});
app.post('/api/calendar/', isAuthenticated, function(req, res) {
  var dayDate = new Date(req.body.date),
      recipeId = req.body.recipeId,
      meal = req.body.meal;

  db.Recipe.find(recipeId).success(function(recipe) {
    if(recipe) {
      var newDay = {
        date: new Date(req.body.date),
        meal: meal,
        RecipeId: recipe.id
      };
      db.Day.findOrCreate({
        where: newDay
      }, newDay).success(function(day) {
        res.json({
          message: 'success'
        });
      });
    }
  });
});
app.delete('/api/calendar/:date/:meal/:recipeId', isAuthenticated, function(req, res) {
  db.Day.find({
    where: {
      date: new Date(req.params.date),
      meal: req.params.meal,
      RecipeId: req.params.recipeId
    }
  }).success(function(day) {
    day.destroy().success(function() {
      res.json({
        message: 'success'
      });
    });
  }).error(function(msg) {
    res.json({
      message: 'error',
      text: msg
    });
  });
});

app.get('/api/weekly_summary/:date', function(req, res) {
  var date = new Date(req.params.date);

  db.Day.findAll({
    where: {
      date: {
        gte: new Date(date),
        lte: new Date(new Date(date).setDate(date.getDate() + 6))
      }
    },
    include: [{
      model: db.Recipe,
      include: [{
        model: db.Ingredient,
        include: [ db.Unit ]
      }]
    }]
  }).success(function(days) {
    var ingredientsSummary = [];

    function getIngredientIndex(id) {
      for(var i = 0; i < ingredientsSummary.length; i++) {
        if(ingredientsSummary[i].id === id)
          return i;
      }
      return -1;
    }

    function getIngredientSummaryModel(ingredient) {
      return {
        id: ingredient.id,
        name: ingredient.name,
        amount: +ingredient.IngredientsRecipe.amount,
        units: ingredient.Unit.name
      };
    }

    days.forEach(function(day) {
      day.Recipe.Ingredients.forEach(function(ingredient) {
        var index = getIngredientIndex(ingredient.id);
        if(index > -1) {
          ingredientsSummary[index].amount += +ingredient.IngredientsRecipe.amount;
        } else {
          ingredientsSummary.push(getIngredientSummaryModel(ingredient));
        }
      });
    });

    res.json({
      date: date,
      ingredients: ingredientsSummary
    });
  });
});

app.post('/api/login', function(req, res, next) {
  passport.authenticate('login', function(err, user, info) {
    if (err) { return next(err); }
    if (!user) { return res.json({ message: "Невірні ім'я користувача, або пароль" }); }
    req.logIn(user, function(err) {
      if (err) { return next(err); }
      return res.json({ message: 'success' });
    });
  })(req, res, next);
});

app.post('/api/signup', passport.authenticate('signup'), function(req, res) {
  res.json({ message: 'success' });
});

app.get('/api/signout', function(req, res) {
  req.logout();
  res.json({ message: 'success' });
});

//Authentication system
//-----------------------------------------------------------------

var isValidPassword = function(user, password) {
  return bCrypt.compareSync(password, user.password);
};

var createHash = function(password) {
  return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
};

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  db.User.find(id)
    .success(function(user) {
      done(null, user);
    })
    .error(function(msg) {
      done(msg, null)
    });
});

passport.use('login', new LocalStrategy({
    passReqToCallback: true
  },
  function(req, username, password, done) {
    db.User.find({ where: { name: username }}).success(function(user) {
      if(!user) {
        console.log('User Not Found with username ' + username);
        return done(null, false, 'invalid username');
      }
      if(!isValidPassword(user, password)) {
        console.log('Invalid password');
        return done(null, false, 'invalid password');
      }

      return done(null, user);
    }).error(function(msg) {
      return done(msg);
    });
  })
);

passport.use('signup', new LocalStrategy({
    passReqToCallback: true
  },
  function(req, username, password, done) {
    var findOrCreateUser = function() {
      db.User.findOrCreate({ where: { name: username, email: req.body.email } })
          .success(function(user, created) {
            if(!created) {
              console.log('User already exists');
              return done(null, false, 'User already exists');
            } else {
              user.name = username;
              user.password = createHash(password);
              user.email = req.body.email;

              user.save()
                  .success(function() {
                    console.log('User Registration successful');
                    return done(null, user);
                  })
                  .error(function(msg) {
                    console.log('Error in Saving user: ' + msg);
                    throw msg;
                    return done(msg);
                  });
            }
          })
          .error(function(msg) {
            console.log('Error in SignUp: ' + msg);
            return done(msg);
          });
    }

    process.nextTick(findOrCreateUser);
  }
));


//Program entry
//-----------------------------------------------------------------
app.set('port', (process.env.PORT || 3001));

var server = app.listen(app.get('port'), function() {
  var host = server.address().address,
      port = server.address().port;

  console.log("Listening at http://%s:%s", host, port);
});
