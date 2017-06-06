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
 * Genera un id aleatorio alfa numérico para crear una nueva partida
 * @return {[type]} [description]
 */
function randomId() {
	var abc = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'y', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
	var id = '';
	for (var i = 0; i < 6; i++) {
		if (rand(0, 1) % 2 == 0)
			id += rand(0, 9);
		else {
			if (rand(0, 1) % 2 == 0)
				id += abc[rand(0, abc.length - 1)].toUpperCase();
			else
				id += abc[rand(0, abc.length - 1)];
		}
	}
	return id;
}

/**
 * Genera un número aleatorio entre min y max
 * @param  {[type]} min [description]
 * @param  {[type]} max [description]
 * @return {[type]}     [description]
 */
function rand(min, max) {
	return Math.floor(Math.random() * ((max + 1) - min)) + min;
}
