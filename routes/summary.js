var db = require('../database/database');

exports.getSummaryByWeekStartDate = function(req, res) {
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
};
