var ws = new WebSocket('ws://' + window.document.location.host);

var whitePieces = [];
var blackPieces = [];
var piece;
var moves = [];

var controllingWhite;
var controllingBlack;
var id;
var mouseDown;

//Dimensions of each space on the board
var height = 50;
var width = 50;

//Dimensions of the board
var x = 400;
var y = 50;
	
var canvas = document.getElementById('canvas1');

//Draw the game board and all of the pieces
var drawCanvas = function() {
	var context = canvas.getContext('2d');
	context.fillStyle = 'white';
	context.fillRect(0,0,canvas.width,canvas.height);
	
	/* Draw chess board */
	for(let i = 0; i < 8; i++) {
		for(let j = 0; j < 8; j++) {
			if((j + i) % 2 == 0) {
				context.fillStyle = 'BurlyWood';
				context.fillRect(x + (width * j), y + (height * i), width, height);
			}
			else {
				context.fillStyle = 'SaddleBrown';
				context.fillRect(x + (width * j), y + (height * i), width, height);
			}
		}
	}
	for(let i = 0; i < 9; i++) {
		context.moveTo(x + (width * i), y);
		context.lineTo(x + (width * i), y + (8 * height));
	}
	for(let i = 0; i < 9; i++) {
		context.moveTo(x, y + (height * i));
		context.lineTo(x + ( 8 * width), y + (height * i));
	}
	
	/* Draw chess pieces */
	context.font = '36px Georgia';
	context.textAlign = 'center';
	context.fillStyle = "White";
	for(let i = 0; i < whitePieces.length; i++) {
		var data = whitePieces[i];
		context.fillText(data.avatar, data.x + (width / 2), data.y + 37);
	}
	context.fillStyle = "Black";
	for(let i = 0; i < blackPieces.length; i++) {
		var data = blackPieces[i];
		context.fillText(data.avatar, data.x + (width / 2), data.y + 37);
	}
	context.stroke();
}

//Return the piece at the specified x and y values
function getPieceAtXY(spaceX, spaceY) {
	for(let i = 0; i < whitePieces.length; i++) {
		if(spaceX == whitePieces[i].x && spaceY == whitePieces[i].y) return whitePieces[i];
	}
	for(let i = 0; i < blackPieces.length; i++) {
		if(spaceX == blackPieces[i].x && spaceY == blackPieces[i].y) return blackPieces[i];
	}
	return null;
}

//Request to move a piece on the board
function requestMove(e) {
	var rect = canvas.getBoundingClientRect();
	//Get the mouse x and y values
	var mouseX = e.clientX - rect.left;
	var mouseY = e.clientY - rect.top;
	//Determine the x and y values of the space the mouse is on
	var spaceX = mouseX - (mouseX % width);
	var spaceY = mouseY - (mouseY % height);
	
	//After selecting a piece and a place to move to attempt to make the move 
	if(piece != null && moves.length > 0) {
		for(let i = 0; i < moves.length; i++) {
			if(spaceX == moves[i].x && spaceY == moves[i].y) {
				makeMove(piece, spaceX, spaceY);
				return;
			}
		}
	}
	
	//Get the piece under the mouse
	piece = getPieceAtXY(spaceX, spaceY);
	if(piece != null) {
		//Check if the user has permission to control the selected piece
		if(piece.colour == "white" && !controllingWhite) {
			alert("You don't have permission to move white pieces");
			return;
		}
		if(piece.colour == "black" && !controllingBlack) {
			alert("You don't have permission to move black pieces");
			return ;
		}
		
		//Get the possible moves for the piece that was selected
		switch(piece.type) {
			case "pawn":
				pawnMoves(piece);
				break;
			case "rook":
				rookMoves(piece);
				break;
			case "knight":
				knightMoves(piece);
				break;
			case "bishop":
				bishopMoves(piece);
				break;
			case "queen":
				queenMoves(piece);
				break;
			case "king":
				kingMoves(piece);
				break;
			default:
				alert("Error");
		}
	}
}

//Request that the server approves the move and updates the board
function makeMove(piece, spaceX, spaceY) {
	var message = {};
	message.piece = piece;
	message.x = spaceX;
	message.y = spaceY;
	ws.send(JSON.stringify(message));
}

