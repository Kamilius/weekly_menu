app.controller 'TopNavCtrl', ['$scope', '$http', '$location', ($scope, $http, $location) ->
  $scope.signOut = () ->
    $http.get('/api/signout')
      .success((data) ->
        if data.message is 'success'
          $scope.$root.userAuthenticated = false
          $location.path('/login')
      )
      .error(() ->
        $scope.$root.setStatusMessage('Виникла помилка підчас з\'єднаня з сервером. \n Спробуйте іще раз.')
      )
]
