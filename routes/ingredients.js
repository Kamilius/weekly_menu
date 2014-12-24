var db = require('../database/database');

exports.getAllIngredients = function(req, res) {
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
};

exports.getIngredientById = function(req, res) {
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
};

exports.editOrCreateIngredient = function(req, res) {
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
};

exports.deleteIngredient = function(req, res) {
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
};
