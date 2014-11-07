var DayOfWeek, Ingredient, Recipe, RecipeIngredient, app;

Recipe = (function() {
  function Recipe(name, ingredients, id) {
    this.name = name != null ? name : '';
    if (ingredients == null) {
      ingredients = [];
    }
    this.id = id != null ? id : 0;
    this.ingredients = [].concat(ingredients);
  }

  return Recipe;

})();

Ingredient = (function() {
  function Ingredient(name, id) {
    this.name = name != null ? name : '';
    this.id = id != null ? id : 0;
  }

  return Ingredient;

})();

RecipeIngredient = (function() {
  function RecipeIngredient(parent, amount, units) {
    this.parent = parent;
    this.amount = amount != null ? amount : '';
    this.units = units != null ? units : '';
  }

  return RecipeIngredient;

})();

DayOfWeek = (function() {
  function DayOfWeek(name, recipes, date) {
    this.name = name;
    this.recipes = recipes;
    this.date = date;
  }

  DayOfWeek.prototype.today = function() {
    return this.date.toLocaleDateString() === new Date().toLocaleDateString();
  };

  return DayOfWeek;

})();

app = angular.module('weeklyMenuApp', ['ngRoute']);

app.config([
  '$routeProvider', function($routeProvider) {
    return $routeProvider.when('/home', {
      templateUrl: 'home.html'
    }).when('/recipes', {
      templateUrl: 'recipesCRUD.html',
      controller: 'RecipesCRUDCtrl'
    }).when('/recipes/:recipeId', {
      templateUrl: 'recipesCRUD.html',
      controller: 'RecipesCRUDCtrl'
    }).when('/ingredients', {
      templateUrl: 'ingredients.html',
      controller: 'IngredientsCtrl'
    }).otherwise({
      redirectTo: '/home'
    });
  }
]);

app.run([
  '$rootScope', '$location', function($rootScope, $location) {
    $rootScope.statusMessage = {
      text: '',
      type: ''
    };
    $rootScope.setStatusMessage = function(text, type) {
      this.statusMessage.text = text;
      this.statusMessage.type = type;
      return setTimeout(function() {
        return (function() {
          $rootScope.statusMessage.text = '';
          $rootScope.statusMessage.type = '';
          return $rootScope.$apply();
        })($rootScope);
      }, 10000);
    };
    $rootScope.saveToLocalStorage = function(key, data) {
      return localStorage.setItem(key, JSON.stringify(data));
    };
    return $rootScope.getClass = function(path) {
      if ($location.path().substr(0, path.length) === path) {
        return 'active';
      } else {
        return '';
      }
    };
  }
]);

app.directive('calendar', function() {
  return {
    restrict: 'E',
    templateUrl: 'calendar.html',
    scope: {},
    controller: 'CalendarCtrl'
  };
});

app.directive('recipescontainer', function() {
  return {
    restrict: 'E',
    templateUrl: 'recipesContainer.html',
    scope: {},
    controller: 'RecipesCtrl'
  };
});

app.directive('ingredients', function() {
  return {
    restrict: 'E',
    scope: {},
    templateUrl: 'ingredients.html'
  };
});

app.directive('index', function() {
  return {
    restrict: 'E',
    templateUrl: 'home.html'
  };
});

app.directive('recipecrud', function() {
  return {
    restrict: 'E',
    scope: {},
    templateUrl: 'recipeCRUD.html'
  };
});

app.directive('recipecontrols', function() {
  return {
    restrict: 'E',
    templateUrl: 'recipeControls.html'
  };
});

app.directive('dragEnterLeaveAnimation', function() {
  return function(scope, element, attrs) {
    element.on('dragenter', function(event) {
      return this.classList.add('over');
    });
    return element.on('dragleave', function(event) {
      return this.classList.remove('over');
    });
  };
});

