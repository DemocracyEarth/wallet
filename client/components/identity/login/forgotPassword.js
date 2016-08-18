Template.forgotPassword.rendered = function () {}
// Template.forgotPassword.helpers({})
Template.forgotPassword.events({
  "click #recovery-button": function (event){
    console.log("onClick: recovery-button");
    
    //get recovery email
    var email = document.getElementById('recovery-email').value;
    
    //validate non-empty email & invoke Passwords API
    if (email != '') {
      Accounts.forgotPassword({email: email}, function(err) {
        if (err) {
          if (err.message === 'User not found [403]') {
            console.log('This email does not exist.');
          } else {
            console.log('We are sorry but something went wrong.');
          }
        } else {
          console.log('Email Sent. Check your mailbox.');
        }
      });
    }
  }
})

