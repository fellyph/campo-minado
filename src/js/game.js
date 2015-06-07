var gameConfig = {
		    level: [{
		        rows: 8,
		        cols: 8,
		        bombsNum: 10
		    }, {
		        rows: 12,
		        cols: 12,
		        bombsNum: 25
		    }, {
		        rows: 18,
		        cols: 18,
		        bombsNum: 40
		    }],
		    currentLevel: 0,
		    width: 50,
		    height: 50,
		    spaceBox: 3,
		    color: '#333333',
		    bombsList: [],
		    flagsNum: 0,
		    clickedNum: 0,
		    map: [],
		    loadedGame: false,
		    totalBlocks: 0
		},
    ctx,
    canvas,
    countrows = 0,
    countcols = 0,
    mouseX,
    mouseY,
    youlose = false,
    timer,
    seconds = 0,
    btnsLevel,
    timerStarted = false,
    btSave,
    btLoad,
    btNew,
    boxesToCheck = [
		    [1, 1],
		    [0, 1],
		    [-1, 1],
		    [-1, 0],
		    [-1, -1],
		    [0, -1],
		    [1, -1],
		    [1, 0]
		],
            clickedBases = [];


// add the listener to check if the page is loaded

window.addEventListener('load', function () {
		    canvas = document.getElementById('my-canvas');
			ctx = canvas.getContext('2d');
		    
			// cache the buttons
			btLoad = document.getElementById('bt-load');
		   	btSave = document.getElementById('bt-save');
			btNew =  document.getElementById('bt-new');
			
			//check if localStorage has a level saved
			if (localStorage.getItem('currentLevel')) {
		        gameConfig.currentLevel = localStorage.getItem('currentLevel');
		        initGame(gameConfig.currentLevel);
		        document.getElementsByClassName('set-level')[gameConfig.currentLevel].className = 'set-level current';
		    } else {
		        initGame(0);
		        document.getElementsByClassName('set-level')[0].className = 'set-level current';
		    }
			
		    if (localStorage.getItem('oldgame')) {
		        btLoad.addEventListener('click', loadGame);
		    } else {
		        btLoad.disabled = true;
		    }
		    
			btnsLevel = document.getElementsByClassName('set-level');
		    
			for (var i = 0; i < btnsLevel.length; i++) {
		        btnsLevel[i].addEventListener('click', selectLevel);
		    }
		    
			btSave.addEventListener('click', saveGame);
		    btNew.addEventListener('click', selectLevel);
		});

		function loadGame(e) {

		    var oldGame = JSON.parse(localStorage.getItem('oldgame'));

		    initGame(oldGame.level);
		    
			gameConfig.map = oldGame.map;
		    gameConfig.bombsList = oldGame.bombsList;
		    gameConfig.clickedNum = oldGame.clickedNum;
		    gameConfig.flagsNum = oldGame.flagsNum;
		    gameConfig.loadedGame = true;
			
			seconds = oldGame.seconds;
			document.getElementById('timer').innerHTML = 'Timer: ' + seconds;
		    
			
		    var totalCols = gameConfig.level[gameConfig.currentLevel].cols;
		    var totalRows = gameConfig.level[gameConfig.currentLevel].rows;

		    for (var i = 0; i < totalRows; i++) {
		        for (var j = 0; j < totalCols; j++) {
		            if (gameConfig.map[i][j].clicked === true) {
		                clearBox(i * gameConfig.width, j * gameConfig.height, gameConfig.map[i][j].nearBombs);
		            }

		            if (gameConfig.map[i][j].haveFlag === true) {
		                addFlag(i * gameConfig.width, j * gameConfig.height);
		            }
		        }
		    }
		}

		function selectLevel(event) {
		   
			var current;
		    if (this.dataset.level) {
		        current = this.dataset.level;
		        localStorage.setItem('currentLevel', current);
		    } else {
		        current = gameConfig.currentLevel;
		    }

		    initGame(current);

		    for (var i = 0; i < btnsLevel.length; i++) {
		        btnsLevel[i].className = 'set-level';
		    }
			
		    btnsLevel[current].className = 'set-level current';
		}

		function tryCheat(event) {
		    if ((gameConfig.bombsList.length - gameConfig.flagsNum) === 0) {
		        var countCheat = 0;
		        for (var bomb in gameConfig.bombsList) {
		            if (gameConfig.map[gameConfig.bombsList[bomb][0]][gameConfig.bombsList[bomb][1]].haveFlag) {
		                countCheat++;
		            }
		        }

		        if (gameConfig.bombsList.length == countCheat) {
		            youWin();
		        } else {
		            gameOver();
		        }
		    }
		}
		
	function onClickGame(e) {
			mouseX = e.pageX - e.target.offsetLeft;
		    mouseY = e.pageY - e.target.offsetTop;

		    if (!timerStarted) {
		        timer = setInterval(countTimer, 1000);
		        timerStarted = true;
		    }

		    clickedX = Math.floor(mouseX / gameConfig.width);
		    clickedY = Math.floor(mouseY / gameConfig.height);

		    if (gameConfig.map[clickedX][clickedY].haveBomb === true) {
		        gameOver();
		    } else if (gameConfig.map[clickedX][clickedY].clicked === false && !youlose) {
		        gameConfig.map[clickedX][clickedY].clicked = true;
		        youStillAlive(clickedX, clickedY);
		        btSave.disabled = false;
		    }
		}

		function onRightClickGame(event) {
		    event.preventDefault();

		    if (!timerStarted) {
		        timer = setInterval(countTimer, 1000);
		        timerStarted = true;
		    }
			
		    mouseX = event.pageX - event.target.offsetLeft;
		    mouseY = event.pageY - event.target.offsetTop;
		    totalBombs = gameConfig.bombsList.length;

		    clickedXFlag = Math.floor(mouseX / gameConfig.width);
		    clickedYFlag = Math.floor(mouseY / gameConfig.height);
		    if (!gameConfig.map[clickedXFlag][clickedYFlag].clicked) {

		        if (!gameConfig.map[clickedXFlag][clickedYFlag].haveFlag && gameConfig.flagsNum < totalBombs) {
		            addFlag(clickedXFlag * gameConfig.width, clickedYFlag * gameConfig.height);
		            gameConfig.map[clickedXFlag][clickedYFlag].haveFlag = true;
		            gameConfig.flagsNum++;
		            if (gameConfig.flagsNum + gameConfig.clickedNum == gameConfig.totalBlocks) {
		                youWin();
		            }
		        } else {
		            removeFlag(clickedXFlag * gameConfig.width, clickedYFlag * gameConfig.height);
		            gameConfig.map[clickedXFlag][clickedYFlag].haveFlag = false;
		            gameConfig.flagsNum--;
		        }
		        document.getElementById('flags').innerHTML = 'FLAGS: ' + (totalBombs - gameConfig.flagsNum);
		    }

		}

		function youWin() {
		    clearInterval(timer);
		    localStorage.clear();
		    document.getElementById('game').className += ' you-win';
		    btSave.disabled = true;
		    document.getElementsByClassName('title-game')[0].innerHTML = 'YOU WIN!';
		}

		function addFlag(x, y) {
			
		    ctx.beginPath();
		    ctx.lineWidth = 3;
		    ctx.strokeStyle = '#ffffff';
		    ctx.moveTo(x + 4, y + 4);
		    ctx.lineTo(x + 4, y + gameConfig.height - 4);
		    ctx.stroke();
		    ctx.closePath();
			ctx.beginPath();
		    ctx.moveTo(x + 8, y + 5);
		    ctx.lineTo(x + gameConfig.width - 8, y + gameConfig.height / 4);
		    ctx.lineTo(x + 8, y + gameConfig.height / 2);
		    ctx.lineTo(x + 8, y + 5);
		    ctx.fillStyle = ctx.strokeStyle = '#ff0000';
		    ctx.fill();
		    ctx.stroke();
		}

		function removeFlag(x, y) {
		    ctx.beginPath();
		    ctx.lineWidth = 1;
		    ctx.rect(x, y, gameConfig.width, gameConfig.height);
		    ctx.strokeStyle = '#ffffff';
		    ctx.fillStyle = gameConfig.color;
		    ctx.fill();
		    ctx.stroke();
		}


		
		function initGame(level) {
		    gameConfig.currentLevel = level;
		    gameConfig.map = [];
		    gameConfig.flagsNum = 0;
		    gameConfig.clickedNum = 0;
		    document.getElementById('game').className = 'container';
		    document.getElementsByClassName('title-game')[0].innerHTML = 'Minesweeper';
		    btSave.disabled = true;
		    
			youlose = false;

		    canvas.width = gameConfig.width * gameConfig.level[gameConfig.currentLevel].cols;
		    canvas.height = gameConfig.height * gameConfig.level[gameConfig.currentLevel].rows;

		    document.getElementById('flags').innerHTML = 'Flags: ' + gameConfig.level[gameConfig.currentLevel].bombsNum;

		    if (timerStarted) {
		        clearInterval(timer);
		        timerStarted = false;
		        seconds = 0;
		        document.getElementById('timer').innerHTML = 'Timer: 0';
		    }

		    drawStage();
		    sortBombs();
		    canvas.addEventListener('click', onClickGame);
		    canvas.addEventListener('contextmenu', onRightClickGame);
		    document.getElementById('smile').addEventListener('click', tryCheat);
		}

		function countTimer() {
		    seconds++;
		    document.getElementById('timer').innerHTML = 'Timer: ' + seconds;
		}

		function sortBombs() {
		    gameConfig.bombsList = [];

		    while (gameConfig.bombsList.length < gameConfig.level[gameConfig.currentLevel].bombsNum) {
		        var randomX = Math.floor(Math.random() * gameConfig.level[gameConfig.currentLevel].cols);
		        var randomY = Math.floor(Math.random() * gameConfig.level[gameConfig.currentLevel].rows);
		       
		        if (gameConfig.map[randomX][randomY].haveBomb !== true) {
		            gameConfig.map[randomX][randomY].haveBomb = true;
		            gameConfig.bombsList.push([randomX, randomY]);
		        }
		    }
		}

		function gameOver() {
		    youlose = true;
		    
            if (gameConfig.loadedGame === true) {
		        localStorage.removeItem('oldgame');
		        gameConfig.loadedGame = false;
		        btLoad.disabled = true;
		    }
            
		    clearInterval(timer);
		    
            for (var i = 0; i < gameConfig.bombsList.length; i++) {
		        var x = gameConfig.bombsList[i][0] * gameConfig.width;
		        var y = gameConfig.bombsList[i][1] * gameConfig.height;
		        ctx.fillStyle = '#DD0000';
		        ctx.fillRect(x, y, gameConfig.width, gameConfig.height);
		    }
			document.getElementById('game').className += ' game-over';
		    document.getElementsByClassName('title-game')[0].innerHTML = 'GAMER OVER';
		    btSave.disabled = true;
		}

		function youStillAlive(x, y) {
		    var numOfNearBombs = 0;

		    for (var i in boxesToCheck) {
		        for (var j = 0; j < gameConfig.level[gameConfig.currentLevel].bombsNum; j++) {
		            if (checkBase(j, x + boxesToCheck[i][0], y + boxesToCheck[i][1])) {
		                numOfNearBombs++;
		            }
		        }
		    }

		    gameConfig.map[x][y].nearBombs = numOfNearBombs;
		    gameConfig.map[x][y].clicked = true;
		    gameConfig.clickedNum++;
			

		    if (gameConfig.flagsNum + gameConfig.clickedNum == gameConfig.totalBlocks) {
		        youWin();
		    }

		    clearBox(x * gameConfig.width, y * gameConfig.height, numOfNearBombs);

		    // check other box without nearBombs
		    if (numOfNearBombs === 0) {
		        for (var index in boxesToCheck) {
		            if (x + boxesToCheck[index][0] >= 0 &&
		                x + boxesToCheck[index][0] < gameConfig.level[gameConfig.currentLevel].cols &&
		                y + boxesToCheck[index][1] >= 0 &&
		                y + boxesToCheck[index][1] < gameConfig.level[gameConfig.currentLevel].rows) {
		                var nextX = x + boxesToCheck[index][0];
		                var nextY = y + boxesToCheck[index][1];

		                if (!gameConfig.map[nextX][nextY].clicked) {
		                    youStillAlive(nextX, nextY);
		                }
		            }
		        }
		    }
		}

		//clear area and show number
		function clearBox(x, y, num) {
		    ctx.clearRect(x, y, gameConfig.width, gameConfig.height);
		    ctx.fillStyle = '#000000';
		    ctx.font = '20px Arial';
		    ctx.fillText(num, x + gameConfig.width * 0.4, y + gameConfig.height * 0.7);
		}
		
		//checkBase: check for bomb on current base
		function checkBase(i, x, y) {
		    if (gameConfig.bombsList[i][0] == x && gameConfig.bombsList[i][1] == y) {
		        return true;
		    } else {
		        return false;
		    }
		}

		//drawStage : this function draw all the blocks on this stage
		
		function drawStage() {
		    ctx.clearRect(0, 0, canvas.width, canvas.height);
		    var totalCols = gameConfig.level[gameConfig.currentLevel].cols;
		    var totalRows = gameConfig.level[gameConfig.currentLevel].rows;

		    gameConfig.totalBlocks = totalCols * totalRows;

		    for (var i = 0; i < totalRows; i++) {
		        var arrayCols = [];

		        for (var j = 0; j < totalCols; j++) {
		            arrayCols[j] = {
		                clicked: false,
		                haveBomb: false,
		                nearBombs: 0,
		                haveFlag: false
		            };
                    
		            var x = j * (gameConfig.width);
		            var y = i * (gameConfig.height);

		            ctx.beginPath();
		            ctx.lineWidth = 1;
		            ctx.rect(x, y, gameConfig.width, gameConfig.height);
		            ctx.strokeStyle = '#ffffff';
		            ctx.fillStyle = gameConfig.color;
		            ctx.fill();
		            ctx.stroke();

		        }
		        gameConfig.map[i] = arrayCols;
		    }

		}

		//drawStage: end

		
		/* saveGame: this function will save before you finish the game all properties about the game: the level, the map with open blocks, the bombs position, the current time, the number of flags  
		*/
		function saveGame(event) {
		    if (!youlose) {
		        var oldGame = {
		            level: gameConfig.currentLevel,
		            map: gameConfig.map,
		            bombsList: gameConfig.bombsList,
		            seconds: seconds,
		            clickedNum: gameConfig.clickedNum,
		            flagsNum: gameConfig.flagsNum
		        };
				
		        localStorage.setItem('oldgame', JSON.stringify(oldGame));
		        btLoad.disabled = false;
				btLoad.addEventListener('click', loadGame);
		    }
		}
		//saveGame: end