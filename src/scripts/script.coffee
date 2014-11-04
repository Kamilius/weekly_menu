class Recipe
	constructor: (@name = '', ingredients = [new Ingredient], @id = 0) ->
		@ingredients = [].concat(ingredients)
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
		# transclude: true
		replace: true
	}

app.directive 'recipescontainer', ->
	{
		restrict: 'E'
		templateUrl: 'recipesContainer.html'
		controller: 'RecipesCtrl'
		# transclude: true
		replace: true
	}

app.directive 'index', ->
	{
		restrict: 'E'
		templateUrl: 'home.html'
		# transclude: true
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
		#transclude: true
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

app.service 'calendarService',['recipeService', ($recipeService) ->
	weeklyMenu = []

	weeklyMenu.push new DayOfWeek('monday', [])
	weeklyMenu.push new DayOfWeek('tuesday', [])
	weeklyMenu.push new DayOfWeek('wednesday', [])
	weeklyMenu.push new DayOfWeek('thursday', [])
	weeklyMenu.push new DayOfWeek('friday', [])
	weeklyMenu.push new DayOfWeek('saturday', [])
	weeklyMenu.push new DayOfWeek('sunday', [])


	indexOfDay = (dayName) ->
		for day, index in weeklyMenu
			return index if day.name is dayName

		return -1

	addRecipe = (day, recipeId) ->
		weeklyMenu[indexOfDay(day)]?.recipes?.push $recipeService.getById(recipeId)

	removeAllRecipeInstances = (recipe) ->
		for day, index in weeklyMenu
			index = day.recipes.indexOf(recipe)
			if index > -1
				day.recipes.splice(index, 1)

	{
		weeklyMenu: weeklyMenu
		addRecipe: addRecipe
		removeAllRecipeInstances: removeAllRecipeInstances
	}
] 

getCalendarDayClass = (dayName) ->
	if dayName is 'saturday' or dayName is 'sunday'
		'col-md-1'
	else
		'col-md-2'

app.controller 'CalendarCtrl', ['$scope', 'recipeService', '$rootScope', 'calendarService', ($scope, $recipeService, $rootScope, $calendarService) ->
	$scope.weeklyMenu = $calendarService.weeklyMenu

	$scope.getCalendarDayClass = getCalendarDayClass

	# $scope.removeRecipe = (id, day) ->
	# 	index = $scope.weeklyMenu[day].recipes.indexOf(recipe)
	# 	if index > -1
	# 		$scope.weeklyMenu[day].recipes.splice(index, 1)


	calendar = document.querySelector('.calendar-recipes')
	
	calendar.addEventListener 'drop', (event) ->
		droppable = event.target
		draggableId = +event.dataTransfer.getData('id')
		if droppable.classList[0] is 'day'
			$calendarService.addRecipe(droppable.classList[3], draggableId)
			droppable.classList.remove('over')
			document.querySelector("[data-id=\"#{draggableId}\"]").style.opacity = '1'
			$scope.$apply()
	, true

]

app.controller 'RecipesCtrl', ['$scope', 'recipeService', 'calendarService', ($scope, $recipeService, $calendarService) ->
	$scope.recipes = $recipeService.recipes

	$scope.removeRecipe = (recipe) ->
		index = $scope.recipes.indexOf(recipe)
		$scope.recipes.splice(index, 1) if index > -1
		$calendarService.removeAllRecipeInstances(recipe)

	recipesContainer = document.querySelector('.recipes-container')
	calendar = document.querySelector('.calendar-recipes')

	recipesContainer.addEventListener 'dragstart', (event) ->
		el = event.target
		if el.classList[0] is 'recipe'
			el.style.opacity = '0.4'
			event.dataTransfer.setData('id', el.dataset.id)
			event.dataTransfer.setData('element', el)
	, true
]

app.controller 'RecipesCRUDCtrl', ['$scope', '$routeParams', 'recipeService', '$location', '$rootScope', ($scope, $routeParams, $recipeService, $location, $rootScope) ->
	$scope.recipes = $recipeService.recipes

	if $routeParams.recipeId
		recipe = $recipeService.getById(+$routeParams.recipeId)
		$scope.recipe = {
			id: recipe.id
			name: recipe.name
			ingredients: [].concat(recipe.ingredients)
		}
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
			else
				recipe = $recipeService.getById($scope.recipe.id)
				recipe.name = $scope.recipe.name
				recipe.ingredients = [].concat($scope.recipe.ingredients)
				
			$location.path("/home")
]