app.service('recipeService', [
  '$rootScope', 'ingredientsService', function($rootScope, $ingredientsService) {
    var add, getById, getCompactRecipes, loadFromLocalStorage, recipes, remove, save;
    recipes = [];
    loadFromLocalStorage = function() {
      var data;
      data = localStorage.getItem('recipes');
      if (data) {
        return recipes = JSON.parse(data).map(function(recipe) {
          return new Recipe(recipe.name, recipe.ingredients.map(function(ing) {
            return new RecipeIngredient($ingredientsService.getById(ing.parent), ing.amount, ing.units);
          }), recipe.id);
        });
      }
    };
    getById = function(id) {
      var recipe, _i, _len;
      for (_i = 0, _len = recipes.length; _i < _len; _i++) {
        recipe = recipes[_i];
        if (recipe.id === id) {
          return recipe;
        }
      }
      return null;
    };
    getCompactRecipes = function() {
      var recipe, temp, _i, _len;
      temp = [];
      for (_i = 0, _len = recipes.length; _i < _len; _i++) {
        recipe = recipes[_i];
        temp.push({
          id: recipe.id,
          name: recipe.name,
          ingredients: recipe.ingredients.map(function(ing) {
            return {
              parent: ing.parent.id,
              amount: ing.amount,
              units: ing.units
            };
          })
        });
      }
      return temp;
    };
    add = function(recipe) {
      var _ref;
      recipe.id = recipes.length > 0 ? ((_ref = recipes[recipes.length - 1]) != null ? _ref.id : void 0) + 1 : 1;
      recipes.push(recipe);
      return $rootScope.saveToLocalStorage('recipes', getCompactRecipes());
    };
    save = function(recipe) {
      var temp;
      if (recipe.id === 0) {
        this.add(new Recipe(recipe.name, recipe.ingredients));
        return $rootScope.setStatusMessage('Рецепт успішно збережено.', 'success');
      } else {
        temp = this.getById(recipe.id);
        temp.name = recipe.name;
        temp.ingredients = [].concat(recipe.ingredients);
        return $rootScope.saveToLocalStorage('recipes', getCompactRecipes());
      }
    };
    remove = function(recipe) {
      var index;
      index = recipes.indexOf(recipe);
      if (index > -1) {
        recipes.splice(index, 1);
      }
      return $rootScope.saveToLocalStorage('recipes', getCompactRecipes());
    };
    loadFromLocalStorage();
    return {
      recipes: recipes,
      getById: getById,
      add: add,
      save: save,
      remove: remove
    };
  }
]);

app.service('ingredientsService', [
  '$rootScope', function($rootScope) {
    var add, getById, ingredients, loadFromLocalStorage, remove, save;
    ingredients = [];
    loadFromLocalStorage = function() {
      var data;
      data = localStorage.getItem('ingredients');
      if (data) {
        return ingredients = JSON.parse(data).map(function(ingredient) {
          return new Ingredient(ingredient.name, ingredient.id);
        });
      }
    };
    getById = function(id) {
      var ingredient, _i, _len;
      for (_i = 0, _len = ingredients.length; _i < _len; _i++) {
        ingredient = ingredients[_i];
        if (ingredient.id === id) {
          return ingredient;
        }
      }
      return null;
    };
    add = function(ingredient) {
      var _ref;
      ingredient.id = ingredients.length > 0 ? ((_ref = ingredients[ingredients.length - 1]) != null ? _ref.id : void 0) + 1 : 1;
      ingredients.push(ingredient);
      return $rootScope.saveToLocalStorage('ingredients', ingredients);
    };
    save = function(ingredient) {
      var temp;
      if (ingredient.id === 0) {
        this.add(new Ingredient(ingredient.name));
        $rootScope.setStatusMessage('Інгредієнт успішно збережено.', 'success');
      } else {
        temp = this.getById(ingredient.id);
        temp.name = ingredient.name;
      }
      return $rootScope.saveToLocalStorage('ingredients', ingredients);
    };
    remove = function(ingredient, recipes) {
      var index, ing, recipe, recipeNames, _i, _j, _len, _len1, _ref;
      index = ingredients.indexOf(ingredient);
      recipeNames = '';
      for (_i = 0, _len = recipes.length; _i < _len; _i++) {
        recipe = recipes[_i];
        _ref = recipe.ingredients;
        for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
          ing = _ref[_j];
          if (ing.parent === ingredient) {
            recipeNames += "\n \"" + recipe.name + "\"";
          }
        }
      }
      if (index > -1 && recipeNames.length === 0) {
        ingredients.splice(index, 1);
        return $rootScope.saveToLocalStorage('ingredients', ingredients);
      } else if (recipeNames.length > 0) {
        return $rootScope.setStatusMessage("Неможливо видалити інгридієнт \"" + ingredient.name + "\". Він використовується у наступних рецептах: \n" + recipeNames, 'error');
      } else {
        return $rootScope.setStatusMessage("Інгридієнту з id: " + ingredient.id + " - не існує.", 'error');
      }
    };
    loadFromLocalStorage();
    return {
      getById: getById,
      items: ingredients,
      add: add,
      save: save,
      remove: remove
    };
  }
]);

