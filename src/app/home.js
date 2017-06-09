angular
	.module('hanoi.home', [])
	.component('hanoiHome', {
		templateUrl: 'app/home.html',
		controller: function(hanoi, toastr, $state, $stateParams, $timeout) {

			// Constantes
			const VM = this;
			const REF_USERS = hanoi.ref.users;
			const REF_GAMES = hanoi.ref.games;

			// Evento que actualiza el array de partidas online
			hanoi.ref.games.on('value', function(snap) {
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
				toastr.info(MSG_GAME_DELETED);
			}

			/**
			 * Genera un id aleatorio para un juego nuevo
			 * @return {String} Cadena alfanumérica aleatorioa
			 */
			VM.generarIdGame = function() {
				return randomId();
			}

		}
	});
