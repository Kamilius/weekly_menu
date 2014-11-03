class Recipe
	constructor: (@name = '', @ingredients = [new Ingredient], @id = 0) ->

class Ingredient
	constructor: (@name = '') ->

class DayOfWeek
	constructor: (@name, @recipes) ->

app = angular.module 'weeklyMenuApp', ['ngRoute']		

app.config [
	'$routeProvider',
	($routeProvider) ->
		$routeProvider.when('/home',
			templateUrl: 'home.html'
		).when('/recipes/:recipeId',
			templateUrl: 'recipesCRUD.html'
			controller: 'RecipesCRUDCtrl'
		).when('/recipes',
			templateUrl: 'recipesCRUD.html'
			controller: 'RecipesCRUDCtrl'
		).
		otherwise(redirectTo: '/home')
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

app.service 'recipeService', ->
	recipes = [
		new Recipe 'Смажена картопля', ['картопля', 'спеції'], 1
		new Recipe 'Борщ', ['картопля', 'буряк', 'морква', 'цибуля', 'куряче філе', 'спеції'], 2
		new Recipe 'Смажена ковбаса з кетчупом', ['ковбаса молочна', 'кетчуп'], 3
		new Recipe 'Стейк', ['м\'ясо', 'спеції'], 4
		new Recipe 'Солянка', ['телятина', 'ковбаса копчена', 'шпондер', 'полядвиця', 'мисливські ковбаски', 'картопля', 'морква', 'цибуля', 'томатна паста', 'спеції'], 5
	]

	getById = (id) ->
		returnValue = null

		for recipe in recipes
			return recipe if recipe.id == id

	add = (recipe) ->
		recipe.id = recipes[recipes.length - 1].id + 1
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

DragEnterHandler = (event) ->
	el = this
	if el.classList[0] is 'day' then el.classList.add('over')

DragLeaveHandler = (event) ->
	el = this
	if el.classList[0] is 'day' then el.classList.remove('over')

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
]

app.controller 'RecipesCRUDCtrl', ['$scope', '$routeParams', 'recipeService', ($scope, $routeParams, $recipeService) ->
	$scope.recipes = $recipeService.recipes
	if $routeParams.recipeId
		$scope.recipe = $recipeService.getById(+$routeParams.recipeId)
	else
		$scope.recipe
	$scope.recipe = $routeParams.recipeId new Recipe()

	$scope.addIngredient = ->
		$scope.recipe.ingredients.push(new Ingredient())
]