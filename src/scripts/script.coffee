class Recipe
	constructor: (@name = '', ingredients = [], @id = 0) ->
		@ingredients = [].concat(ingredients)

class Ingredient
	constructor: (@name = '', @id = 0) ->

class RecipeIngredient
	constructor: (@parent, @amount = '', @units = '') ->

class DayOfWeek
	constructor: (@name, @recipes, @date) ->
	today: ->
		@date.toLocaleDateString() is new Date().toLocaleDateString()

class WeekSummary
	constructor: (@week, @year, @recipes = []) ->
		temp = {}
		for recipe in recipes
			if not temp[recipe.name]
				temp[recipe.name] =
					id: recipe.id
					name: recipe.name
					ingredients: recipe.ingredients.map (ing) ->
						new RecipeIngredient(ing.parent.name, ing.amount, ing.units)
			else
				for tempIng in temp[recipe.name].ingredients
					for ing in recipe.ingredients
						if tempIng.units is ing.units
							tempIng.amount = +tempIng.amount + +ing.amount

		@recipes = []
		for key of temp
			@recipes.push(temp[key]) if temp.hasOwnProperty(key)

app = angular.module 'weeklyMenuApp', ['ngRoute']		

app.config ['$routeProvider', ($routeProvider) ->
		$routeProvider.when('/home',
			templateUrl: 'home.html'
		).when('/recipes',
			templateUrl: 'recipesCRUD.html'
			controller: 'RecipesCRUDCtrl'
		).when('/recipes/:recipeId',
			templateUrl: 'recipesCRUD.html'
			controller: 'RecipesCRUDCtrl'
		).when('/ingredients',
			templateUrl: 'ingredients.html'
			controller: 'IngredientsCtrl'
		).when('/summary',
			templateUrl: 'summary.html'
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

app.directive 'ingredients', ->
	{
		restrict: 'E'
		scope: {}
		templateUrl: 'ingredients.html'
	}

app.directive 'index', ->
	{
		restrict: 'E'
		templateUrl: 'home.html'
	}

app.directive 'recipecrud', ->
	{
		restrict: 'E'
		scope: {}
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
			@classList.add('over')
		element.on 'dragleave', (event) ->
			@classList.remove('over')

app.service 'recipeService', ['$rootScope', 'ingredientsService', ($rootScope, $ingredientsService) ->
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
					new RecipeIngredient($ingredientsService.getById(ing.parent), ing.amount, ing.units)
				), recipe.id)

	getById = (id) ->
		for recipe in recipes
			return recipe if recipe.id == id

		return null

	getCompactRecipes = ->
		temp = []
		for recipe in recipes
			temp.push(
				id: recipe.id
				name: recipe.name
				ingredients: recipe.ingredients.map (ing) ->
					return {
						parent: ing.parent.id
						amount: ing.amount
						units: ing.units
					}
			)

		return temp

	add = (recipe) ->
		recipe.id = if recipes.length > 0 then recipes[recipes.length - 1]?.id + 1 else 1
		recipes.push(recipe)
		$rootScope.saveToLocalStorage('recipes', getCompactRecipes())

	save = (recipe) ->
		if recipe.id is 0
			@add new Recipe(recipe.name, recipe.ingredients)
			$rootScope.setStatusMessage('Рецепт успішно збережено.', 'success')
		else
			temp = @getById(recipe.id)
			temp.name = recipe.name
			temp.ingredients = [].concat(recipe.ingredients)
			$rootScope.saveToLocalStorage('recipes', getCompactRecipes())

	remove = (recipe) ->
		index = recipes.indexOf(recipe)

		if index > -1
			recipes.splice(index, 1)

		$rootScope.saveToLocalStorage('recipes', getCompactRecipes())

	loadFromLocalStorage()	

	return {
		recipes: recipes
		getById: getById
		add: add
		save: save
		remove: remove
	}
]

app.service 'ingredientsService', ['$rootScope', ($rootScope) ->
	ingredients = []

	loadFromLocalStorage = ->
		data = localStorage.getItem('ingredients')

		if data
			ingredients = JSON.parse(data).map (ingredient) ->
				new Ingredient(ingredient.name, ingredient.id)

	getById = (id) ->
		for ingredient in ingredients
			return ingredient if ingredient.id == id

		return null

	add = (ingredient) ->
		ingredient.id = if ingredients.length > 0 then ingredients[ingredients.length - 1]?.id + 1 else 1
		ingredients.push(ingredient)
		$rootScope.saveToLocalStorage('ingredients', ingredients)

	save = (ingredient) ->
		if ingredient.id is 0
			@add new Ingredient(ingredient.name)
			$rootScope.setStatusMessage('Інгредієнт успішно збережено.', 'success')
		else
			temp = @getById(ingredient.id)
			temp.name = ingredient.name

		$rootScope.saveToLocalStorage('ingredients', ingredients)

	remove = (ingredient, recipes) ->
		index = ingredients.indexOf(ingredient)
		recipeNames = ''

		for recipe in recipes
			for ing in recipe.ingredients when ing.parent is ingredient
				recipeNames += "\n \"#{recipe.name}\""

		if index > -1 and recipeNames.length is 0
			ingredients.splice(index, 1)
			$rootScope.saveToLocalStorage('ingredients', ingredients)
		else if recipeNames.length > 0
			$rootScope.setStatusMessage("Неможливо видалити інгридієнт \"#{ingredient.name}\". Він використовується у наступних рецептах: \n#{ recipeNames }", 'error')
		else
			$rootScope.setStatusMessage("Інгридієнту з id: #{ingredient.id} - не існує.", 'error')
	loadFromLocalStorage()

	{
		getById: getById
		items: ingredients
		add: add
		save: save
		remove: remove
	}
]

app.service 'calendarService', ['recipeService', '$rootScope', '$filter', ($recipeService, $rootScope, $filter) ->
	weeklyMenu = []
	dayNames = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
	currentWeek = +$filter('date')(new Date(), 'ww')
	currentYear = new Date().getFullYear()

	currentDate = (firstWeekDate) ->
		return "#{currentWeek}, #{currentYear}"

	loadFromLocalStorage = () ->
		data = localStorage.getItem("week_#{currentWeek}_#{currentYear}")

		#clear weeklyMenu array if it's not empty
		weeklyMenu.splice(0, weeklyMenu.length) if weeklyMenu.length > 0

		#if there is previously saved data for this week and year
		if data
			#form new week days and init them with previously saved data
			temp = JSON.parse(data)
			temp.forEach (day) ->
				weeklyMenu.push new DayOfWeek(day.name, day.recipes.map((id) ->
						$recipeService.getById(id)
					), new Date(day.date))
		#if no previosly saved data for this week and year
		#build clear week
		else
			buildWeek()

	getDateOfISOWeek = (week, year) ->
    simple = new Date(year, 0, 1 + (week - 1) * 7)
    dow = simple.getDay()
    ISOweekStart = simple
    if dow <= 4
      ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1)
    else
      ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay())
    ISOweekStart

	buildWeek = () ->
		monday = getDateOfISOWeek(currentWeek, currentYear)
		
		for index in [0..6]
			weeklyMenu.push(new DayOfWeek(dayNames[index], [], new Date(new Date(monday).setDate(monday.getDate() + index))))

	nextWeek = () ->
		if currentWeek + 1 > 52
			currentWeek = 1
			currentYear++
		else
			currentWeek++

		loadFromLocalStorage()

	prevWeek = () ->
		if currentWeek - 1 < 1
			currentWeek = 52
			currentYear--
		else
			currentWeek--

		loadFromLocalStorage()

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

		$rootScope.saveToLocalStorage("week_#{currentWeek}_#{currentYear}", getCompactRecipes())

	removeRecipe = (recipe, day) ->
		dayIndex = weeklyMenu.indexOf(day)
		recipeIndex = weeklyMenu[dayIndex].recipes.indexOf(recipe)
		if recipeIndex > -1
			weeklyMenu[dayIndex].recipes.splice(recipeIndex, 1)
			$rootScope.saveToLocalStorage("week_#{currentWeek}_#{currentYear}", getCompactRecipes())

	removeAllRecipeInstances = (recipe) ->
		for day, index in weeklyMenu
			index = day.recipes.indexOf(recipe)
			if index > -1
				day.recipes.splice(index, 1)
		$rootScope.saveToLocalStorage("week_#{currentWeek}_#{currentYear}", getCompactRecipes())

	loadFromLocalStorage()

	{
		weeklyMenu: weeklyMenu
		addRecipe: addRecipe
		removeAllRecipeInstances: removeAllRecipeInstances
		removeRecipe: removeRecipe
		recipeInDay: recipeInDay
		nextWeek: nextWeek
		prevWeek: prevWeek
		currentDate: currentDate
	}
]

