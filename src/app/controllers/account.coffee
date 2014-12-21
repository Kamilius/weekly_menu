app.controller 'AccountCtrl', ['$scope', '$http', '$location', ($scope, $http, $location) ->
  $scope.user =
    username: ''
    password: ''
    passwordCheck: ''
    email: ''

  $scope.signUpFormVisible = false
  $scope.usernameError = false
  $scope.passwordError = false

  $scope.showSignUpForm = () ->
    $scope.signUpFormVisible = true

  $scope.signIn = () ->
    if $scope.user.username and $scope.user.password
      $http.post('/api/login', { username: $scope.user.username, password: $scope.user.password })
        .success((data) ->
          if data.message is 'success'
            $scope.$root.userAuthenticated = true
            $scope.$root.setStatusMessage('Ви успішно увійшли до системи.', 'success')
            $location.path("/")
          else
            $scope.$root.setStatusMessage(data.message, 'error')
        )
    else
      if not $scope.user.username
        $scope.usernameError = true
      if not $scope.user.password
        $scope.passwordError = true

  $scope.signUp = () ->
    if $scope.user.username and $scope.user.password is $scope.user.passwordCheck
      $http.post('/api/signup', { username: $scope.user.username, password: $scope.user.password })
        .success((data) ->
          if data.message is 'success'
            $scope.$root.userAuthenticated = true
            $scope.$root.setStatusMessage('Вас успішно зареєстровано.', 'success')
            $location.path("/")
          else
            $scope.$root.setStatusMessage(data.message, 'error')
        )
    else
      $scope.$root.setStatusMessage('Усі поля є обов\'язковими', 'error')
]
