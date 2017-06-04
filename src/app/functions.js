/**
 * Devuelve un elemento del DOM
 * @param  {[type]} id [description]
 * @return {[type]}    [description]
 */
function getId(id) {
	return document.getElementById(id);
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
	return firebase.database().ref(node).child(child);
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
