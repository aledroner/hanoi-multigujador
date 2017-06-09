// Devuelve la referencia de un objeto padre de la base de datos
function getRef(node) {
	return firebase.database().ref(node);
}

// Devuelve la referencia de un objeto hijo de la base de datos
function getChild(node, child) {
	return getRef(node).child(child);
}
