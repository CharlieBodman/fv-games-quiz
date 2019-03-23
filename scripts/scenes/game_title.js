import configManager from '../config';
import Base from './base';
import Words from '../words';

class GameTitle extends Base
{

    init()
    {
        this.config = configManager.getConfig();
        this.loadingDisplay = null;
        this.startButton = null;
    }

    createtitle()
    {
        const game = this.game;
        const centerX = game.world.centerX;

        // Title 
        const title = game.add.text(centerX, 450, "Quiz", { font: `100px ${ this.config.fonts.primary }` });
        title.anchor.setTo(0.5, 0.5);

        // Logo
        const quizLogo = game.add.sprite(centerX, 250, 'quiz-logo');
        quizLogo.anchor.setTo(0.5, 0.5);

        this.title = title;

        // Add collision to the title text, but don't allow it to move
        game.physics.arcade.enable([title]);
        title.body.immovable = true;
    }

    createStartButton()
    {
        var game = this.game;

        var startButton = game.add.text(game.world.centerX, 650, "Start", { font: `60px ${ this.config.fonts.primary }` });
        startButton.anchor.setTo(0.5, 0.5);
        startButton.alpha = 0;
        startButton.inputEnabled = true;
        startButton.input.useHandCursor = true;
        startButton.events.onInputOver.add(() => { startButton.fill = "#3BA185"; });
        startButton.events.onInputOut.add(() => { startButton.fill = "#000000"; });
        startButton.events.onInputUp.add(this.startGame, this);
        startButton.visible = false;
        
        var tween = game.add.tween(startButton).to({ alpha: 1 }, 500, "Linear", true, 0, -1);
        tween.yoyo(true, 500);
        
        this.startButton = startButton;
    }

    startGame()
    {
        this.playClickAudio();
        this.game.state.start("Categories");
    }

    update()
    {
        this.game.physics.arcade.collide(this.title, this.emitter);
        super.update();
    }

    create()
    {
        this.createtitle();
        this.createRainEffect();
        this.createMuteButton();
        this.createFullscreenButton();
        this.createRotateDevice();
        this.createStartButton();
        this.createFetchLoadingDisplay();
        this.fetchWords();
    }

    createFetchLoadingDisplay()
    {
        const loadingDisplay = this.game.add.group();
        const centerX = this.game.width / 2;

        const title = this.game.add.text(centerX, 600, "Fetching words...", { font: `30px ${ this.config.fonts.primary }` });
        title.anchor.setTo(0.5, 0.5);

        const spinnerImage = this.game.add.image(centerX, 650, 'spinner');
        spinnerImage.anchor.setTo(0.5, 0.5);
        spinnerImage.scale.setTo(0.4,0.4);
        
        this.add.tween(spinnerImage).to({angle:360}, 750, "Linear", true, 0, -1, false);
        
        loadingDisplay.add(title);
        loadingDisplay.add(spinnerImage);
        
        this.loadingDisplay = loadingDisplay;
    }

    async fetchWords(retries = 0)
    {
        try 
        {
            const response = await fetch('/get/some-data');
            const responseJson = await response.json();

            Words.add(responseJson.words);
            
            this.loadingDisplay.visible = false;
            this.startButton.visible = true;
        }
        catch(error)
        {
            /**
             * Here we are going to try fetching words again, 
             * This will utilize a back off retry implementation
             */
            await this.delay(retries * 500);   
            await this.fetchWords(retries + 1);
        } 
    }
    
    delay(timeMs)
    {
        return new Promise((resolve, reject)=>{
            setTimeout(resolve, timeMs);
        });
    }
    
    createRainEffect()
    {
        const game = this.game;
        const emitter = game.add.emitter(game.world.centerX, -300, 400);

        emitter.width = game.world.width + 200;
        emitter.angle = 10; // uncomment to set an angle for the rain.

        emitter.makeParticles('rain', null, 400, true);

        emitter.minParticleScale = 0.1;
        emitter.maxParticleScale = 0.5;

        emitter.setYSpeed(100, 300);
        emitter.setXSpeed(-5, 5);
        emitter.bounce.setTo(0.3, 0.3);

        emitter.minRotation = 0;
        emitter.maxRotation = 0;

        emitter.start(false, 3000, 50, 0);

        this.emitter = emitter;
    }
}

export default GameTitle;