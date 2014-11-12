app.service 'recipeService', ['$rootScope', 'ingredientsService', ($rootScope, $ingredientsService) ->
	recipes = []

	loadFromLocalStorage = ->
		data = localStorage.getItem('recipes')

		if data
			recipes = JSON.parse(data).map (recipe) ->
				new Recipe(recipe.id, recipe.name, recipe.ingredients.map((ing) ->
					new IngredientAmount($ingredientsService.getById(ing.id), parseFloat(ing.amount))
				))

	getById = (id) ->
		for recipe in recipes
			return recipe if recipe.id == id

		return null

	getCompactRecipes = ->
		temp = []
		for recipe in recipes
			temp.push(
				id: recipe.id
				name: recipe.name
				ingredients: recipe.ingredients.map (ing) ->
					return {
						id: ing.ingredient.id
						amount: ing.amount
					}
			)

		return temp

	add = (recipe) ->
		recipe.id = if recipes.length > 0 then recipes[recipes.length - 1]?.id + 1 else 1
		recipes.push(recipe)
		$rootScope.saveToLocalStorage('recipes', getCompactRecipes())

	save = (recipe) ->
		if recipe.id is 0
			@add new Recipe(0, recipe.name, recipe.ingredients)
			$rootScope.setStatusMessage('Рецепт успішно збережено.', 'success')
		else
			temp = @getById(recipe.id)
			temp.name = recipe.name
			temp.ingredients = [].concat(recipe.ingredients)
			$rootScope.saveToLocalStorage('recipes', getCompactRecipes())

	remove = (recipe) ->
		index = recipes.indexOf(recipe)

		if index > -1
			recipes.splice(index, 1)

		$rootScope.saveToLocalStorage('recipes', getCompactRecipes())

	loadFromLocalStorage()

	return {
		recipes: recipes
		getById: getById
		add: add
		save: save
		remove: remove
	}
]
