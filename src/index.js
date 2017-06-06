angular
	.module('app', [
		'ui.router',
		'firebase',
		'toastr',
		'hanoi.main'
	])
	.config(function(toastrConfig) { // Configura los toastr
		angular.extend(toastrConfig, {
			closeButton: true,
			extendedTimeOut: 2000,
			tapToDismiss: true,
			positionClass: 'toast-top-left',
			preventOpenDuplicates: true
		});
	});
