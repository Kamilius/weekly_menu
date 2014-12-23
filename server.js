'use strict';
var express = require('express'),
    bodyParser = require('body-parser'),
    app = express(),
    passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    bCrypt = require('bcrypt-nodejs'),
    expressSession = require('express-session'),
    db = require('./server/database'),
    fs = require('fs');

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
app.get('/api/units', isAuthenticated, function(req, res) {
  db.User.find(req.user.id).success(function(user) {
    user.getUnits({ order: ['name']}).success(function(units) {
      res.json(units.map(function(unit) {
        return {
          id: unit.id,
          name: unit.name
        };
      }));
    })
    .error(function(msg) {
      console.log(msg);
      res.json({ message: 'Can not get units' });
    });
  })
  .error(function(msg) {
    console.log(msg);
    res.json({ message: 'User not found' });
  });
});
app.get('/api/units/:id', isAuthenticated, function(req, res) {
  db.Unit.find({ where: { UserId: req.user.id, id: req.params.id }}).success(function(item) {
    res.json(item);
  });
});
app.post('/api/units', isAuthenticated, function(req, res) {
  db.Unit.findOrCreate({ where: { id: req.body.id, UserId: req.user.id }}).success(function(unit, created) {
    if(created) {
      unit.UserId = req.user.id;
    }
    unit.name = req.body.name;
    unit.save().success(function() {
      res.json({ message: 'success', unitId: unit.id });
    });
  });
});
app.delete('/api/units/:id', isAuthenticated, function(req, res) {
  db.Unit.find(req.params.id).success(function(unit) {
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
          res.json({
            message: "success",
            unitId: unit.id
          });
        });
      }
    })
  }).error(function(msg) {
    console.log(msg);
    res.json({ message: 'Unit not found' });
  });
});

//Ingredients
app.get('/api/ingredients/', function(req, res) {
  db.User.find(req.user.id).success(function(user) {
    user.getIngredients({ include: [ db.Unit ], order: ['name'] }).success(function(items) {
      res.json(items.map(function(item) {
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
  });
});
app.get('/api/ingredients/:id', function(req, res) {
  db.Ingredient.find({ where: { UserId: req.user.id, id: req.params.id }}).success(function(item) {
    res.json({
      id: item.id,
      name: item.name,
      unit: {
        id: item.Unit.id,
        name: item.Unit.name
      }
    });
  }).error(function(msg) {
    console.log(msg);
    res.json({
      message: 'Ingredient not found'
    });
  });
});
app.post('/api/ingredients', isAuthenticated, function(req, res) {
  db.User.find(req.user.id).success(function(user) {
    user.getUnits({ where: { id: req.body.unit.id }}).success(function(units) {
      db.Ingredient.findOrCreate({
          where: { id: req.body.id, UserId: req.user.id }
        }).success(function(ingredient, created) {
          ingredient.name = req.body.name;
          ingredient.setUnit(units[0]).success(function() {
            ingredient.save().success(function() {
              res.json({
                message: 'success',
                ingrId: ingredient.id
              });
            });
          });
        });
    });
  });
});

app.delete('/api/ingredients/:id', isAuthenticated, function(req, res) {
  db.User.find(req.user.id).success(function(user) {
    user.getIngredients({ where: { id: req.params.id }}).success(function(ingredients) {
      ingredients[0].getRecipes().success(function(recipes) {
        if(recipes.length > 0) {
          res.json({
            message: "error",
            recipes: recipes.map(function(recipe) {
              return recipe.name;
            })
          });
        } else {
          ingredients[0].destroy().success(function() {
            res.json({
              message: 'success'
            });
          });
        }
      });
    });
  });
});

//Recipes
function recipesToJSON(recipes) {
  return recipes.map(function(recipe) {
    return {
      id: recipe.id,
      name: recipe.name,
      description: recipe.description,
      image: recipe.image,
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

app.get('/api/recipes/', function(req, res) {
  db.User.find(req.user.id).success(function(user) {
    user.getRecipes({
      include: [{
        model: db.Ingredient,
        include: [ db.Unit ]
      }],
      order: ['name']
    }).success(function(recipes) {
      res.json(recipesToJSON(recipes));
    });
  });
});
app.get('/api/recipes/:id', function(req, res) {
  db.User.find(req.user.id).success(function(user) {
    user.getRecipes({
      where: {
        id: req.params.id
      },
      include: [{
        model: db.Ingredient,
        include: [ db.Unit ]
      }]
    }).success(function(recipes) {
      if(recipes.length > 0) {
        var recipe = recipes[0];
        res.statusCode = 200;
        res.json({
          id: recipe.id,
          name: recipe.name,
          description: recipe.description,
          image: recipe.image,
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
      } else {
        res.statusCode = 404;
        res.json({
          message: 'Recipe not found'
        });
      }
    });
  });
});
app.post('/api/recipes', isAuthenticated, function(req, res) {
  var newIngredients = req.body.ingredients;
  db.User.find(req.user.id).success(function(user) {
    user.getIngredients({
      where: {
        id: req.body.ingredients.map(function(ingr) {
          return ingr.id;
        })
      }
    }).success(function(ingredients) {
      if(ingredients.length > 0) {
        db.Recipe.findOrCreate({ where: { id: req.body.id, UserId: req.user.id } })
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
                res.statusCode = 200;
                res.json({
                  message: 'success',
                  recipeId: recipe.id
                });
              });
            });
        });
      }
    })
  }).error(function(err) {
    console.log(err);
    res.json({
      mesage: 'error'
    });
  });
});

//saving image after recipe is saved
app.put('/api/recipes/:id', isAuthenticated, function(req, res) {
  var base64data = req.body.image.replace(/^data:image\/(png|jpeg|jpg);base64,/, "");
  fs.writeFile("build/images/recipes/" + req.params.id + ".png", base64data, 'base64', function(err) {
    if(err) {
      console.log(err);
    }
    else {
      db.Recipe.find(req.params.id).success(function(recipe) {
        recipe.image = '/images/recipes/' + req.params.id + '.png';
        recipe.save().success(function() {
          res.json({
            message: 'success'
          });
        }).error(function(msg) {
          console.log(msg);
          res.json({
            message: 'Не вдалось зберегти зображення'
          });
        });
      }).error(function(msg) {
        res.json({
          message: 'Немає рецепту з таким номером'
        });
      });
    }
  });
});
app.delete('/api/recipes/:id', isAuthenticated, function(req, res) {
  db.Recipe.find(req.params.id).success(function(recipe) {
    if(recipe) {
      db.Day.destroy({ where: { RecipeId: recipe.id }}).success(function() {
        recipe.destroy().success(function() {
          var imagePath = "build/images/recipes/" + req.params.id + ".png";
          fs.exists(imagePath, function(exists) {
            if(exists) {
              fs.unlink(imagePath, function(err) {
                if(err)
                  throw err;

                res.statusCode = 200;
                res.json({
                  message: 'success'
                });
              });
            } else {
              res.statusCode = 200;
              res.json({
                message: 'success'
              });
            }
          })
        });
      });
    } else {
      res.statusCode = 200;
      res.json({
        message: 'success'
      });
    }
  });
});

//Calendar
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
            unit: {
              id: ingr.Unit.id,
              name: ingr.Unit.name
            }
          }
        })
      }
    };
  });
}

