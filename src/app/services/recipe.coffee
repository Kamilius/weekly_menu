app.service 'recipeService', ['$rootScope', 'ingredientsService', ($rootScope, $ingredientsService) ->
	# recipes = [
	# 	new Recipe 'Смажена картопля', [{ name: 'картопля' }, { name:'спеції' }], 1
	# 	new Recipe 'Борщ', [{ name:'картопля' }, { name:'буряк' }, { name:'морква' }, { name:'цибуля' }, { name:'куряче філе' }, { name:'спеції' }], 2
	# 	new Recipe 'Смажена ковбаса з кетчупом', [{ name:'ковбаса молочна' }, { name:'кетчуп' }], 3
	# 	new Recipe 'Стейк', [{ name:'м\'ясо' }, { name:'спеції' }], 4
	# 	new Recipe 'Солянка', [{ name:'телятина' }, { name:'ковбаса копчена' }, { name:'шпондер' }, { name:'полядвиця' }, { name:'мисливські ковбаски' }, { name:'картопля' }, { name:'морква' }, { name:'цибуля' }, { name:'томатна паста' }, { name:'спеції' }], 5
	# ]
	recipes = []

	loadFromLocalStorage = ->
		data = localStorage.getItem('recipes')

		if data
			recipes = JSON.parse(data).map (recipe) ->
				new Recipe(recipe.name, recipe.ingredients.map((ing) ->
					new RecipeIngredient($ingredientsService.getById(ing.parent), ing.amount, ing.units)
				), recipe.id)

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
						parent: ing.parent.id
						amount: ing.amount
						units: ing.units
					}
			)

		return temp

	add = (recipe) ->
		recipe.id = if recipes.length > 0 then recipes[recipes.length - 1]?.id + 1 else 1
		recipes.push(recipe)
		$rootScope.saveToLocalStorage('recipes', getCompactRecipes())

	save = (recipe) ->
		if recipe.id is 0
			@add new Recipe(recipe.name, recipe.ingredients)
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