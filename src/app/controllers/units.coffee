app.controller 'UnitsCtrl', ['$scope', '$http', ($scope, $http) ->
	$scope.units = []
	$scope.unit = new Unit()

	removeUnitOnClient = (id) ->
		for unit, index in $scope.units when unit.id is id
			break

		$scope.units.splice(index, 1)

	initUnits = ->
		$http.get('/api/units').success((data, status, headers, config) ->
			if data
				$scope.units = data.map (unit) ->
					new Unit(unit.id, unit.name)
		)

	$scope.unitActive = (unit) ->
		if unit.id is $scope.unit.id then 'active' else ''

	$scope.saveUnit = ->
		if $scope.unit.name.length > 0
			$http.post('/api/units', { id: $scope.unit.id, name: $scope.unit.name }).success((data, status, headers, config) ->
				if data.message is 'success'
					if not $scope.unit.id
						$scope.unit.id = data.unitId
						$scope.units.push(new Unit($scope.unit.id, $scope.unit.name))
					$scope.unit = new Unit()
					$scope.setStatusMessage('Одиницю виміру успішно збережено.', 'success')
			)
		else
			$scope.setStatusMessage('Одиниця міри має мати назву.', 'error')

	$scope.editUnit = (unit) ->
		$scope.unit = unit

	$scope.removeUnit = (unit) ->
		$http.delete("/api/units/#{unit.id}").success (data, status, headers, config) ->
			if data.message is 'error'
				text = "Не можливо видалити. \nОдиниця міри використовується у таких інгредієнтах: "
				for ingr in data.ingredients
					text += "\n\"#{ingr}\""
				$scope.setStatusMessage(text, 'error')
			else
				removeUnitOnClient(data.unitId)
				$scope.unit = new Unit()

				$scope.setStatusMessage('Одиницю міри успішно видалено', 'success')

	initUnits();
]
