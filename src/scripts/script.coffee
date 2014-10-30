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
	]

	recipesContainer = document.querySelector('.recipes-container')
	calendar = document.querySelector('.calendar-recipes')

	recipesContainer.addEventListener 'dragstart', (event) ->
		el = event.target
		if el.classList[0] == 'recipe' then event.target.style.opacity = '0.4'
	calendar.addEventListener 'dragenter', (event) ->
		el = event.target
		if el.classList[1] == 'day' then el.classList.add('over')
	calendar.addEventListener 'dragleave', (event) ->
		el = event.target
		if el.classList[1] == 'day' then el.classList.remove('over')
]

app.controller 'CalendarCtrl', ['$scope', ($scope) ->
]