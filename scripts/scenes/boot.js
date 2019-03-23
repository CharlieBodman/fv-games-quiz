import configManager from '../config';

class Boot {

    init() {
        this.config = configManager.getConfig();
        this.game.stage.backgroundColor = "#FFFFFF";
        
        this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        this.scale.pageAlignHorizontally = true;
        this.scale.pageAlignVertically = false;    
        
        this.game.scale.windowConstraints.bottom = "visual";
    }

    preload() {
        this.game.load.image('loading', this.config.images.preloaderLoading);
        this.game.load.image('brand', this.config.images.preloaderLogo);
    }

    startPreloadScene() {
        this.game.state.start("Preload");
    }

    create() {
        this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        setTimeout(this.startPreloadScene.bind(this),500);
    }
}

export default Boot;
