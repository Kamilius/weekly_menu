app.controller 'CalendarCtrl', ['$scope', 'recipeService', '$rootScope', 'calendarService', ($scope, $recipeService, $rootScope, $calendarService) ->
	$scope.weeklyMenu = $calendarService.weeklyMenu
	$scope.calendarService = $calendarService
	$scope.nextWeek = $calendarService.nextWeek
	$scope.prevWeek = $calendarService.prevWeek

	$scope.removeRecipe = (recipe, day) ->
		$calendarService.removeRecipe(recipe, day)

	calendar = document.querySelector('.calendar-recipes')
	
	calendar.addEventListener 'drop', (event) ->
		droppable = event.target
		draggableId = +event.dataTransfer.getData('id')
		dayName = droppable.classList[3]
		if droppable.classList[0] is 'day'
			if not $calendarService.recipeInDay(dayName, draggableId)
				$calendarService.addRecipe(dayName, draggableId)
			else
				$rootScope.setStatusMessage("Один день не може містити дві страви з однаковим ім'ям.", "error")
			$scope.$apply()
		droppable.classList.remove('over')
		document.querySelector("[data-id=\"#{draggableId}\"]").style.opacity = '1'
	, true
]