//Get all possible moves for a pawn given its current position and the state of the board
function pawnMoves(piece) {
	moves = [];
	var pieceAt;
	if(piece.colour == "white") {
		if(piece.y == y + (6 * height)) {
			pieceAt = getPieceAtXY(piece.x, piece.y - 50); 
			if(pieceAt == null) { 
				moves.push({x: piece.x, y: piece.y - 50});
				pieceAt = getPieceAtXY(piece.x, piece.y - 100); 
				if(pieceAt == null) moves.push({x: piece.x, y: piece.y - 100});
			}
		}
		else {
			pieceAt = getPieceAtXY(piece.x, piece.y - 50); 
			if(pieceAt == null) moves.push({x: piece.x, y: piece.y - 50});
		}
		
		pieceAt = getPieceAtXY(piece.x - 50, piece.y - 50);
		if(pieceAt != null) {
			if(pieceAt.colour == "black") moves.push({x: piece.x - 50, y: piece.y - 50});
		}
		pieceAt = getPieceAtXY(piece.x + 50, piece.y - 50);
		if(pieceAt != null) {
			if(pieceAt.colour == "black") moves.push({x: piece.x + 50, y: piece.y - 50});
		}
	}
	if(piece.colour == "black") {
		if(piece.y == y + height) {
			pieceAt = getPieceAtXY(piece.x, piece.y + 50); 
			if(pieceAt == null) moves.push({x: piece.x, y: piece.y + 50});
			pieceAt = getPieceAtXY(piece.x, piece.y + 100); 
			if(pieceAt == null) moves.push({x: piece.x, y: piece.y + 100});
		}
		else {
			pieceAt = getPieceAtXY(piece.x, piece.y + 50); 
			if(pieceAt == null) moves.push({x: piece.x, y: piece.y + 50});
		}
		
		pieceAt = getPieceAtXY(piece.x - 50, piece.y + 50);
		if(pieceAt != null) {
			if(pieceAt.colour == "white") moves.push({x: piece.x - 50, y: piece.y + 50});
		}
		pieceAt = getPieceAtXY(piece.x + 50, piece.y + 50);
		if(pieceAt != null) {
			if(pieceAt.colour == "white") moves.push({x: piece.x + 50, y: piece.y + 50});
		}
	}
	drawMoves();
}

//Get all possible moves for a rook given its position and the state of the board
function rookMoves(piece) {
	moves = [];
	var pieceAt;
	if(piece.colour == "white") {
		for(let i = piece.x - width; i >= x; i-=width) {
			pieceAt = getPieceAtXY(i, piece.y);
			if(pieceAt != null) {
				if(pieceAt.colour == "black")  {
					moves.push({x: i, y: piece.y});
					break;
				}
				if(pieceAt.colour == "white") break;
			}
			else {
				if(i >= x && i <= x + (7 * width)) moves.push({x: i, y: piece.y});
				else break;
			}
		}
		for(let i = piece.x + width; i <= x + (7 * width); i+=width) {
			pieceAt = getPieceAtXY(i, piece.y);
			if(pieceAt != null) {
				if(pieceAt.colour == "black") {
					moves.push({x: i, y: piece.y});
					break;
				}
				if(pieceAt.colour == "white") break;
			}
			else { 
				if(i >= x && i <= x + (7 * width)) moves.push({x: i, y: piece.y});
				else break;
			}
		}
		for(let i = piece.y - height; i >= y; i-=height) {
			pieceAt = getPieceAtXY(piece.x, i);
			if(pieceAt != null) {
				if(pieceAt.colour == "black") {
					moves.push({x: piece.x, y: i});
					break;
				}
				if(pieceAt.colour == "white") break;
			}
			else { 
				if(i >= y && i <= y + (7 * height)) moves.push({x: piece.x, y: i});
				else break;
			}
		}
		for(let i = piece.y + height; i <= y + (7 * height); i+=height) {
			pieceAt = getPieceAtXY(piece.x, i);
			if(pieceAt != null) {
				if(pieceAt.colour == "black") { 
					moves.push({x: piece.x, y: i});
					break;
				}
				if(pieceAt.colour == "white") break;
			}
			else { 
				if(i >= y && i <= y + (7 * height)) moves.push({x: piece.x, y: i});
				else break;
			}
		}
	}
	
	if(piece.colour == "black") {
		for(let i = piece.x - width; i >= x; i-=width) {
			pieceAt = getPieceAtXY(i, piece.y);
			if(pieceAt != null) {
				if(pieceAt.colour == "white") { 
					moves.push({x: i, y: piece.y});
					break;
				}
				if(pieceAt.colour == "black") break;
			}
			else { 
				if(i >= x && i <= x + (7 * width)) moves.push({x: i, y: piece.y});
				else break;
			}
		}
		for(let i = piece.x + width; i <= x + (7 * width); i+=width) {
			pieceAt = getPieceAtXY(i, piece.y);
			if(pieceAt != null) {
				if(pieceAt.colour == "white") { 
					moves.push({x: i, y: piece.y});
					break;
				}
				if(pieceAt.colour == "black") break;
			}
			else { 
				if(i >= x && i <= x + (7 * width)) moves.push({x: i, y: piece.y});
				else break;
			}
		}
		for(let i = piece.y - height; i >= y; i-=height) {
			pieceAt = getPieceAtXY(piece.x, i);
			if(pieceAt != null) {
				if(pieceAt.colour == "white") { 
					moves.push({x: piece.x, y: i});
					break;
				}
				if(pieceAt.colour == "black") break;
			}
			else { 
				if(i >= y && i <= y + (7 * height)) moves.push({x: piece.x, y: i});
				else break;
			}
		}
		for(let i = piece.y + height; i <= y + (7 * height); i+=height) {
			pieceAt = getPieceAtXY(piece.x, i);
			if(pieceAt != null) {
				if(pieceAt.colour == "white") { 
					moves.push({x: piece.x, y: i});
					break;
				}
				if(pieceAt.colour == "black") break;
			}
			else { 
				if(i >= y && i <= y + (i * height)) moves.push({x: piece.x, y: i});
				else break;
			}
		}
	}
	drawMoves();
}

