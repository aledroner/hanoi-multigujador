angular
	.module('hanoi.login', [])
	.component('hanoiLogin', {
		templateUrl: 'app/login.html',
		controller: function(hanoi, toastr, $state) {

			// Constantes
			const VM = this;

			// Evento que lee si hay un usuario logueado
			firebase.auth().onAuthStateChanged(function(user) {
				if (user) {
					$state.go('app.home');
				}
			});

			/**
			 * Inicia sesión
			 * @param  {String} social Red social con la que inicias sesión
			 */
			VM.signIn = function(social) {
				var provider;
				if (social === 't') provider = new firebase.auth.TwitterAuthProvider();
				if (social === 'g') provider = new firebase.auth.GoogleAuthProvider();
				firebase.auth().signInWithPopup(provider)
					.then(function(result) {
						hanoi.createNewUser(result, social);
					})
					.catch(function(error) {
						console.log(error.message);
						toastr.error(hanoi.message.error);
					});
			}
		}
	});
