// Devuelve la referencia de un objeto padre de la base de datos
function getRef(node) {
	return firebase.database().ref(node);
}

// Devuelve la referencia de un objeto hijo de la base de datos
function getChild(node, child) {
	return getRef(node).child(child);
}

/**
 * Crea un objeto jugador con sus discos
 * @param  {Object} user  Perfil del jugador unido a la partida
 * @param  {Int}    level Número de discos de la partida
 * @return {Object}       Perfil del jugador actualizado con los discos
 */
function createObjectPlayer(user, level) {

	var arrayDisks = [];
	var position = 1;

	for (var i = level; i > 0; i--) {
		var disk = {
			tam: i,
			pos: position,
			tow: -1
		}
		arrayDisks.push(disk);
		position++;
	}

	var player = {
		name: user.profile.name,
		picture: user.profile.picture,
		uid: user.profile.uid,
		disks: arrayDisks,
		accion: 'Coger'
	}

	return player;
}
