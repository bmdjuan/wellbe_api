module.exports = function(WbUser) {
//Relations : http://docs.strongloop.com/display/public/LB/Tutorial%3A+model+relations

  // Setup validations
  WbUser.validatesPresenceOf('guid','name', 'email','language','password');
  WbUser.validatesLengthOf('password', {min: 5, message: {min: 'Password is too short'}});
  WbUser.validatesUniquenessOf('email', {message: 'email is not unique'});

  var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  WbUser.validatesFormatOf('email', {with: re, message: 'Must provide a valid email'});
  if (!(WbUser.settings.realmRequired || UserModel.settings.realmDelimiter)) {
    WbUser.validatesUniquenessOf('email', {message: 'Email already exists'});
    WbUser.validatesUniquenessOf('guid', {message: 'User already exists'});
  }

  user.isValid(function (valid) {
    if (!valid) {
      user.errors // hash of errors {attr: [errmessage, errmessage, ...], attr: ...}
    }
  })

};
