var DayOfWeek, Ingredient, Recipe, app, getCalendarDayClass;

Recipe = (function() {
  function Recipe(name, ingredients, id) {
    this.name = name != null ? name : '';
    if (ingredients == null) {
      ingredients = [new Ingredient];
    }
    this.id = id != null ? id : 0;
    this.ingredients = [].concat(ingredients);
  }

  return Recipe;

})();

Ingredient = (function() {
  function Ingredient(name) {
    this.name = name != null ? name : '';
  }

  return Ingredient;

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
    }).otherwise({
      redirectTo: '/home'
    });
  }
]);

app.run([
  '$rootScope', function($rootScope) {
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
    return $rootScope.saveToLocalStorage = function(key, data) {
      return localStorage.setItem(key, JSON.stringify(data));
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

app.directive('index', function() {
  return {
    restrict: 'E',
    templateUrl: 'home.html'
  };
});

app.directive('recipecrud', function() {
  return {
    restrict: 'E',
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
  '$rootScope', function($rootScope) {
    var add, getById, loadFromLocalStorage, recipes, remove, save;
    recipes = [];
    loadFromLocalStorage = function() {
      var data;
      data = localStorage.getItem('recipes');
      if (data) {
        return recipes = JSON.parse(data).map(function(recipe) {
          return new Recipe(recipe.name, recipe.ingredients.map(function(ing) {
            return new Ingredient(ing.name);
          }), recipe.id);
        });
      }
    };
    getById = function(id) {
      var recipe, returnValue, _i, _len;
      returnValue = null;
      for (_i = 0, _len = recipes.length; _i < _len; _i++) {
        recipe = recipes[_i];
        if (recipe.id === id) {
          return recipe;
        }
      }
    };
    add = function(recipe) {
      recipe.id = recipes.length > 0 ? recipes[recipes.length - 1].id + 1 : 1;
      recipes.push(recipe);
      return $rootScope.saveToLocalStorage('recipes', recipes);
    };
    save = function(recipe) {
      var temp;
      if (recipe.id === 0) {
        this.add(new Recipe(recipe.name, recipe.ingredients));
        $rootScope.setStatusMessage('Рецепт успішно збережено.', 'success');
      } else {
        temp = this.getById(recipe.id);
        temp.name = recipe.name;
        temp.ingredients = [].concat(recipe.ingredients);
      }
      return $rootScope.saveToLocalStorage('recipes', recipes);
    };
    remove = function(recipe) {
      var index;
      index = recipes.indexOf(recipe);
      if (index > -1) {
        recipes.splice(index, 1);
      }
      return $rootScope.saveToLocalStorage('recipes', recipes);
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

app.service('calendarService', [
  'recipeService', '$rootScope', function($recipeService, $rootScope) {
    var addRecipe, getCompactRecipes, indexOfDay, loadFromLocalStorage, recipeInDay, removeAllRecipeInstances, removeRecipe, weeklyMenu;
    weeklyMenu = [];
    loadFromLocalStorage = function() {
      var data, temp;
      data = localStorage.getItem('calendar');
      if (data) {
        temp = JSON.parse(data);
        return temp.forEach(function(day) {
          return weeklyMenu.push(new DayOfWeek(day.name, day.recipes.map(function(id) {
            return $recipeService.getById(id);
          }), new Date(day.date)));
        });
      } else {
        weeklyMenu.push(new DayOfWeek('monday', [], new Date(2014, 10, 3)));
        weeklyMenu.push(new DayOfWeek('tuesday', [], new Date(2014, 10, 4)));
        weeklyMenu.push(new DayOfWeek('wednesday', [], new Date(2014, 10, 5)));
        weeklyMenu.push(new DayOfWeek('thursday', [], new Date(2014, 10, 6)));
        weeklyMenu.push(new DayOfWeek('friday', [], new Date(2014, 10, 6)));
        weeklyMenu.push(new DayOfWeek('saturday', [], new Date(2014, 10, 8)));
        return weeklyMenu.push(new DayOfWeek('sunday', [], new Date(2014, 10, 9)));
      }
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
      return $rootScope.saveToLocalStorage('calendar', getCompactRecipes());
    };
    removeRecipe = function(recipe, day) {
      var dayIndex, recipeIndex;
      dayIndex = weeklyMenu.indexOf(day);
      recipeIndex = weeklyMenu[dayIndex].recipes.indexOf(recipe);
      if (recipeIndex > -1) {
        weeklyMenu[dayIndex].recipes.splice(recipeIndex, 1);
        return $rootScope.saveToLocalStorage('calendar', getCompactRecipes());
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
      return $rootScope.saveToLocalStorage('calendar', getCompactRecipes());
    };
    loadFromLocalStorage();
    return {
      weeklyMenu: weeklyMenu,
      addRecipe: addRecipe,
      removeAllRecipeInstances: removeAllRecipeInstances,
      removeRecipe: removeRecipe,
      recipeInDay: recipeInDay
    };
  }
]);

getCalendarDayClass = function(dayName) {
  if (dayName === 'saturday' || dayName === 'sunday') {
    return 'col-md-1';
  } else {
    return 'col-md-2';
  }
};

app.controller('CalendarCtrl', [
  '$scope', 'recipeService', '$rootScope', 'calendarService', function($scope, $recipeService, $rootScope, $calendarService) {
    var calendar;
    $scope.weeklyMenu = $calendarService.weeklyMenu;
    $scope.getCalendarDayClass = getCalendarDayClass;
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
          $scope.$apply();
        }
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

app.controller('RecipesCRUDCtrl', [
  '$scope', '$routeParams', 'recipeService', '$location', '$rootScope', function($scope, $routeParams, $recipeService, $location, $rootScope) {
    var recipe;
    $scope.recipes = $recipeService.recipes;
    if ($routeParams.recipeId) {
      recipe = $recipeService.getById(+$routeParams.recipeId);
      $scope.recipe = {
        id: recipe.id,
        name: recipe.name,
        ingredients: [].concat(recipe.ingredients)
      };
    } else {
      $scope.recipe = new Recipe();
    }
    $scope.addIngredient = function() {
      return $scope.recipe.ingredients.push(new Ingredient());
    };
    $scope.removeIngredient = function(ing) {
      var index;
      index = $scope.recipe.ingredients.indexOf(ing);
      if (index > -1 && $scope.recipe.ingredients.length > 1) {
        $scope.recipe.ingredients.splice(index, 1);
        return $rootScope.setStatusMessage('', '');
      } else {
        return $rootScope.setStatusMessage('Має бути принаймні один інгридієнт.', 'error');
      }
    };
    return $scope.saveRecipe = function() {
      if ($scope.recipeForm.$invalid === false) {
        $recipeService.save($scope.recipe);
        return $location.path("/home");
      }
    };
  }
]);