app.service('calendarService', [
  'recipeService', '$rootScope', function($recipeService, $rootScope) {
    var addRecipe, buildWeek, currentWeek, currentWeekNumber, dayNames, getCompactRecipes, indexOfDay, loadFromLocalStorage, nextWeek, prevWeek, recipeInDay, removeAllRecipeInstances, removeRecipe, weeklyMenu;
    weeklyMenu = [];
    dayNames = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    currentWeek = 1;
    currentWeekNumber = function(firstWeekDate) {
      var ONE_WEEK, date1_ms, date2_ms, difference_ms;
      ONE_WEEK = 1000 * 60 * 60 * 24 * 7;
      date1_ms = firstWeekDate;
      date2_ms = new Date();
      difference_ms = Math.abs(date1_ms - date2_ms);
      return currentWeek = Math.floor(difference_ms / ONE_WEEK) || 1;
    };
    loadFromLocalStorage = function(weekNum) {
      var data, temp;
      if (weeklyMenu.length > 0) {
        weeklyMenu.splice(0, weeklyMenu.length);
      }
      if (!weekNum) {
        data = localStorage.getItem("week_1");
        weekNum = (data = JSON.parse(data)) ? currentWeekNumber(new Date(data[0].date)) : 1;
      }
      data = localStorage.getItem("week_" + weekNum);
      if (data) {
        temp = JSON.parse(data);
        return temp.forEach(function(day) {
          return weeklyMenu.push(new DayOfWeek(day.name, day.recipes.map(function(id) {
            return $recipeService.getById(id);
          }), new Date(day.date)));
        });
      } else {
        return buildWeek(weekNum);
      }
    };
    buildWeek = function(weekNum) {
      var index, lastDate, today, _i, _results;
      if (weekNum == null) {
        weekNum = 1;
      }
      if (weeklyMenu.length > 0) {
        lastDate = new Date(weeklyMenu[6].date);
        lastDate = new Date(lastDate.setDate(lastDate.getDate() + 1));
        weeklyMenu.splice(0, weeklyMenu.length);
      } else {
        today = new Date();
        lastDate = new Date(today.setDate((today.getDate() - today.getDay() + 1) * weekNum));
      }
      _results = [];
      for (index = _i = 0; _i <= 6; index = ++_i) {
        _results.push(weeklyMenu.push(new DayOfWeek(dayNames[index], [], new Date(new Date(lastDate).setDate(lastDate.getDate() + index)))));
      }
      return _results;
    };
    nextWeek = function() {
      currentWeek++;
      return loadFromLocalStorage(currentWeek);
    };
    prevWeek = function() {
      if (currentWeek > 1) {
        currentWeek = currentWeek - 1;
      }
      return loadFromLocalStorage(currentWeek);
    };
    recipeInDay = function(day, recipeId) {
      var recipe, weekDay, _i, _j, _len, _len1, _ref;
      for (_i = 0, _len = weeklyMenu.length; _i < _len; _i++) {
        weekDay = weeklyMenu[_i];
        if (weekDay.name === day) {
          _ref = weekDay.recipes;
          for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
            recipe = _ref[_j];
            if (recipe.id === recipeId) {
              return true;
            }
          }
        }
      }
      return false;
    };
    indexOfDay = function(dayName) {
      var day, index, _i, _len;
      for (index = _i = 0, _len = weeklyMenu.length; _i < _len; index = ++_i) {
        day = weeklyMenu[index];
        if (day.name === dayName) {
          return index;
        }
      }
      return -1;
    };
    getCompactRecipes = function() {
      var menu;
      menu = [];
      weeklyMenu.forEach(function(day) {
        return menu.push({
          name: day.name,
          recipes: day.recipes.map(function(recipe) {
            return recipe.id;
          }),
          date: new Date(day.date)
        });
      });
      return menu;
    };
    addRecipe = function(day, recipeId) {
      var _ref, _ref1;
      if ((_ref = weeklyMenu[indexOfDay(day)]) != null) {
        if ((_ref1 = _ref.recipes) != null) {
          _ref1.push($recipeService.getById(recipeId));
        }
      }
      return $rootScope.saveToLocalStorage("week_" + currentWeek, getCompactRecipes());
    };
    removeRecipe = function(recipe, day) {
      var dayIndex, recipeIndex;
      dayIndex = weeklyMenu.indexOf(day);
      recipeIndex = weeklyMenu[dayIndex].recipes.indexOf(recipe);
      if (recipeIndex > -1) {
        weeklyMenu[dayIndex].recipes.splice(recipeIndex, 1);
        return $rootScope.saveToLocalStorage("week_" + currentWeek, getCompactRecipes());
      }
    };
    removeAllRecipeInstances = function(recipe) {
      var day, index, _i, _len;
      for (index = _i = 0, _len = weeklyMenu.length; _i < _len; index = ++_i) {
        day = weeklyMenu[index];
        index = day.recipes.indexOf(recipe);
        if (index > -1) {
          day.recipes.splice(index, 1);
        }
      }
      return $rootScope.saveToLocalStorage("week_" + currentWeek, getCompactRecipes());
    };
    loadFromLocalStorage();
    return {
      weeklyMenu: weeklyMenu,
      addRecipe: addRecipe,
      removeAllRecipeInstances: removeAllRecipeInstances,
      removeRecipe: removeRecipe,
      recipeInDay: recipeInDay,
      nextWeek: nextWeek,
      prevWeek: prevWeek,
      currentWeek: function() {
        return currentWeek;
      }
    };
  }
]);

