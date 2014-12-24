var db = require('../database/database'),
    fs = require('fs');


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
};

exports.getAllRecipes = function(req, res) {
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
};

exports.getRecipeById = function(req, res) {
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
};

exports.editOrCreateRecipe = function(req, res) {
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
};

exports.saveRecipeImage = function(req, res) {
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
};

exports.deleteRecipe = function(req, res) {
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
};
