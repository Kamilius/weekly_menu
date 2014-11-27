app.controller 'CalendarCtrl', ['$scope', '$http', '$filter', 'recipeService', 'calendarService', ($scope, $http, $filter, $recipeService, $calendarService) ->
	#private properties
	dayNames = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
	currentWeek = +$filter('date')(new Date(), 'ww')
	currentYear = new Date().getFullYear()
	#scope variables
	$scope.weeklyMenu = []
	$scope.calendarService = $calendarService

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

		for index in [0..6]
			$scope.weeklyMenu.push(new DayOfWeek(dayNames[index], [], new Date(new Date(monday).setDate(monday.getDate() + index))))

	nextWeek = ->
		if currentWeek + 1 > 52
			currentWeek = 1
			currentYear++
		else
			currentWeek++

	prevWeek = ->
		if currentWeek - 1 < 1
			currentWeek = 52
			currentYear--
		else
			currentWeek--

	init = ->
		$http.get('/api/init-calendar/' + encodeURIComponent(new Date().toLocaleDateString()), (data) ->
			console.log(data)
		)
		buildWeek()

	$scope.removeRecipe = (recipe, day) ->
		recipe.processing = true
		$http.delete("/api/calendar/#{dayDate}/#{ingredient.id}").success((data, status, headers, config) ->
			recipe.processing = false

			if data.message is 'error'
				$scope.setStatusMessage('Виникла помилка. Спробуйте видалити рецепт іще раз.', 'error')
			else
				$scope.setStatusMessage('Рецепт успішно видалено', 'success')
		)

	calendar = document.querySelector('.calendar-recipes')

	calendar.addEventListener 'drop', (event) ->
		droppable = event.target
		draggableId = +event.dataTransfer.getData('id')
		dayName = droppable.classList[3]
		if droppable.classList[0] is 'day'
			if not $calendarService.recipeInDay(dayName, draggableId)
				$calendarService.addRecipe(dayName, draggableId)
			else
				$scope.setStatusMessage("Один день не може містити дві страви з однаковим ім'ям.", "error")
			$scope.$apply()
		droppable.classList.remove('over')
		document.querySelector("[data-id=\"#{draggableId}\"]").style.opacity = '1'
	, true

	init()
]
