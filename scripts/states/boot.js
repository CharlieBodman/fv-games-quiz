import Config from '../config';

/**
 * Boot State
 * This is the first state that will run
 */
class Boot {

    /**
     * Initialize
     * Part of the Phaser LifeCycle
     * https://phaser.io/docs/2.6.2/Phaser.State.html#init
     */
    init() {
        
        // Set the stage background
        this.game.stage.backgroundColor = "#FFFFFF";
        
        // Scale and center the game
        this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        this.scale.pageAlignHorizontally = true;
        this.scale.pageAlignVertically = false;    
        
        // Set the scale to contrain to the window
        this.game.scale.windowConstraints.bottom = "visual";
    }

    /**
     * Preload
     * Part of the Phaser LifeCycle
     * https://phaser.io/docs/2.6.2/Phaser.State.html#preload
     */
    preload() {
        const config = Config.getConfig();
        this.game.load.image('loading', config.images.preloaderLoading);
        this.game.load.image('brand', config.images.preloaderLogo);
    }
    
    
    /**
     * Create
     * Part of the Phaser LifeCycle
     * https://phaser.io/docs/2.6.2/Phaser.State.html#create
     */
    create() {
        this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        setTimeout(this.startPreloadState.bind(this),500);
    }

    /**
     * Starts the preload state
     */
    startPreloadState() {
        this.game.state.start("Preload");
    }
}

export default Boot;