app.controller('CalendarCtrl', [
  '$scope', 'recipeService', '$rootScope', 'calendarService', function($scope, $recipeService, $rootScope, $calendarService) {
    var calendar;
    $scope.weeklyMenu = $calendarService.weeklyMenu;
    $scope.calendarService = $calendarService;
    $scope.nextWeek = $calendarService.nextWeek;
    $scope.prevWeek = $calendarService.prevWeek;
    $scope.removeRecipe = function(recipe, day) {
      return $calendarService.removeRecipe(recipe, day);
    };
    calendar = document.querySelector('.calendar-recipes');
    return calendar.addEventListener('drop', function(event) {
      var dayName, draggableId, droppable;
      droppable = event.target;
      draggableId = +event.dataTransfer.getData('id');
      dayName = droppable.classList[3];
      if (droppable.classList[0] === 'day') {
        if (!$calendarService.recipeInDay(dayName, draggableId)) {
          $calendarService.addRecipe(dayName, draggableId);
        } else {
          $rootScope.setStatusMessage("Один день не може містити дві страви з однаковим ім'ям.", "error");
        }
        $scope.$apply();
      }
      droppable.classList.remove('over');
      return document.querySelector("[data-id=\"" + draggableId + "\"]").style.opacity = '1';
    }, true);
  }
]);