app.get('/api/calendar/:date', function(req, res) {
  var date = new Date(req.params.date);

  db.User.find(req.user.id).success(function(user) {
    user.getDays({
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
      res.statusCode = 200;
      res.json(daysToJSON(days));
    });
  });
});
app.post('/api/calendar/', isAuthenticated, function(req, res) {
  var dayDate = new Date(req.body.date),
      recipeId = req.body.recipeId,
      meal = req.body.meal;

  db.User.find(req.user.id).success(function(user) {
    user.getRecipes({ where: { id: recipeId }}).success(function(recipes) {
      var recipe = recipes[0]
      if(recipe) {
        var newDay = {
          date: new Date(req.body.date),
          meal: meal,
          RecipeId: recipe.id,
          UserId: req.user.id
        };
        db.Day.findOrCreate({
          where: newDay
        }, newDay).success(function(day) {
          res.statusCode = 200;
          res.json({
            message: 'success'
          });
        });
      }
    });
  });
});
app.delete('/api/calendar/:date/:meal/:recipeId', isAuthenticated, function(req, res) {
  db.User.find(req.user.id).success(function(user) {
    user.getDays({
      where: {
        date: new Date(req.params.date),
        meal: req.params.meal,
        RecipeId: req.params.recipeId
      }
    }).success(function(day) {
      day[0].destroy().success(function() {
        res.json({
          message: 'success'
        });
      });
    }).error(function(msg) {
      throw msg;

      res.statusCode = 500;
      res.json({
        message: 'error'
      });
    });
  });
});

app.get('/api/weekly_summary/:date', isAuthenticated, function(req, res) {
  var date = new Date(req.params.date);

  db.User.find(req.user.id).success(function(user) {
    user.getDays({
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
          unit: ingredient.Unit.name
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
