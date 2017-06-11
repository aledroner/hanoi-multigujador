angular
	.module('app')
	.config(routesConfig);

/** @ngInject */
function routesConfig($stateProvider, $urlRouterProvider, $locationProvider) {
	$locationProvider.html5Mode(true).hashPrefix('!');
	$urlRouterProvider.when('/', '/home');
	$urlRouterProvider.otherwise('/');

	$stateProvider
		.state('app', {
			url: '/',
			component: 'app'
		})
		.state('app.rules', {
			url: 'rules',
			template: '<hanoi-rules></hanoi-rules>'
		})
		.state('app.about', {
			url: 'about',
			template: '<hanoi-about></hanoi-about>'
		})
		.state('app.login', {
			url: 'login',
			template: '<hanoi-login></hanoi-login>'
		})
		.state('app.home', {
			url: 'home',
			template: '<hanoi-home></hanoi-home>'
		})
		.state('app.game', {
			url: ':gameId',
			template: '<hanoi-game></hanoi-game>'
		});
}
