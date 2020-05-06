//Container for the white pieces
var whitePieces = [];

//Container for white pieces in their new game state
var newGameWPieces = [];
newGameWPieces.push({type: "pawn", colour: "white", avatar: "P", x: 400, y: 350});
newGameWPieces.push({type: "pawn", colour: "white", avatar: "P", x: 450, y: 350}); 
newGameWPieces.push({type: "pawn", colour: "white", avatar: "P", x: 500, y: 350}); 
newGameWPieces.push({type: "pawn", colour: "white", avatar: "P", x: 550, y: 350}); 
newGameWPieces.push({type: "pawn", colour: "white", avatar: "P", x: 600, y: 350}); 
newGameWPieces.push({type: "pawn", colour: "white", avatar: "P", x: 650, y: 350}); 
newGameWPieces.push({type: "pawn", colour: "white", avatar: "P", x: 700, y: 350}); 
newGameWPieces.push({type: "pawn", colour: "white", avatar: "P", x: 750, y: 350});

newGameWPieces.push({type: "rook", colour: "white", avatar: "R", x: 400, y: 400}); 
newGameWPieces.push({type: "knight", colour: "white", avatar: "Kn", x: 450, y: 400}); 
newGameWPieces.push({type: "bishop", colour: "white", avatar: "B", x: 500, y: 400}); 
newGameWPieces.push({type: "king", colour: "white", avatar: "K", x: 550, y: 400}); 
newGameWPieces.push({type: "queen", colour: "white", avatar: "Q", x: 600, y: 400}); 
newGameWPieces.push({type: "bishop", colour: "white", avatar: "B", x: 650, y: 400}); 
newGameWPieces.push({type: "knight", colour: "white", avatar: "Kn", x: 700, y: 400}); 
newGameWPieces.push({type: "rook", colour: "white", avatar: "R", x: 750, y: 400});   

//Container for the black pieces
var blackPieces = [];

//Container for black pieces in their new game state
var newGameBPieces = [];
newGameBPieces.push({type: "pawn", colour: "black", avatar: "P", x: 400, y: 100});
newGameBPieces.push({type: "pawn", colour: "black", avatar: "P", x: 450, y: 100}); 
newGameBPieces.push({type: "pawn", colour: "black", avatar: "P", x: 500, y: 100}); 
newGameBPieces.push({type: "pawn", colour: "black", avatar: "P", x: 550, y: 100}); 
newGameBPieces.push({type: "pawn", colour: "black", avatar: "P", x: 600, y: 100}); 
newGameBPieces.push({type: "pawn", colour: "black", avatar: "P", x: 650, y: 100}); 
newGameBPieces.push({type: "pawn", colour: "black", avatar: "P", x: 700, y: 100}); 
newGameBPieces.push({type: "pawn", colour: "black", avatar: "P", x: 750, y: 100});

newGameBPieces.push({type: "rook", colour: "black", avatar: "R", x: 400, y: 50}); 
newGameBPieces.push({type: "knight", colour: "black", avatar: "Kn", x: 450, y: 50}); 
newGameBPieces.push({type: "bishop", colour: "black", avatar: "B", x: 500, y: 50}); 
newGameBPieces.push({type: "king", colour: "black", avatar: "K", x: 600, y: 50}); 
newGameBPieces.push({type: "queen", colour: "black", avatar: "Q", x: 550, y: 50}); 
newGameBPieces.push({type: "bishop", colour: "black", avatar: "B", x: 650, y: 50}); 
newGameBPieces.push({type: "knight", colour: "black", avatar: "Kn", x: 700, y: 50}); 
newGameBPieces.push({type: "rook", colour: "black", avatar: "R", x: 750, y: 50});

//Hold the IDs of clients who control white pieces
var controlsWhite = [];
//Holds the IDs of clients who control black pieces
var controlsBlack = [];

//The clients connected to the server
var clients = [];
//The number of clients connected to the server
var numClients = 0;

//My module
var cm = require('chessmoves');

var fs = require('fs');

var http = require('http');
var socketServer = require('ws').Server;
var ecStatic = require('ecstatic');

