app.controller 'SummaryCtrl', ['$scope', '$http', '$filter', 'recipeService', ($scope, $http, $filter, $recipeService) ->
	$scope.weeklySummary = {}

	$scope.showSummaryDate = ->
		startDate = new Date($scope.weeklySummary.date)
		endDate = new Date(new Date($scope.weeklySummary.date).setDate($scope.weeklySummary.date?.getDate() + 6))
		return "#{startDate.getDate()}-#{endDate.getDate()} #{getMonthNameByNumber(startDate.getMonth())} #{startDate.getFullYear()}"

	initSummary = ->
		todayDate = new Date()
		currentWeek = +$filter('date')(new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate()), 'ww', 'UTC')
		currentYear = new Date().getFullYear()

		$http.get('/api/weekly_summary/' + encodeURIComponent(formatDateString(getDateOfISOWeek(currentWeek, currentYear)))).success((data) ->
			$scope.weeklySummary = data
			$scope.weeklySummary.date = new Date($scope.weeklySummary.date)
		)

	initSummary()
]
