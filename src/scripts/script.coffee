class Recipe
	constructor: (@name, @ingredients, @id = 0) ->

class DayOfWeek
	constructor: (@name, @recipes) ->

app = angular.module 'weeklyMenuApp', ['ngRoute']		

app.config [
	'$routeProvider',
	($routeProvider) ->
		$routeProvider.when('/home',
			templateUrl: 'home.html'
		).when('/recipes',
			templateUrl: 'recipesCRUD.html'
			controller: 'RecipesCRUDCtrl'
		).
		otherwise(
			redirectTo: '/home')
]

app.service 'recipeService', ->
	recipes = [
		new Recipe 'Baked potato', ['potato', 'spice'], 1
		new Recipe 'Steak', ['beef meat', 'spice'], 2
		new Recipe 'Baked potato', ['potato', 'spice'], 3
		new Recipe 'Steak', ['beef meat', 'spice'], 4
		new Recipe 'Baked potato', ['potato', 'spice'], 5
		new Recipe 'Steak', ['beef meat', 'spice'], 6
		new Recipe 'Baked potato', ['potato', 'spice'], 7
	]

	getById = (id) ->
		returnValue = null

		for recipe in recipes
			return recipe if recipe.id == id

	add = (recipe) ->
		recipes.push(recipe)

	remove = (id) ->
		recipe = getById(id)
		if recipe is true
			recipes.splice(recipes.indexOf(recipe), 1)

	return {
		recipes: recipes
		getById: getById
		add: add
		remove: remove
	}


getCalendarDayClass = (dayName) ->
	if dayName is 'saturday' or dayName is 'sunday'
		'col-md-1'
	else
		'col-md-2'

indexOfDay = (dayName, daysList) ->
	for day, index in daysList
		return index if day.name is dayName

	return -1

app.controller 'CalendarCtrl', ['$scope', 'recipeService', ($scope, recipeService) ->
	$scope.weeklyMenu = []
	$scope.weeklyMenu.push new DayOfWeek('monday', [])
	$scope.weeklyMenu.push new DayOfWeek('tuesday', [])
	$scope.weeklyMenu.push new DayOfWeek('wednesday', [])
	$scope.weeklyMenu.push new DayOfWeek('thursday', [])
	$scope.weeklyMenu.push new DayOfWeek('friday', [])
	$scope.weeklyMenu.push new DayOfWeek('saturday', [])
	$scope.weeklyMenu.push new DayOfWeek('sunday', [])

	$scope.getCalendarDayClass = getCalendarDayClass

	calendar = document.querySelector('.calendar-recipes')
	
	calendar.addEventListener 'drop', (event) ->
		droppable = event.target
		draggableId = +event.dataTransfer.getData('id')
		if droppable.classList[0] is 'day'
			$scope.weeklyMenu[indexOfDay(droppable.classList[3], $scope.weeklyMenu)]?.recipes?.push recipeService.getById(draggableId)
			droppable.classList.remove('over')
			$scope.$apply()
	, false
]

app.controller 'RecipesCtrl', ['$scope', 'recipeService', ($scope, recipeService) ->
	$scope.recipes = recipeService.recipes

	recipesContainer = document.querySelector('.recipes-container')
	calendar = document.querySelector('.calendar-recipes')

	recipesContainer.addEventListener 'dragstart', (event) ->
		el = event.target
		if el.classList[0] is 'recipe' 
			el.style.opacity = '0.4'
			event.dataTransfer.setData('id', el.dataset.id)
	, false
	calendar.addEventListener 'dragenter', (event) ->
		el = event.target
		if el.classList[0] is 'day' then el.classList.add('over')
	, false
	calendar.addEventListener 'dragleave', (event) ->
		el = event.target
		if el.classList[0] is 'day' then el.classList.remove('over')	
	, false
]

app.controller 'RecipesCRUDCtrl', ['$scope', 'recipeService', ($scope, recipeService) ->
	$scope.recipes = recipeService.recipes
]

app.directive 'calendar', ->
	{
		restrict: 'E'
		templateUrl: 'calendar.html'
		controller: 'CalendarCtrl'
		transclude: true
		replace: true
	}

app.directive 'recipescontainer', ->
	{
		restrict: 'E'
		templateUrl: 'recipesContainer.html'
		controller: 'RecipesCtrl'
		transclude: true
		replace: true
	}

app.directive 'index', ->
	{
		restrict: 'E'
		templateUrl: 'home.html'
		transclude: true
		replace: true
	}

app.directive 'recipecrud', ->
	{
		restrict: 'E'
		templateUrl: 'recipeCRUD.html'
		transclude: true
		replace: true
	}