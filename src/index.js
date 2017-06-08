angular
	.module('app', [
		'ui.router',
		'ui.bootstrap',
		'firebase',
		'toastr',
		'hanoi.main',
		'hanoi.footer'
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