//Get all possible moves for a knight given its position and the state of the board
function knightMoves(piece) {
	moves = [];
	var pieceAt;
	
	//Two up and one to the right
	pieceAt = getPieceAtXY(piece.x + width, piece.y + (2 * height));
	if(pieceAt != null) {
		if(piece.colour != pieceAt.colour) moves.push({x: piece.x + width, y: piece.y + (2 * height)});
	}
	else {
		if(piece.x + width >= x && piece.x + width <= x + (7 * width) && piece.y + (2 * height) >= y && 
			piece.y + (2 * height) <= y + (7 * height)) { 
			moves.push({x: piece.x + width, y: piece.y + (2 * height)});
		}
	}

	//Two up and one to the left
	pieceAt = getPieceAtXY(piece.x - width, piece.y + (2 * height));
	if(pieceAt != null) {
		if(piece.colour != pieceAt.colour) moves.push({x: piece.x - width, y: piece.y + (2 * height)});
	}
	else {
		if(piece.x - width >= x && piece.x - width <= x + (7 * width) && piece.y + (2 * height) >= y && 
			piece.y  + (2 * height) <= y + (7 * height)) { 
			moves.push({x: piece.x - width, y: piece.y + (2 * height)});
		}
	}

	//One up and two to the right
	pieceAt = getPieceAtXY(piece.x + (2 * width), piece.y + height);
	if(pieceAt != null) {
		if(piece.colour != pieceAt.colour) moves.push({x: piece.x + (2 * width), y: piece.y + height});
	}
	else {
		if(piece.x + (2 * width) >= x && piece.x + (2 * width) <= x + (7 * width) && piece.y + height >= y && 
			piece.y  + height <= y + (7 * height)) { 
			moves.push({x: piece.x + (2 * width), y: piece.y + height});
		}
	}

	//One up and two to the left
	pieceAt = getPieceAtXY(piece.x - (2 * width), piece.y + height);
	if(pieceAt != null) {
		if(piece.colour != pieceAt.colour) moves.push({x: piece.x - (2 * width), y: piece.y + height});
	}
	else {
		if(piece.x - (2 * width) >= x && piece.x - (2 * width) <= x + (7 * width) && piece.y + height >= y && 
			piece.y  + height <= y + (7 * height)) { 
			moves.push({x: piece.x - (2 * width), y: piece.y + height});
		}
	}

	//Two down and one to the right
	pieceAt = getPieceAtXY(piece.x + width, piece.y - (2 * height));
	if(pieceAt != null) {
		if(piece.colour != pieceAt.colour) moves.push({x: piece.x + width, y: piece.y - (2 * height)});
	}
	else {
		if(piece.x + width >= x && piece.x + width <= x + (7 * width) && piece.y - (2 * height) >= y && 
			piece.y  - (2 * height) <= y + (7 * height)) { 
			moves.push({x: piece.x + width, y: piece.y - (2 * height)});
		}
	}

	//Two down and one to the left
	pieceAt = getPieceAtXY(piece.x - width, piece.y - (2 * height));
	if(pieceAt != null) {
		if(piece.colour != pieceAt.colour) moves.push({x: piece.x - width, y: piece.y - (2 * height)});
	}
	else {
		if(piece.x - width >= x && piece.x - width <= x + (7 * width) && piece.y - (2 * height) >= y && 
			piece.y  - (2 * height) <= y + (7 * height)) { 
			moves.push({x: piece.x - width, y: piece.y - (2 * height)});
		}
	}

	//One down and two to the right
	pieceAt = getPieceAtXY(piece.x + (2 * width), piece.y - height);
	if(pieceAt != null) {
		if(piece.colour != pieceAt.colour) moves.push({x: piece.x + (2 * width), y: piece.y - (2 * height)});
	}
	else {
		if(piece.x + (2 * width) >= x && piece.x + (2 * width) <= x + (7 * width) && piece.y - height >= y && 
			piece.y  - height <= y + (7 * height)) { 
			moves.push({x: piece.x + (2 * width), y: piece.y - height});
		}
	}

	//One down and two to the left
	pieceAt = getPieceAtXY(piece.x - (2 * width), piece.y - height);
	if(pieceAt != null) {
		if(piece.colour != pieceAt.colour) moves.push({x: piece.x - (2 * width), y: piece.y - height});
	}
	else {
		if(piece.x - (2 * width) >= x && piece.x - (2 * width) <= x + (7 * width) && piece.y - height >= y && 
			piece.y  - height <= y + (7 * height)) { 
			moves.push({x: piece.x - (2 * width), y: piece.y - height});
		}
	}
	
	drawMoves();
}

