// Devuelve la referencia de un objeto padre de la base de datos
function getRef(node) {
	return firebase.database().ref(node);
}

// Devuelve la referencia de un objeto hijo de la base de datos
function getChild(node, child) {
	return getRef(node).child(child);
}

// Crea un objeto hijo en la referencia
function createChild(node, child, obj) {
	getChild(node, child).set(obj);
}

// Actualiza un hijo
function updateChild(node, child, obj) {
	getChild(node, child).update(obj);
}

// Actualiza o crea un campo de un hijo
function updateField(node, child, field, value) {
	var obj = {};
	obj[field] = value;
	updateChild(node, child, obj);
}

// Remueve un hijo
function deleteChild(node, child) {
	getChild(node, child).remove();
}

// Crea una nueva partida
function setGame(uid, gameId, mode) {
	const refGames = getRef('games');
	getChild('users', uid)
		.on('value', function(snap) {
			var user = snap.val();
			if (mode == 'crear') {
				var game = {
					full: false,
					date: new Date().getTime(),
					id: gameId,
					player1: user.profile,
					player2: {
						name: 'Esperando...',
						picture: '/app/img/user.png'
					}
				}
				refGames.child(gameId).set(game);
			} else {
				updateField('games', gameId, 'full', true);
				updateChild('games/' + gameId, 'player2', user.profile);
			}
		});
}

// Crea un objeto usuario dependiendo de la red social
function createUser(social, result) {
	if (social === 't') {
		return {
			profile: {
				uid: result.user.uid,
				name: result.additionalUserInfo.profile.screen_name,
				picture: result.additionalUserInfo.profile.profile_image_url_https
			}
		};
	} else if (social === 'g') {
		return {
			profile: {
				uid: result.user.uid,
				name: result.additionalUserInfo.profile.given_name,
				picture: result.additionalUserInfo.profile.picture
			}
		};
	}
}
