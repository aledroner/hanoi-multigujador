angular
	.module('hanoi.main', [])
	.component('app', {
		templateUrl: 'app/main.html',
		controller: function($stateParams, $state, $timeout, toastr) {
			const vm = this;

			// Variable que controla los stateParams
			$timeout(function() {
				vm.stateParams = $stateParams;
			});

			/**
			 * Inicia sesión con google
			 */
			vm.signIn = function(social) {
				var provider;
				if (social === 't') provider = new firebase.auth.TwitterAuthProvider();
				if (social === 'g') provider = new firebase.auth.GoogleAuthProvider();
				firebase.auth().signInWithPopup(provider)
					.then(function(result) {
						var user = createUser(social, result);
						setUser(result.user.uid, user);
						toastr.success('¡Bienvenido ' + user.profile.name + '!');
					})
					.catch(function(error) {
						toastr.error(error.message);
					});
			}

			/**
			 * Cierra sesión
			 */
			vm.signOut = function() {
				firebase.auth().signOut()
					.then(function() {
						go(null);
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
				if (vm.currentUserId != null) {
					var gameId = randomId();
					setGame(vm.currentUserId, gameId);
					go(gameId);
					setPlayers(gameId);
					toastr.success('Partida creada. Espera a tu oponente');
				} else {
					toastr.error('Ha ocurrido un error');
				}
			}

			/**
			 * Crea una partida nueva multijugador
			 * @return {[type]} [description]
			 */
			vm.unirsePartida = function(gameId) {
				vm.currentUserId = firebase.auth().currentUser.uid;
				if (vm.currentUserId != null) {
					joinGame(vm.currentUserId, gameId);
					go(gameId);
					setPlayers(gameId);
					toastr.success('Te has unido a la partida');
				} else {
					toastr.error('Ha ocurrido un error');
				}
			}

			/**
			 * Actualiza el array de partidas online
			 * @param  {[type]} data [description]
			 * @return {[type]}      [description]
			 */
			getRef('games-online').on('value', function(data) {
				$timeout(function() {
					vm.gamesOnline = $.map(data.val(), function(value, index) {
						return [value];
					});
				});
			});

			// Evento cuando hay un cambio en la autenticación
			firebase.auth().onAuthStateChanged(function(user) {
				if (user) {
					$stateParams.log = true;
					setUserLogged(user.uid);
				} else {
					$stateParams.log = false;
					$stateParams.game = null;
					$stateParams.player1 = null;
					$stateParams.player2 = null;
				}
			});

			/**
			 * Te lleva a una partida
			 * @param  {[type]} game [description]
			 * @return {[type]}      [description]
			 */
			function go(game) {
				$state.go($state.current, {
					game: game
				});
			}

			/**
			 * Muestra la foto de perfil del usuario logueado en el header
			 * @param {[type]} uid [description]
			 */
			function setUserLogged(uid) {
				$timeout(function() {
					getRef('users/' + uid).on('value', function(snap) {
						vm.userLogged = snap.val();
						getId('log-player1-picture').src = vm.userLogged.profile.picture;
					});
				});
			};

			/**
			 * Muestra la info de cada jugador en el modo game
			 * @param {[type]} gameId [description]
			 */
			function setPlayers(gameId) {
				$timeout(function() {
					getRef('games-online/' + gameId).on('value', function(snap) {
						var game = snap.val();
						inner('player1-name', game.player1.profile.name);
						getId('player1-picture').src = game.player1.profile.picture;
						inner('player2-name', game.player2.profile.name);
						getId('player2-picture').src = game.player2.profile.picture;

						if (game.player1.profile.uid === vm.userLogged.profile.uid) {
							console.log('player 1 -> ', game.player1.profile.uid);
							toggle('player1-controlls', 'block')
							toggle('player2-controlls', 'none')
						} else {
							console.log('player 2 -> ', game.player2.profile.uid);
							toggle('player1-controlls', 'none')
							toggle('player2-controlls', 'block')
						}
					});
				});
			};
		}
	});
