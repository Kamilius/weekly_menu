/* globals app */

app.config(['$routeProvider', ($routeProvider) => {
  $routeProvider.when('/', {
    templateUrl: 'views/home.html'
  }).when('/recipes', {
    templateUrl: 'views/recipesCRUD.html',
    controller: 'RecipesCRUDCtrl'
  }).when('/recipes/:recipeId', {
    templateUrl: 'views/recipesCRUD.html',
    controller: 'RecipesCRUDCtrl'
  }).when('/ingredients', {
    templateUrl: 'views/ingredients.html',
    controller: 'IngredientsCtrl'
  }).when('/units', {
    templateUrl: 'views/units.html',
    controller: 'UnitsCtrl'
  }).when('/summary', {
    templateUrl: 'views/summary.html',
    controller: 'SummaryCtrl'
  }).
  otherwise({ redirectTo: '/' })
}])

app.run(['$rootScope', '$location', ($rootScope, $location) => {
  $rootScope.statusMessage = {
    text: '',
    type: ''
  }

  $rootScope.setStatusMessage = (text, type) => {
    this.statusMessage.text = text
    this.statusMessage.type = type

    setTimeout(() => {
      (() => {
        $rootScope.statusMessage.text = ''
        $rootScope.statusMessage.type = ''
        $rootScope.$apply()
      })($rootScope)
    }, 10000)
  }

  $rootScope.getClass = (path) => {
    return $location.path().substr(0, path.length) === path ? 'active' : ''
  }

  $rootScope.recipeDetailsVisible = false
}])

app.directive('calendar', () => {
  return {
    restrict: 'E',
    templateUrl: 'views/calendar.html',
    scope: {},
    controller: 'CalendarCtrl'
  }
})

app.directive('recipescontainer', () => {
  return {
    restrict: 'E',
    templateUrl: 'views/recipesContainer.html',
    scope: {},
    controller: 'RecipesCtrl'
  }
})

app.directive('ingredients', () => {
  return {
    restrict: 'E',
    scope: {},
    templateUrl: 'views/ingredients.html'
  }
})

app.directive('index', () => {
  return {
    restrict: 'E',
    templateUrl: 'views/home.html'
  }
})

app.directive('recipecrud', () => {
  return {
    restrict: 'E',
    scope: {},
    templateUrl: 'views/recipeCRUD.html'
  }
})

app.directive('recipecontrols', () => {
  return {
    restrict: 'E',
    templateUrl: 'views/recipeControls.html'
  }
})

app.directive('dragEnterLeaveAnimation', () => {
  return (scope, element, attrs) => {
    element.on('dragenter', (event) => {
      this.classList.add('over')
    })

    element.on('dragleave', (event) => {
      this.classList.remove('over')
    })
  }
})
