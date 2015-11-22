app.controller 'RecipesCtrl', ['$scope', '$http', 'recipeService', ($scope, $http, $recipeService) ->
	$scope.recipes = []

	$scope.removeRecipe = (recipe) ->
		recipe.processing = true
		deleteURL = "/api/recipes/#{recipe.id}"
		$http.delete(deleteURL).success((data, status, headers, config) ->
			if data.message is 'error'
				$scope.$root.setStatusMessage('Виникла помилка. Спробуйте видалити рецепт іще раз.', 'error')
			else
				$scope.recipes.splice($scope.recipes.indexOf(recipe), 1)
				$scope.$root.setStatusMessage('Рецепт успішно видалено', 'success')

				#broadcast event in order to refresh recipes on calendar
				$scope.$root.$broadcast('recipe:removed',  { recipeId: recipe.id });

			recipe.processing = false
		)

	init = ->
		recipesContainer = document.querySelector('.recipes-container')

		$http.get('/api/recipes/').success((data) ->
			$recipeService.setRecipes(data)
			$scope.recipes = $recipeService.getRecipes()
		)
		recipesContainer.addEventListener 'dragstart', (event) ->
			el = event.target
			if el.classList[0] is 'recipe'
				el.style.opacity = '0.4'
				event.dataTransfer.setData('id', el.dataset.id)
				event.dataTransfer.setData('element', el)
		, true

	init()
]
