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

			toggle('btn-signIn', 'none');
			toggle('btn-signOut', 'block');
			toggle('game', 'block');

			getChild('users/' + user.uid, 'profile')
				.on('value', function(snap) {
					var profile = snap.val();
					inner('player1-name', profile.name);
					getId('player1-picture').src = profile.picture;
				});


		} else {
			console.log('no logueado');
			toggle('btn-signIn', 'block');
			toggle('btn-signOut', 'none');
			toggle('game', 'block');
		}
	});
};
