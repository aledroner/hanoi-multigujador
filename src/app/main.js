angular
	.module('hanoi.main', [])
	.component('app', {
		templateUrl: 'app/main.html',
		controller: function(toastr) {
			const vm = this;

			/**
			 * Inicia sesión con google
			 */
			vm.signIn = function(social) {
				var provider;
				if (social === 't') provider = new firebase.auth.TwitterAuthProvider();
				if (social === 'g') provider = new firebase.auth.GoogleAuthProvider();
				firebase.auth().signInWithPopup(provider)
					.then(function(result) {
						var user = setUser(social, result);
						createUser(result.user.uid, user);
						toastr.success('¡Bienvenido ' + user.profile.name + '!');
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

/**
 * Crea un objeto usuario dependiendo de la red social
 * @param {[type]} social [description]
 * @param {[type]} result [description]
 */
function setUser(social, result) {
	if (social === 't') {
		return user = {
			profile: {
				name: result.additionalUserInfo.profile.screen_name,
				picture: result.additionalUserInfo.profile.profile_image_url
			}
		};
	} else if (social === 'g') {
		return user = {
			profile: {
				name: result.additionalUserInfo.profile.given_name,
				picture: result.additionalUserInfo.profile.picture
			}
		};
	}
}
