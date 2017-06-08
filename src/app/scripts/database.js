// Devuelve la referencia de un objeto padre de la base de datos
function getRef(node) {
	return firebase.database().ref(node);
}

// Devuelve la referencia de un objeto hijo de la base de datos
function getChild(node, child) {
	return getRef(node).child(child);
}

// Crea una nueva partida
function setGame(uid, gameId, mode) {
	const REF_GAMES = getRef('games');
	getRef('users').child(uid).once('value', function(snap) {
		var user = snap.val();
		if (mode == 'crear') {
			var game = {
				full: false,
				date: new Date().getTime(),
				id: gameId,
				level: 0,
				player1: user.profile,
				player2: {
					name: 'Esperando...',
					picture: '/app/img/user.png'
				}
			}
			REF_GAMES.child(gameId).set(game);
		} else {
			REF_GAMES.child(gameId).update({
				full: true,
				player2: user.profile
			});
		}
	});
}

// Crea un objeto usuario dependiendo de la red social
function createUser(social, result) {
	if (social === 't') {
		return {
			activeGame: false,
			profile: {
				uid: result.user.uid,
				name: result.additionalUserInfo.profile.screen_name,
				picture: result.additionalUserInfo.profile.profile_image_url_https
			}
		};
	} else if (social === 'g') {
		return {
			activeGame: false,
			profile: {
				uid: result.user.uid,
				name: result.additionalUserInfo.profile.given_name,
				picture: result.additionalUserInfo.profile.picture
			}
		};
	}
}
