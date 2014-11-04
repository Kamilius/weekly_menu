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
		).when('/recipes',
			templateUrl: 'recipesCRUD.html'
			controller: 'RecipesCRUDCtrl'
		).when('/recipes/:recipeId',
			templateUrl: 'recipesCRUD.html'
			controller: 'RecipesCRUDCtrl'
		).
		otherwise(redirectTo: '/home')
]

app.run ['$rootScope', ($rootScope) ->

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

app.directive 'recipecontrols', ->
	{
		restrict: 'E'
		templateUrl: 'recipeControls.html'
		transclude: true
		replace: true
	}

DragEnterHandler = (event) ->
	@.classList.add('over')

DragLeaveHandler = (event) ->
	@.classList.remove('over')

app.directive 'dragEnterLeaveAnimation', ->
	(scope, element, attrs) ->
		element.on 'dragenter', DragEnterHandler
		element.on 'dragleave', DragLeaveHandler

app.service 'recipeService', ->
	recipes = [
		new Recipe 'Смажена картопля', [{ name: 'картопля' }, { name:'спеції' }], 1
		new Recipe 'Борщ', [{ name:'картопля' }, { name:'буряк' }, { name:'морква' }, { name:'цибуля' }, { name:'куряче філе' }, { name:'спеції' }], 2
		new Recipe 'Смажена ковбаса з кетчупом', [{ name:'ковбаса молочна' }, { name:'кетчуп' }], 3
		new Recipe 'Стейк', [{ name:'м\'ясо' }, { name:'спеції' }], 4
		new Recipe 'Солянка', [{ name:'телятина' }, { name:'ковбаса копчена' }, { name:'шпондер' }, { name:'полядвиця' }, { name:'мисливські ковбаски' }, { name:'картопля' }, { name:'морква' }, { name:'цибуля' }, { name:'томатна паста' }, { name:'спеції' }], 5
	]

	getById = (id) ->
		returnValue = null

		for recipe in recipes
			return recipe if recipe.id == id

	add = (recipe) ->
		recipe.id = recipes[recipes.length - 1].id + 1
		recipes.push(recipe)

	remove = (recipe) ->
		index = recipes.indexOf(recipe)

		if index is not -1
			recipes.splice(index, 1)

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

app.controller 'CalendarCtrl', ['$scope', 'recipeService', '$rootScope', ($scope, recipeService, $rootScope) ->
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
	, true

]

app.controller 'RecipesCtrl', ['$scope', 'recipeService', ($scope, recipeService) ->
	$scope.recipes = recipeService.recipes

	$scope.removeRecipe = (recipe) ->
		index = $scope.recipes.indexOf(recipe)
		$scope.recipes.splice(index, 1)

	recipesContainer = document.querySelector('.recipes-container')
	calendar = document.querySelector('.calendar-recipes')

	recipesContainer.addEventListener 'dragstart', (event) ->
		el = event.target
		if el.classList[0] is 'recipe' 
			el.style.opacity = '0.4'
			event.dataTransfer.setData('id', el.dataset.id)
	, true
]

app.controller 'RecipesCRUDCtrl', ['$scope', '$routeParams', 'recipeService', '$location', '$rootScope', ($scope, $routeParams, $recipeService, $location, $rootScope) ->
	$scope.recipes = $recipeService.recipes

	if $routeParams.recipeId
		$scope.recipe = $recipeService.getById(+$routeParams.recipeId)
		console.log($scope.recipe)
	else
		$scope.recipe = new Recipe()

	$scope.addIngredient = ->
		$scope.recipe.ingredients.push(new Ingredient())

	$scope.removeIngredient = (ing) ->
		index = $scope.recipe.ingredients.indexOf(ing)

		if index > -1 and $scope.recipe.ingredients.length > 1
			$scope.recipe.ingredients.splice(index, 1)
			$rootScope.setStatusMessage('', '')
		else
			$rootScope.setStatusMessage('Має бути принаймні один інгридієнт.', 'error')

	$scope.saveRecipe = ->
		if $scope.recipeForm.$dirty is true and $scope.recipeForm.$invalid is false
			if $scope.recipe.id is 0
				$recipeService.add new Recipe($scope.recipe.name, $scope.recipe.ingredients)
				$rootScope.setStatusMessage('Рецепт успішно збережено.', 'success')
				
			$location.path("/home")
]