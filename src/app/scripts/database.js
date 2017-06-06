/**
 * Devuelve la referencia de un objeto padre de la base de datos
 * @param  {[type]} node [description]
 * @return {[type]}      [description]
 */
function getRef(node) {
	return firebase.database().ref(node);
}

/**
 * Devuelve la referencia de un objeto hijo de la base de datos
 * @param  {[type]} node  [description]
 * @param  {[type]} child [description]
 * @return {[type]}       [description]
 */
function getChild(node, child) {
	return getRef(node).child(child);
}

/**
 * Escribe en la base de datos un usuario pasado por parámetro
 * @param  {[type]} uid  [description]
 * @param  {[type]} user [description]
 * @return {[type]}      [description]
 */
function setUser(uid, user) {
	firebase.database().ref('users/' + uid).set(user);
}

/**
 * Crea una nueva partida
 * @param  {[type]} uid [description]
 * @return {[type]}     [description]
 */
function setGame(uid, gameId) {
	getRef('users/' + uid)
		.on('value', function(snap) {
			var user = snap.val();
			var game = {
				date: new Date().getTime(),
				id: gameId,
				player1: user,
				player2: {
					profile: {
						name: 'Esperando...',
						picture: '/app/img/user.png'
					}
				}
			}
			firebase.database().ref('games-online/' + gameId).set(game);
		});
}

/**
 * Jugador 2 se une a una partida creada
 * @param  {[type]} uid    [description]
 * @param  {[type]} gameId [description]
 * @return {[type]}        [description]
 */
function joinGame(uid, gameId) {
	getRef('users/' + uid)
		.on('value', function(snap) {
			var user = snap.val();
			firebase.database().ref('games-online/' + gameId + '/player2').set(user);
		});
}

/**
 * Crea un objeto usuario dependiendo de la red social
 * @param {[type]} social [description]
 * @param {[type]} result [description]
 */
function createUser(social, result) {
	if (social === 't') {
		return user = {
			profile: {
				uid: result.user.uid,
				name: result.additionalUserInfo.profile.screen_name,
				picture: result.additionalUserInfo.profile.profile_image_url
			}
		};
	} else if (social === 'g') {
		return user = {
			profile: {
				uid: result.user.uid,
				name: result.additionalUserInfo.profile.given_name,
				picture: result.additionalUserInfo.profile.picture
			}
		};
	}
}
