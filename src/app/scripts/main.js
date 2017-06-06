angular
	.module('hanoi.main', [])
	.component('app', {
		templateUrl: 'app/main.html',
		controller: function($stateParams, $state, $timeout, toastr) {
			const vm = this;

			// Variable que controla los stateParams
			$timeout(function() {
				vm.stateParams = $stateParams;
				setPlayers(vm.stateParams.player1, vm.stateParams.player2);
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
					setPlayers(vm.currentUserId, null);
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
					getRef('games-online/' + gameId + '/player2')
						.on('value', function(snap) {
							var player2 = snap.val();
							setPlayers(vm.currentUserId, player2.profile.uid);
						});
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
					$stateParams.log = true
				} else {
					$stateParams.log = false
					$stateParams.game = null
					$stateParams.player1 = null
					$stateParams.player2 = null
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
			 * Setea los parámetros de jugadores en el juego
			 * @param {[type]} player1Id [description]
			 * @param {[type]} player2Id [description]
			 */
			function setPlayers(player1Id, player2Id) {
				$stateParams.player1 = player1Id;
				$stateParams.player2 = player2Id;
				if (player1Id) {
					refresh('player1', player1Id);
				}
				if (player2Id) {
					refresh('player2', player2Id);
				}
			}
		}
	});
