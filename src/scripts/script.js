var DayOfWeek, DragEnterHandler, DragLeaveHandler, Ingredient, Recipe, app, getCalendarDayClass, indexOfDay;

Recipe = (function() {
  function Recipe(name, ingredients, id) {
    this.name = name != null ? name : '';
    this.ingredients = ingredients != null ? ingredients : [new Ingredient];
    this.id = id != null ? id : 0;
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
    return $rootScope.setStatusMessage = function(text, type) {
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

app.directive('recipecontrols', function() {
  return {
    restrict: 'E',
    templateUrl: 'recipeControls.html',
    transclude: true,
    replace: true
  };
});

DragEnterHandler = function(event) {
  return this.classList.add('over');
};

DragLeaveHandler = function(event) {
  return this.classList.remove('over');
};

app.directive('dragEnterLeaveAnimation', function() {
  return function(scope, element, attrs) {
    element.on('dragenter', DragEnterHandler);
    return element.on('dragleave', DragLeaveHandler);
  };
});

app.service('recipeService', function() {
  var add, getById, recipes, remove;
  recipes = [
    new Recipe('Смажена картопля', [
      {
        name: 'картопля'
      }, {
        name: 'спеції'
      }
    ], 1), new Recipe('Борщ', [
      {
        name: 'картопля'
      }, {
        name: 'буряк'
      }, {
        name: 'морква'
      }, {
        name: 'цибуля'
      }, {
        name: 'куряче філе'
      }, {
        name: 'спеції'
      }
    ], 2), new Recipe('Смажена ковбаса з кетчупом', [
      {
        name: 'ковбаса молочна'
      }, {
        name: 'кетчуп'
      }
    ], 3), new Recipe('Стейк', [
      {
        name: 'м\'ясо'
      }, {
        name: 'спеції'
      }
    ], 4), new Recipe('Солянка', [
      {
        name: 'телятина'
      }, {
        name: 'ковбаса копчена'
      }, {
        name: 'шпондер'
      }, {
        name: 'полядвиця'
      }, {
        name: 'мисливські ковбаски'
      }, {
        name: 'картопля'
      }, {
        name: 'морква'
      }, {
        name: 'цибуля'
      }, {
        name: 'томатна паста'
      }, {
        name: 'спеції'
      }
    ], 5)
  ];
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
    recipe.id = recipes[recipes.length - 1].id + 1;
    return recipes.push(recipe);
  };
  remove = function(recipe) {
    var index;
    index = recipes.indexOf(recipe);
    if (index === !-1) {
      return recipes.splice(index, 1);
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
  '$scope', 'recipeService', '$rootScope', function($scope, recipeService, $rootScope) {
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
    }, true);
  }
]);

app.controller('RecipesCtrl', [
  '$scope', 'recipeService', function($scope, recipeService) {
    var calendar, recipesContainer;
    $scope.recipes = recipeService.recipes;
    $scope.removeRecipe = function(recipe) {
      var index;
      index = $scope.recipes.indexOf(recipe);
      return $scope.recipes.splice(index, 1);
    };
    recipesContainer = document.querySelector('.recipes-container');
    calendar = document.querySelector('.calendar-recipes');
    return recipesContainer.addEventListener('dragstart', function(event) {
      var el;
      el = event.target;
      if (el.classList[0] === 'recipe') {
        el.style.opacity = '0.4';
        return event.dataTransfer.setData('id', el.dataset.id);
      }
    }, true);
  }
]);

app.controller('RecipesCRUDCtrl', [
  '$scope', '$routeParams', 'recipeService', '$location', '$rootScope', function($scope, $routeParams, $recipeService, $location, $rootScope) {
    $scope.recipes = $recipeService.recipes;
    if ($routeParams.recipeId) {
      $scope.recipe = $recipeService.getById(+$routeParams.recipeId);
      console.log($scope.recipe);
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
      if ($scope.recipeForm.$dirty === true && $scope.recipeForm.$invalid === false) {
        if ($scope.recipe.id === 0) {
          $recipeService.add(new Recipe($scope.recipe.name, $scope.recipe.ingredients));
          $rootScope.setStatusMessage('Рецепт успішно збережено.', 'success');
        }
        return $location.path("/home");
      }
    };
  }
]);
