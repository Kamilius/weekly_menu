app = angular.module 'weeklyMenuApp', []

class Recipe
	constructor: (@name, @ingredients) ->

app.controller 'RecipesCtrl', ['$scope', ($scope) ->
	$scope.recipes = [
		new Recipe 'Baked potato', ['potato', 'spice']
		new Recipe 'Steak', ['beef meat', 'spice']
		new Recipe 'Baked potato', ['potato', 'spice']
		new Recipe 'Steak', ['beef meat', 'spice']
		new Recipe 'Baked potato', ['potato', 'spice']
		new Recipe 'Steak', ['beef meat', 'spice']
		new Recipe 'Baked potato', ['potato', 'spice']
		new Recipe 'Steak', ['beef meat', 'spice']
		new Recipe 'Baked potato', ['potato', 'spice']
		new Recipe 'Steak', ['beef meat', 'spice']
		new Recipe 'Baked potato', ['potato', 'spice']
		new Recipe 'Steak', ['beef meat', 'spice']
		new Recipe 'Baked potato', ['potato', 'spice']
		new Recipe 'Steak', ['beef meat', 'spice']
		new Recipe 'Baked potato', ['potato', 'spice']
		new Recipe 'Steak', ['beef meat', 'spice']
		new Recipe 'Baked potato', ['potato', 'spice']
		new Recipe 'Steak', ['beef meat', 'spice']
		new Recipe 'Baked potato', ['potato', 'spice']
		new Recipe 'Steak', ['beef meat', 'spice']
		new Recipe 'Baked potato', ['potato', 'spice']
		new Recipe 'Steak', ['beef meat', 'spice']
		new Recipe 'Baked potato', ['potato', 'spice']
		new Recipe 'Steak', ['beef meat', 'spice']
		new Recipe 'Baked potato', ['potato', 'spice']
		new Recipe 'Steak', ['beef meat', 'spice']
		new Recipe 'Baked potato', ['potato', 'spice']
		new Recipe 'Steak', ['beef meat', 'spice']
		new Recipe 'Baked potato', ['potato', 'spice']
		new Recipe 'Steak', ['beef meat', 'spice']
		new Recipe 'Baked potato', ['potato', 'spice']
		new Recipe 'Steak', ['beef meat', 'spice']
		new Recipe 'Baked potato', ['potato', 'spice']
		new Recipe 'Steak', ['beef meat', 'spice']
		new Recipe 'Baked potato', ['potato', 'spice']
		new Recipe 'Steak', ['beef meat', 'spice']
		new Recipe 'Baked potato', ['potato', 'spice']
		new Recipe 'Steak', ['beef meat', 'spice']
	]

	recipesContainer = document.querySelector('.recipes-container')
	calendar = document.querySelector('.calendar-recipes')

	recipesContainer.addEventListener 'dragstart', (event) ->
		el = event.target
		if el.classList[0] == 'recipe' then event.target.style.opacity = '0.4'
	, false
	calendar.addEventListener 'dragenter', (event) ->
		el = event.target
		if el.classList[1] == 'day' then el.classList.add('over')
	, false
	calendar.addEventListener 'dragleave', (event) ->
		el = event.target
		if el.classList[1] == 'day' then el.classList.remove('over')	
	, false
]

app.controller 'CalendarCtrl', ['$scope', ($scope) ->
	$scope.weeklyMenu = {}
	calendar = document.querySelector('.calendar-recipes')
	calendar.addEventListener 'drop', (event) ->
		draggable = event.target
		droppable = this
		if droppable.classList[1] == 'day' then $scope.weeklyMenu[droppable.classList[2]].push JSON.parse(event.dataTransfer.getData('json'))
		console.log($scope.weeklyMenu)
	, false
]