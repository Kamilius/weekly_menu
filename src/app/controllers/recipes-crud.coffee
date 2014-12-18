app.controller 'RecipesCRUDCtrl', ['$scope', '$routeParams', '$location', '$rootScope', '$http', 'ingredientsService', ($scope, $routeParams, $location, $rootScope, $http, $ingredientsService) ->
	$scope.ingredients = []
	$scope.ingModel = new Ingredient()
	$scope.recipe = null

	setFormModel = ->
		if $routeParams.recipeId
			$http.get("/api/recipes/#{$routeParams.recipeId}").success((data, status, headers, config) ->
				if data
					$scope.recipe = new Recipe(data.id, data.name, data.description, '', data.ingredients)
			)
		else
			$scope.recipe = new Recipe()

	initRecipeForm = ->
		if $ingredientsService.getIngredients().length is 0
			$http.get("/api/ingredients").success((data, status, headers, config) ->
				if data
					$ingredientsService.setIngredients(data)
					$scope.ingredients = $ingredientsService.getIngredients()

				setFormModel()
			)
		else
			$scope.ingredients = $ingredientsService.getIngredients()
			setFormModel()

	$scope.chooseIngredient = (ing) ->
		$scope.ingModel = new Ingredient(ing.id, ing.name, ing.unit)

	$scope.addIngredient = () ->
		if typeof $scope.ingModel.amount is "string"
			$scope.ingModel.amount = $scope.ingModel.amount.replace(',', '.')

		if $scope.ingModel.id > 0 and $scope.ingModel.amount.length > 0
			$scope.recipe.ingredients.push($scope.ingModel)
			$scope.ingModel = new Ingredient()

	$scope.removeIngredient = (ing) ->
		index = $scope.recipe.ingredients.indexOf(ing)

		if index > -1 and $scope.recipe.ingredients.length > 0
			$scope.recipe.ingredients.splice(index, 1)

	$scope.saveRecipe = ->
		if $scope.recipeForm.$invalid is false and $scope.recipe.ingredients.length > 0
			if $scope.recipe.name.length > 0
				$http.post('/api/recipes', {
					id: $scope.recipe.id
					name: $scope.recipe.name
					description: $scope.recipe.description
					ingredients: $scope.recipe.ingredients.map (ingr) ->
						return {
							id: ingr.id
							amount: ingr.amount
						}
				}).success((data, status, headers, config) ->
					$scope.setStatusMessage('Рецепт успішно збережено.', 'success')
					$location.path("/home")
				)
			else
				$rootScope.setStatusMessage('Рецепт має містити назву.', 'error')
		else
			$rootScope.setStatusMessage('Рецепт має містити принаймні один інгредієнт.', 'error')

	initRecipeForm()
]
