angular
	.module('hanoi.canvas', [])
	.controller('CanvasCtrl', function CanvasCtrl(hanoi, $stateParams, toastr) {

		// Constantes
		const VM = this;
		const REF_USERS = getRef('users');
		const REF_GAMES = getRef('games');

		// Variables canvas
		var canvas1 = document.getElementById('player1-canvas');
		var canvas2 = document.getElementById('player2-canvas');
		var ctx1 = canvas1.getContext('2d');
		var ctx2 = canvas2.getContext('2d');

		var arrayContexts = [ctx1, ctx2];

		// Colores discos
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
		REF_GAMES.child($stateParams.gameId).on('value', function(snap) {
			var game = snap.val();
			var uid = firebase.auth().currentUser.uid;

			// Controla que los controles sólo se muestran al jugador activo
			if (game.player1.uid === uid || game.player2.uid === uid) {
				VM.owner = true;
			}

			// Define que el jugador actual está listo para empezar
			if (game.full)
				VM.gameFull = true

			// Define que el jugador actual está listo para empezar
			if (game.playerWaiting == uid)
				VM.ready = true

			// Define si la partida ha empezado
			if (game.gameStart)
				VM.gameStart = true;

			// Objetos con el array de discos de la partida y el contexto de canvas de cada uno
			var p1 = {
				ctx: ctx1,
				disks: game.player1.disks
			};
			var p2 = {
				ctx: ctx2,
				disks: game.player2.disks
			};
			var dataGame;

			if (game.full) {
				if (game.player1.uid === uid) {
					dataGame = [p1, p2]
				} else {
					dataGame = [p2, p1]
				}
			} else {
				dataGame = [p1]
			}

			if (game.gameStart) {
				drawDisks(dataGame);
			}
		});

		/**
		 * Empieza la partida si el otro jugador ya está preparado
		 */
		VM.empezar = function() {
			REF_GAMES.child($stateParams.gameId).once('value')
				.then(function(snap) {
					var game = snap.val();
					var uid = firebase.auth().currentUser.uid;
					if (game.playerWaiting != undefined) {
						REF_GAMES.child($stateParams.gameId).update({
							gameStart: true
						}).then(function() {
							toastr.info(hanoi.message.game_start);
						})
					} else {
						REF_GAMES.child($stateParams.gameId).update({
							playerWaiting: uid
						}).then(function() {
							toastr.info(hanoi.message.game_wait);
						})
					}
				})
		}
	});
