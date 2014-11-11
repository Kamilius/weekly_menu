app.controller 'SummaryCtrl', ['$scope', 'recipeService', ($scope, $recipeService) ->
	$scope.summaryItems = []

	loadFromLocalStorage = (week, year) ->
		data = localStorage.getItem("week_#{week}_#{year}")
		recipes = []

		#forming recipes list for current week of year
		if data
			JSON.parse(data).forEach (day) ->
				recipes = recipes.concat(day.recipes.map((id) ->
						$recipeService.getById(id)
					))

		recipes

	initSummary = ->
		#create separate weekSummary for each week available in base
		for key of localStorage
			if key.indexOf('week') is 0
				monthYear = key.match(/\d+/g)
				$scope.summaryItems.push(new WeekSummary(monthYear[0], monthYear[1], loadFromLocalStorage(monthYear[0], monthYear[1])))

	initSummary()
]