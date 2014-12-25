'use strict';
var passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    bCrypt = require('bcrypt-nodejs'),
    db = require('../database/database');

var isValidPassword = function(user, password) {
  return bCrypt.compareSync(password, user.password);
};

var createHash = function(password) {
  return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
};

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  db.User.find(id)
  .success(function(user) {
    done(null, user);
  })
  .error(function(msg) {
    done(msg, null)
  });
});

passport.use('login', new LocalStrategy({
    passReqToCallback: true
  },

  function(req, username, password, done) {
    db.User.find({ where: { name: username }}).success(function(user) {
      if(!user) {
        console.log('User Not Found with username ' + username);
        return done(null, false, 'invalid username');
      }
      if(!isValidPassword(user, password)) {
        console.log('Invalid password');
        return done(null, false, 'invalid password');
      }

      return done(null, user);
    }).error(function(msg) {
      return done(msg);
    });
  })
);

passport.use('signup', new LocalStrategy({
    passReqToCallback: true
  },
  function(req, username, password, done) {
    var findOrCreateUser = function() {
      db.User.findOrCreate({ where: { name: username, email: req.body.email } })
      .success(function(user, created) {
        if(!created) {
          console.log('User already exists');
          return done(null, false, 'User already exists');
        } else {
          user.name = username;
          user.password = createHash(password);
          user.email = req.body.email;

          user.save()
          .success(function() {
            console.log('User Registration successful');
            return done(null, user);
          })
          .error(function(msg) {
            console.log('Error in Saving user: ' + msg);
            throw msg;
            return done(msg);
          });
        }
      })
      .error(function(msg) {
        console.log('Error in SignUp: ' + msg);
        return done(msg);
      });
    }

    process.nextTick(findOrCreateUser);
  }
));

exports.isAuthenticated = function (req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.json({ message: 'Ви не авторизовані.' });
};

exports.login = function(req, res, next) {
  passport.authenticate('login', function(err, user, info) {
    if (err) { return next(err); }
    if (!user) { return res.json({ message: "Невірні ім'я користувача, або пароль" }); }
    req.logIn(user, function(err) {
      if (err) { return next(err); }
      return res.json({ message: 'success' });
    });
  })(req, res, next);
};

exports.signup = function(req, res) {
  res.json({ message: 'success' });
};

exports.signout = function(req, res) {
  req.logout();
  res.json({ message: 'success' });
};
