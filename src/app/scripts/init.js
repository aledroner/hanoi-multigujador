window.onload = function() {

	/**
	 * Evento cuando hay un cambio en la autenticación
	 * de usuarios de la base de datos.
	 * @param  {[type]} user [description]
	 * @return {[type]}      [description]
	 */
	firebase.auth().onAuthStateChanged(function(user) {
		if (user) {
			console.log(user);
		} else {
			console.log('no logueado');
		}
	});
};
