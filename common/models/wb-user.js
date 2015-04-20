var config = require('../../server/config.json');
var path = require('path');

module.exports = function(WBUser) {
//Relations : http://docs.strongloop.com/display/public/LB/Tutorial%3A+model+relations
  //console.log(JSON.stringify(WBUser));
  var wb_user = new WBUser();
  // Setup validations
  //send verification email after registration
  WBUser.beforeRemote('create', function(context, user) {
    console.log('> user.beforeRemote triggered');

    var options = {
      type: 'email',
      to: user.email,
      from: 'noreply@loopback.com',
      subject: 'Thanks for registering.',
      template: path.resolve(__dirname, '../../server/views/verify.ejs'),
      redirect: '/verified',
      user: user
    };

    user.isValid(function (valid) {
      if (!valid) {
        WBUser.errors // hash of errors {attr: [errmessage, errmessage, ...], attr: ...}
      }
    });
  });

  WBUser.validatesPresenceOf('guid','name', 'email','language','password');
  WBUser.validatesLengthOf('password', {min: 5, message: {min: 'Password is too short'}});
  WBUser.validatesUniquenessOf('email', {message: 'email is not unique'});

  var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  WBUser.validatesFormatOf('email', {with: re, message: 'Must provide a valid email'});
  if (!(WBUser.settings.realmRequired || WBUser.settings.realmDelimiter)) {
    WBUser.validatesUniquenessOf('email', {message: 'Email already exists'});
    WBUser.validatesUniquenessOf('guid', {message: 'User already exists'});
  }



  //send verification email after registration
  WBUser.afterRemote('create', function(context, user) {
    console.log('> user.afterRemote triggered');

    var options = {
      type: 'email',
      to: user.email,
      from: 'noreply@loopback.com',
      subject: 'Thanks for registering.',
      template: path.resolve(__dirname, '../../server/views/verify.ejs'),
      redirect: '/verified',
      user: user
    };

    // user.verify(options, function(err, response) {
    //  if (err) {
    //    next(err);
    //    return;
    //  }
    //
    //  console.log('> verification email sent:', response);
    //
    //  context.res.render('response', {
    //    title: 'Signed up successfully',
    //    content: 'Please check your email and click on the verification link '
    //    + 'before logging in.',
    //    redirectTo: '/',
    //    redirectToLinkText: 'Log in'
    //  });
    //});
  });

  //send password reset link when requested
  WBUser.on('resetPasswordRequest', function(info) {
    var url = 'http://' + config.host + ':' + config.port + '/reset-password';
    var html = 'Click <a href="' + url + '?access_token=' + info.accessToken.id
      + '">here</a> to reset your password';

    WBUser.app.models.Email.send({
      to: info.email,
      from: info.email,
      subject: 'Password reset',
      html: html
    }, function(err) {
      if (err) return console.log('> error sending password reset email');
      console.log('> sending password reset email to:', info.email);
    });
  });

};
