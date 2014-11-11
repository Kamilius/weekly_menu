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