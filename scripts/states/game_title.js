import Config from '../config';
import Base from './base';
import WordsManager from '../words_manager';
import wait from '../utils/wait';

/**
 * Game title
 * This is where the word loading begins
 * "Start Screen"
 */
class GameTitle extends Base
{

    /**
     * Initialize
     * Part of the Phaser LifeCycle
     * https://phaser.io/docs/2.6.2/Phaser.State.html#init
     */
    init()
    {
        this.config = Config.getConfig();
        this.loadingDisplay = null;
        this.startButton = null;
    }

    /**
     * Creates title text
     */
    createtitle()
    {
        // Title 
        const title = this.game.add.text(this.game.world.centerX, 450, "Quiz", { font: `100px ${ this.config.fonts.primary }` });
        title.anchor.setTo(0.5, 0.5);

        this.title = title;

        // Add collision to the title text, but don't allow it to move
        this.game.physics.arcade.enable([title]);
        title.body.immovable = true;
    }

    /**
     * Create logo sprite
     */
    createLogo()
    {
        // Logo
        const quizLogo = this.game.add.sprite(this.game.world.centerX, 250, 'quiz-logo');
        quizLogo.anchor.setTo(0.5, 0.5);
    }

    /**
     * Creates fadinng start button text 
     */
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

    /**
     * Starts the next state
     */
    startGame()
    {
        this.playClickAudio();
        this.game.state.start("Categories");
    }

    /**
     * Create
     * Part of the Phaser LifeCycle
     * https://phaser.io/docs/2.6.2/Phaser.State.html#create
     */
    create()
    {
        this.createtitle();
        this.createLogo();
        this.createRainEffect();
        this.createMuteButton();
        this.createFullscreenButton();
        this.createRotateDevice();
        this.createStartButton();
        this.createFetchLoadingDisplay();
        this.startTime = Date.now();
        this.fetchWordsAsync();
    }

    /**
     * Update
     * Part of the Phaser LifeCycle
     * https://phaser.io/docs/2.6.2/Phaser.State.html#update
     */
    update()
    {
        super.update();

        this.game.physics.arcade.collide(this.title, this.emitter);

        const startTime = Date.now() - this.startTime;

        if (startTime > 5000)
        {
            this.loadingText.text = "Sorry..this is taking a while.."
        }
    }

    /**
     * Creates fetch loading display
     */
    createFetchLoadingDisplay()
    {
        const loadingDisplay = this.game.add.group();
        const centerX = this.game.width / 2;

        const loadingText = this.game.add.text(centerX, 600, "Fetching words...", { font: `30px ${ this.config.fonts.primary }` });
        loadingText.anchor.setTo(0.5, 0.5);

        const spinnerImage = this.game.add.image(centerX, 650, 'spinner');
        spinnerImage.anchor.setTo(0.5, 0.5);
        spinnerImage.scale.setTo(0.4, 0.4);

        this.add.tween(spinnerImage).to({ angle: 360 }, 750, "Linear", true, 0, -1, false);

        loadingDisplay.add(loadingText);
        loadingDisplay.add(spinnerImage);

        this.loadingText = loadingText;
        this.loadingDisplay = loadingDisplay;
    }

     /**
     * Fetches words asynchronously 
     * This method will keep trying until it succeeds
     * It uses a backoff method to not overload the server
     */
    async fetchWordsAsync(retries = 0)
    {
        try 
        {
            const response = await fetch('/get/some-data');
            const responseJson = await response.json();

            for (var i = 0; i < 2000; i++)
            {
                responseJson.words.push({
                    "group": "Things",
                    "word": "Word " + i,
                    "translation": "Translation " + i,
                    "audio": "assets/sounds/i_am_going_to_sit.mp3",
                    "image": "https://preprod.firstvoices.com/nuxeo/nxfile/default/ea2bd6b7-6411-48fc-9d09-4324c3a1d9c0/picture:views/0/content/Thumbnail_farmer-vb.jpg"
                });
            }

            WordsManager.add(responseJson.words);

            this.loadingDisplay.visible = false;
            this.startButton.visible = true;
        }
        catch (error)
        {
            /**
             * Here we are going to try fetching words again, 
             * This will utilize a back off retry implementation
             */
            await wait(retries * 500);
            await this.fetchWordsAsync(retries + 1);
        }
    }

    /**
     * Creats rain effect
     */
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