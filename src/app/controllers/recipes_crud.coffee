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
		if typeof $scope.ingModel.amount is "string"
			$scope.ingModel.amount = $scope.ingModel.amount.replace(',', '.')

		$scope.ingModel.amount = parseFloat($scope.ingModel.amount)

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