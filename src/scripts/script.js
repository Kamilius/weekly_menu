var DayOfWeek, Recipe, app, getCalendarDayClass, indexOfDay;

Recipe = (function() {
  function Recipe(name, ingredients, id) {
    this.name = name;
    this.ingredients = ingredients;
    this.id = id != null ? id : 0;
  }

  return Recipe;

})();

DayOfWeek = (function() {
  function DayOfWeek(name, recipes) {
    this.name = name;
    this.recipes = recipes;
  }

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
    }).otherwise({
      redirectTo: '/home'
    });
  }
]);

app.service('recipeService', function() {
  var add, getById, recipes, remove;
  recipes = [new Recipe('Baked potato', ['potato', 'spice'], 1), new Recipe('Steak', ['beef meat', 'spice'], 2), new Recipe('Baked potato', ['potato', 'spice'], 3), new Recipe('Steak', ['beef meat', 'spice'], 4), new Recipe('Baked potato', ['potato', 'spice'], 5), new Recipe('Steak', ['beef meat', 'spice'], 6), new Recipe('Baked potato', ['potato', 'spice'], 7)];
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
    return recipes.push(recipe);
  };
  remove = function(id) {
    var recipe;
    recipe = getById(id);
    if (recipe === true) {
      return recipes.splice(recipes.indexOf(recipe), 1);
    }
  };
  return {
    recipes: recipes,
    getById: getById,
    add: add,
    remove: remove
  };
});

getCalendarDayClass = function(dayName) {
  if (dayName === 'saturday' || dayName === 'sunday') {
    return 'col-md-1';
  } else {
    return 'col-md-2';
  }
};

indexOfDay = function(dayName, daysList) {
  var day, index, _i, _len;
  for (index = _i = 0, _len = daysList.length; _i < _len; index = ++_i) {
    day = daysList[index];
    if (day.name === dayName) {
      return index;
    }
  }
  return -1;
};

app.controller('CalendarCtrl', [
  '$scope', 'recipeService', function($scope, recipeService) {
    var calendar;
    $scope.weeklyMenu = [];
    $scope.weeklyMenu.push(new DayOfWeek('monday', []));
    $scope.weeklyMenu.push(new DayOfWeek('tuesday', []));
    $scope.weeklyMenu.push(new DayOfWeek('wednesday', []));
    $scope.weeklyMenu.push(new DayOfWeek('thursday', []));
    $scope.weeklyMenu.push(new DayOfWeek('friday', []));
    $scope.weeklyMenu.push(new DayOfWeek('saturday', []));
    $scope.weeklyMenu.push(new DayOfWeek('sunday', []));
    $scope.getCalendarDayClass = getCalendarDayClass;
    calendar = document.querySelector('.calendar-recipes');
    return calendar.addEventListener('drop', function(event) {
      var draggableId, droppable, _ref, _ref1;
      droppable = event.target;
      draggableId = +event.dataTransfer.getData('id');
      if (droppable.classList[0] === 'day') {
        if ((_ref = $scope.weeklyMenu[indexOfDay(droppable.classList[3], $scope.weeklyMenu)]) != null) {
          if ((_ref1 = _ref.recipes) != null) {
            _ref1.push(recipeService.getById(draggableId));
          }
        }
        droppable.classList.remove('over');
        return $scope.$apply();
      }
    }, false);
  }
]);

app.controller('RecipesCtrl', [
  '$scope', 'recipeService', function($scope, recipeService) {
    var calendar, recipesContainer;
    $scope.recipes = recipeService.recipes;
    recipesContainer = document.querySelector('.recipes-container');
    calendar = document.querySelector('.calendar-recipes');
    recipesContainer.addEventListener('dragstart', function(event) {
      var el;
      el = event.target;
      if (el.classList[0] === 'recipe') {
        el.style.opacity = '0.4';
        return event.dataTransfer.setData('id', el.dataset.id);
      }
    }, false);
    calendar.addEventListener('dragenter', function(event) {
      var el;
      el = event.target;
      if (el.classList[0] === 'day') {
        return el.classList.add('over');
      }
    }, false);
    return calendar.addEventListener('dragleave', function(event) {
      var el;
      el = event.target;
      if (el.classList[0] === 'day') {
        return el.classList.remove('over');
      }
    }, false);
  }
]);

app.controller('RecipesCRUDCtrl', [
  '$scope', 'recipeService', function($scope, recipeService) {
    return $scope.recipes = recipeService.recipes;
  }
]);

app.directive('calendar', function() {
  return {
    restrict: 'E',
    templateUrl: 'calendar.html',
    controller: 'CalendarCtrl',
    transclude: true,
    replace: true
  };
});

app.directive('recipescontainer', function() {
  return {
    restrict: 'E',
    templateUrl: 'recipesContainer.html',
    controller: 'RecipesCtrl',
    transclude: true,
    replace: true
  };
});

app.directive('index', function() {
  return {
    restrict: 'E',
    templateUrl: 'home.html',
    transclude: true,
    replace: true
  };
});

app.directive('recipecrud', function() {
  return {
    restrict: 'E',
    templateUrl: 'recipeCRUD.html',
    transclude: true,
    replace: true
  };
});
