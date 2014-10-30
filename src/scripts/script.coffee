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
		if el.classList[0] == 'recipe' 
			el.style.opacity = '0.4'
			event.dataTransfer.setData('draggable', el)
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
		droppable = event.target
		draggable = event.dataTransfer.getData('draggable')
		if droppable.classList[1] == 'day' 
			if !$scope.weeklyMenu[droppable.classList[2]]
				$scope.weeklyMenu[droppable.classList[2]] = []
			$scope.weeklyMenu[droppable.classList[2]].push 'done'
			
			console.log($scope.weeklyMenu)
	, false
]