//Get all possible moves for a bishop given its position and the state of the board
function bishopMoves(piece) {
	moves = [];
	var pieceAt;
	
	for(let i = 1; i < 8; i++) {
		pieceAt = getPieceAtXY(piece.x + (i * width), piece.y + (i * height));
		if(pieceAt != null) {
			if(piece.colour != pieceAt.colour) { 
				moves.push({x: piece.x + (i * width), y: piece.y + (i * height)});
				break;
			}
			else break;
		}
		else {
			if(piece.x + (i * width) >= x && piece.x + (i * width) <= x + (7 * width) && piece.y + (i * height) >= y
				&& piece.y + (i * height) <= y + (7 * height)) {
					moves.push({x: piece.x + (i * width), y: piece.y + (i * height)});
			}
			else break;
		}
	}
	
	for(let i = 1; i < 8; i++) {
		pieceAt = getPieceAtXY(piece.x - (i * width), piece.y + (i * height));
		if(pieceAt != null) {
			if(piece.colour != pieceAt.colour) { 
				moves.push({x: piece.x - (i * width), y: piece.y + (i * height)});
				break;
			}
			else break;
		}
		else {
			if(piece.x - (i * width) >= x && piece.x - (i * width) <= x + (7 * width) && piece.y + (i * height) >= y
				&& piece.y + (i * height) <= y + (7 * height)) {
					moves.push({x: piece.x - (i * width), y: piece.y + (i * height)});
			}
			else break;
		}
	}
	
	for(let i = 1; i < 8; i++) {
		pieceAt = getPieceAtXY(piece.x + (i * width), piece.y - (i * height));
		if(pieceAt != null) {
			if(piece.colour != pieceAt.colour) { 
				moves.push({x: piece.x + (i * width), y: piece.y - (i * height)});
				break;
			}
			else break;
		}
		else {
			if(piece.x + (i * width) >= x && piece.x + (i * width) <= x + (7 * width) && piece.y - (i * height) >= y
				&& piece.y - (i * height) <= y + (7 * height)) {
					moves.push({x: piece.x + (i * width), y: piece.y - (i * height)});
			}
			else break;
		}
	}
	
	for(let i = 1; i < 8; i++) {
		pieceAt = getPieceAtXY(piece.x - (i * width), piece.y - (i * height));
		if(pieceAt != null) {
			if(piece.colour != pieceAt.colour) { 
				moves.push({x: piece.x - (i * width), y: piece.y - (i * height)});
				break;
			}
			else break;
		}
		else {
			if(piece.x - (i * width) >= x && piece.x - (i * width) <= x + (7 * width) && piece.y - (i * height) >= y
				&& piece.y - (i * height) <= y + (7 * height)) {
					moves.push({x: piece.x - (i * width), y: piece.y - (i * height)});
			}
			else break;
		}
	}
	drawMoves();
}

