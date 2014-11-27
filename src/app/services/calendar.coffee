app.service 'calendarService', ['recipeService', '$rootScope', '$filter', ($recipeService, $rootScope, $filter) ->
	weeklyMenu = []
	dayNames = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
	currentWeek = +$filter('date')(new Date(), 'ww')
	currentYear = new Date().getFullYear()

	# loadFromLocalStorage = () ->
	# 	data = localStorage.getItem("week_#{currentWeek}_#{currentYear}")
	#
	# 	#clear weeklyMenu array if it's not empty
	# 	weeklyMenu.splice(0, weeklyMenu.length) if weeklyMenu.length > 0
	#
	# 	#if there is previously saved data for this week and year
	# 	if data
	# 		#form new week days and init them with previously saved data
	# 		temp = JSON.parse(data)
	# 		temp.forEach (day) ->
	# 			weeklyMenu.push new DayOfWeek(day.name, day.recipes.map((id) ->
	# 					$recipeService.getById(id)
	# 				), new Date(day.date))
	# 	#if no previosly saved data for this week and year
	# 	#build clear week
	# 	else
	# 		buildWeek()

	# getDateOfISOWeek = (week, year) ->
  #   simple = new Date(year, 0, 1 + (week - 1) * 7)
  #   dow = simple.getDay()
  #   ISOweekStart = simple
  #   if dow <= 4
  #     ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1)
  #   else
  #     ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay())
  #   ISOweekStart
	#
	# buildWeek = () ->
	# 	monday = getDateOfISOWeek(currentWeek, currentYear)
	#
	# 	for index in [0..6]
	# 		weeklyMenu.push(new DayOfWeek(dayNames[index], [], new Date(new Date(monday).setDate(monday.getDate() + index))))
	#
	# nextWeek = () ->
	# 	if currentWeek + 1 > 52
	# 		currentWeek = 1
	# 		currentYear++
	# 	else
	# 		currentWeek++
	#
	# 	loadFromLocalStorage()
	#
	# prevWeek = () ->
	# 	if currentWeek - 1 < 1
	# 		currentWeek = 52
	# 		currentYear--
	# 	else
	# 		currentWeek--
	#
	# 	loadFromLocalStorage()

	recipeInDay = (day, recipeId) ->
		for weekDay in weeklyMenu when weekDay.name is day
			for recipe in weekDay.recipes when recipe.id is recipeId
				return true
		return false

	indexOfDay = (dayName) ->
		for day, index in weeklyMenu
			return index if day.name is dayName

		return -1

	getCompactRecipes = ->
		menu = []
		weeklyMenu.forEach (day) ->
			menu.push
				name: day.name
				recipes: day.recipes.map (recipe) ->
					recipe.id
				date: new Date(day.date)

		menu

	addRecipe = (day, recipeId) ->
		weeklyMenu[indexOfDay(day)]?.recipes?.push $recipeService.getById(recipeId)

		localStorage.setItem("week_#{currentWeek}_#{currentYear}", getCompactRecipes())

	removeRecipe = (recipe, day) ->
		dayIndex = weeklyMenu.indexOf(day)
		recipeIndex = weeklyMenu[dayIndex].recipes.indexOf(recipe)
		if recipeIndex > -1
			weeklyMenu[dayIndex].recipes.splice(recipeIndex, 1)
			localStorage.setItem("week_#{currentWeek}_#{currentYear}", getCompactRecipes())

	removeAllRecipeInstances = (recipe) ->
		for day, index in weeklyMenu
			index = day.recipes.indexOf(recipe)
			if index > -1
				day.recipes.splice(index, 1)
		localStorage.setItem("week_#{currentWeek}_#{currentYear}", getCompactRecipes())

	#loadFromLocalStorage()

	{
		weeklyMenu: weeklyMenu
		addRecipe: addRecipe
		removeAllRecipeInstances: removeAllRecipeInstances
		removeRecipe: removeRecipe
		recipeInDay: recipeInDay
	}
]
