app.controller 'AccountCtrl', ['$scope', '$http', ($scope, $http) ->
  $scope.user =
    username: ''
    password: ''
    passwordCheck: ''
    email: ''

  $scope.signUpFormVisible = false
  $scope.usernameError = false
  $scope.passwordError = false

  $scope.signIn = () ->
    if $scope.user.username and $scope.user.password
      $http.post('/api/login', { username: $scope.user.username, password: $scope.user.password })
        .success((data) ->
          if data.message is 'success'
            $scope.$root.userAuthenticated = true
          else
            $scope.$root.setStatusMessage(data.message, 'error')
        )
    else
      if not $scope.user.username
        $scope.usernameError = true
      if not $scope.user.password
        $scope.passwordError = true
]
