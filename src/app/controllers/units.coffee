app.controller 'UnitsCtrl', ['$scope', 'unitsService', 'ingredientsService', ($scope, $unitsService, $ingredientsService) ->
	$scope.units = $unitsService.items
	$scope.unit = new Unit()

	$scope.unitActive = (unit) ->
		if unit.id is $scope.unit.id then 'active' else ''

	$scope.saveUnit = ->
		if $scope.unit.name.length > 0
			$unitsService.save($scope.unit)
			$scope.unit = new Unit()
		else
			$rootScope.setStatusMessage('Одиниця міри має мати назву.', 'error')

	$scope.editUnit = (unit) ->
		$scope.unit = unit

	$scope.removeUnit = (unit) ->
		$unitsService.remove(unit, $ingredientsService.items)
		$scope.unit = new Unit()
]