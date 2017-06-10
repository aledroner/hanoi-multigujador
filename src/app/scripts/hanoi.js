angular
	.module('hanoi.canvas', [])
	.controller('CanvasCtrl', function CanvasCtrl($scope) {
		var canvas1 = document.getElementById('player1-canvas');
		var canvas2 = document.getElementById('player2-canvas');
		var ctx1 = canvas1.getContext('2d');
		var ctx2 = canvas2.getContext('2d');

		// Colores discos
		var colors = ['#d63d3d', '#d6743d', '#d3d63d', '#3dd663', '#3dd6d6', '#3d63d6', '#653dd6', '#a13dd6', '#d63d90'];
		var woodColor = '#9c632e';
		var borderColor = '#222';

		// Tamaño canvas. También evita pixelado
		var w = canvas1.width = canvas2.width = getComputedStyle(canvas1).width.split('px')[0];
		var h = canvas1.height = canvas2.height = getComputedStyle(canvas1).height.split('px')[0];

		// Tamaños
		var tam = 16;
		var border = 1;
		var baseY = h - tam;
		var topY = 50;
		var gapX = w / 4;

		/**
		 * Dibuja la base de madera donde se colocarán los discos
		 */
		function init(context) {
			// Base madera
			context.fillStyle = borderColor;
			context.fillRect(0, baseY, w, tam);
			context.fill();
			context.fillStyle = woodColor;
			context.fillRect(0 + border, baseY + border, w - border * 2, tam - border * 2);

			// Palos madera
			for (var i = -1; i <= 1; i++) {
				context.fillStyle = borderColor;
				context.fillRect((gapX * (i + 2) + (tam / 2) * i * 4) - (tam / 2), topY, tam, baseY - topY);
				context.fillStyle = woodColor;
				context.fillRect((gapX * (i + 2) + (tam / 2) * i * 4) - (tam / 2) + border, topY + border, tam - border * 2, baseY - topY - border);
			}
			context.fill();
		}
		init(ctx1);
		init(ctx2);
	});;
