angular
	.module('modal.deleteGame', [])
	.component('modalDeleteGame', {
		templateUrl: 'app/modals/modalDeleteGame.html',
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
