angular
	.module('hanoi.canvas', [])
	.controller('CanvasCtrl', function CanvasCtrl(hanoi, $stateParams, toastr) {

		// Constantes
		const VM = this;
		const REF_USERS = getRef('users');
		const REF_GAMES = getRef('games');
		const GAME_ID = getParamGameId();
		VM.action = 'Coger';

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
						baseY + i + 1 - tam * player.disks[i].pos,
						tam * player.disks[i].tam,
						tam);
				}
				for (var i = 0; i < player.disks.length; i++) {
					player.ctx.fillStyle = colors[i]; // Bordes
					player.ctx.fillRect(
						(gapX * (player.disks[i].tow + 2) + (tam / 2) * player.disks[i].tow * 4) - (player.disks[i].tam * tam / 2) - (tam * ((1 - coef) / 2)) + border,
						baseY + i + 1 - tam * player.disks[i].pos + border,
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
				if (VM.game.player1.uid === VM.uid || VM.game.player2.uid === VM.uid) {
					VM.owner = true;
				}

				// Define que el jugador actual está listo para empezar
				if (VM.game.full)
					VM.gameFull = true

				// Define si la partida ha empezado
				if (VM.game.gameStart)
					VM.gameStart = true;

				// Define que el jugador actual está listo para empezar
				if (VM.game.playerWaiting == VM.uid) {
					VM.ready = true
				} else if (!VM.gameStart && VM.game.playerWaiting != undefined) {
					toastr.info(hanoi.message.game_ready);
				}

				// Objetos con el array de discos de la partida y el contexto de canvas de cada uno
				var p1 = {
					ctx: ctx1,
					disks: VM.game.player1.disks
				};
				var p2 = {
					ctx: ctx2,
					disks: VM.game.player2.disks
				};
				var dataGame;

				if (VM.game.full) {
					dataGame = [p1, p2]
				} else {
					dataGame = [p1]
				}

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
			var disks = VM.currentUser.disks;
			if (VM.action == 'Coger') {
				var last = getLastDisk(tow, disks);
				if (last.pos == 0) {
					toastr.info(hanoi.message.game_towerEmpty);
				} else {
					last.pos = 12;
					VM.refCurentUser.update({
						lastDisk: last
					}).then(function() {
						VM.refCurentUser.child('disks').child(last.id).update(last);
						cambiarAccion();
					});
				}
			} else {
				var last = getLastDisk(tow, disks);
				if (tow == VM.lastDisk.tow) { // Suelta en misma torre
					var noTwelve = getLastDisk(tow, disks, true);
					last.pos = noTwelve.pos + 1;
					VM.refCurentUser.update({
						lastDisk: last
					}).then(function() {
						VM.refCurentUser.child('disks').child(last.id).update(last);
						cambiarAccion();
					});
				}
			}
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
