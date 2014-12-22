app.controller 'TopNavCtrl', ['$scope', '$http', ($scope, $http) ->
  $scope.signOut = () ->
    $http.get('/api/signout')
      .success((data) ->
        if data.message is 'success'
          $scope.$root.userAuthenticated = false
      )
      .error(() ->
        $scope.$root.setStatusMessage('Виникла помилка підчас з\'єднаня з сервером. \n Спробуйте іще раз.')
      )
]
