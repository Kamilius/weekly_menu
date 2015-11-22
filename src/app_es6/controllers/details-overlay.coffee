app.controller 'DetailsOverlayCtrl', ['$scope', ($scope) ->
  $scope.recipeDetails =
    name: ''
    ingredients: []
    description: ''

  $scope.recipeDetailsVisible = false

  $scope.$on 'show-recipe-details', (event, data) ->
    $scope.recipeDetails = data
    $scope.recipeDetailsVisible = true

  $scope.hideRecipeDetails = () ->
    $scope.recipeDetailsVisible = false
]