//Get all possible moves for a queen given its position and the state of the board
function queenMoves(piece) {
	moves = [];
	var pieceAt;
	
	for(let i = 1; i < 8; i++) {
		pieceAt = getPieceAtXY(piece.x + (i * width), piece.y + (i * height));
		if(pieceAt != null) {
			if(piece.colour != pieceAt.colour) { 
				moves.push({x: piece.x + (i * width), y: piece.y + (i * height)});
				break;
			}
			else break;
		}
		else {
			if(piece.x + (i * width) >= x && piece.x + (i * width) <= x + (7 * width) && piece.y + (i * height) >= y
				&& piece.y + (i * height) <= y + (7 * height)) {
					moves.push({x: piece.x + (i * width), y: piece.y + (i * height)});
			}
			else break;
		}
	}
	
	for(let i = 1; i < 8; i++) {
		pieceAt = getPieceAtXY(piece.x - (i * width), piece.y + (i * height));
		if(pieceAt != null) {
			if(piece.colour != pieceAt.colour) { 
				moves.push({x: piece.x - (i * width), y: piece.y + (i * height)});
				break;
			}
			else break;
		}
		else {
			if(piece.x - (i * width) >= x && piece.x - (i * width) <= x + (7 * width) && piece.y + (i * height) >= y
				&& piece.y + (i * height) <= y + (7 * height)) {
					moves.push({x: piece.x - (i * width), y: piece.y + (i * height)});
			}
			else break;
		}
	}
	
	for(let i = 1; i < 8; i++) {
		pieceAt = getPieceAtXY(piece.x + (i * width), piece.y - (i * height));
		if(pieceAt != null) {
			if(piece.colour != pieceAt.colour) { 
				moves.push({x: piece.x + (i * width), y: piece.y - (i * height)});
				break;
			}
			else break;
		}
		else {
			if(piece.x + (i * width) >= x && piece.x + (i * width) <= x + (7 * width) && piece.y - (i * height) >= y
				&& piece.y - (i * height) <= y + (7 * height)) {
					moves.push({x: piece.x + (i * width), y: piece.y - (i * height)});
			}
			else break;
		}
	}
	
	for(let i = 1; i < 8; i++) {
		pieceAt = getPieceAtXY(piece.x - (i * width), piece.y - (i * height));
		if(pieceAt != null) {
			if(piece.colour != pieceAt.colour) { 
				moves.push({x: piece.x - (i * width), y: piece.y - (i * height)});
				break;
			}
			else break;
		}
		else {
			if(piece.x - (i * width) >= x && piece.x - (i * width) <= x + (7 * width) && piece.y - (i * height) >= y
				&& piece.y - (i * height) <= y + (7 * height)) {
					moves.push({x: piece.x - (i * width), y: piece.y - (i * height)});
			}
			else break;
		}
	}
	if(piece.colour == "white") {
		for(let i = piece.x - width; i >= x; i-=width) {
			pieceAt = getPieceAtXY(i, piece.y);
			if(pieceAt != null) {
				if(pieceAt.colour == "black") {
					moves.push({x: i, y: piece.y});
					break;
				}
				if(pieceAt.colour == "white") break;
			}
			else {
				if(i >= x && i <= x + (7 * width)) moves.push({x: i, y: piece.y});
				else break;
			}
		}
		for(let i = piece.x + width; i <= x + (7 * width); i+=width) {
			pieceAt = getPieceAtXY(i, piece.y);
			if(pieceAt != null) {
				if(pieceAt.colour == "black") {
					moves.push({x: i, y: piece.y});
					break;
				}
				if(pieceAt.colour == "white") break;
			}
			else { 
				if(i >= x && i <= x + (7 * width)) moves.push({x: i, y: piece.y});
				else break;
			}
		}
		for(let i = piece.y - height; i >= y; i-=height) {
			pieceAt = getPieceAtXY(piece.x, i);
			if(pieceAt != null) {
				if(pieceAt.colour == "black") {
					moves.push({x: piece.x, y: i});
					break;
				}
				if(pieceAt.colour == "white") break;
			}
			else { 
				if(i >= y && i <= y + (7 * height)) moves.push({x: piece.x, y: i});
				else break;
			}
		}
		for(let i = piece.y + height; i <= y + (7 * height); i+=height) {
			pieceAt = getPieceAtXY(piece.x, i);
			if(pieceAt != null) {
				if(pieceAt.colour == "black") { 
					moves.push({x: piece.x, y: i});
					break;
				}
				if(pieceAt.colour == "white") break;
			}
			else { 
				if(i >= y && i <= y + (7 * height)) moves.push({x: piece.x, y: i});
				else break;
			}
		}
	}
	
	if(piece.colour == "black") {
		for(let i = piece.x - width; i >= x; i-=width) {
			pieceAt = getPieceAtXY(i, piece.y);
			if(pieceAt != null) {
				if(pieceAt.colour == "white") { 
					moves.push({x: i, y: piece.y});
					break;
				}
				if(pieceAt.colour == "black") break;
			}
			else { 
				if(i >= x && i <= x + (7 * width)) moves.push({x: i, y: piece.y});
				else break;
			}
		}
		for(let i = piece.x + width; i <= x + (7 * width); i+=width) {
			pieceAt = getPieceAtXY(i, piece.y);
			if(pieceAt != null) {
				if(pieceAt.colour == "white") { 
					moves.push({x: i, y: piece.y});
					break;
				}
				if(pieceAt.colour == "black") break;
			}
			else { 
				if(i >= x && i <= x + (7 * width)) moves.push({x: i, y: piece.y});
				else break;
			}
		}
		for(let i = piece.y - height; i >= y; i-=height) {
			pieceAt = getPieceAtXY(piece.x, i);
			if(pieceAt != null) {
				if(pieceAt.colour == "white") { 
					moves.push({x: piece.x, y: i});
					break;
				}
				if(pieceAt.colour == "black") break;
			}
			else { 
				if(i >= y && i <= y + (7 * height)) moves.push({x: piece.x, y: i});
				else break;
			}
		}
		for(let i = piece.y + height; i <= y + (7 * height); i+=height) {
			pieceAt = getPieceAtXY(piece.x, i);
			if(pieceAt != null) {
				if(pieceAt.colour == "white") { 
					moves.push({x: piece.x, y: i});
					break;
				}
				if(pieceAt.colour == "black") break;
			}
			else { 
				if(i >= y && i <= y + (i * height)) moves.push({x: piece.x, y: i});
				else break;
			}
		}
	}
	drawMoves();
}

