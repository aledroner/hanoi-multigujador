angular
	.module('app')
	.component('app', {
		templateUrl: 'app/main.html'
	})
	.factory('hanoi', function(toastr, $state, $stateParams) {

		// Constantes
		const REF_USERS = getRef('users');
		const REF_GAMES = getRef('games');
		const REF_ARCHIVE_GAMES = getRef('archive-games');

		// Mensajes
		const SIGNIN = '¡Saludos! ';
		const SIGNOUT = '¡Hasta pronto figura!';
		const ERROR = 'Ha ocurrido un error escandaloso. Vuelva a intentarlo más tarde.';
		const GAME_ACTIVED = 'Ya estás en una partida, no pretendas ser omnipresente.';
		const GAME_CREATED = 'Partida creada. Ve a por un snack mientras esperas a tu oponente.';
		const GAME_JOINED = 'Has osado retar a ';
		const GAME_DELETED = 'Partida directa al incinerador.';
		const GAME_WAIT = 'Espera a que tu openente quiera empezar.';
		const GAME_START = '¡QUE COMIENCE EL DU-DU-DU-DUELO!';
		const GAME_READY = 'Tu oponente quiere jugar. ¡Pulsa el botón Empezar partida!';
		const GAME_TOWER_EMPTY = 'Esa torre está vacía.';
		const GAME_ILEGAL_MOVE = 'No puedes mover ese disco ahí. ¡Es demasiado grande!';
		const GAME_WIN = '¡FELICIDADES! HAS GANADO A TU PODEROSO OPONENTE. Es mentira, en realidad era un poco malo.';
		const GAME_LOSE = '¡OOOOOOhh! Has perdido :(';
		const GAME_ARCHIVE = 'Partida archivada.';

		var currentUser = 'noPlayer';

		// Evento que lee si hay un usuario logueado
		firebase.auth().onAuthStateChanged(function(user) {
			if (user) {
				currentUser = user.uid;
			} else {
				currentUser = 'noPlayer';
			}
		});

		return {

			currenUser: currentUser,

			/**
			 * Referencia a los nodos principales de la base de datos
			 * @type {Object}
			 */
			ref: {
				users: REF_USERS,
				games: REF_GAMES,
				archiveGames: REF_ARCHIVE_GAMES
			},
			/**
			 * Mensajes que se muestran al usuario
			 * @type {Object}
			 */
			message: {
				signin: SIGNIN,
				signout: SIGNOUT,
				error: ERROR,
				game_actived: GAME_ACTIVED,
				game_created: GAME_CREATED,
				game_joined: GAME_JOINED,
				game_deleted: GAME_DELETED,
				game_wait: GAME_WAIT,
				game_start: GAME_START,
				game_ready: GAME_READY,
				game_towerEmpty: GAME_TOWER_EMPTY,
				game_ilegalMove: GAME_ILEGAL_MOVE,
				game_win: GAME_WIN,
				game_lose: GAME_LOSE,
				game_archive: GAME_ARCHIVE
			},

			/**
			 * Crea un usuario nuevo en la base de datos
			 * @param  {Object} result Objeto resultado de iniciar sesión
			 * @param  {String} social Red social desde la que inicias sesión
			 */
			createNewUser: function(result, social) {
				var uid = result.user.uid;
				REF_USERS.once('value').then(function(snap) {
					var user = {}
					if (social === 't') {
						user = {
							activeGame: false,
							profile: {
								uid: result.user.uid,
								name: result.additionalUserInfo.profile.screen_name,
								picture: result.additionalUserInfo.profile.profile_image_url_https
							}
						};
					} else if (social === 'g') {
						user = {
							activeGame: false,
							profile: {
								uid: result.user.uid,
								name: result.additionalUserInfo.profile.given_name,
								picture: result.additionalUserInfo.profile.picture
							}
						};
					}
					if (!snap.hasChild(uid)) {
						REF_USERS.child(uid).set(user);
					}
					toastr.success(SIGNIN + user.profile.name);
				});
			},

			/**
			 * Crea una partida nueva multijugador
			 * @param  {String} gameId Id aleatoria del juego
			 * @param  {Int} 	level  Nivel de la partida
			 */
			createGame: function(gameId, level) {
				REF_USERS.child(currentUser).once('value', function(snap) {
					var user = snap.val();
					var game = {
						full: false,
						date: new Date().getTime(),
						id: gameId,
						level: level,
						gameStart: false,
						player1: createObjectPlayer(user, level, true),
						player2: {
							name: 'Esperando...',
							picture: '/app/img/user.png'
						}
					}
					REF_GAMES.child(gameId).set(game);
				});
				REF_USERS.child(currentUser).update({
					activeGame: true
				});
				$state.go('app.game', {
					'gameId': gameId
				});
				toastr.success(GAME_CREATED);
			},

			/**
			 * Se une a una partida ya creada
			 * @param  {String} gameId Id aleatoria del juego
			 * @param  {Int} 	level  Nivel de la partida
			 */
			joinGame: function(game, user) {
				REF_GAMES.child(game.id).update({
					full: true,
					player2: createObjectPlayer(user, game.level, false)
				});
				REF_USERS.child(currentUser).update({
					activeGame: true
				});
				$state.go('app.game', {
					'gameId': game.id
				});
				toastr.success(GAME_JOINED + game.player1.name);
			},

			/**
			 * Archiva un juego terminado
			 * @param  {Object} game  El objeto del juego terminado
			 * @param  {boolean} win  Es true si el jugador ha ganado y no se ha rendido.
			 */
			archiveGame: function(game, win) {
				var gameArchive = {
					id: game.id,
					date: game.date,
					level: game.level
				}

				player1 = {
					name: game.player1.name,
					picture: game.player1.picture,
					uid: game.player1.uid
				}

				player2 = {
					name: game.player2.name,
					picture: game.player2.picture,
					uid: game.player2.uid
				}

				var winnerUid;
				var loserUid;

				if (game.player1.uid == currentUser) {
					if (win) {
						gameArchive.winner = player1;
						gameArchive.loser = player2;
						winnerUid = player1.uid;
						loserUid = player2.uid;
					} else {
						gameArchive.winner = player2;
						gameArchive.loser = player1;
						winnerUid = player2.uid;
						loserUid = player1.uid;
					}
				} else {
					if (win) {
						gameArchive.winner = player2;
						gameArchive.loser = player1;
						winnerUid = player2.uid;
						loserUid = player1.uid;
					} else {
						gameArchive.winner = player1;
						gameArchive.loser = player2;
						winnerUid = player1.uid;
						loserUid = player2.uid;
					}
				}
				REF_GAMES.child(game.id).update({
					winner: winnerUid,
					loser: loserUid
				}).then(function() {
					REF_ARCHIVE_GAMES.child(game.id).set(gameArchive)
						.then(function() {
							REF_GAMES.child(game.id).remove();
						}).then(function() {
							REF_USERS.child(game.player1.uid).update({
								activeGame: false
							});
							REF_USERS.child(game.player2.uid).update({
								activeGame: false
							});
						});
				})

			}
		}
	});

/**
 * Devuelve la referencia de un objeto padre de la base de datos
 * @param  {String} node Nodo de la base de datos a leer
 * @return {Object}      Referencia
 */
function getRef(node) {
	return firebase.database().ref(node);
}

/**
 * Crea un objeto jugador con sus discos
 * @param  {Object} user  Perfil del jugador unido a la partida
 * @param  {Int}    level Número de discos de la partida
 * @return {Object}       Perfil del jugador actualizado con los discos
 */
function createObjectPlayer(user, level, player1) {

	var arrayDisks = [];
	var position = 1;

	for (var i = level; i > 0; i--) {
		var disk = {
			id: position - 1,
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
		moves: 0,
		action: 'Coger',
		player1: player1
	}

	return player;
}
