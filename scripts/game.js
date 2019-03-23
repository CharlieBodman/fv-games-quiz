/*------------------------- SCENES ----------------------*/
import Boot          from './scenes/boot';
import Preload       from './scenes/preload';
import GameTitle     from './scenes/game_title';
import Main          from './scenes/main';
import GameOver      from './scenes/game_over';
import Categories    from './scenes/categories';
import KineticPlugin from './libs/phaser-kinetic-scrolling-plugin';
import styles        from '../styles/stylesheet.css';
import Words         from './words';

/*------------------------- CONFIG -----------------------*/
import GameConfig   from './config';


/**
 * Game initializer
 */
export default {

    /**
     * Game Instance
     */
    gameInstance:null,

    /**
     * Intiialize game with config
     * @param {Element} containerElemement - element to inject canvas into
     * @param {Object} config to extend
     */
    init:function( containerElement, config )
    {
        if(this.gameInstance != null)
        {
            this.destroy();
        }

        KineticPlugin(Phaser);
        
        GameConfig.setConfig(config);
        
        //Start Game
        const game = new Phaser.Game(640, 1136, Phaser.AUTO, containerElement, null, false);

        game.state.add("Boot", Boot);
        game.state.add("Preload", Preload);
        game.state.add("GameTitle", GameTitle);
        game.state.add("Categories", Categories);
        game.state.add("Main", Main);
        game.state.add("GameOver", GameOver);
        game.state.start("Boot");
        
        this.gameInstance = game;
    },

    /**
     * Destroy
     */
    destroy:function(){
        this.gameInstance.destroy();
        this.gameInstance = null;
    }
}