app.controller 'AccountCtrl', ['$scope', '$http', ($scope, $http) ->
  $scope.user =
    username: ''
    password: ''
    passwordCheck: ''
    email: ''

  $scope.signIn = () ->
    if $scope.user.username and $scope.user.password
      $http.post('/api/login', { username: $scope.user.username, password: $scope.user.password })
        .success((data) ->
          if data.message is 'success'
            $scope.$root.userAuthenticated = true
          else
            $scope.$root.setStatusMessage(data.message, 'error')
        )
]
