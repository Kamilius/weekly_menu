app.controller 'RecipesCRUDCtrl', ['$scope', '$routeParams', '$location', '$rootScope', '$http', ($scope, $routeParams, $location, $rootScope, $http) ->
	$scope.ingredients = []
	$scope.ingModel = new Ingredient()
	$scope.recipe = {
		image: ''
	}

	setFormModel = ->
		if $routeParams.recipeId
			$http.get("/api/recipes/#{$routeParams.recipeId}").success((data, status, headers, config) ->
				if data
					$scope.recipe = new Recipe(data.id, data.name, data.description, '', data.image, data.ingredients)
			)
		else
			$scope.recipe = new Recipe()

	initRecipeForm = () ->
		$http.get("/api/ingredients").success (data, status, headers, config) ->
			if data
				$scope.ingredients = data

			setFormModel()

	$scope.getRecipeImage = () ->
		if typeof $scope.recipe.image is 'string' and $scope.recipe.image.length > 0
			return $scope.recipe.image
		else
			return 'http://placehold.it/167x167'

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
					if data.message is 'success' and $scope.recipe.image
						$http.put("/api/recipes/#{data.recipeId}", {image: $scope.recipe.image})
							.success((data) ->
								if data.message is 'success'
									$scope.setStatusMessage('Рецепт успішно збережено.', 'success')
									$location.path("/home")
						)
				)
			else
				$rootScope.setStatusMessage('Рецепт має містити назву.', 'error')
		else
			$rootScope.setStatusMessage('Рецепт має містити принаймні один інгредієнт.', 'error')

	initRecipeForm()
]
