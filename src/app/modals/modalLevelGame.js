angular
	.module('modal.levelGame', [])
	.component('modalLevelGame', {
		templateUrl: 'app/modals/modalLevelGame.html',
		bindings: {
			resolve: '<',
			close: '&',
			dismiss: '&'
		},
		controller: function() {
			const VM = this;

			VM.levels = [1, 2, 3, 4, 5, 6, 7, 8, 9];
			VM.selected = 1;

			VM.crear = function() {
				VM.close({
					$value: VM.selected
				});
			};
			VM.cancel = function() {
				VM.dismiss({
					$value: 'cancel'
				});
			};
		}
	});
