angular
	.module('app')
	.config(routesConfig);

/** @ngInject */
function routesConfig($stateProvider, $urlRouterProvider, $locationProvider) {
	$locationProvider.html5Mode(true).hashPrefix('!');
	$urlRouterProvider.when('/', '/login');
	$urlRouterProvider.otherwise('/');

	$stateProvider
		.state('app', {
			url: '/',
			component: 'app'
		})
		.state('app.login', {
			url: 'login',
			template: '<hanoi-login></hanoi-login>',
			controller: function($log) {
				$log.log('');
			}
		})
		.state('app.home', {
			url: 'home',
			template: '<hanoi-home></hanoi-home>',
			controller: function($log) {
				$log.log('');
			}
		})
		.state('app.game', {
			url: 'game/:gameId',
			template: '<hanoi-game></hanoi-game>',
			controller: function($log, $stateParams) {
				$log.log('');
			}
		});
}
