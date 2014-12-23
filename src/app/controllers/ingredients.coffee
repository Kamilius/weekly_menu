app.controller 'IngredientsCtrl', ['$scope', '$http', ($scope, $http) ->
	$scope.ingredients = []
	$scope.units = []
	$scope.ingredient = new Ingredient()
	$scope.ingredient.unit = new Unit()

	init = ->
		$http.get('/api/units').success((data, status, headers, config) ->
			$http.get('/api/ingredients').success((data, status, headers, config) ->
				if data
					$scope.ingredients = data.map (ingredient) ->
						new Ingredient(ingredient.id, ingredient.name, ingredient.unit)
			)
			$scope.units = data.map (unit) ->
				new Unit(unit.id, unit.name)
		)

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
				if not $scope.ingredient.id
					$scope.ingredient.id = data.ingrId
					$scope.ingredients.push(new Ingredient($scope.ingredient.id, $scope.ingredient.name, $scope.ingredient.unit))

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
				text = "Не можливо видалити. \nІнгредієнт використовується у наступних рецептах: "
				for recipe in data.recipes
					text += "\n\"#{recipe}\""
				$scope.setStatusMessage(text, 'error')
			else
				$scope.ingredients.splice($scope.ingredients.indexOf($scope.ingredient), 1)
				$scope.ingredient = new Ingredient()
				$scope.ingredient.unit = new Unit()
				$scope.setStatusMessage('Інгредієнт успішно видалено', 'success')
		)

	init()
]
