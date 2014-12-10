app.controller 'CalendarCtrl', ['$scope', '$http', '$filter', 'recipeService', ($scope, $http, $filter, $recipeService) ->
	#private properties
	dayNames = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
	currentWeek = +$filter('date')(new Date(), 'ww')
	currentYear = new Date().getFullYear()
	#scope variables
	$scope.weeklyMenu = []

	$scope.currentDate = ->
		return "#{currentWeek}, #{currentYear}"

	getDateOfISOWeek = (week, year) ->
		simple = new Date(year, 0, 1 + (week - 1) * 7)
		dow = simple.getDay()
		ISOweekStart = simple
		if dow <= 4
			ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1)
		else
			ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay())
		ISOweekStart

	buildWeek = ->
		monday = getDateOfISOWeek(currentWeek, currentYear)

		$scope.weeklyMenu.splice(0, $scope.weeklyMenu.length)

		for index in [0..6]
			$scope.weeklyMenu.push(new DayOfWeek(dayNames[index], new Date(new Date(monday).setDate(monday.getDate() + index))))

	getDayByName = (dayName) ->
		for day in $scope.weeklyMenu
			if day.name is dayName
				return day

	getDayByDate = (date) ->
		for day in $scope.weeklyMenu
			if day.date.toLocaleDateString() is date
				return day

	$scope.nextWeek = ->
		if currentWeek + 1 > 52
			currentWeek = 1
			currentYear++
		else
			currentWeek++
		buildWeek()

	$scope.prevWeek = ->
		if currentWeek - 1 < 1
			currentWeek = 52
			currentYear--
		else
			currentWeek--
		buildWeek()

	$scope.removeRecipe = (recipe, day) ->
		recipe.processing = true
		deleteURL = "/api/calendar/#{encodeURIComponent(day.date.toLocaleDateString())}/#{recipe.meal}/#{recipe.id}"
		$http.delete(deleteURL).success((data, status, headers, config) ->
			recipe.processing = false

			if data.message is 'error'
				$scope.$root.setStatusMessage('Виникла помилка. Спробуйте видалити рецепт іще раз.', 'error')
			else
				day[recipe.meal].splice(day[recipe.meal].indexOf(recipe), 1)
				$scope.$root.setStatusMessage('Рецепт успішно видалено', 'success')
		)

	removeAllRecipesById = (id) ->
		filterHelper = (recipe) ->
			return recipe.id != id

		$scope.weeklyMenu.forEach((day) ->
			day.breakfast = day.breakfast.filter(filterHelper)
			day.lunch = day.lunch.filter(filterHelper)
			day.dinner = day.dinner.filter(filterHelper)
		)

	recipeInMeal = (day, meal, recipeId) ->
		for weekDay in $scope.weeklyMenu when weekDay.name is day
			for recipe in weekDay[meal] when recipe.id is recipeId
				return true
		return false

	init = () ->
		buildWeek()
		$http.get('/api/calendar/' + encodeURIComponent($scope.weeklyMenu[0].date.toLocaleDateString())).success((data) ->
			#pack recipes according to day of week
			data.forEach((dataDay) ->
				date = new Date(dataDay.date).toLocaleDateString()
				dayOfWeek = getDayByDate(date)
				recipe = dataDay.recipe
				dayOfWeek[dataDay.meal].push(new Recipe(recipe.id, recipe.name, recipe.description, dataDay.meal, recipe.ingredients))
			)
		)

		#attach drag and drop "DROP" event handler
		calendar = document.querySelector('.calendar-recipes')

		calendar.addEventListener 'drop', (event) ->
			droppable = event.target
			draggableId = +event.dataTransfer.getData('id')
			dayName = droppable.parentNode.dataset['dayName']
			mealName = droppable.dataset['mealName']

			if droppable.classList.contains('meal')
				day = getDayByName(dayName)
				date = day.date

				if not recipeInMeal(dayName, mealName, draggableId)
					$http.post('/api/calendar', {
						date: date
						recipeId: draggableId
						meal: mealName
					}).success((data) ->
						recipe = $recipeService.getById(draggableId)
						day[mealName].push(recipe) if recipe
					)
				else
					$scope.$root.setStatusMessage("Один прийом їжі не може містити дві страви з однаковим ім'ям.", "error")
			droppable.classList.remove('over')
			document.querySelector("[data-id=\"#{draggableId}\"]").style.opacity = '1'
		, true

	$scope.$root.$on('recipe:removed', (event, data) ->
		removeAllRecipesById(data.recipeId)
	)

	init()
]
