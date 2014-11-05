class Recipe
	constructor: (@name = '', ingredients = [new Ingredient], @id = 0) ->
		@ingredients = [].concat(ingredients)
class Ingredient
	constructor: (@name = '') ->

class DayOfWeek
	constructor: (@name, @recipes, @date) ->
	today: ->
		@date.toLocaleDateString() == new Date().toLocaleDateString()

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

	$rootScope.saveToLocalStorage = (key, data) ->
		localStorage.setItem(key, JSON.stringify(data))
]

app.directive 'calendar', ->
	{
		restrict: 'E'
		templateUrl: 'calendar.html'
		scope: {}
		controller: 'CalendarCtrl'
	}

app.directive 'recipescontainer', ->
	{
		restrict: 'E'
		templateUrl: 'recipesContainer.html'
		scope: {}
		controller: 'RecipesCtrl'
	}

app.directive 'index', ->
	{
		restrict: 'E'
		templateUrl: 'home.html'
	}

app.directive 'recipecrud', ->
	{
		restrict: 'E'
		templateUrl: 'recipeCRUD.html'
	}

app.directive 'recipecontrols', ->
	{
		restrict: 'E'
		templateUrl: 'recipeControls.html'
	}

app.directive 'dragEnterLeaveAnimation', -> 
	(scope, element, attrs) ->
		element.on 'dragenter', (event) ->
			@.classList.add('over')
		element.on 'dragleave', (event) ->
			@.classList.remove('over')

app.service 'recipeService', ['$rootScope', ($rootScope) ->
	# recipes = [
	# 	new Recipe 'Смажена картопля', [{ name: 'картопля' }, { name:'спеції' }], 1
	# 	new Recipe 'Борщ', [{ name:'картопля' }, { name:'буряк' }, { name:'морква' }, { name:'цибуля' }, { name:'куряче філе' }, { name:'спеції' }], 2
	# 	new Recipe 'Смажена ковбаса з кетчупом', [{ name:'ковбаса молочна' }, { name:'кетчуп' }], 3
	# 	new Recipe 'Стейк', [{ name:'м\'ясо' }, { name:'спеції' }], 4
	# 	new Recipe 'Солянка', [{ name:'телятина' }, { name:'ковбаса копчена' }, { name:'шпондер' }, { name:'полядвиця' }, { name:'мисливські ковбаски' }, { name:'картопля' }, { name:'морква' }, { name:'цибуля' }, { name:'томатна паста' }, { name:'спеції' }], 5
	# ]
	recipes = []

	loadFromLocalStorage = ->
		data = localStorage.getItem('recipes')

		if data
			recipes = JSON.parse(data).map (recipe) ->
				new Recipe(recipe.name, recipe.ingredients.map((ing) ->
					new Ingredient(ing.name)
				), recipe.id)

	getById = (id) ->
		returnValue = null

		for recipe in recipes
			return recipe if recipe.id == id

	add = (recipe) ->
		recipe.id = if recipes.length > 0 then recipes[recipes.length - 1].id + 1 else 1
		recipes.push(recipe)
		$rootScope.saveToLocalStorage('recipes', recipes)

	save = (recipe) ->
		if recipe.id is 0
			@add new Recipe(recipe.name, recipe.ingredients)
			$rootScope.setStatusMessage('Рецепт успішно збережено.', 'success')
		else
			temp = @getById(recipe.id)
			temp.name = recipe.name
			temp.ingredients = [].concat(recipe.ingredients)

		$rootScope.saveToLocalStorage('recipes', recipes)

	remove = (recipe) ->
		index = recipes.indexOf(recipe)

		if index > -1
			recipes.splice(index, 1)

		$rootScope.saveToLocalStorage('recipes', recipes)

	loadFromLocalStorage()	

	return {
		recipes: recipes
		getById: getById
		add: add
		save: save
		remove: remove
	}
]

