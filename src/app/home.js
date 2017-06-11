angular
	.module('hanoi.home', ['modal.levelGame', 'modal.deleteGame'])
	.component('hanoiHome', {
		templateUrl: 'app/home.html',
		controller: function(hanoi, toastr, $state, $stateParams, $timeout, $uibModal, $filter) {

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

			// variable que lee el input de búsqueda
			VM.busqueda = '';

			/**
			 * Actualiza el array cada vez que se busca algo para filtrarlo
			 */
			VM.actualizarArray = function() {
				VM.gamesOnlineFiltrado = VM.gamesOnline;
				for (var i = 0; i < VM.busqueda.length; i++)
					VM.gamesOnlineFiltrado = $filter('filter')(VM.gamesOnlineFiltrado, VM.busqueda[i]);
			}

			// Evento que actualiza el array de partidas online
			hanoi.ref.games.on('value', function(snap) {
				$timeout(function() {
					VM.gamesOnlineFiltrado = VM.gamesOnline = $.map(snap.val(), function(value, index) {
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
			VM.crearPartida = function(game) {
				var uid = VM.userLogged.profile.uid;
				if (game == null) {
					REF_USERS.child(uid).once('value', function(snap) {
						var user = snap.val();
						if (user.activeGame) {
							toastr.info(hanoi.message.game_actived);
						} else {
							VM.modalLevelGame();
						}
					});
				} else {
					REF_USERS.child(uid).once('value', function(snap) {
						var user = snap.val();
						if (game.player1.uid == uid || game.player2.uid == uid) {
							$state.go('app.game', {
								'gameId': game.id
							});
						} else {
							if (user.activeGame) {
								toastr.info(hanoi.message.game_actived);
							} else {
								hanoi.joinGame(game, user);
							}
						}
					});
				}
			}

			/**
			 * Muestra una ventana modal para elegir el nivel de la partida
			 */
			VM.modalLevelGame = function() {
				var modalInstance = $uibModal.open({
					animation: false,
					component: 'modalLevelGame',
					resolve: {
						level: function() {
							return 1;
						}
					}
				});
				modalInstance.result.then(function(level) {
					hanoi.createGame(randomId(), level);
				}, function() {
					console.log('modal-component dismissed at: ' + new Date());
				});
			};

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
			 * Muestra una ventana modal para borrar una partida
			 * @param  {String} gameId    Id aleatoria del juego
			 * @param  {String} player1Id Id aleatoria del jugador 1
			 * @param  {String} player2Id Id aleatoria del jugador 2
			 */
			VM.modalDeleteGame = function(gameId, player1Id, player2Id) {
				var modalInstance = $uibModal.open({
					animation: false,
					component: 'modalDeleteGame',
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
	});
