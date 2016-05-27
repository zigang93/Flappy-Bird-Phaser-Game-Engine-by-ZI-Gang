var game = new Phaser.Game(320,505,Phaser.AUTO,'game');
game.States = {};

game.States.boot = function(){
	this.preload = function(){
		if(!game.device.desktop){//mobile available
			this.scale.scaleMode = Phaser.ScaleManager.EXACT_FIT;
			this.scale.forcePortrait = true;
			this.scale.refresh();
		}
		game.load.image('loading','assets/preloader.gif');
	};
	this.create = function(){
		game.state.start('preload'); //preloading
	};
}

game.States.preload = function(){
	this.preload = function(){
		var preloadSprite = game.add.sprite(35,game.height/2,'loading'); //add the character animation
		game.load.setPreloadSprite(preloadSprite);
		game.load.image('background','assets/background.png'); //bg
    	game.load.image('ground','assets/ground.png'); //map
    	game.load.image('title','assets/title_flappyBird.png'); //game title
    	game.load.spritesheet('bird','assets/bird.png',34,24,3); //character
    	game.load.image('btn','assets/start-button.png');  //button
    	game.load.spritesheet('pipe','assets/pipes.png',54,320,2); //pipe
    	game.load.bitmapFont('flappy_font', 'assets/fonts/flappyfont/flappyfont.png', 'assets/fonts/flappyfont/flappyfont.fnt');

    	game.load.image('ready_text','assets/get-ready.png');
    	game.load.image('play_tip','assets/instructions.png');
    	game.load.image('game_over','assets/gameover.png');
    	game.load.image('score_board','assets/scoreboard.png');

			game.load.audio('fly_sound', 'assets/jump.wav');//fly sound effect
    	game.load.audio('score_sound', 'assets/coin.wav');//get coin sound effect
    	game.load.audio('hit_pipe_sound', 'assets/hit.wav'); //hit the pipe sound effect
    	game.load.audio('hit_ground_sound', 'assets/ouch.wav'); //hit the ground sound effect
			game.load.audio('bgm', 'assets/bgm.wav'); //bgm
			game.load.audio('start_bgm' , 'assets/startBgm.wav');//start game bgm
			game.load.audio('game_over', 'assets/gameOver.wav');//game over bgm

	}
	this.create = function(){
		game.state.start('menu');


	}
}

game.States.menu = function(){
	this.create = function(){
		game.add.tileSprite(0,0,game.width,game.height,'background').autoScroll(-10,0);
		game.add.tileSprite(0,game.height-112,game.width,112,'ground').autoScroll(-100,0);
		var titleGroup = game.add.group();
		titleGroup.create(40,0,'title');
		var bird = titleGroup.create(150, -15, 'bird');
		bird.animations.add('fly');
		bird.animations.play('fly',12,true); //play animtion
		titleGroup.x = 35;
		titleGroup.y = 100;
		game.add.tween(titleGroup).to({ y:120 },1000,null,true,0,Number.MAX_VALUE,true);
		var btn = game.add.button(game.width/2,game.height/2,'btn',function(){
			game.state.start('play');

		});
		btn.anchor.setTo(0.5,0.5);


	}
}