//Get all possible moves for a king given its position and the state of the board
function kingMoves(piece) {
	moves = [];
	var pieceAt;
	
	pieceAt = getPieceAtXY(piece.x + width, piece.y);
	if(pieceAt != null) {
		if(piece.colour != pieceAt.colour) moves.push({x: piece.x + width, y: piece.y});
	}
	else {
		if(piece.x + width >= x && piece.x + width <= x + (7 * width)) moves.push({x: piece.x + width, y: piece.y});
	}
	
	pieceAt = getPieceAtXY(piece.x - width, piece.y);
	if(pieceAt != null) {
		if(piece.colour != pieceAt.colour) moves.push({x: piece.x - width, y: piece.y});
	}
	else {
		if(piece.x - width >= x && piece.x - width <= x + (7 * width)) moves.push({x: piece.x - width, y: piece.y});
	}
	
	pieceAt = getPieceAtXY(piece.x, piece.y + height);
	if(pieceAt != null) {
		if(piece.colour != pieceAt.colour) moves.push({x: piece.x, y: piece.y + height});
	}
	else {
		if(piece.y + height >= y && piece.y + height <= y + (7 * height)) moves.push({x: piece.x, y: piece.y + height});
	}
	
	pieceAt = getPieceAtXY(piece.x, piece.y - height);
	if(pieceAt != null) {
		if(piece.colour != pieceAt.colour) moves.push({x: piece.x, y: piece.y - height});
	}
	else {
		if(piece.y - height >= y && piece.y - height <= y + (7 * height)) moves.push({x: piece.x, y: piece.y - height});
	}
	
	pieceAt = getPieceAtXY(piece.x + width, piece.y + height);
	if(pieceAt != null) {
		if(piece.colour != pieceAt.colour) moves.push({x: piece.x + width, y: piece.y + height});
	}
	else {
		if(piece.x + width >= x && piece.x + width <= x + (7 * width) && piece.y + height >= y 
			&& piece.y + height <= y + (7 * height))
			moves.push({x: piece.x + width, y: piece.y + height});
	}
	
	pieceAt = getPieceAtXY(piece.x + width, piece.y - height);
	if(pieceAt != null) {
		if(piece.colour != pieceAt.colour) moves.push({x: piece.x + width, y: piece.y - height});
	}
	else {
		if(piece.x + width >= x && piece.x + width <= x + (7 * width) && piece.y - height >= y 
			&& piece.y - height <= y + (7 * height))
			moves.push({x: piece.x + width, y: piece.y - height});
	}
	
	pieceAt = getPieceAtXY(piece.x - width, piece.y - height);
	if(pieceAt != null) {
		if(piece.colour != pieceAt.colour) moves.push({x: piece.x - width, y: piece.y - height});
	}
	else {
		if(piece.x - width >= x && piece.x - width <= x + (7 * width) && piece.y - height >= y 
			&& piece.y - height <= y + (7 * height))
			moves.push({x: piece.x - width, y: piece.y - height});
	}
	
	pieceAt = getPieceAtXY(piece.x - width, piece.y + height);
	if(pieceAt != null) {
		if(piece.colour != pieceAt.colour) moves.push({x: piece.x - width, y: piece.y + height});
	}
	else {
		if(piece.x - width >= x && piece.x - width <= x + (7 * width) && piece.y + height >= y 
			&& piece.y + height <= y + (7 * height))
			moves.push({x: piece.x - width, y: piece.y + height});
	}
	drawMoves();
}

