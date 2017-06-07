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
				if (mode != 'ver') {
					var userId = getLocal('userId');
					go(gameId);
					setGame(userId, gameId, mode);
					setLocal('gameActive', gameId);
					updateField('users', userId, 'activeGame', gameId);
					if (mode == 'crear') {
						toastr.success('Partida creada. Espera a tu oponente');
					} else {
						toastr.success('Te has unido a la partida');
					}
				} else {
					go(gameId);
				}
			}

			// Evento cuando hay un cambio en la autenticación
			firebase.auth().onAuthStateChanged(function(user) {
				if (user) {
					$stateParams.log = true;
					refUsers.child(getLocal('userId')).on('value', function(snap) {
						vm.userLogged = snap.val();
					})
					if ($stateParams.game == null) {
						updateField('users', user.uid, 'activeGame', null);
					}
				} else {
					$stateParams.log = false;
					$stateParams.game = null;
				}
			});

			if ($stateParams.game != null) {
				console.log('hola');
				refGames.child($stateParams.game).on('value', function(snap) {
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
