angular
	.module('app')
	.factory('hanoi', function(toastr) {

		// Constantes
		const REF_USERS = getRef('users');
		const REF_GAMES = getRef('games');

		// Mensajes
		const SIGNIN = '¡Saludos! ';
		const SIGNOUT = '¡Hasta pronto figura!';
		const ERROR = 'Ha ocurrido un error escandaloso.';
		const GAME_ACTIVED = 'Ya estás en una partida; no pretendas ser omnipresente.';
		const GAME_CREATED = 'Partida creada. Ve a por un snack mientras esperas a tu oponente.';
		const GAME_JOINED = 'Has retado al malvado ';
		const GAME_DELETED = 'Partida directa al incinerador.';

		return {
			/**
			 * Mensajes que se muestran al usuario
			 * @type {Object}
			 */
			message: {
				signin: SIGNIN,
				signout: SIGNOUT,
				error: ERROR,
				game_actived: GAME_ACTIVED,
				game_created: GAME_CREATED,
				game_joined: GAME_JOINED,
				game_deleted: GAME_DELETED
			},

			createNewUser: function(result, social) {
				var uid = result.user.uid;
				REF_USERS.once('value').then(function(snap) {
					var user = createUser(social, result);
					if (!snap.hasChild(uid)) {
						REF_USERS.child(uid).set(user);
					}
					toastr.success(SIGNIN + user.profile.name);
				});
			}

		}
	})
	.component('app', {
		templateUrl: 'app/main.html',
		controller: function($stateParams, $state, $timeout, $uibModal, toastr) {

			// Constantes
			const VM = this;
			const REF_USERS = getRef('users');
			const REF_GAMES = getRef('games');

			// Evento que actualiza el array de partidas online
			REF_GAMES.on('value', function(snap) {
				$timeout(function() {
					VM.gamesOnline = $.map(snap.val(), function(value, index) {
						return [value];
					});
				});
			});

			/**
			 * Crea o se une a una partida nueva multijugador
			 * @param  {String} gameId Id aleatoria del juego
			 * @param  {String} mode   Modo de entrar ['Crear' | 'Unir' | 'Ver']
			 */
			VM.crearPartida = function(gameId, mode) {
				var userId = localStorage.getItem('userId');
				if (mode == 'crear') {
					REF_USERS.child(userId).once('value', function(snap) {
						var user = snap.val();
						if (user.activeGame) {
							toastr.info(MSG_GAME_ACTIVED);
						} else {
							go(gameId);
							REF_USERS.child(userId).update({
								activeGame: true
							});
							setGame(userId, gameId, mode);
							toastr.success(MSG_GAME_CREATED);
						}
					});
				} else if (mode == 'unir') {
					REF_GAMES.child(gameId).once('value', function(snap) {
						var game = snap.val();
						REF_USERS.child(userId).once('value', function(snap) {
							var user = snap.val();
							if (game.player1.uid == userId || game.player2.uid == userId) {
								go(gameId);
							} else {
								if (user.activeGame) {
									toastr.info(MSG_GAME_ACTIVED);
								} else {
									go(gameId);
									REF_USERS.child(userId).update({
										activeGame: true
									});
									setGame(userId, gameId, mode);
									toastr.success(MSG_GAME_JOINED + game.player1.name);
								}
							}
						});
					});
				} else if (mode == 'ver') {
					go(gameId);
				}
			}

			/**
			 * Se une a una partida ya creada
			 * @param  {String} gameId    Id aleatoria del juego
			 * @param  {String} player1Id Id aleatoria del jugador 1
			 * @param  {String} player2Id Id aleatoria del jugador 2
			 */
			VM.borrarPartida = function(gameId, player1Id, player2Id) {
				if (player1Id) {
					REF_USERS.child(player1Id).update({
						activeGame: false
					});
				}
				if (player2Id) {
					REF_USERS.child(player2Id).update({
						activeGame: false
					});
				}
				REF_GAMES.child(gameId).remove();
				toastr.info(MSG_GAME_DELETED);
			}

			// Evento cuando hay un cambio en la autenticación
			firebase.auth().onAuthStateChanged(function(user) {
				if (user) {
					$stateParams.log = true;
					REF_USERS.child(localStorage.getItem('userId')).on('value', function(snap) {
						VM.userLogged = snap.val();
					})
				} else {
					$stateParams.log = false;
					$stateParams.game = null;
				}
			});

			// Setea quién es el jugador 1 y el jugador 2
			if ($stateParams.game != null) {
				REF_GAMES.child($stateParams.game).on('value', function(snap) {
					if ($stateParams.game != null) {
						$timeout(function() {
							var game = snap.val();
							var userId = localStorage.getItem('userId')
							if (game.player1.uid === userId) {
								VM.player1 = snap.val().player1;
								VM.player2 = snap.val().player2;
							} else {
								VM.player1 = snap.val().player2;
								VM.player2 = snap.val().player1;
							}
						});
					}
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

			/**
			 * Genera un id aleatorio para un juego nuevo
			 * @return {String} Cadena alfanumérica aleatorioa
			 */
			VM.generarIdGame = function() {
				return randomId();
			}

			/**
			 * Ventana modal
			 */
			VM.modal = function(gameId, player1Id, player2Id) {
				var modalInstance = $uibModal.open({
					animation: false,
					component: 'modalComponent',
					resolve: {
						game: function() {
							return gameId;
						}
					}
				});

				modalInstance.result.then(function(gameId, player1Id, player2Id) {
					VM.borrarPartida(gameId, player1Id, player2Id);
				}, function() {
					console.log('modal-component dismissed at: ' + new Date());
				});
			};
		}
	})
	.component('modalComponent', {
		templateUrl: 'app/modal.html',
		bindings: {
			resolve: '<',
			close: '&',
			dismiss: '&'
		},
		controller: function() {
			const VM = this;
			VM.borrar = function(game) {
				VM.close({
					$value: game
				});
			};
			VM.cancel = function() {
				VM.dismiss({
					$value: 'cancel'
				});
			};
		}
	});
