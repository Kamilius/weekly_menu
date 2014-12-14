'use strict';
var express = require('express'),
    bodyParser = require('body-parser'),
    app = express(),
    Sequelize = require('sequelize'),
    sequelize,
    Unit, Ingredient, Recipe, IngredientsRecipes, Day, RecipesDays;

if(process.env.HEROKU_POSTGRESQL_BRONZE_URL) {
  var match = process.env.HEROKU_POSTGRESQL_BRONZE_URL.match(/postgres:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
  sequelize = new Sequelize(match[5], match[1], match[2], {
    dialect: 'postgres',
    protocol: 'postgres',
    port: match[4],
    host: match[3],
    logging: false,
    timezone: '+02:00'
  });
} else {
  //remit laptop
  // sequelize = new Sequelize('weekly_menu', 'dev', '1', {
  //   dialect: 'postgres'
  // });

  //home
  sequelize = new Sequelize('weekly_menu', 'postgres', '12356890', {
    dialect: 'postgres',
    timezone: '+02:00'
  });
}


//DATABASE
//-----------------------------------------------------------------
//Database structure creation and bootstrap
Unit = sequelize.define('Unit', {
  name: Sequelize.STRING
});
Ingredient = sequelize.define('Ingredient', {
  name: Sequelize.STRING
});

Ingredient.belongsTo(Unit);
Unit.hasMany(Ingredient);

Recipe = sequelize.define('Recipe', {
  name: Sequelize.STRING,
  description: Sequelize.TEXT
});
IngredientsRecipes = sequelize.define('IngredientsRecipes', {
  amount: Sequelize.STRING
});

Recipe.hasMany(Ingredient, { through: IngredientsRecipes });
Ingredient.hasMany(Recipe, { through: IngredientsRecipes });

Day = sequelize.define('Day', {
  date: Sequelize.DATE,
  meal: Sequelize.STRING
});

Day.belongsTo(Recipe);
Recipe.hasMany(Day);

sequelize
  .sync()//pass { force: true } to drop databases
  .complete(function(err) {
    if (!!err) {
      console.log('An error occurred while creating the table: %s', err);
    } else {
      console.log('Table created.');
    }
  });

//parse JSON post requests
app.use(bodyParser.json());

//set build folder as public
app.use(express.static(__dirname + '/build'));

//ROUTING
//-----------------------------------------------------------------
app.get('/', function(req, res) {
  res.sendFile(__dirname + '/build/index.html');
});

//retrieve all items of passed collection ordered by name
function getAllUnits(response) {
  Unit.findAll({ order: ['name'] }).success(function(items) {
    response.json(items);
  });
}
function getUnitById(response, id) {
  Unit.find(id).success(function(item) {
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
app.post('/api/units', function(req, res) {
  Unit.findOrCreate({ where: { id: req.body.id }, defaults: req.body }).success(function(unit, created) {
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
app.delete('/api/units/:id', function(req, res) {
  Unit.find(req.params.id).success(function(unit) {
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
  Ingredient.findAll({ include: [ Unit ], order: ['name'] }).success(function(items) {
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
  Ingredient.find(id).success(function(item) {
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
app.post('/api/ingredients', function(req, res) {
  Unit.find(req.body.unit.id).success(function(unit) {
    Ingredient
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

app.delete('/api/ingredients/:id', function(req, res) {
  Ingredient.find(req.params.id).success(function(ingredient) {
    if(ingredient) {
      ingredient.destroy().success(function() {
        getAllItems(res, Ingredient);
      });
    } else {
      getAllItems(res, Ingredient);
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
  Recipe.findAll({
    include: [{
      model: Ingredient,
      include: [ Unit ]
    }],
    order: ['name']
  }).success(function(recipes) {
    response.json(recipesToJSON(recipes));
  });
}

function getRecipeById(response, id) {
  Recipe.find({
    where:  {
      id: id
    },
    include: [{
      model: Ingredient,
      include: [ Unit ]
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
app.post('/api/recipes', function(req, res) {
  var newIngredients = req.body.ingredients;
  Ingredient.findAll({
    where: {
      id: req.body.ingredients.map(function(ingr) {
        return ingr.id;
      })
    }
  }).success(function(ingredients) {
    if(ingredients.length > 0) {
      Recipe.findOrCreate({ where: { id: req.body.id } })
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
app.delete('/api/recipes/:id', function(req, res) {
  Recipe.find(req.params.id).success(function(recipe) {
    if(recipe) {
      Day.destroy({ where: { RecipeId: recipe.id }}).success(function() {
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
            amount: +ingr.IngredientsRecipe.amount
          }
        })
      }
    };
  });
}

//Calendar
function getWeek(response, date) {
  //get seven days starting from 'date'
  Day.findAll({
    where: {
      date: {
        gte: new Date(date),
        lte: new Date(new Date(date).setDate(date.getDate() + 6))
      }
    },
    order: 'date',
    include: [{
      model: Recipe,
      include: [ Ingredient ]
    }]
  }).success(function(days) {
    response.json(daysToJSON(days));
  });
}

app.get('/api/calendar/:date', function(req, res) {
  getWeek(res, new Date(req.params.date));
});
app.post('/api/calendar/', function(req, res) {
  var dayDate = new Date(req.body.date),
      recipeId = req.body.recipeId,
      meal = req.body.meal;

  Recipe.find(recipeId).success(function(recipe) {
    if(recipe) {
      var newDay = {
        date: dayDate.toUTCString(),
        meal: meal,
        RecipeId: recipe.id
      };
      Day.findOrCreate({
        where: newDay
      }, newDay).success(function(day) {
        res.json({
          message: 'success'
        });
      });
    }
  });
});
app.delete('/api/calendar/:date/:meal/:recipeId', function(req, res) {
  console.log(req.params.date);
  Day.find({
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
    console.log(msg);
    res.json({
      message: 'error',
      text: msg
    });
  });
});

//Program entry
//-----------------------------------------------------------------
app.set('port', (process.env.PORT || 3001));

var server = app.listen(app.get('port'), function() {
  var host = server.address().address,
      port = server.address().port;

  console.log("Listening at http://%s:%s", host, port);
});
