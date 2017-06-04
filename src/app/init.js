window.onload = function() {

	// Lee el título de la aplicación
	getChild('app', 'title').on('value', function(snap) {
		getId('header-title').innerHTML = snap.val();
	});


	/**
	 * Evento cuando hay un cambio en la autenticación
	 * de usuarios de la base de datos.
	 * @param  {[type]} user [description]
	 * @return {[type]}      [description]
	 */
	firebase.auth().onAuthStateChanged(function(user) {
		if (user) {
			console.log(user);
			toggle('btn-signIn', 'none');
			toggle('btn-signOut', 'block');
			toggle('game', 'block');
		} else {
			console.log('no logueado');
			toggle('btn-signIn', 'block');
			toggle('btn-signOut', 'none');
			toggle('game', 'block');
		}
	});
};