var server = http.createServer(ecStatic({root:__dirname + '/html'}));
var wss = new socketServer({server: server});
wss.on('connection', function(ws) {
	console.log('Client connected');
	numClients++;
	clients.push({client: ws, id: numClients});
	var msg = {}
	msg.id = numClients;
	ws.send(JSON.stringify(msg));
	ws.on('message', function(msg) {
		//A client has requested to begin a new match
		if(msg == "New Game") {
			//Set all the pieces to their new game state
			whitePieces = JSON.parse(JSON.stringify(newGameWPieces));
			blackPieces = JSON.parse(JSON.stringify(newGameBPieces));
			//Send the pieces to the clients
			broadcastPieces();
		}
		//A client has requested to load the most recently saved match
		else if(msg == "Load Game") {
			fs.readFile('save.txt', function(err, data) {
				if(err) {
					var returnObj = {};
					returnObj.state = "Could not load match.";
					wss.clients.forEach(function(client) {
						client.send(JSON.stringify(returnObj));
					});
				}
				whitePieces = [];
				blackPieces = [];
				var pieces = data.toString().split("\n");
				for(let i = 0; i < pieces.length; i++) {
					var data = pieces[i].split(" ");
					if(data[1] == "white")
						whitePieces.push({type: data[0], colour: data[1], avatar: data[2], x: parseInt(data[3]), 
							y: parseInt(data[4])});
					else 
						blackPieces.push({type: data[0], colour: data[1], avatar: data[2], x: parseInt(data[3]), 
							y: parseInt(data[4])});
				}
				blackPieces.pop();
			});
			broadcastPieces();
		}
		//A client has requested to save the current match
		else if(msg == "Save Game") {
			var returnObj = {};
			var file = fs.createWriteStream('save.txt');
			//Catch any errors and alert the clients of the error
			file.on('error', function(error) {
				returnObj.state = "Failed to save match.";
				wss.clients.forEach(function(client) {
					client.send(JSON.stringify(returnObj));
				});
			});
			//Write all of the white pieces to the file
			for(let i = 0; i < whitePieces.length; i++) {
				file.write(whitePieces[i].type + " " + whitePieces[i].colour + " " + whitePieces[i].avatar + " " 
				+ whitePieces[i].x + " " + whitePieces[i].y);
				file.write("\r\n");
			}
			//Write all of the black pieces to the file
			for(let i = 0; i < blackPieces.length; i++) {
				file.write(blackPieces[i].type + " " + blackPieces[i].colour + " " + blackPieces[i].avatar + " " 
				+ blackPieces[i].x + " " + blackPieces[i].y);
				file.write("\r\n");
			}
			file.end;
			returnObj.state = "Match saved.";
			//Inform all the clients that the match has been saved
			wss.clients.forEach(function(client) {
				client.send(JSON.stringify(returnObj));
			});
		}
		else {
			data = JSON.parse(msg);
			//The client has requested control of a set of chess pieces
			if(data.colour && data.id) {
				var msg = {};
				//If they have requested white assign them to white and remove them from black if necessary
				if(data.colour == "White") {
					if(controlsWhite.indexOf(data.id) < 0) controlsWhite.push(data.id);
					if(controlsBlack.indexOf(data.id) >= 0) controlsBlack.splice(controlsBlack.indexOf(data.id), 1);
					msg.control = "Controlling white";
				}
				//If they have requested black assign them to black and remove them from white if necessary
				else if(data.colour == "Black") {
					if(controlsBlack.indexOf(data.id) < 0) controlsBlack.push(data.id);
					if(controlsWhite.indexOf(data.id) >= 0) controlsWhite.splice(controlsWhite.indexOf(data.id), 1);
					msg.control = "Controlling black";
				}
				else {
					msg.control = "Error";
				}
				var client;
				//Update the client on the permission change
				for(let i = 0; i < clients.length; i++) {
					if(clients[i].id == data.id) client = clients[i].client;
				}
				client.send(JSON.stringify(msg));
			}
			//The client has requested to move a chess piece
			if(data.piece && data.x && data.y) {
				//Piece they wish to move
				var pieceToMove;
				//Piece to remove if there is one at the target location
				var pieceToRemove;
				
				if(data.piece.colour == "white") {
					//Get the piece they wish to move
					for(let i = 0; i < whitePieces.length; i++) {
						if(JSON.stringify(whitePieces[i]) === JSON.stringify(data.piece)) {
							pieceToMove = i;
						}
					}
					//Get the piece to remove if there is one
					for(let i = 0; i < blackPieces.length; i++) {
						if(blackPieces[i].x == data.x && blackPieces[i].y == data.y) {
							pieceToRemove = i;
						}
					}
					//Update the location of the piece to move
					if(pieceToMove != null) { 
						whitePieces[pieceToMove].x = data.x;
						whitePieces[pieceToMove].y = data.y;
					}
					//Delete the piece to remove from its array
					if(pieceToRemove != null) {
						var removedPiece = JSON.parse(JSON.stringify(blackPieces[pieceToRemove]));
						blackPieces.splice(pieceToRemove, 1);
					}
					//If the piece is a pawn and has reached the other side of the board promote it to a queen
					if(whitePieces[pieceToMove].type == "pawn" && whitePieces[pieceToMove].y == 50) {
						whitePieces[pieceToMove].type = "queen";
						whitePieces[pieceToMove].avatar = "Q";
					}
					//If a piece was removed and it was the king end the game
					if(pieceToRemove != null && removedPiece.type == "king") {
						gameOver("White");
					}
				}
				if(data.piece.colour == "black") {
					for(let i = 0; i < blackPieces.length; i++) {
						if(JSON.stringify(blackPieces[i]) === JSON.stringify(data.piece)) {
							pieceToMove = i;
						}
					}
					for(let i = 0; i < whitePieces.length; i++) {
						if(whitePieces[i].x == data.x && whitePieces[i].y == data.y) {
							pieceToRemove = i;
						}
					}
					if(pieceToMove != null) { 
						blackPieces[pieceToMove].x = data.x;
						blackPieces[pieceToMove].y = data.y;
					}
					if(pieceToRemove != null) {
						var removedPiece = JSON.parse(JSON.stringify(whitePieces[pieceToRemove]));
						whitePieces.splice(pieceToRemove, 1);
					}
					if(blackPieces[pieceToMove].type == "pawn" && blackPieces[pieceToMove].y == 350) {
						blackPieces[pieceToMove].type = "queen";
						blackPieces[pieceToMove].avatar = "Q";
					}
					if(pieceToRemove != null && removedPiece.type == "king") {
						gameOver("Black");
					}
				}
				//Send the updated piece arrays to the clients
				broadcastPieces();
			}
		}
	});
});

//Sends the current version of the board to all the clients
function broadcastPieces() {
	var msg = {};
	msg.white = whitePieces;
	msg.black = blackPieces;
	wss.clients.forEach(function(client) {
		client.send(JSON.stringify(msg));
	});
}

//Alerts all clients that game has ended
function gameOver(colour) {
	var msg = {};
	msg.over = colour + " has won!";
	msg.white = whitePieces;
	msg.black = blackPieces;
	wss.clients.forEach(function(client) {
		client.send(JSON.stringify(msg));
	});
}

server.listen(3000);
console.log('Server Running at http://127.0.0.1:3000  CNTL-C to quit');