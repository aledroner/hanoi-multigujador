angular
	.module('hanoi.home', [])
	.component('hanoiHome', {
		templateUrl: 'app/home.html',
		controller: function(hanoi, toastr, $state, $stateParams, $timeout, $uibModal) {

			// Constantes
			const VM = this;
			const REF_USERS = hanoi.ref.users;
			const REF_GAMES = hanoi.ref.games;

			// Usuario logueado
			VM.userLogged = {
				profile: {
					picture: 'app/img/user.png'
				}
			}

			// Evento que actualiza el array de partidas online
			hanoi.ref.games.on('value', function(snap) {
				$timeout(function() {
					VM.gamesOnline = $.map(snap.val(), function(value, index) {
						return [value];
					});
				});
			});

			// Evento cuando hay un cambio en la autenticación
			firebase.auth().onAuthStateChanged(function(user) {
				if (user) {
					REF_USERS.child(user.uid).on('value', function(snap) {
						VM.userLogged = snap.val();
					});
				}
			});

			/**
			 * Crea o se une a una partida nueva multijugador
			 * @param  {String} gameId Id aleatoria del juego
			 * @param  {String} mode   Modo de entrar ['Crear' | 'Unir' | 'Ver']
			 */
			VM.crearPartida = function(gameId, mode) {
				if (mode == 'crear') {
					hanoi.createGame(gameId, mode);
				} else if (mode == 'unir') {
					hanoi.joinGame(gameId, mode);
				} else if (mode == 'ver') {
					$state.go('app.game', {
						'gameId': gameId
					});
				}
			}

			/**
			 * Borra una partida
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
				toastr.info(hanoi.message.game_deleted);
			}

			/**
			 * Genera un id aleatorio para un juego nuevo
			 * @return {String} Cadena alfanumérica aleatorioa
			 */
			VM.generarIdGame = function() {
				return randomId();
			}

			/**
			 * Muestra una ventana modal para borrar una partida
			 * @param  {String} gameId    Id aleatoria del juego
			 * @param  {String} player1Id Id aleatoria del jugador 1
			 * @param  {String} player2Id Id aleatoria del jugador 2
			 */
			VM.modal = function(gameId, player1Id, player2Id) {
				var modalInstance = $uibModal.open({
					animation: false,
					component: 'modalComponent',
					resolve: {
						gameId: function() {
							return gameId;
						},
						player1Id: function() {
							return player1Id;
						},
						player2Id: function() {
							return player2Id;
						}
					}
				});

				modalInstance.result.then(function(resolve) {
					VM.borrarPartida(resolve.gameId, resolve.player1Id, resolve.player2Id);
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
			VM.borrar = function() {
				VM.close({
					$value: {
						gameId: VM.resolve.gameId,
						player1Id: VM.resolve.player1Id,
						player2Id: VM.resolve.player2Id
					}
				});
			};
			VM.cancel = function() {
				VM.dismiss({
					$value: 'cancel'
				});
			};
		}
	});
