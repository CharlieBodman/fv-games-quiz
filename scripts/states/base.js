class Base
{
    init()
    {
        this.clickAudio = null;
        this.orientationDialog = null;
        this.preloadProgress = null;
        this.fullscreenButton = null;
        this.unfullscreenButton = null;
    }

    preload()
    {
        const preloadProgress = this.game.add.group();

        const width = this.game.width / 2;
        const height = 25;

        var progressBarBackground = this.game.add.graphics(0, 0)
        progressBarBackground.beginFill(0xEEEEEE);
        progressBarBackground.drawRect(0, 0, width, height)
        progressBarBackground.moveTo(0, 0);
        progressBarBackground.drawCircle(0, height / 2, height);
        progressBarBackground.drawCircle(width, height / 2, height);

        var progressBarFill = this.game.add.graphics(0, 0)
        progressBarFill.beginFill(0x000000);
        progressBarFill.drawRect(0, 0, width * 0, height)
        progressBarFill.moveTo(0, 0);
        progressBarFill.drawCircle(0, height / 2, height);
        progressBarFill.drawCircle(width * 0, height / 2, height);

        preloadProgress.add(progressBarBackground);
        preloadProgress.add(progressBarFill);

        preloadProgress.x = (this.game.width / 2) - (preloadProgress.width / 2) + height;
        preloadProgress.y = 500;
        preloadProgress.visible = false;

        // Load Start
        this.game.load.onLoadStart.add(() =>
        {
            preloadProgress.visible = true;
        }, this);

        // On Load Progress
        this.game.load.onFileComplete.add((progress) =>
        {
            const percent = progress / 100;
            progressBarFill.clear();
            progressBarFill.beginFill(0x000000);
            progressBarFill.drawRect(0, 0, width * percent, height)
            progressBarFill.moveTo(0, 0);
            progressBarFill.drawCircle(0, height / 2, height);
            progressBarFill.drawCircle(width * percent, height / 2, height);
        }, this);

        // On Load Complete
        this.game.load.onLoadComplete.add(() =>
        {
            preloadProgress.visible = false
        }, this);

    }

    create()
    {
        this.createFullscreenButton();
        this.createMuteButton();
        this.createRainEffect();
    }
    
    playClickAudio()
    {
        if(!this.clickAudio)
        {
            this.clickAudio = this.game.add.audio('click', 0.6);
        }
        
        this.clickAudio.play();
    }

    createRotateDevice()
    {
        const dialogBackground = this.createDialogBackground();
        const dialogText = this.game.add.text(this.game.width / 2, this.game.height / 2 - 200, "Rotate Screen", {
            font: `100px ${ this.config.fonts.primary }`,
            wordWrap: true, wordWrapWidth: this.game.width - 200
        });

        dialogText.anchor.setTo(0.5, 0.5);

        const orientationDialog = this.game.add.group();
        orientationDialog.add(dialogBackground);
        orientationDialog.add(dialogText);
        orientationDialog.visible = false;

        this.orientationDialog = orientationDialog;
    }

    createDialogBackground()
    {
        const dialogBackground = this.game.add.graphics();
        dialogBackground.beginFill(0xFFFFFF, 0.95);
        dialogBackground.drawRect(0, 0, this.game.width, this.game.height);
        dialogBackground.inputEnabled = true;
        return dialogBackground;
    }

    update()
    {
        if (this.orientationDialog != null)
        {
            var orientation = screen.msOrientation || screen.mozOrientation || (screen.orientation || {}).type;

            this.orientationDialog.visible = false;

            if (orientation && orientation.indexOf("landscape") != -1 && this.game.device.desktop == false)
            {
                this.orientationDialog.visible = true;
            }
        }
        
        if(this.unfullscreenButton && this.fullscreenButton)
        {
            this.unfullscreenButton.visible = this.scale.isFullScreen;
            this.fullscreenButton.visible = !this.scale.isFullScreen;   
        }
    }

    /**
     * Creates mute button control
     */
    createMuteButton()
    {
        const unmuteButton = this.add.sprite(40, 40, 'unmute');
        unmuteButton.anchor.setTo(0.5, 0.5);
        unmuteButton.scale.setTo(0.3, 0.3);
        unmuteButton.inputEnabled = true;
        unmuteButton.visible = this.game.sound.mute;
        unmuteButton.input.useHandCursor = true;
        unmuteButton.fixedToCamera = true;

        const muteButton = this.add.sprite(40, 40, 'mute');
        muteButton.anchor.setTo(0.5, 0.5);
        muteButton.scale.setTo(0.3, 0.3);
        muteButton.inputEnabled = true;
        muteButton.visible = !this.game.sound.mute;
        muteButton.input.useHandCursor = true;
        muteButton.fixedToCamera = true;

        unmuteButton.events.onInputUp.add(() =>
        {
            muteButton.visible = true;
            unmuteButton.visible = false;
            this.game.sound.mute = false;
            this.playClickAudio();
        });

        muteButton.events.onInputDown.add(() =>
        {
            unmuteButton.visible = true;
            muteButton.visible = false;
            this.game.sound.mute = true;
        });
    }

    createFullscreenButton()
    {
        this.game.scale.fullScreenScaleMode = Phaser.ScaleManager.SHOW_ALL;

        if (this.game.scale.compatibility.supportsFullScreen)
        {
            const fullscreen = this.add.sprite(this.game.width - 50, 40, 'fullscreen');
            fullscreen.anchor.setTo(0.5, 0.5);
            fullscreen.scale.setTo(0.3, 0.3);
            fullscreen.inputEnabled = true;
            fullscreen.visible = !this.game.scale.isFullScreen;
            fullscreen.input.useHandCursor = true;
            fullscreen.fixedToCamera = true;

            const unfullscreen = this.add.sprite(this.game.width - 50, 40, 'unfullscreen');
            unfullscreen.anchor.setTo(0.5, 0.5);
            unfullscreen.scale.setTo(0.3, 0.3);
            unfullscreen.inputEnabled = true;
            unfullscreen.visible = this.game.scale.isFullScreen;
            unfullscreen.input.useHandCursor = true;
            unfullscreen.fixedToCamera = true;

            fullscreen.events.onInputUp.add(() =>
            {
                this.playClickAudio();
                this.game.scale.startFullScreen(false);
            });

            unfullscreen.events.onInputDown.add(() =>
            {
                this.playClickAudio();
                this.game.scale.stopFullScreen();
            });
            
            this.fullscreenButton = fullscreen;
            this.unfullscreenButton = unfullscreen;
        }
    }

    /**
     * Creates a "fade in" effect
     */
    fadeIn(delay = 0)
    {
        const fadeBackground = this.game.add.graphics(0, 0);
        fadeBackground.beginFill(0xFFFFFF, 1);
        fadeBackground.drawRect(0, 0, this.game.width, this.game.height);
        fadeBackground.alpha = 1;
        fadeBackground.endFill();

        const backgroundTween = this.game.add.tween(fadeBackground);
        backgroundTween.to({ alpha: 0 }, 100, null, null, delay);
        backgroundTween.onComplete.add(() =>
        {
            fadeBackground.destroy();
        });
        backgroundTween.start();
    }

    /**
     * Switches state while fading out
     * @param {string} state 
     */
    switchState(state, params)
    {
        const fadeBackground = this.game.add.graphics(0, 0);
        fadeBackground.beginFill(0xFFFFFF, 1);
        fadeBackground.drawRect(0, 0, this.game.width, this.game.height);
        fadeBackground.alpha = 0;
        fadeBackground.endFill();

        const backgroundTween = this.game.add.tween(fadeBackground);
        backgroundTween.to({ alpha: 1 }, 100, null);
        backgroundTween.onComplete.add(() =>
        {
            this.game.state.start(state, true, false, params);
        }, this);

        backgroundTween.start();
    }

    createRainEffect()
    {
        const game = this.game;

        const emitterContainer = game.add.group();
        emitterContainer.x = 0;
        emitterContainer.y = 0;

        const emitter = game.add.emitter(game.world.centerX, -300, 400);

        emitter.width = game.world.width + 200;
        emitter.angle = 10; // uncomment to set an angle for the rain.

        emitter.makeParticles('rain', null, 400, true);

        emitter.minParticleScale = 0.1;
        emitter.maxParticleScale = 0.5;
        emitter.maxParticleAlpha = 0.2;
        emitter.minParticleAlpha = 0.05;

        emitter.setYSpeed(100, 300);
        emitter.setXSpeed(-5, 5);
        emitter.bounce.setTo(0.3, 0.3);

        emitter.minRotation = 0;
        emitter.maxRotation = 0;

        emitter.start(false, 3000, 50, 0);

        emitterContainer.add(emitter);
        emitterContainer.fixedToCamera = true;

        this.emitter = emitter;
    }

}

export default Base;