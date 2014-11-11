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