app.controller 'IngredientsCtrl', ['$scope', 'ingredientsService', '$rootScope', 'recipeService', 'unitsService', ($scope, $ingredientsService, $rootScope, $recipeService, $unitsService) ->
	$scope.ingredients = $ingredientsService.items
	$scope.units = $unitsService.items
	$scope.ingredient = new Ingredient()
	$scope.ingredient.unit = $scope.units[0]

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