app.controller 'CalendarCtrl', ['$scope', 'recipeService', '$rootScope', 'calendarService', ($scope, $recipeService, $rootScope, $calendarService) ->
	$scope.weeklyMenu = $calendarService.weeklyMenu
	$scope.calendarService = $calendarService
	$scope.nextWeek = $calendarService.nextWeek
	$scope.prevWeek = $calendarService.prevWeek

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
			else
				$rootScope.setStatusMessage("Один день не може містити дві страви з однаковим ім'ям.", "error")
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

app.controller 'IngredientsCtrl', ['$scope', 'ingredientsService', '$rootScope', 'recipeService', ($scope, $ingredientsService, $rootScope, $recipeService) ->
	$scope.ingredients = $ingredientsService.items
	$scope.ingredient = new Ingredient()

	$scope.ingredientActive = (ingredient) ->
		if ingredient.id is $scope.ingredient.id then 'active' else ''

	$scope.saveIngredient = ->
		if $scope.ingredient.name.length > 0
			$ingredientsService.save($scope.ingredient)
			$scope.ingredient = new Ingredient()
		else
			$rootScope.setStatusMessage('Інгредієнт має мати назву.', 'error')

	$scope.editIngredient = (ingredient) ->
		$scope.ingredient = ingredient

	$scope.removeIngredient = (ingredient) ->
		$ingredientsService.remove(ingredient, $recipeService.recipes)
		$scope.ingredient = new Ingredient()
]

app.controller 'RecipesCRUDCtrl', ['$scope', '$routeParams', 'recipeService', '$location', '$rootScope', 'ingredientsService', ($scope, $routeParams, $recipeService, $location, $rootScope, $ingredientsService) ->
	
	$scope.recipes = $recipeService.recipes
	$scope.ingredients = $ingredientsService.items
	$scope.ingModel =
		id: 0
		name: ''
		amount: ''
		units: 'шт.'
	$scope.recipe = null

	if $routeParams.recipeId
		recipe = $recipeService.getById(+$routeParams.recipeId)
		$scope.recipe = new Recipe(recipe.name, [].concat(recipe.ingredients), recipe.id)
	else
		$scope.recipe = new Recipe()

	$scope.chooseIngredient = (ing) ->
		$scope.ingModel.id = ing.id
		$scope.ingModel.name = ing.name

	$scope.addIngredient = () ->
		if $scope.ingModel.id > 0 and $scope.ingModel.amount > 0
			$scope.recipe.ingredients.push(new RecipeIngredient($ingredientsService.getById($scope.ingModel.id), $scope.ingModel.amount, $scope.ingModel.units))
			$scope.ingModel.id = 0
			$scope.ingModel.name = ''
			$scope.ingModel.amount = ''
			$scope.ingModel.units = 'шт.'
		else
			false

	$scope.removeIngredient = (ing) ->
		index = $scope.recipe.ingredients.indexOf(ing)

		if index > -1 and $scope.recipe.ingredients.length > 0
			$scope.recipe.ingredients.splice(index, 1)
			$rootScope.setStatusMessage('', '')

	$scope.saveRecipe = ->
		if $scope.recipeForm.$invalid is false and $scope.recipe.ingredients.length > 0
			$recipeService.save($scope.recipe)
			$location.path("/home")
		else
			$rootScope.setStatusMessage('Рецепт має містити принаймні один інгридієнт.', 'error')
]

app.controller 'SummaryCtrl', ['$scope', 'recipeService', ($scope, $recipeService) ->
	$scope.summaryItems = []

	loadFromLocalStorage = (week, year) ->
		data = localStorage.getItem("week_#{week}_#{year}")
		recipes = []

		#forming recipes list for current week of year
		if data
			JSON.parse(data).forEach (day) ->
				recipes = recipes.concat(day.recipes.map((id) ->
						$recipeService.getById(id)
					))

		recipes

	initSummary = ->
		#create separate weekSummary for each week available in base
		for key of localStorage
			if key.indexOf('week') is 0
				monthYear = key.match(/\d+/g)
				$scope.summaryItems.push(new WeekSummary(monthYear[0], monthYear[1], loadFromLocalStorage(monthYear[0], monthYear[1])))

	initSummary()
]