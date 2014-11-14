app.config ['$routeProvider', ($routeProvider) ->
		$routeProvider.when('/home',
			templateUrl: 'views/home.html'
		).when('/recipes',
			templateUrl: 'views/recipesCRUD.html'
			controller: 'RecipesCRUDCtrl'
		).when('/recipes/:recipeId',
			templateUrl: 'views/recipesCRUD.html'
			controller: 'RecipesCRUDCtrl'
		).when('/ingredients',
			templateUrl: 'views/ingredients.html'
			controller: 'IngredientsCtrl'
		).when('/units',
			templateUrl: 'views/units.html'
			controller: 'UnitsCtrl'
		).when('/summary',
			templateUrl: 'views/summary.html'
			controller: 'SummaryCtrl'
		).
		otherwise(redirectTo: '/home')
]

app.run ['$rootScope', '$location', ($rootScope, $location) ->
	$rootScope.statusMessage = 
		text: ''
		type: ''

	$rootScope.setStatusMessage = (text, type) ->
		this.statusMessage.text = text
		this.statusMessage.type = type
		setTimeout ->
			(->
				$rootScope.statusMessage.text = ''
				$rootScope.statusMessage.type = ''
				$rootScope.$apply()
			)($rootScope)
		, 10000

	clearEmptyWeeks = (week, weekItemName) ->
		counter = 0
		for day in week
			if day.recipes.length > 0
				counter++
				break

		if counter is 0
			localStorage.removeItem(weekItemName)
			return true

		return false

	$rootScope.saveToLocalStorage = (key, data) ->
		# clear week_# variable, if week is empty, 
		# to optimize local storage capacity
		if key.indexOf('week') is 0
			if clearEmptyWeeks(data, key)
				return

		localStorage.setItem(key, JSON.stringify(data))

	$rootScope.getClass = (path) ->
		if $location.path().substr(0, path.length) == path then 'active' else ''
]

app.directive 'calendar', ->
	{
		restrict: 'E'
		templateUrl: 'views/calendar.html'
		scope: {}
		controller: 'CalendarCtrl'
	}

app.directive 'recipescontainer', ->
	{
		restrict: 'E'
		templateUrl: 'views/recipesContainer.html'
		scope: {}
		controller: 'RecipesCtrl'
	}

app.directive 'ingredients', ->
	{
		restrict: 'E'
		scope: {}
		templateUrl: 'views/ingredients.html'
	}

app.directive 'index', ->
	{
		restrict: 'E'
		templateUrl: 'views/home.html'
	}

app.directive 'recipecrud', ->
	{
		restrict: 'E'
		scope: {}
		templateUrl: 'views/recipeCRUD.html'
	}

app.directive 'recipecontrols', ->
	{
		restrict: 'E'
		templateUrl: 'views/recipeControls.html'
	}

app.directive 'dragEnterLeaveAnimation', -> 
	(scope, element, attrs) ->
		element.on 'dragenter', (event) ->
			@classList.add('over')
		element.on 'dragleave', (event) ->
			@classList.remove('over')