angular
	.module('hanoi.main', [])
	.component('app', {
		templateUrl: 'app/main.html',
		controller: function(toastr) {
			const vm = this;

			/**
			 * Inicia sesión anónimamente
			 */
			vm.signIn = function() {
				firebase.auth().signInAnonymously()
					.then(function() {
						toastr.success('¡Bienbenido a Torres de Hanoi!')
					})
					.catch(function(error) {
						toastr.success('Ha ocurrido un error')
					});
			}

			/**
			 * Cierra sesión
			 */
			vm.signOut = function() {
				firebase.auth().signOut()
					.then(function() {
						toastr.info('¡Hasta pronto!');
					}).catch(function(err) {
						toastr.success('Ha ocurrido un error')
					});
			}

		}
	});
