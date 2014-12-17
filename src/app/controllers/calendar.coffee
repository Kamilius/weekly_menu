app.controller 'CalendarCtrl', ['$scope', '$http', '$filter', 'recipeService', ($scope, $http, $filter, $recipeService) ->
	#private properties
	dayNames = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
	todayDate = new Date()
	currentWeek = +$filter('date')(new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate()), 'ww', 'UTC')
	currentYear = new Date().getFullYear()
	#scope variables
	$scope.weeklyMenu = []
	$scope.recipeDetails = {
		name: ''
		ingredients: []
		description: ''
	}

	$scope.showRecipeDetails = (recipe) ->
		$scope.recipeDetails = recipe
		$scope.recipeDetailsVisible = {
			name: ''
			ingredients: []
			description: ''
		}

	$scope.hideRecipeDetails = () ->
		$scope.recipeDetailsVisible = false

	$scope.currentDate = ->
		return "#{currentWeek}, #{currentYear}"

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
			if formatDateString(day.date) is date
				return day

	$scope.nextWeek = ->
		if currentWeek + 1 > 52
			currentWeek = 1
			currentYear++
		else
			currentWeek++
		buildWeek()
		getRecipesForCurrentWeek()

	$scope.prevWeek = ->
		if currentWeek - 1 < 1
			currentWeek = 52
			currentYear--
		else
			currentWeek--
		buildWeek()
		getRecipesForCurrentWeek()

	$scope.removeRecipe = (recipe, day) ->
		day.mealInProgress = recipe.meal

		deleteURL = "/api/calendar/#{encodeURIComponent(formatDateString(day.date))}/#{recipe.meal}/#{recipe.id}"
		$http.delete(deleteURL).success((data, status, headers, config) ->
			if data.message is 'error'
				$scope.$root.setStatusMessage('Виникла помилка. Спробуйте видалити рецепт іще раз.', 'error')
			else
				day[recipe.meal].splice(day[recipe.meal].indexOf(recipe), 1)
				$scope.$root.setStatusMessage('Рецепт успішно видалено', 'success')

			day.mealInProgress = ''
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

	getRecipesForCurrentWeek = () ->
		$http.get('/api/calendar/' + encodeURIComponent(formatDateString($scope.weeklyMenu[0].date))).success((data) ->
			#pack recipes according to day of week
			data.forEach((dataDay) ->
				date = formatDateString(new Date(dataDay.date))
				dayOfWeek = getDayByDate(date)

				if dayOfWeek
					recipe = dataDay.recipe
					dayOfWeek[dataDay.meal].push(new Recipe(recipe.id, recipe.name, recipe.description, dataDay.meal, recipe.ingredients))
			)
		)

	init = () ->
		buildWeek()

		getRecipesForCurrentWeek()

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
					day.mealInProgress = mealName

					$http.post('/api/calendar', {
						date: "#{date.getFullYear()}/#{date.getMonth() + 1}/#{date.getDate()}"
						recipeId: draggableId
						meal: mealName
					}).success((data) ->
						recipe = $recipeService.getById(draggableId)
						day[mealName].push(recipe) if recipe

						day.mealInProgress = ''
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
