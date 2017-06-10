angular
	.module('hanoi.game', ['hanoi.canvas'])
	.component('hanoiGame', {
		templateUrl: 'app/game.html',
		controller: function(hanoi, $state, $stateParams, $timeout) {

			// Constantes
			const VM = this;
			const REF_USERS = getRef('users');
			const REF_GAMES = getRef('games');

			VM.player1 = VM.player2 = {
				name: 'Esperando...',
				picture: 'app/img/user.png'
			}

			// Si la partida no existe vuelve al home
			REF_GAMES.on('value', function(snap) {
				if (!snap.hasChild($stateParams.gameId)) {
					$state.go('app');
				}
			});

			// Setea quién es el jugador 1 y el jugador 2
			REF_GAMES.child($stateParams.gameId).on('value', function(snap) {
				if ($stateParams.gameId != null) {
					$timeout(function() {
						var game = snap.val();
						if (game.player1.uid === firebase.auth().currentUser.uid) {
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
	});
