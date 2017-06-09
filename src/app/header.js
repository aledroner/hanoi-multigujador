angular
	.module('hanoi.header', [])
	.component('hanoiHeader', {
		templateUrl: 'app/header.html',
		controller: function($stateParams, toastr) {
			// Constantes
			const VM = this;
			const MSG_ERROR = 'Ha ocurrido un error escandaloso.';

			/**
			 * Cuando se crea el controlador
			 */
			VM.$onInit = function() {
				VM.stateParams = $stateParams;
				VM.userLogged = {
					profile: {
						picture: 'app/img/user.png'
					}
				}
			};

			/**
			 * Cierra sesión
			 */
			VM.signOut = function() {
				firebase.auth().signOut()
					.then(function() {
						go(null);
						localStorage.setItem('userId', '');
						toastr.info(MSG_SIGNOUT);
					}).catch(function(err) {
						toastr.success(MSG_ERROR)
					});
			}



			/**
			 * Te lleva a una partida
			 * @param  {String} gameId Id aleatoria del juego
			 */
			function go(gameId) {
				$state.go($state.current, {
					game: gameId
				});
			}

		}
	});
