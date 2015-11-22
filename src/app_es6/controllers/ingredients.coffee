app.controller 'IngredientsCtrl', ['$scope', '$http', 'ingredientsService', 'unitsService', ($scope, $http, $ingredientsService, $unitsService) ->
	$scope.ingredients = []
	$scope.units = []
	$scope.ingredient = new Ingredient()
	$scope.ingredient.unit = new Unit()

	loadUnits = ->
		$http.get('/api/units').success((data, status, headers, config) ->
			$unitsService.setUnits(data)
			$scope.units = $unitsService.getUnits()
		)

	loadIngredients = ->
		$http.get('/api/ingredients').success((data, status, headers, config) ->
			$scope.ingredients.splice(0, $scope.ingredients.length)
			$ingredientsService.setIngredients(data)
			$scope.ingredients = $ingredientsService.getIngredients()
		)

	loadUnitsAndIngredients = ->
		$http.get('/api/units').success((data, status, headers, config) ->
			$unitsService.setUnits(data)
			$scope.units = $unitsService.getUnits()

			loadIngredients()
		)

	init = ->
		existingUnits = $unitsService.getUnits()
		existingIngredients = $ingredientsService.getIngredients()

		if existingUnits.length is 0
			if existingIngredients.length is 0
				loadUnitsAndIngredients()
			else
				loadUnits()
				$scope.ingredients = existingIngredients
		else if existingIngredients.length is 0
			$scope.units = existingUnits
			loadIngredients()
		else
			$scope.units = existingUnits
			$scope.ingredients = existingIngredients


	$scope.ingredientActive = (ingredient) ->
		if ingredient.id is $scope.ingredient.id then 'active' else ''

	$scope.saveIngredient = ->
		if $scope.ingredient.name.length > 0 && $scope.ingredient.unit.id
			$http.post('/api/ingredients', {
				id: $scope.ingredient.id,
				name: $scope.ingredient.name,
				unit:  {
					id: $scope.ingredient.unit.id
					name: $scope.ingredient.unit.name
					}
			}).success((data, status, headers, config) ->
				$ingredientsService.setIngredients(data)
				$scope.ingredients = $ingredientsService.getIngredients()
				$scope.ingredient = new Ingredient()
				$scope.setStatusMessage('Інгредієнт успішно збережено.', 'success')
			)
		else
			$scope.setStatusMessage('Інгредієнт має мати назву і міру.', 'error')

	$scope.editIngredient = (ingredient) ->
		$scope.ingredient = ingredient

	$scope.removeIngredient = (ingredient) ->
		$http.delete("/api/ingredients/#{ingredient.id}").success((data, status, headers, config) ->
			if data.message is 'error'
				text = "Не можливо видалити. Інгредієнт використовується у таких рецептах: "
				for recipe in data.recipes
					text += "\n#{recipe}"
				$scope.setStatusMessage(text, 'error')
			else
				$ingredientsService.setIngredients(data)
				$scope.ingredients = $ingredientsService.getIngredients()
				$scope.ingredient = new Ingredient()

			$scope.setStatusMessage('Інгредієнт успішно видалено', 'success')
		)

	init()
]