//Draw all the possible moves for a selected piece onto the board	
function drawMoves() {
	drawCanvas();
	var context = canvas.getContext('2d');
	for(let i = 0; i < moves.length; i++) {
		context.fillStyle = "LawnGreen";
		context.fillRect(moves[i].x + 1, moves[i].y + 1, width - 2, height - 2);
		for(let j = 0; j < whitePieces.length; j++) {
			if(whitePieces[j].x == moves[i].x && whitePieces[j].y == moves[i].y) {
				context.font = '36px Georgia';
				context.textAlign = 'center';
				context.fillStyle = "White";
				context.fillText(whitePieces[j].avatar, whitePieces[j].x + (width / 2), whitePieces[j].y + 37);
			}
		}
		for(let j = 0; j < blackPieces.length; j++) {
			if(blackPieces[j].x == moves[i].x && blackPieces[j].y == moves[i].y) {
				context.font = '36px Georgia';
				context.textAlign = 'center';
				context.fillStyle = "Black";
				context.fillText(blackPieces[j].avatar, blackPieces[j].x + (width / 2), blackPieces[j].y + 37);
			}
		}
	}
}

//Request that the server grant permission to control white pieces
function controlWhite() {
	var message = {};
	message.id = id;
	message.colour = 'White';
	ws.send(JSON.stringify(message));
}

//Request that the server grant permission to control black pieces
function controlBlack() {
	var message = {};
	message.id = id;
	message.colour = 'Black';
	ws.send(JSON.stringify(message));
}

//Request that the server start a new match
function newGame() {
	var message = 'New Game';
	ws.send(message);
}

//Request that the server load the most recently saved match
function loadGame() {
	var message = 'Load Game';
	ws.send(message);
}

//Request that the server save the current match
function saveGame() {
	var message = 'Save Game';
	ws.send(message);
}

//Listener for server responses
ws.onmessage = function(message) {
	var responseObject = JSON.parse(message.data);
	if(responseObject.id) id = responseObject.id;
	if(responseObject.white) whitePieces = responseObject.white;
	if(responseObject.black) blackPieces = responseObject.black;
	if(responseObject.control) {
		if(responseObject.control == "Controlling white") {
			controllingWhite = true;
			controllingBlack = false;
			alert("Controlling white pieces");
		}
		else if(responseObject.control == "Controlling black") {
			controllingBlack = true;
			controllingWhite = false;
			alert("Controlling black pieces");
		}
		else {}
	}
	if(responseObject.state) alert(responseObject.state);
	drawCanvas();
	if(responseObject.over) alert(responseObject.over);
};

//Things to do when the page loads	
document.addEventListener('DOMContentLoaded', function() {
	//Add a mouse listener for moves
	document.getElementById('canvas1').addEventListener('mousedown', mouseDown = function(event) { requestMove(event); });
	//Draw the board
	drawCanvas();
});
