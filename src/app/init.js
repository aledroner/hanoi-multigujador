window.onload = function() {

	// Lee el título de la aplicación
	getRef('app/title').on('value', function(snap) {
		inner('header-title', snap.val());
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
			toggle('logIn', 'none');
			toggle('btn-signOut', 'block');
			toggle('game', 'block');
			refresh('player1', user);
		} else {
			console.log('no logueado');
			toggle('logIn', 'block');
			toggle('btn-signOut', 'none');
			toggle('game', 'none');
		}
	});
};
