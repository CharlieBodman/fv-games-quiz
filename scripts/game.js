/*------------------------- STATES ----------------------*/
import Boot from './states/boot';
import Preload from './states/preload';
import GameTitle from './states/game_title';
import Main from './states/main';
import Categories from './states/categories';
import KineticPlugin from './libs/phaser-kinetic-scrolling-plugin';

/*------------------------- CONFIG -----------------------*/
import GameConfig from './config';


class Game
{
    /**
     * Intiialize game with config
     * @param {Element} containerElemement - element to inject canvas into
     * @param {Object} config to extend
     */
    init(containerElement, config)
    {
        this.destroy();

        KineticPlugin(Phaser);

        GameConfig.setConfig(config);

        //Start Game
        const game = new Phaser.Game(640, 1136, Phaser.AUTO, containerElement, null, false);
        game.state.add("Boot", Boot);
        game.state.add("Preload", Preload);
        game.state.add("GameTitle", GameTitle);
        game.state.add("Categories", Categories);
        game.state.add("Main", Main);
        game.state.start("Boot");
        
        this.game = game;
    }

    /**
     * Destroy
     */
    destroy()
    {
        if (this.game)
        {
            this.gameInstance.destroy();
            this.gameInstance = null;
        }
    }
}


export default new Game();