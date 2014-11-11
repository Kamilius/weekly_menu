var DayOfWeek, Ingredient, Recipe, RecipeIngredient, WeekSummary, app;

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

WeekSummary = (function() {
  function WeekSummary(week, year, recipes) {
    var ing, key, recipe, temp, tempIng, _i, _j, _k, _len, _len1, _len2, _ref, _ref1;
    this.week = week;
    this.year = year;
    this.recipes = recipes != null ? recipes : [];
    temp = {};
    for (_i = 0, _len = recipes.length; _i < _len; _i++) {
      recipe = recipes[_i];
      if (!temp[recipe.name]) {
        temp[recipe.name] = {
          id: recipe.id,
          name: recipe.name,
          ingredients: recipe.ingredients.map(function(ing) {
            return new RecipeIngredient(ing.parent.name, ing.amount, ing.units);
          })
        };
      } else {
        _ref = temp[recipe.name].ingredients;
        for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
          tempIng = _ref[_j];
          _ref1 = recipe.ingredients;
          for (_k = 0, _len2 = _ref1.length; _k < _len2; _k++) {
            ing = _ref1[_k];
            if (tempIng.units === ing.units) {
              tempIng.amount = +tempIng.amount + +ing.amount;
            }
          }
        }
      }
    }
    this.recipes = [];
    for (key in temp) {
      if (temp.hasOwnProperty(key)) {
        this.recipes.push(temp[key]);
      }
    }
  }

  return WeekSummary;

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
    }).when('/summary', {
      templateUrl: 'summary.html',
      controller: 'SummaryCtrl'
    }).otherwise({
      redirectTo: '/home'
    });
  }
]);

app.run([
  '$rootScope', '$location', function($rootScope, $location) {
    var clearEmptyWeeks;
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
    clearEmptyWeeks = function(week, weekItemName) {
      var counter, day, _i, _len;
      counter = 0;
      for (_i = 0, _len = week.length; _i < _len; _i++) {
        day = week[_i];
        if (day.recipes.length > 0) {
          counter++;
          break;
        }
      }
      if (counter === 0) {
        localStorage.removeItem(weekItemName);
        return true;
      }
      return false;
    };
    $rootScope.saveToLocalStorage = function(key, data) {
      if (key.indexOf('week') === 0) {
        if (clearEmptyWeeks(data, key)) {
          return;
        }
      }
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
  'recipeService', '$rootScope', '$filter', function($recipeService, $rootScope, $filter) {
    var addRecipe, buildWeek, currentDate, currentWeek, currentYear, dayNames, getCompactRecipes, getDateOfISOWeek, indexOfDay, loadFromLocalStorage, nextWeek, prevWeek, recipeInDay, removeAllRecipeInstances, removeRecipe, weeklyMenu;
    weeklyMenu = [];
    dayNames = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    currentWeek = +$filter('date')(new Date(), 'ww');
    currentYear = new Date().getFullYear();
    currentDate = function(firstWeekDate) {
      return "" + currentWeek + ", " + currentYear;
    };
    loadFromLocalStorage = function() {
      var data, temp;
      data = localStorage.getItem("week_" + currentWeek + "_" + currentYear);
      if (weeklyMenu.length > 0) {
        weeklyMenu.splice(0, weeklyMenu.length);
      }
      if (data) {
        temp = JSON.parse(data);
        return temp.forEach(function(day) {
          return weeklyMenu.push(new DayOfWeek(day.name, day.recipes.map(function(id) {
            return $recipeService.getById(id);
          }), new Date(day.date)));
        });
      } else {
        return buildWeek();
      }
    };
    getDateOfISOWeek = function(week, year) {
      var ISOweekStart, dow, simple;
      simple = new Date(year, 0, 1 + (week - 1) * 7);
      dow = simple.getDay();
      ISOweekStart = simple;
      if (dow <= 4) {
        ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
      } else {
        ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
      }
      return ISOweekStart;
    };
    buildWeek = function() {
      var index, monday, _i, _results;
      monday = getDateOfISOWeek(currentWeek, currentYear);
      _results = [];
      for (index = _i = 0; _i <= 6; index = ++_i) {
        _results.push(weeklyMenu.push(new DayOfWeek(dayNames[index], [], new Date(new Date(monday).setDate(monday.getDate() + index)))));
      }
      return _results;
    };
    nextWeek = function() {
      if (currentWeek + 1 > 52) {
        currentWeek = 1;
        currentYear++;
      } else {
        currentWeek++;
      }
      return loadFromLocalStorage();
    };
    prevWeek = function() {
      if (currentWeek - 1 < 1) {
        currentWeek = 52;
        currentYear--;
      } else {
        currentWeek--;
      }
      return loadFromLocalStorage();
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
      return $rootScope.saveToLocalStorage("week_" + currentWeek + "_" + currentYear, getCompactRecipes());
    };
    removeRecipe = function(recipe, day) {
      var dayIndex, recipeIndex;
      dayIndex = weeklyMenu.indexOf(day);
      recipeIndex = weeklyMenu[dayIndex].recipes.indexOf(recipe);
      if (recipeIndex > -1) {
        weeklyMenu[dayIndex].recipes.splice(recipeIndex, 1);
        return $rootScope.saveToLocalStorage("week_" + currentWeek + "_" + currentYear, getCompactRecipes());
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
      return $rootScope.saveToLocalStorage("week_" + currentWeek + "_" + currentYear, getCompactRecipes());
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
      currentDate: currentDate
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
      if (typeof $scope.ingModel.amount === "string") {
        $scope.ingModel.amount = $scope.ingModel.amount.replace(',', '.');
      }
      $scope.ingModel.amount = parseFloat($scope.ingModel.amount);
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

app.controller('SummaryCtrl', [
  '$scope', 'recipeService', function($scope, $recipeService) {
    var initSummary, loadFromLocalStorage;
    $scope.summaryItems = [];
    loadFromLocalStorage = function(week, year) {
      var data, recipes;
      data = localStorage.getItem("week_" + week + "_" + year);
      recipes = [];
      if (data) {
        JSON.parse(data).forEach(function(day) {
          return recipes = recipes.concat(day.recipes.map(function(id) {
            return $recipeService.getById(id);
          }));
        });
      }
      return recipes;
    };
    initSummary = function() {
      var key, monthYear, _results;
      _results = [];
      for (key in localStorage) {
        if (key.indexOf('week') === 0) {
          monthYear = key.match(/\d+/g);
          _results.push($scope.summaryItems.push(new WeekSummary(monthYear[0], monthYear[1], loadFromLocalStorage(monthYear[0], monthYear[1]))));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };
    return initSummary();
  }
]);
