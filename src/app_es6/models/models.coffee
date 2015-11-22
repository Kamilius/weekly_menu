class Unit
	constructor: (@id = 0, @name = '') ->

class Ingredient
	unit: new Unit()
	constructor: (@id = 0, @name = '', unit, @amount = '') ->
		if unit
			@unit = new Unit(unit.id, unit.name)

class Recipe
	processing: false
	constructor: (@id = 0, @name = '', @description = '', @meal = '', @ingredients = []) ->

class DayOfWeek
	constructor: (@name, @date) ->
		@breakfast = []
		@lunch = []
		@dinner = []
		@mealInProgress = ''
	today: ->
		formatDateString(@date) is formatDateString(new Date())
	isMealInProgress: (meal) ->
		@mealInProgress is meal

class WeekSummary
	constructor: (@week, @date, @ingredients = []) ->
