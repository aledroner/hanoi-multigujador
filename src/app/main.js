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
					var user = createUser(social, result);
					if (!snap.hasChild(uid)) {
						REF_USERS.child(uid).set(user);
					}
					toastr.success(SIGNIN + user.profile.name);
				});
			},

			/**
			 * Crea una partida nueva multijugador
			 * @param  {String} gameId Id aleatoria del juego
			 * @param  {String} mode   Modo de entrar ['Crear' | 'Unir' | 'Ver']
			 */
			createGame: function(gameId, level) {
				REF_USERS.child(currentUser).once('value', function(snap) {
					var user = snap.val();
					if (user.activeGame) {
						toastr.info(GAME_ACTIVED);
					} else {
						$state.go('app.game', {
							'gameId': gameId
						});
						REF_USERS.child(currentUser).update({
							activeGame: true
						});
						setGame(currentUser, gameId, level);
						toastr.success(GAME_CREATED);
					}
				});
			},

			/**
			 * Se une a una partida ya creada
			 * @param  {String} gameId Id aleatoria del juego
			 * @param  {String} mode   Modo de entrar ['Crear' | 'Unir' | 'Ver']
			 */
			joinGame: function(gameId, mode) {
				REF_GAMES.child(gameId).once('value', function(snap) {
					var game = snap.val();
					REF_USERS.child(currentUser).once('value', function(snap) {
						var user = snap.val();
						if (game.player1.uid == currentUser || game.player2.uid == currentUser) {
							$state.go('app.game', {
								'gameId': gameId
							});
						} else {
							if (user.activeGame) {
								toastr.info(GAME_ACTIVED);
							} else {
								$state.go('app.game', {
									'gameId': gameId
								});
								REF_USERS.child(currentUser).update({
									activeGame: true
								});
								setGame(currentUser, gameId, mode);
								toastr.success(GAME_JOINED + game.player1.name);
							}
						}
					});
				});
			},

		}
	});
