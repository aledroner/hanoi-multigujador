/**
 * Devuelve un elemento del DOM
 * @param  {[type]} id [description]
 * @return {[type]}    [description]
 */
function getId(id) {
	return document.getElementById(id);
}

/**
 * Escribe texto HTML en un elemento
 * @param  {[type]} id   [description]
 * @param  {[type]} text [description]
 * @return {[type]}      [description]
 */
function inner(id, text) {
	getId(id).innerHTML = text;
}

/**
 * Cambia el display de un elemento del DOM
 * @param  {[type]} id      [description]
 * @param  {[type]} display [description]
 * @return {[type]}         [description]
 */
function toggle(id, display) {
	getId(id).style.display = display;
}

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

/**
 * Escribe en la base de datos un usuario pasado por parámetro
 * @param  {[type]} uid  [description]
 * @param  {[type]} user [description]
 * @return {[type]}      [description]
 */
function createUser(uid, user) {
	firebase.database().ref('users/' + uid).set(user);
}

/**
 * Actualiza los datos de un jugador
 * @param  {[type]} player [description]
 * @param  {[type]} user   [description]
 * @return {[type]}        [description]
 */
function refresh(player, user) {
	getChild('users/' + user.uid, 'profile')
		.on('value', function(snap) {
			var profile = snap.val();
			inner(player + '-name', profile.name);
			getId(player + '-picture').src = profile.picture;
		});
}
