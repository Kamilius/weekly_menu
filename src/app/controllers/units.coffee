app.controller 'UnitsCtrl', ['$scope', '$http', 'unitsService', ($scope, $http, $unitsService) ->
	$scope.units = []
	$scope.unit = new Unit()

	initUnits = ->
		if($unitsService.getUnits().length is 0)
			$http.get('/api/units').success((data, status, headers, config) ->
				$unitsService.setUnits(data)
				$scope.units = $unitsService.getUnits()
			)
		else
			$scope.units = $unitsService.getUnits()

	$scope.unitActive = (unit) ->
		if unit.id is $scope.unit.id then 'active' else ''

	$scope.saveUnit = ->
		if $scope.unit.name.length > 0
			$http.post('/api/units', { id: $scope.unit.id, name: $scope.unit.name }).success((data, status, headers, config) ->
				$unitsService.setUnits(data)
				$scope.units = $unitsService.getUnits()
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
				text = "Не можливо видалити. Одиниця міри використовується у таких інгредієнтах: "
				for ingr in data.ingredients
					text += "\n#{ingr}"
				$scope.setStatusMessage(text, 'error')
			else
				$unitsService.setUnits(data)
				$scope.units = $unitsService.getUnits()
				$scope.unit = new Unit()

				$scope.setStatusMessage('Одиницю міри успішно видалено', 'success')

	initUnits();
]
