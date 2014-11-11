app.service 'ingredientsService', ['$rootScope', 'unitsService', ($rootScope, $unitsService) ->
	ingredients = []

	loadFromLocalStorage = ->
		data = localStorage.getItem('ingredients')

		if data
			ingredients = JSON.parse(data).map (ingredient) ->
				new Ingredient(ingredient.id, ingredient.name, $unitsService.getById(ingredient.unit))

	getCompactIngredients = ->
		JSON.stringify ingredients.map (ing) ->
			{
				id: ing.id
				name: ing.name
				unit: ing.unit.id
			}

	getById = (id) ->
		for ingredient in ingredients
			return ingredient if ingredient.id == id

		return null

	add = (ingredient) ->
		ingredient.id = if ingredients.length > 0 then ingredients[ingredients.length - 1]?.id + 1 else 1
		ingredients.push(ingredient)
		localStorage.setItem('ingredients', getCompactIngredients())

	save = (ingredient) ->
		if ingredient.id is 0
			@add new Ingredient(0, ingredient.name, ingredient.unit)
			$rootScope.setStatusMessage('Інгредієнт успішно збережено.', 'success')
		else
			temp = @getById(ingredient.id)
			temp.name = ingredient.name
			localStorage.setItem('ingredients', getCompactIngredients())

	remove = (ingredient, recipes) ->
		index = ingredients.indexOf(ingredient)
		recipeNames = ''

		for recipe in recipes
			for ing in recipe.ingredients when ing.parent is ingredient
				recipeNames += "\n \"#{recipe.name}\""

		if index > -1 and recipeNames.length is 0
			ingredients.splice(index, 1)
			localStorage.setItem('ingredients', getCompactIngredients())
		else if recipeNames.length > 0
			$rootScope.setStatusMessage("Неможливо видалити інгридієнт \"#{ingredient.name}\". Він використовується у наступних рецептах: \n#{ recipeNames }", 'error')
		else
			$rootScope.setStatusMessage("Інгридієнту з id: #{ingredient.id} - не існує.", 'error')
	loadFromLocalStorage()

	{
		getById: getById
		items: ingredients
		add: add
		save: save
		remove: remove
	}
]