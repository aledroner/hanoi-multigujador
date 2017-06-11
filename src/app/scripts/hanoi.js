angular
	.module('hanoi.canvas', ['modal.giveUp'])
	.controller('CanvasCtrl', function CanvasCtrl(hanoi, $stateParams, toastr, $uibModal) {

		// Constantes
		const VM = this;
		const REF_USERS = getRef('users');
		const REF_GAMES = getRef('games');
		const GAME_ID = getParamGameId();
		const audioGet = document.getElementById('audioGet');
		const audioSet = document.getElementById('audioSet');
		const audioWin = document.getElementById('audioWin');
		const audioLose = document.getElementById('audioLose');

		VM.action = 'Coger';
		VM.transaction = true;

		// Variables canvas
		var canvas1 = document.getElementById('player1-canvas');
		var canvas2 = document.getElementById('player2-canvas');
		var ctx1 = canvas1.getContext('2d');
		var ctx2 = canvas2.getContext('2d');

		var arrayContexts = [ctx1, ctx2];

		// Colores discosuid
		var colors = ['#d63d3d', '#d6743d', '#d3d63d', '#3dd663', '#3dd6d6', '#3d63d6', '#653dd6', '#a13dd6', '#d63d90'];
		var woodColor = '#9c632e';
		var borderColor = '#222';

		// Tamaño canvas. También evita pixelado
		var w = canvas1.width = canvas2.width = getComputedStyle(canvas1).width.split('px')[0];
		var h = canvas1.height = canvas2.height = getComputedStyle(canvas1).height.split('px')[0];

		// Tamaños
		var tam = 16;
		var coef = .7;
		var border = 1;
		var baseY = h - tam;
		var topY = 50;
		var gapX = w / 4;

		/**
		 * Dibuja la base de madera donde se colocarán los discos
		 */
		function drawInit() {
			angular.forEach(arrayContexts, function(ctx) {
				// Base madera
				ctx.fillStyle = borderColor;
				ctx.fillRect(0, baseY, w, tam);
				ctx.fill();
				ctx.fillStyle = woodColor;
				ctx.fillRect(0 + border, baseY + border, w - border * 2, tam - border * 2);

				// Palos madera
				for (var i = -1; i <= 1; i++) {
					ctx.fillStyle = borderColor; // Bordes
					ctx.fillRect((gapX * (i + 2) + (tam / 2) * i * 4) - (tam / 2), topY, tam * coef, baseY - topY);
					ctx.fillStyle = woodColor; // Color
					ctx.fillRect((gapX * (i + 2) + (tam / 2) * i * 4) - (tam / 2) + border, topY + border, tam * coef - border * 2, baseY - topY - border);
				}
				ctx.fill();
			});
		}
		drawInit();

		/**
		 * Dibuja los discos
		 */
		function drawDisks(dataGame) {
			angular.forEach(dataGame, function(player) {
				player.ctx.fillStyle = borderColor; // Bordes
				for (var i = 0; i < player.disks.length; i++) {
					player.ctx.fillRect(
						(gapX * (player.disks[i].tow + 2) + (tam / 2) * player.disks[i].tow * 4) - (player.disks[i].tam * tam / 2) - (tam * ((1 - coef) / 2)),
						baseY + 1 - tam * player.disks[i].pos,
						tam * player.disks[i].tam,
						tam);
				}
				for (var i = 0; i < player.disks.length; i++) {
					player.ctx.fillStyle = colors[i]; // Bordes
					player.ctx.fillRect(
						(gapX * (player.disks[i].tow + 2) + (tam / 2) * player.disks[i].tow * 4) - (player.disks[i].tam * tam / 2) - (tam * ((1 - coef) / 2)) + border,
						baseY + 1 - tam * player.disks[i].pos + border,
						tam * player.disks[i].tam - border * 2,
						tam - border * 2);
				}
				player.ctx.fill();
			});
		}

		// Evento que lee el objeto del juego cada vez que hay un cambio en él
		REF_GAMES.child(GAME_ID).on('value', function(snap) {
			VM.game = snap.val();
			if (VM.game) {
				VM.uid = firebase.auth().currentUser.uid;
				VM.refGame = hanoi.ref.games.child(VM.game.id);

				// Establece quién es el jugador actual
				if (VM.game.player1.uid == VM.uid) {
					VM.currentUser = VM.game.player1;
					VM.refCurentUser = VM.refGame.child('player1');
				} else {
					VM.currentUser = VM.game.player2;
					VM.refCurentUser = VM.refGame.child('player2');
				}

				if (VM.currentUser.player1) {
					VM.player1 = true;
				} else {
					VM.player2 = true;
				}

				VM.lastDisk = VM.currentUser.lastDisk;
				VM.action = VM.currentUser.action;

				// Controla que los controles sólo se muestran al jugador activo
				if (VM.game.player1.uid === VM.uid || VM.game.player2.uid === VM.uid)
					VM.owner = true;

				// Define que la partida tiene dos jugadores
				if (VM.game.full)
					VM.gameFull = true;

				// Define si la partida ha empezado
				if (VM.game.gameStart)
					VM.gameStart = true;

				// Define que el jugador actual está listo para empezar
				if (VM.game.playerWaiting == VM.uid) {
					VM.ready = true
				} else if (!VM.gameStart && VM.game.playerWaiting != undefined) {
					toastr.info(hanoi.message.game_ready);
				}

				// Muestra un mensaje al usuario cuando acaba la partida
				if (VM.game.winner != undefined) {
					if (VM.game.winner == VM.uid) {
						audioWin.play();
						toastr.success(hanoi.message.game_win);
					} else if (VM.game.loser == VM.uid) {
						audioLose.play();
						toastr.info(hanoi.message.game_lose);
					}
					toastr.info(hanoi.message.game_archive);
				}

				// Objetos con el array de discos de la partida y el contexto de canvas de cada uno
				var dataGame;
				var p1 = {
					ctx: ctx1,
					disks: VM.game.player1.disks
				};
				var p2 = {
					ctx: ctx2,
					disks: VM.game.player2.disks
				};
				if (VM.game.full) {
					dataGame = [p1, p2]
				} else {
					dataGame = [p1]
				}

				// Si el juego ha empezado pinta el canvas con el dataGame
				if (VM.game.gameStart) {
					ctx1.clearRect(0, 0, canvas1.width, canvas1.height);
					ctx2.clearRect(0, 0, canvas1.width, canvas1.height);
					drawInit();
					drawDisks(dataGame);
				}
			}
		});

		/**
		 * Empieza la partida si el otro jugador ya está preparado
		 */
		VM.empezar = function() {
			if (VM.game.playerWaiting != undefined) {
				REF_GAMES.child(VM.game.id).update({
					gameStart: true
				}).then(function() {
					toastr.info(hanoi.message.game_start);
				})
			} else {
				REF_GAMES.child(VM.game.id).update({
					playerWaiting: VM.uid
				}).then(function() {
					toastr.info(hanoi.message.game_wait);
				})
			}
		}

		/**
		 * Bottón para coger o soltar discos
		 * @param  {Int} tow El identificador de la torre
		 */
		VM.accion = function(tow) {
			if (VM.transaction) {
				var disks = VM.currentUser.disks;
				var last = getLastDisk(tow, disks);
				if (VM.action == 'Coger') {
					if (last.pos == 0) { // Si torre vacía
						toastr.info(hanoi.message.game_towerEmpty);
					} else { // Si torre contiene discos
						last.pos = 12;
						updateDisk(last);
					}
					audioGet.play();
				} else {
					if (tow == VM.lastDisk.tow) { // Suelta disco en misma torre
						var noTwelve = getLastDisk(tow, disks, true);
						last.pos = noTwelve.pos + 1;
						updateDisk(last);
					} else { // Suelta disco en otra torre
						if (last.pos != 0) { // Si torre con discos
							if (last.tam < VM.lastDisk.tam) { // Si tamaño mayor
								toastr.warning(hanoi.message.game_ilegalMove);
							} else { // Si correcto
								VM.lastDisk.pos = last.pos + 1;
								VM.lastDisk.tow = tow;
								updateDisk(VM.lastDisk);
							}
						} else { // Si torre vacía
							last.pos = 1;
							last.tow = tow;
							last.id = VM.lastDisk.id;
							updateDisk(last);
						}
					}
					audioSet.play();
				}
			}
		}

		/**
		 * Actualiza en la base de datos el disco movido
		 * @param  {Object} last Disco a actualizar
		 */
		function updateDisk(last) {
			VM.transaction = false;
			var move;
			if (VM.currentUser.action == 'Coger') {
				move = 0;
			} else {
				move = 1;
			}
			VM.refCurentUser.update({
				lastDisk: last,
				moves: VM.currentUser.moves + move
			}).then(function() {
				VM.refCurentUser.child('disks').child(last.id).update(last)
					.then(function() {
						if (comprobarGanado()) {
							VM.win = true;
							hanoi.archiveGame(VM.game, true);
						} else {
							cambiarAccion();
						}
						VM.transaction = true;
					});
			});
		}

		/**
		 * Cambia la acción de los botones
		 */
		function cambiarAccion() {
			var coger = {
				action: 'Coger'
			};
			var soltar = {
				action: 'Soltar'
			};
			if (VM.currentUser.action == 'Coger') {
				VM.refCurentUser.update(soltar);
			} else {
				VM.refCurentUser.update(coger)
			}
		}

		/**
		 * Comprueba que el usuario ha ganado
		 * @return {Boolean} True si ha ganado
		 */
		function comprobarGanado() {
			var discosOK = 0;
			for (var i = 0; i < VM.currentUser.disks.length && discosOK < VM.game.level; i++) {
				if (VM.currentUser.disks[i].tow == 1) {
					discosOK++;
				}
			}
			if (discosOK == VM.game.level) {
				return true;
			} else {
				return false;
			}
		}

		/**
		 * Devuelve la id del juego
		 */
		function getParamGameId() {
			var gameId;
			if ($stateParams.gameId == undefined) {
				gameId = 'null'
			} else {
				gameId = $stateParams.gameId;
			}
			return gameId;
		}

		/**
		 * Muestra una ventana modal para borrar una partida
		 * @param  {String} gameId    Id aleatoria del juego
		 * @param  {String} player1Id Id aleatoria del jugador 1
		 * @param  {String} player2Id Id aleatoria del jugador 2
		 */
		VM.modalGiveUp = function() {
			var modalInstance = $uibModal.open({
				animation: false,
				component: 'modalGiveUp',
				resolve: {
					game: function() {
						return VM.game;
					},
					uid: function() {
						return VM.uid;
					}
				}
			});

			modalInstance.result.then(function(resolve) {
				hanoi.archiveGame(resolve.game, false)
			}, function() {
				console.log('');
			});
		};
	});

/**
 * Devuelve la posición del último disco
 * de la torre pasada por parámetro
 * @param  {Int}     tow   		El identificador de la torre
 * @param  {Array}   disks 		Array con los discos del jugador actual
 * @param  {Boolean} noTwelve   No quieres que te devuelva el disco 12
 * @return {Object}  lastDisk   Último disco
 */
function getLastDisk(tow, disks, noTwelve) {
	var lastDisk = {
		pos: 0
	};
	for (var i = 0; i < disks.length; i++) {
		var disk = disks[i];
		if (disk.tow == tow) {
			if (disk.pos > lastDisk.pos) {
				if (noTwelve) {
					if (disk.pos != 12) {
						lastDisk = disk
					}
				} else {
					lastDisk = disk
				}
			}
		}

	}
	return lastDisk;
}