app.service 'calendarService',['recipeService', '$rootScope', ($recipeService, $rootScope) ->
	weeklyMenu = []

	loadFromLocalStorage = ->
		data = localStorage.getItem('calendar')

		if data
			temp = JSON.parse(data)
			temp.forEach (day) ->
				weeklyMenu.push new DayOfWeek(day.name, day.recipes.map((id) ->
						$recipeService.getById(id)
					), new Date(day.date))

		else
			weeklyMenu.push new DayOfWeek('monday', [], new Date(2014, 10, 3))
			weeklyMenu.push new DayOfWeek('tuesday', [], new Date(2014, 10, 4))
			weeklyMenu.push new DayOfWeek('wednesday', [], new Date(2014, 10, 5))
			weeklyMenu.push new DayOfWeek('thursday', [], new Date(2014, 10, 6))
			weeklyMenu.push new DayOfWeek('friday', [], new Date(2014, 10, 6))
			weeklyMenu.push new DayOfWeek('saturday', [], new Date(2014, 10, 8))
			weeklyMenu.push new DayOfWeek('sunday', [], new Date(2014, 10, 9))

	recipeInDay = (day, recipeId) ->
		for weekDay in weeklyMenu when weekDay.name is day
			for recipe in weekDay.recipes when recipe.id is recipeId
				return true
		return false

	indexOfDay = (dayName) ->
		for day, index in weeklyMenu
			return index if day.name is dayName

		return -1

	getCompactRecipes = ->
		menu = []
		weeklyMenu.forEach (day) ->
			menu.push 
				name: day.name
				recipes: day.recipes.map (recipe) ->
					recipe.id
				date: new Date(day.date)

		menu

	addRecipe = (day, recipeId) ->
		weeklyMenu[indexOfDay(day)]?.recipes?.push $recipeService.getById(recipeId)

		$rootScope.saveToLocalStorage('calendar', getCompactRecipes())

	removeRecipe = (recipe, day) ->
		dayIndex = weeklyMenu.indexOf(day)
		recipeIndex = weeklyMenu[dayIndex].recipes.indexOf(recipe)
		if recipeIndex > -1
			weeklyMenu[dayIndex].recipes.splice(recipeIndex, 1)
			$rootScope.saveToLocalStorage('calendar', getCompactRecipes())

	removeAllRecipeInstances = (recipe) ->
		for day, index in weeklyMenu
			index = day.recipes.indexOf(recipe)
			if index > -1
				day.recipes.splice(index, 1)
		$rootScope.saveToLocalStorage('calendar', getCompactRecipes())

	loadFromLocalStorage()

	{
		weeklyMenu: weeklyMenu
		addRecipe: addRecipe
		removeAllRecipeInstances: removeAllRecipeInstances
		removeRecipe: removeRecipe
		recipeInDay: recipeInDay
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

	$scope.removeRecipe = (recipe, day) ->
		$calendarService.removeRecipe(recipe, day)

	calendar = document.querySelector('.calendar-recipes')
	
	calendar.addEventListener 'drop', (event) ->
		droppable = event.target
		draggableId = +event.dataTransfer.getData('id')
		dayName = droppable.classList[3]
		if droppable.classList[0] is 'day'
			if not $calendarService.recipeInDay(dayName, draggableId)
				$calendarService.addRecipe(dayName, draggableId)
				$scope.$apply()
		droppable.classList.remove('over')
		document.querySelector("[data-id=\"#{draggableId}\"]").style.opacity = '1'
	, true

]

app.controller 'RecipesCtrl', ['$scope', 'recipeService', 'calendarService', ($scope, $recipeService, $calendarService) ->
	$scope.recipes = $recipeService.recipes

	$scope.removeRecipe = (recipe) ->
		$recipeService.remove(recipe)
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
		if $scope.recipeForm.$invalid is false
			$recipeService.save($scope.recipe)

			$location.path("/home")
]