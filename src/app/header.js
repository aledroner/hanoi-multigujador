angular
	.module('hanoi.header', [])
	.component('hanoiHeader', {
		templateUrl: 'app/header.html',
		controller: function(hanoi, toastr, $state, $timeout) {
			// Constantes
			const VM = this;
			const MSG_ERROR = 'Ha ocurrido un error escandaloso.';

			// Variables
			VM.uid = 'noLogged';
			VM.isLogged = false;
			VM.profilePicture = 'app/img/user.png';

			// Evento que lee si hay un usuario logueado
			firebase.auth().onAuthStateChanged(function(user) {
				if (user) {
					VM.isLogged = true;
					hanoi.ref.users.child(user.uid).on('value', function(snap) {
						VM.profilePicture = snap.val().profile.picture;
					});
				} else {
					$state.go('app.login');
				}
			});

			/**
			 * Cierra sesión
			 */
			VM.signOut = function() {
				firebase.auth().signOut()
					.then(function() {
						VM.isLogged = false;
						toastr.info(hanoi.message.signout);
					}).catch(function(error) {
						console.log(error.message);
						toastr.error(hanoi.message.error);
					});
			}
		}
	});;
