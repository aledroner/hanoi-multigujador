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

/**
 * Actualiza los datos de un jugador
 * @param  {[type]} player [description]
 * @param  {[type]} user   [description]
 * @return {[type]}        [description]
 */
function refresh(player, user) {
	getChild('users/' + user, 'profile')
		.on('value', function(snap) {
			var profile = snap.val();
			inner(player + '-name', profile.name);
			getId(player + '-picture').src = profile.picture;
		});
}
