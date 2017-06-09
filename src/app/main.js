angular
	.module('app')
	.component('app', {
		templateUrl: 'app/main.html'
	})
	.factory('hanoi', function(toastr, $state, $stateParams) {

		// Constantes
		const REF_USERS = getRef('users');
		const REF_GAMES = getRef('games');

		// Mensajes
		const SIGNIN = '¡Saludos! ';
		const SIGNOUT = '¡Hasta pronto figura!';
		const ERROR = 'Ha ocurrido un error escandaloso.';
		const GAME_ACTIVED = 'Ya estás en una partida, no pretendas ser omnipresente.';
		const GAME_CREATED = 'Partida creada. Ve a por un snack mientras esperas a tu oponente.';
		const GAME_JOINED = 'Has retado al malvado ';
		const GAME_DELETED = 'Partida directa al incinerador.';

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
				games: REF_GAMES
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
				game_deleted: GAME_DELETED
			},

			/**
			 * Crea un nuevo objeto en la base de datos
			 * @param  {Object} ref    Referencia de la base de datos
			 * @param  {Object} object Objeto a crear
			 */
			create: function(ref, object) {
				ref.set(object, function(err) {
					if (err) {
						console.log(err.message);
					} else {
						console.log('SET: ', object);
					}
				});
			},

			/**
			 * Actualiza un objeto de la base de datos
			 * @param  {Object} ref    Referencia de la base de datos
			 * @param  {String} id     Id del child a actualizar
			 * @param  {Object} object Objeto a crear
			 */
			update: function(ref, id, object) {
				ref.child(id).update(object, function(err) {
					if (err) {
						console.log(err.message);
					} else {
						console.log('UPDATE: ', object);
					}
				});
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
						player1: user.profile,
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
					player2: user.profile
				});
				REF_USERS.child(currentUser).update({
					activeGame: true
				});
				$state.go('app.game', {
					'gameId': game.id
				});
				toastr.success(GAME_JOINED + game.player1.name);
			},

		}
	});
