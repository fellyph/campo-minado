	
	var gameConfig = { 
			level:[
				{
					rows:8,
					cols:8,
					bombsNum:10
				},
				{	
					rows:12,
					cols:12,
					bombsNum:30
				},
				{	
					rows:18,
					cols:18,
					bombsNum:50
				}],
			currentLevel:1,
			width:50,
			height:50,
			spaceBox:3,
			color:"#000000",
			bombsList:[]
	}
		
		var ctx,
			canvas,
			countrows = 0,
			countcols = 0,
			mouseX,
			mouseY,
			youlose = false;
			
		var boxesToCheck = [
				[1,1],
				[0,1],
				[-1,1],
				[-1,0],
				[-1,-1],
				[0,-1],
				[1,-1],
				[1,0]
			],
			clickedBases = [];
			
		window.addEventListener("load",function(){
			 canvas = document.getElementById("my-canvas");
			 ctx = canvas.getContext("2d");
			 canvas.width = gameConfig.width * gameConfig.level[gameConfig.currentLevel].cols;
			 canvas.height = gameConfig.height * gameConfig.level[gameConfig.currentLevel].rows;
			 initGame()
		})
		
		function onClickGame(e){
			mouseX = e.offsetX;
			mouseY = e.offsetY;
			
			clickedX = Math.floor(mouseX/gameConfig.width);
			clickedY = Math.floor(mouseY/gameConfig.height);
			console.log(clickedX + "," + clickedY);
			
			for(var i = 0; i< gameConfig.level[gameConfig.currentLevel].bombsNum; i++){
				if(clickedX == gameConfig.bombsList[i][0] && clickedY == gameConfig.bombsList[i][1]){
					gameOver()
				}
			}
				
			if(youlose == false){
				console.log("you live")
				youStillAlive()
			}
		}
	
		function initGame(){
			drawStage();
			sortBombs();
			canvas.addEventListener("click", onClickGame);
		}
		
		function sortBombs(){
			for(var i=0 ; i < gameConfig.level[gameConfig.currentLevel].bombsNum; i++){
				gameConfig.bombsList.push([
					Math.floor(Math.random()*gameConfig.level[gameConfig.currentLevel].cols),
					Math.floor(Math.random()*gameConfig.level[gameConfig.currentLevel].rows)
					])
			}
		}
		
		function gameOver(){
			console.log("you died")
			youlose = true;
			
			for(i = 0; i < gameConfig.bombsList.length; i++){
				var x = gameConfig.bombsList[i][0] * gameConfig.width;
				var y = gameConfig.bombsList[i][1] * gameConfig.height;
				ctx.fillStyle = "#DD0000";
				ctx.fillRect(x,y,gameConfig.width,gameConfig.height);
			}
			
			document.getElementById("game").className += " gameover";
		}
		
		function youStillAlive(){
			var numOfNearBombs = 0;
			
			for(i in boxesToCheck){
				for( j = 0; j < gameConfig.level[gameConfig.currentLevel].bombsNum; j++){
					if(checkBase(j, clickedX + boxesToCheck[i][0], clickedY + boxesToCheck[i][1])){
						numOfNearBombs++;
					}
				}
			}
			
			clearBox(clickedX*gameConfig.width,clickedY*gameConfig.height,numOfNearBombs)
			clickedBases[(clickedBases.length)]  = [clickedX,clickedY,numOfNearBombs];
		}
		
		function clearBox(x,y,num){
		 	ctx.clearRect(x,y,gameConfig.width,gameConfig.height);
		 	ctx.fillStyle= "#000000";
		 	ctx.font = "20px Arial";
			ctx.fillText(num,x+gameConfig.width*0.4,y+gameConfig.height*0.7);	
		}
		
		function checkBase(i,x,y){
			if(gameConfig.bombsList[i][0] == x && gameConfig.bombsList[i][1] ==y){
				return true;
			}else{
				return false;
			}
		}
		
		function drawStage(){
			ctx.clearRect(0,0,400,600);
			var total = gameConfig.level[gameConfig.currentLevel].cols * gameConfig.level[gameConfig.currentLevel].rows;
			console.log(total)
			
			for(var i = 0; i < total; i++){
				var x = countcols * (gameConfig.width);
				var y = countrows * (gameConfig.height);
				
				ctx.beginPath()
				ctx.lineWidth = 1;
				ctx.rect(x,y,gameConfig.width,gameConfig.height);
				ctx.strokeStyle = "#ffffff";
				ctx.fillStyle = gameConfig.color;
				ctx.fill();
				ctx.stroke();
						
				if(countcols < gameConfig.level[gameConfig.currentLevel].cols-1){
					countcols++;
				}else{
					countcols = 0;
					countrows++;
				}
				
			}
			
		}