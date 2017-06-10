angular
	.module('hanoi.about', [])
	.component('hanoiAbout', {
		templateUrl: 'app/about.html'
	})
	.controller('techCtrl', function($http) {
		const vm = this;
		$http
			.get('app/techs.json')
			.then(function(response) {
				vm.techs = response.data;
			});
	});
