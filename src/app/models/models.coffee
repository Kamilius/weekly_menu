class Unit
	constructor: (@id = 0, @name = '') ->

class Ingredient
	constructor: (@id = 0, @name = '', @unit) ->

class Recipe
	constructor: (@id = 0, @name = '', @ingredients = []) ->

class Day
	recipes: []
	constructor: (@id = 0, @name = 'monday') ->

class Week
	days: []
	constructor: (@id = 0, @week = 1, @year = 1970) ->

class IngredientAmount
	constructor: (@ingredient = {}, @amount = '') ->





class DayOfWeek
	constructor: (@name, @recipes, @date) ->
	today: ->
		@date.toLocaleDateString() is new Date().toLocaleDateString()

class WeekSummary
	constructor: (@week, @year, @recipes = []) ->
		temp = {}
		for recipe in recipes
			if not temp[recipe.name]
				temp[recipe.name] =
					id: recipe.id
					name: recipe.name
					ingredients: recipe.ingredients.map (ing) ->
						new RecipeIngredient(ing.parent.name, ing.amount, ing.units)
			else
				for tempIng in temp[recipe.name].ingredients
					for ing in recipe.ingredients
						if tempIng.units is ing.units
							tempIng.amount = +tempIng.amount + +ing.amount

		@recipes = []
		for key of temp
			@recipes.push(temp[key]) if temp.hasOwnProperty(key)