game.States.play = function(){


	this.create = function(){
		this.bg = game.add.tileSprite(0,0,game.width,game.height,'background');
		this.pipeGroup = game.add.group();
		this.pipeGroup.enableBody = true;
		this.ground = game.add.tileSprite(0,game.height-112,game.width,112,'ground');
		this.bird = game.add.sprite(50,150,'bird');
		this.bird.animations.add('fly');
		this.bird.animations.play('fly',12,true);
		this.bird.anchor.setTo(0.5, 0.5);
		game.physics.enable(this.bird,Phaser.Physics.ARCADE);
		this.bird.body.gravity.y = 0;
		game.physics.enable(this.ground,Phaser.Physics.ARCADE);
		this.ground.body.immovable = true;

		this.soundFly = game.add.sound('fly_sound');
		this.soundScore = game.add.sound('score_sound');
		this.soundHitPipe = game.add.sound('hit_pipe_sound');
		this.soundHitGround = game.add.sound('hit_ground_sound');
		this.soundBGM = game.add.sound('bgm');
		this.soundGameOver = game.add.sound('game_over');
		this.startBGM = game.add.sound('start_bgm');
		this.scoreText = game.add.bitmapText(game.world.centerX-10, 30, 'flappy_font', '0', 36);

		this.readyText = game.add.image(game.width/2, 180, 'ready_text');
		this.playTip = game.add.image(game.width/2,300,'play_tip');
		this.readyText.anchor.setTo(0.5, 0);
		this.playTip.anchor.setTo(0.5, 0);

		this.hasStarted = false; //not start yet
		game.time.events.loop(900, this.generatePipes, this);
		game.time.events.stop(false);
		game.input.onDown.addOnce(this.statrGame, this);
		this.startBGM.play();




	};
	this.update = function(){
		if(!this.hasStarted) return;
		game.physics.arcade.collide(this.bird,this.ground, this.hitGround, null, this);
		game.physics.arcade.overlap(this.bird, this.pipeGroup, this.hitPipe, null, this);
		if(this.bird.angle < 90) this.bird.angle += 2.5; //bird direction go down when less than 90
		this.pipeGroup.forEachExists(this.checkScore,this); //check score


	}

	this.statrGame = function(){
		this.gameSpeed = 150; //game speed
		this.gameIsOver = false;
		this.hasHitGround = false;
		this.hasStarted = true;
		this.score = 0;
		this.bg.autoScroll(-(this.gameSpeed/10),0);
		this.ground.autoScroll(-this.gameSpeed,0);
		this.bird.body.gravity.y = 1150;
		this.readyText.destroy();
		this.playTip.destroy();
		game.input.onDown.add(this.fly, this);
		game.time.events.start();
		this.soundBGM.play();
		this.startBGM.stop();



	}

	this.stopGame = function(){
		this.bg.stopScroll();
		this.ground.stopScroll();
		this.pipeGroup.forEachExists(function(pipe){
			pipe.body.velocity.x = 0;
		}, this);
		this.bird.animations.stop('fly', 0);
		game.input.onDown.remove(this.fly,this);
		game.time.events.stop(true);
		this.soundBGM.stop();


	}

	this.fly = function(){
		this.bird.body.velocity.y = -350;
		game.add.tween(this.bird).to({angle:-30}, 100, null, true, 0, 0, false); //make bird direction go up when fly
		this.soundFly.play();
	}

	this.hitPipe = function(){
		if(this.gameIsOver) return;
		this.soundHitPipe.play();
		this.gameOver();
	}
	this.hitGround = function(){
		if(this.hasHitGround) return; //if already
		this.hasHitGround = true;
		this.soundHitGround.play();
		this.gameOver(true); // then game over is true
	}
	this.gameOver = function(show_text){
		this.gameIsOver = true; // when true
		this.stopGame();//stop game
		if(show_text) this.showGameOverText(); // go to showGameOverText
	};

	this.showGameOverText = function(){
		this.scoreText.destroy();
		game.bestScore = game.bestScore || 0; //best score or 0
		if(this.score > game.bestScore) game.bestScore = this.score; //if the score higher than best score , set the higher score into system
		this.gameOverGroup = game.add.group(); //add a group of asset
		this.soundGameOver.play();
		var gameOverText = this.gameOverGroup.create(game.width/2,0,'game_over');
		var scoreboard = this.gameOverGroup.create(game.width/2,70,'score_board');
		var currentScoreText = game.add.bitmapText(game.width/2 + 60, 105, 'flappy_font', this.score+'', 20, this.gameOverGroup); //current score
		var bestScoreText = game.add.bitmapText(game.width/2 + 60, 153, 'flappy_font', game.bestScore+'', 20, this.gameOverGroup); //best score
		var replayBtn = game.add.button(game.width/2, 210, 'btn', function(){//replay button
			game.state.start('play');
		}, this, null, null, null, null, this.gameOverGroup);
		gameOverText.anchor.setTo(0.5, 0);
		scoreboard.anchor.setTo(0.5, 0);
		replayBtn.anchor.setTo(0.5, 0);
		this.gameOverGroup.y = 30;

	}

	this.generatePipes = function(gap){
		gap = gap || 100; //top and bottom pipe of gap/ distance
		var position = (505 - 320 - gap) + Math.floor((505 - 112 - 30 - gap - 505 + 320 + gap) * Math.random());
		var topPipeY = position-360;
		var bottomPipeY = position+gap;

		if(this.resetPipe(topPipeY,bottomPipeY)) return;

		var topPipe = game.add.sprite(game.width, topPipeY, 'pipe', 0, this.pipeGroup);
		var bottomPipe = game.add.sprite(game.width, bottomPipeY, 'pipe', 1, this.pipeGroup);
		this.pipeGroup.setAll('checkWorldBounds',true);
		this.pipeGroup.setAll('outOfBoundsKill',true);
		this.pipeGroup.setAll('body.velocity.x', -this.gameSpeed);
	}

	this.resetPipe = function(topPipeY,bottomPipeY){//recycle the pipe when they out of range... loop method
		var i = 0;
		this.pipeGroup.forEachDead(function(pipe){
			if(pipe.y<=0){ //topPipe
				pipe.reset(game.width, topPipeY);
				pipe.hasScored = false; //reset
			}else{
				pipe.reset(game.width, bottomPipeY);
			}
			pipe.body.velocity.x = -this.gameSpeed;
			i++;
		}, this);
		return i == 2; //if i==2 mean had 1 set of pipe out of range，then loop/recycle it agian
	}

	this.checkScore = function(pipe){//function that check the pipe score
		if(!pipe.hasScored && pipe.y<=0 && pipe.x<=this.bird.x-17-54){
			pipe.hasScored = true;
			this.scoreText.text = ++this.score;
			this.soundScore.play();
			return true;
		}
		return false;
	}


}

//add state to game
game.state.add('boot',game.States.boot);
game.state.add('preload',game.States.preload);
game.state.add('menu',game.States.menu);
game.state.add('play',game.States.play);
//game start
game.state.start('boot');
