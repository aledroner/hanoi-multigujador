angular
	.module('hanoi.main', [])
	.component('app', {
		templateUrl: 'app/main.html',
		controller: function($stateParams, $state, $timeout, toastr) {
			const vm = this;
			const refUsers = getRef('users');
			const refGames = getRef('games');
			vm.userLogged = {
				profile: {
					picture: 'app/img/user.png'
				}
			}

			// Variable que controla los stateParams
			$timeout(function() {
				vm.stateParams = $stateParams;

			});

			// Actualiza el array de partidas online
			refGames.on('value', function(snap) {
				$timeout(function() {
					vm.gamesOnline = $.map(snap.val(), function(value, index) {
						return [value];
					});
				});
			});

			// Inicia sesión
			vm.signIn = function(social) {
				var provider;
				if (social === 't') provider = new firebase.auth.TwitterAuthProvider();
				if (social === 'g') provider = new firebase.auth.GoogleAuthProvider();
				firebase.auth().signInWithPopup(provider)
					.then(function(result) {
						var user = createUser(social, result);
						createChild('users', result.user.uid, user);
						setLocal('userId', result.user.uid);
						toastr.success('¡Bienvenido ' + user.profile.name + '!');
					})
					.catch(function(error) {
						toastr.error(error.message);
					});
			}

			// Cierra sesión
			vm.signOut = function() {
				firebase.auth().signOut()
					.then(function() {
						go(null);
						setLocal('userId', '');
						toastr.info('¡Hasta pronto!');
					}).catch(function(err) {
						toastr.success('Ha ocurrido un error')
					});
			}

			// Crea o se une a una partida nueva multijugador
			vm.crearPartida = function(gameId, mode) {
				var userId = getLocal('userId');
				if (mode == 'crear') {
					refUsers.child(userId).once('value', function(snap) {
						var user = snap.val();
						if (user.activeGame) {
							toastr.info('Ya tienes una partida creada. No puedes crear más de una.');
						} else {
							go(gameId);
							updateField('users', userId, 'activeGame', true);
							setGame(userId, gameId, mode);
							toastr.success('Partida creada. Espera a tu oponente');
						}
					});
				} else if (mode == 'unir') {
					refGames.child(gameId).once('value', function(snap) {
						var game = snap.val();
						if (game.player1.uid == userId) {
							go(gameId);
						} else {
							go(gameId);
							updateField('users', userId, 'activeGame', true);
							setGame(userId, gameId, mode);
							toastr.success('Te has unido a la partida');
						}
					})
				} else if (mode == 'ver') {
					go(gameId);
				}
			}

			// Crea o se une a una partida nueva multijugador
			vm.borrarPartida = function(gameId) {
				updateField('users', getLocal('userId'), 'activeGame', false);
				deleteChild('games', gameId);
				toastr.info('Has borrado la partida');
			}

			// Evento cuando hay un cambio en la autenticación
			firebase.auth().onAuthStateChanged(function(user) {
				if (user) {
					$stateParams.log = true;
					refUsers.child(getLocal('userId')).on('value', function(snap) {
						vm.userLogged = snap.val();
					})
				} else {
					$stateParams.log = false;
					$stateParams.game = null;
				}
			});

			// Setea quién es el jugador uno y el jugador dos
			if ($stateParams.game != null) {
				refGames.child($stateParams.game).once('value', function(snap) {
					$timeout(function() {
						var game = snap.val();
						var userId = getLocal('userId');
						if (game.player1.uid === userId) {
							vm.player1 = snap.val().player1;
							vm.player2 = snap.val().player2;
						} else {
							vm.player1 = snap.val().player2;
							vm.player2 = snap.val().player1;
						}
					});
				});
			}

			// Te lleva a una partida
			function go(gameId) {
				$state.go($state.current, {
					game: gameId
				});
			}

			// Genera un id aleatorio para un juego nuevo
			vm.generarIdGame = function() {
				return randomId();
			}
		}
	});
