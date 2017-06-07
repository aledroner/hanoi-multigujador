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
						var uid = result.user.uid;
						refUsers.child(uid).set(user)
						localStorage.setItem('userId', uid);
						toastr.success('¡Saludos! ' + user.profile.name);
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
						localStorage.setItem('userId', '');
						toastr.info('¡Hasta pronto figura!');
					}).catch(function(err) {
						toastr.success('Ha ocurrido un error escandaloso.')
					});
			}

			// Crea o se une a una partida nueva multijugador
			vm.crearPartida = function(gameId, mode) {
				var userId = localStorage.getItem('userId');
				if (mode == 'crear') {
					refUsers.child(userId).once('value', function(snap) {
						var user = snap.val();
						if (user.activeGame) {
							toastr.info('Ya estás en una partida, no pretendas ser omnipresente.');
						} else {
							go(gameId);
							refUsers.child(userId).update({
								activeGame: true
							});
							setGame(userId, gameId, mode);
							toastr.success('Partida creada. Ve a por un snack mientras esperas a tu oponente.');
						}
					});
				} else if (mode == 'unir') {
					refGames.child(gameId).once('value', function(snap) {
						var game = snap.val();
						// if (user.activeGame) {
						// 	toastr.info('Ya estás en una partida, no pretendas ser omnipresente.');
						go(gameId);
						if (game.player1.uid != userId) {
							refUsers.child(userId).update({
								activeGame: true
							});
							setGame(userId, gameId, mode);
							toastr.success('¿¡Osas retar a ' + game.player1.name + '!?');
						}
					})
				} else if (mode == 'ver') {
					go(gameId);
				}
			}

			// Crea o se une a una partida nueva multijugador
			vm.borrarPartida = function(gameId, player1Id, player2Id) {
				if (player1Id) {
					refUsers.child(player1Id).update({
						activeGame: false
					});
				}
				if (player2Id) {
					refUsers.child(player2Id).update({
						activeGame: false
					});
				}
				refGames.child(gameId).remove();
				toastr.info('Partida directa al incinerador.');
			}

			// Evento cuando hay un cambio en la autenticación
			firebase.auth().onAuthStateChanged(function(user) {
				if (user) {
					$stateParams.log = true;
					refUsers.child(localStorage.getItem('userId')).on('value', function(snap) {
						vm.userLogged = snap.val();
					})
				} else {
					$stateParams.log = false;
					$stateParams.game = null;
				}
			});

			// Setea quién es el jugador uno y el jugador dos
			if ($stateParams.game != null) {
				refGames.child($stateParams.game).on('value', function(snap) {
					$timeout(function() {
						var game = snap.val();
						var userId = localStorage.getItem('userId')
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