app.controller('RecipesCtrl', [
  '$scope', 'recipeService', 'calendarService', function($scope, $recipeService, $calendarService) {
    var calendar, recipesContainer;
    $scope.recipes = $recipeService.recipes;
    $scope.removeRecipe = function(recipe) {
      $recipeService.remove(recipe);
      return $calendarService.removeAllRecipeInstances(recipe);
    };
    recipesContainer = document.querySelector('.recipes-container');
    calendar = document.querySelector('.calendar-recipes');
    return recipesContainer.addEventListener('dragstart', function(event) {
      var el;
      el = event.target;
      if (el.classList[0] === 'recipe') {
        el.style.opacity = '0.4';
        event.dataTransfer.setData('id', el.dataset.id);
        return event.dataTransfer.setData('element', el);
      }
    }, true);
  }
]);

app.controller('IngredientsCtrl', [
  '$scope', 'ingredientsService', '$rootScope', 'recipeService', function($scope, $ingredientsService, $rootScope, $recipeService) {
    $scope.ingredients = $ingredientsService.items;
    $scope.ingredient = new Ingredient();
    $scope.ingredientActive = function(ingredient) {
      if (ingredient.id === $scope.ingredient.id) {
        return 'active';
      } else {
        return '';
      }
    };
    $scope.saveIngredient = function() {
      if ($scope.ingredient.name.length > 0) {
        $ingredientsService.save($scope.ingredient);
        return $scope.ingredient = new Ingredient();
      } else {
        return $rootScope.setStatusMessage('Інгредієнт має мати назву.', 'error');
      }
    };
    $scope.editIngredient = function(ingredient) {
      return $scope.ingredient = ingredient;
    };
    return $scope.removeIngredient = function(ingredient) {
      $ingredientsService.remove(ingredient, $recipeService.recipes);
      return $scope.ingredient = new Ingredient();
    };
  }
]);

app.controller('RecipesCRUDCtrl', [
  '$scope', '$routeParams', 'recipeService', '$location', '$rootScope', 'ingredientsService', function($scope, $routeParams, $recipeService, $location, $rootScope, $ingredientsService) {
    var recipe;
    $scope.recipes = $recipeService.recipes;
    $scope.ingredients = $ingredientsService.items;
    $scope.ingModel = {
      id: 0,
      name: '',
      amount: '',
      units: 'шт.'
    };
    $scope.recipe = null;
    if ($routeParams.recipeId) {
      recipe = $recipeService.getById(+$routeParams.recipeId);
      $scope.recipe = new Recipe(recipe.name, [].concat(recipe.ingredients), recipe.id);
    } else {
      $scope.recipe = new Recipe();
    }
    $scope.chooseIngredient = function(ing) {
      $scope.ingModel.id = ing.id;
      return $scope.ingModel.name = ing.name;
    };
    $scope.addIngredient = function() {
      if ($scope.ingModel.id > 0 && $scope.ingModel.amount > 0) {
        $scope.recipe.ingredients.push(new RecipeIngredient($ingredientsService.getById($scope.ingModel.id), $scope.ingModel.amount, $scope.ingModel.units));
        $scope.ingModel.id = 0;
        $scope.ingModel.name = '';
        $scope.ingModel.amount = '';
        return $scope.ingModel.units = 'шт.';
      } else {
        return false;
      }
    };
    $scope.removeIngredient = function(ing) {
      var index;
      index = $scope.recipe.ingredients.indexOf(ing);
      if (index > -1 && $scope.recipe.ingredients.length > 0) {
        $scope.recipe.ingredients.splice(index, 1);
        return $rootScope.setStatusMessage('', '');
      }
    };
    return $scope.saveRecipe = function() {
      if ($scope.recipeForm.$invalid === false && $scope.recipe.ingredients.length > 0) {
        $recipeService.save($scope.recipe);
        return $location.path("/home");
      } else {
        return $rootScope.setStatusMessage('Рецепт має містити принаймні один інгридієнт.', 'error');
      }
    };
  }
]);
