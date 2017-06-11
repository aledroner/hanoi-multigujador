angular
	.module('modal.giveUp', [])
	.component('modalGiveUp', {
		templateUrl: 'app/modals/modalGiveUp.html',
		bindings: {
			resolve: '<',
			close: '&',
			dismiss: '&'
		},
		controller: function() {
			const VM = this;
			VM.rendirse = function() {
				VM.close({
					$value: {
						game: VM.resolve.game
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
