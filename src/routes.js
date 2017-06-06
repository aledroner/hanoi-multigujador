angular
	.module('app')
	.config(routesConfig);

/** @ngInject */
function routesConfig($stateProvider, $urlRouterProvider, $locationProvider) {
	$locationProvider.html5Mode(true).hashPrefix('!');
	$urlRouterProvider.otherwise('/');

	$stateProvider
		.state('app', {
			url: '/',
			component: 'app',
			params: {
				game: null,
				log: false,
				player1: null,
				player2: null,
			}
		});
}
