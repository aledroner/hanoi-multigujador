angular
	.module('hanoi.main', [])
	.component('app', {
		templateUrl: 'app/main.html',
		controller: function(toastr, $timeout) {
			const vm = this;

			/**
			 * Inicia sesión con google
			 */
			vm.signIn = function(social) {
				var provider;
				if (social === 't') provider = new firebase.auth.TwitterAuthProvider();
				if (social === 'g') provider = new firebase.auth.GoogleAuthProvider();
				firebase.auth().signInWithPopup(provider)
					.then(function(result) {
						var user = setUser(social, result);
						createUser(result.user.uid, user);
						toastr.success('¡Bienvenido ' + user.profile.name + '!');
					})
					.catch(function(error) {
						toastr.error(error.message);
					});
				actualizarArray();
			}

			/**
			 * Cierra sesión
			 */
			vm.signOut = function() {
				firebase.auth().signOut()
					.then(function() {
						toastr.info('¡Hasta pronto!');
					}).catch(function(err) {
						toastr.success('Ha ocurrido un error')
					});
			}

			/**
			 * Crea una partida nueva multijugador
			 * @return {[type]} [description]
			 */
			vm.crearPartida = function() {
				vm.currentUserId = firebase.auth().currentUser.uid;
				createGame(vm.currentUserId);
			}

			/**
			 * Actualiza el array de partidas online
			 * @param  {[type]} data [description]
			 * @return {[type]}      [description]
			 */
			getRef('games-online').on('value', function(data) {
				$timeout(function() {
					vm.gamesOnline = data.val();
				});
			});


		}
	});
