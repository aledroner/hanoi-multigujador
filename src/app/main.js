angular
	.module('hanoi.main', [])
	.component('app', {
		templateUrl: 'app/main.html',
		controller: function(toastr) {
			const vm = this;

			/**
			 * Inicia sesión con google
			 */
			vm.signIn = function() {
				var provider = new firebase.auth.GoogleAuthProvider();
				firebase.auth().signInWithPopup(provider)
					.then(function(result) {
						var profile = result.additionalUserInfo.profile;
						var uid = result.user.uid;
						var user = {
							profile: {
								email: profile.email,
								name: profile.given_name,
								picture: profile.picture,
							}
						};
						createUser(uid, user);
						toastr.success('¡Bienvenido ' + user.name + '!');
					})
					.catch(function(error) {
						toastr.error(error.message);
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
