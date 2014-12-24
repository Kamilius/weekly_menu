var db = require('../database/database');

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

exports.getWeekDaysRecipes = function(req, res) {
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
};

exports.saveRecipeInDay = function(req, res) {
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
};

exports.deleteRecipeFromDay = function(req, res) {
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
};
