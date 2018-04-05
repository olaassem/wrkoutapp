function registerNewUser(){
	$('.create-account-btn').on('click', event => {
		event.preventDefault();
		let userData = {
			'email': $('.inputEmail').val(),
			'password': $('.inputPass').val(),
			'name': $('.inputName').val()
		}
		$.ajax({
		    type: "POST",
		    contentType: 'application/json',
		    url: '/user/register',
		    data: JSON.stringify( userData )
	  	})
		.done(function( user ){
			console.log( user );
			$('.input').val("");
		})
		.fail(function( error ){
	    	console.log('Registering user failed!');
	    	$('.input').val("");
	    })
	})
}
registerNewUser();


function loginExistingUser(){
	$('.login-btn').on('click', event => {
		event.preventDefault();
		let userData = {
			'email': $('.inputEmail').val(),
			'password': $('.inputPass').val(),
		}
		$.ajax({
		    type: "POST",
		    contentType: 'application/json',
		    url: '/user/login',
		    data: JSON.stringify( userData )
	  	})
		.done(function( user ){
			console.log( user );
			$('.input').val("");
		})
		.fail(function( error ){
	    	console.log('Cannot log in user!');
	    	$('.input').val("");
	    })
	})
}
loginExistingUser();




//   C L I C K   O N   T A B   F U N C T I O N A L I T Y   //
$('.js-login-form').hide( );
$('.login-tab').css('background', 'none');



$('.login-tab').click( event => {
	event.preventDefault();
    $('.js-register-form').hide();
    $('.js-login-form').show();
    $('.signup-tab').css('background', 'none');
    $('.login-tab').css('background', 'white');
});


$('.signup-tab').click( event => {
	event.preventDefault();
    $('.js-register-form').show();
    $('.js-login-form').hide();
    $('.login-tab').css('background', 'none');
    $('.signup-tab').css('background', 'white');
});