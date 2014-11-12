app.controller 'RecipesCRUDCtrl', ['$scope', '$routeParams', 'recipeService', '$location', '$rootScope', 'ingredientsService', ($scope, $routeParams, $recipeService, $location, $rootScope, $ingredientsService) ->

	$scope.recipes = $recipeService.recipes
	$scope.ingredients = $ingredientsService.items
	$scope.ingModel = new IngredientAmount()
	$scope.recipe = null

	if $routeParams.recipeId
		recipe = $recipeService.getById(+$routeParams.recipeId)
		$scope.recipe = new Recipe(recipe.id, recipe.name, [].concat(recipe.ingredients))
	else
		$scope.recipe = new Recipe()

	$scope.chooseIngredient = (ing) ->
		$scope.ingModel = new IngredientAmount(ing)

	$scope.addIngredient = () ->
		if typeof $scope.ingModel.amount is "string"
			$scope.ingModel.amount = $scope.ingModel.amount.replace(',', '.')

		$scope.ingModel.amount = parseFloat($scope.ingModel.amount)

		if $scope.ingModel.ingredient.id? > 0 and $scope.ingModel.amount > 0
			$scope.recipe.ingredients.push(new IngredientAmount($scope.ingModel.ingredient, $scope.ingModel.amount))
			$scope.ingModel = new IngredientAmount()
		else
			false

	$scope.removeIngredient = (ing) ->
		index = $scope.recipe.ingredients.indexOf(ing)

		if index > -1 and $scope.recipe.ingredients.length > 0
			$scope.recipe.ingredients.splice(index, 1)

	$scope.saveRecipe = ->
		if $scope.recipeForm.$invalid is false and $scope.recipe.ingredients.length > 0
			$recipeService.save($scope.recipe)
			$location.path("/home")
		else
			$rootScope.setStatusMessage('Рецепт має містити принаймні один інгридієнт.', 'error')
]
