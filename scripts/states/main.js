import Base from './base';
import ConfigManager from '../config';
import WordsManager from '../words_manager';

/**
 * Main Game Modes
 */
export const MODES = {
    STUDY: 'study',
    TEST: 'test'
}

/**
 * Default State Options
 */
const defaultOptions = {
    category: "",
    words: []
}

/**
 * Main State
 * This is the main state (study|test)
 */
class Main extends Base
{

    /**
     * Initialize
     * Part of the Phaser LifeCycle
     * https://phaser.io/docs/2.6.2/Phaser.State.html#init
     */
    init(options = {})
    {
        // Set config     
        this.config = ConfigManager.getConfig();

        // Set the options to the default
        this.options = Object.assign({}, defaultOptions, options);

        // Set properties 
        this.category = options.category;
        this.words = this.options.words.length > 0 ? this.options.words : WordsManager.getWords(this.category, 10);
        this.mode = options.mode ? options.mode : MODES.STUDY;

        // Quiz properties
        this.quizQuestions = [];
        this.quizNumber = 0;
        this.quizNumberMax = this.words.length - 1;

        // Quiz stats
        this.answeredQuizQuestions = [];
        this.skippedQuizQuestions = [];
        this.wrongQuizQuestions = [];
        this.correctQuizQuestions = [];

        // Elements
        this.currentQuizNumberDot = null;
        this.quizNumberArrowIndicator = null
        this.audioPlayProgress = null;
        this.audioPlayProgressMask = null;
        this.quizQuestionText = null;
        this.quizStudyText = null;
        this.studyNextWordButton = null;
        this.studyButtons = null;
        this.answersGroup = null;
        this.answerDialog = null;
        this.summaryDialog = null;
        this.skipButton = null;

        // Build Questions
        this.buildQuestions();

        // Create Title
        this.createTitle();
        super.create();
    }

    /**
     * Create Answer Dialog
     */
    createAnswerDialog()
    {
        const dialog = this.game.add.group();
        const dialogBackground = this.createDialogBackground();
        const dialogText = this.game.add.text(this.game.width / 2, this.game.height / 2 - 200, "", { font: `100px ${ this.config.fonts.primary }` });
        dialogText.anchor.setTo(0.5, 0.5);

        dialog.add(dialogBackground);
        dialog.add(dialogText);

        dialog.visible = false;

        this.answerDialog = dialog;
    }


    /**
     * Preload
     * Part of the Phaser LifeCycle
     * https://phaser.io/docs/2.6.2/Phaser.State.html#preload
     */
    preload()
    {
        super.preload();

        const words = this.words;
        for (let word of words)
        {
            this.load.audio(word.audio, word.audio);
        }
    }

    /**
     * Shuffle Array
     * @param {array} a 
     */
    shuffleArray(a)
    {
        var j, x, i;
        for (i = a.length - 1; i > 0; i--)
        {
            j = Math.floor(Math.random() * (i + 1));
            x = a[i];
            a[i] = a[j];
            a[j] = x;
        }
        return a;
    }

    /**
     * Build Questions
     */
    buildQuestions()
    {
        let words = this.words;
        const wordCount = words.length;

        words = this.shuffleArray(words);

        for (let i = 0; i < wordCount; i++)
        {
            const word = words[i];

            // Get remaining words
            let remainingWords = words.slice();
            remainingWords.splice(i, 1);
            remainingWords = this.shuffleArray(remainingWords);

            // Generate answers
            const answers = [
                word.translation,
                remainingWords.pop().translation,
                remainingWords.pop().translation,
                remainingWords.pop().translation
            ];

            // Build question
            const quizQuestion = {
                word: word,
                answers: this.shuffleArray(answers)
            };

            // Add question to questions list
            this.quizQuestions.push(quizQuestion);
        }
    }

    /**
     * Give answer to current question
     * @param {number} answerIndex 
     */
    giveAnswer(answerIndex)
    {
        const question = this.quizQuestions[this.quizNumber];
        const indicator = this.progressIndicators.getChildAt(this.quizNumber);

        const questionWord = question.word;
        const answer = this.answersGroup.getChildAt(answerIndex);

        this.playClickAudio();
        this.answeredQuizQuestions.push(this.quizNumber);

        if (answer.text.toLowerCase().indexOf(questionWord.translation.toLowerCase()) != -1)
        {
            this.showCorrectDialog();
            this.correctQuizQuestions.push(this.quizNumber);
            indicator.loadTexture('progress-dot-correct');
        }
        else
        {
            this.showIncorrectDialog();
            this.wrongQuizQuestions.push(this.quizNumber);
            indicator.loadTexture('progress-dot-incorrect');
        }

        setTimeout(() =>
        {
            this.gotoNextQuestion();
            this.answerDialog.visible = false;
        }, 1200);
    }

    /**
     * Restart the scene
     */
    restart(mode = false, words = false)
    {
        if (mode)
        {
            this.options.mode = mode;
        }
        
        this.options.words = words;

        this.game.state.start(this.game.state.current, true, false, this.options);
    }

    /**
     * Create Summary Dialog
     */
    createSummaryDialog()
    {
        const dialogBackground = this.createDialogBackground();

        const summaryTitle = this.game.add.text(this.game.width / 2, 200, "Summary", { font: `55px ${ this.config.fonts.primary }` });
        summaryTitle.anchor.setTo(0.5, 0.5);
        summaryTitle.fixedToCamera = true;

        const correctQuestions = this.game.add.text(this.game.width / 2, 300, "1/2", { font: `55px ${ this.config.fonts.primary }` });
        correctQuestions.anchor.setTo(0.5, 0.5);
        correctQuestions.name = "correct-questions";
        correctQuestions.fixedToCamera = true;

        const timeToComplete = this.game.add.text(this.game.width / 2, 400, "1:00", { font: `55px ${ this.config.fonts.primary }` });
        timeToComplete.anchor.setTo(0.5, 0.5);
        timeToComplete.name = "time-to-complete";
        timeToComplete.fixedToCamera = true;

        const study = this.game.add.text(this.game.width / 2, this.game.height - 180, "Study", { font: `45px ${ this.config.fonts.primary }` });
        study.anchor.setTo(0.5, 0.5);
        study.fixedToCamera = true;
        study.inputEnabled = true;
        study.events.onInputOver.add(() => { study.fill = this.config.colours.primary });
        study.events.onInputOut.add(() => { study.fill = '#000000' });
        study.events.onInputDown.add(() => { study.fill = this.config.colours.primary });
        study.events.onInputUp.add(() =>
        {
            this.playClickAudio()
            study.fill = '#000000';
            this.restart(MODES.STUDY, this.words);
        })

        const retry = this.game.add.text(this.game.width / 2, this.game.height - 260, "Retry", { font: `45px ${ this.config.fonts.primary }` });
        retry.anchor.setTo(0.5, 0.5);
        retry.fixedToCamera = true;
        retry.inputEnabled = true;
        retry.events.onInputOver.add(() => { retry.fill = this.config.colours.primary });
        retry.events.onInputOut.add(() => { retry.fill = '#000000' });
        retry.events.onInputDown.add(() => { retry.fill = this.config.colours.primary });
        retry.events.onInputUp.add(() =>
        {
            this.playClickAudio()
            retry.fill = '#000000';
            this.restart(MODES.TEST, this.words);
        })

        let nextSet = this.game.add.text(this.game.width / 2, this.game.height - 340, "Next", { font: `45px ${ this.config.fonts.primary }` });
        nextSet.anchor.setTo(0.5, 0.5);
        nextSet.fixedToCamera = true;
        nextSet.inputEnabled = true;
        nextSet.events.onInputOver.add(() => { nextSet.fill = this.config.colours.primary });
        nextSet.events.onInputOut.add(() => { nextSet.fill = '#000000' });
        nextSet.events.onInputDown.add(() => { nextSet.fill = this.config.colours.primary });
        nextSet.events.onInputUp.add(() =>
        {
            this.playClickAudio()
            nextSet.fill = '#000000';
            this.restart(MODES.STUDY);
        });
        
        const summaryDialog = this.game.add.group();
        summaryDialog.add(dialogBackground);
        summaryDialog.add(summaryTitle);
        summaryDialog.add(correctQuestions);
        summaryDialog.add(timeToComplete);
        summaryDialog.add(study);
        summaryDialog.add(retry);
        summaryDialog.add(nextSet);

        summaryDialog.visible = false;

        this.summaryDialog = summaryDialog;
    }

    /**
     * Show Summary Dialog
     */
    showSummaryDialog()
    {
        const correctQuestionsText = this.summaryDialog.getByName("correct-questions");
        correctQuestionsText.text = `${ this.correctQuizQuestions.length } / ${ this.quizQuestions.length }`;

        const timeToComplete = this.summaryDialog.getByName("time-to-complete");
        timeToComplete.text = this.formatTime(Date.now() - this.startTime);
        this.summaryDialog.visible = true;
    }

    /**
     * Convert MS to Time
     * @param {number} millisec 
     */
    formatTime(millisec)
    {

        var seconds = (millisec / 1000).toFixed(1);

        var minutes = (millisec / (1000 * 60)).toFixed(1);

        var hours = (millisec / (1000 * 60 * 60)).toFixed(1);

        var days = (millisec / (1000 * 60 * 60 * 24)).toFixed(1);

        if (seconds < 60)
        {
            return seconds + " Sec";
        } else if (minutes < 60)
        {
            return minutes + " Min";
        } else if (hours < 24)
        {
            return hours + " Hrs";
        } else
        {
            return days + " Days"
        }
    }

    /**
     * Show Correct Dialog
     */
    showCorrectDialog()
    {
        this.answerDialog.visible = true;
        const answerText = this.answerDialog.getChildAt(1);
        answerText.text = "Correct!";
        answerText.fill = this.config.colours.primary;
    }

    /**
     * Show Incorrect Dialog
     */
    showIncorrectDialog()
    {
        this.answerDialog.visible = true;
        const answerText = this.answerDialog.getChildAt(1);
        answerText.text = "Incorrect!";
        answerText.fill = this.config.colours.secondary;
    }

    /**
     * Create Title
     */
    createTitle()
    {
        const game = this.game;
        const centerX = game.world.centerX;

        // Title 
        const gameTitle = game.add.text(centerX, 50, "Quiz", { font: `40px ${ this.config.fonts.primary }` });
        gameTitle.anchor.setTo(0.5, 0.5);
        gameTitle.fixedToCamera = true;

        const categoryTitle = game.add.text(centerX, 120, this.category, { font: `50px ${ this.config.fonts.primary }` });
        categoryTitle.fill = "#3BA185";
        categoryTitle.anchor.setTo(0.5, 0.5);
        categoryTitle.fixedToCamera = true;

    }

    /**
     * Create Progress Indicators
     */
    createProgressIndicators()
    {
        const progressIndicators = this.game.add.group();
        progressIndicators.y = 170;

        for (let i = 0; i <= this.quizNumberMax; i++)
        {
            const dot = this.game.add.image(0, 0, 'progress-dot');
            dot.scale.setTo(0.8, 0.8)
            dot.anchor.setTo(0.5, 0.5);

            progressIndicators.add(dot);
        }

        progressIndicators.align(-1, 1, 40, 45, Phaser.CENTER);
        progressIndicators.x = (this.game.width / 2) - (progressIndicators.width / 2) - 5;

        const quizNumberArrowIndicator = this.game.add.image(0, 0, "triangle");
        quizNumberArrowIndicator.scale.setTo(0.5, 0.5 * -1);
        quizNumberArrowIndicator.anchor.setTo(0.5, 0.5);

        this.currentQuizNumberDot = progressIndicators.getChildAt(0);
        this.progressIndicators = progressIndicators;
        this.quizNumberArrowIndicator = quizNumberArrowIndicator;
    }

    /**
     * Creates Study Buttons
     * These are the main buttons in study mode
     * Next Word | Begin Quiz
     */
    createStudyButtons()
    {
        const studyButtons = this.game.add.group();
        studyButtons.x = 0;
        studyButtons.y = 800;

        const studyNextWordButton = this.game.add.text(this.game.width / 2, 0, "Next Word", { font: `40px ${ this.config.fonts.primary }` });
        studyNextWordButton.anchor.setTo(0.5, 0.5);
        studyNextWordButton.inputEnabled = true;
        studyNextWordButton.events.onInputOver.add(() => { studyNextWordButton.fill = '#3BA185'; });
        studyNextWordButton.events.onInputOut.add(() => { studyNextWordButton.fill = '#000000'; })
        studyNextWordButton.events.onInputUp.add(() =>
        {
            studyNextWordButton.fill = '#000000';
            this.playClickAudio();
            this.skippedQuizQuestions.push(this.quizNumber);
            this.gotoNextQuestion();
        });

        const startTest = this.game.add.text(this.game.width / 2, 100, "Begin Quiz", { font: `40px ${ this.config.fonts.primary }` });
        startTest.anchor.setTo(0.5, 0.5);
        startTest.inputEnabled = true;
        startTest.events.onInputOver.add(() => { startTest.fill = '#3BA185'; });
        startTest.events.onInputOut.add(() => { startTest.fill = '#000000'; })
        startTest.events.onInputUp.add(() =>
        {
            this.playClickAudio();
            this.restart(MODES.TEST, this.words);
        });

        studyButtons.add(studyNextWordButton);
        studyButtons.add(startTest);
        studyButtons.visible = false;

        this.studyButtons = studyButtons
    }

    /**
     * Create Skip Button
     * Allows the user to skip the question
     */
    createSkipButton()
    {
        const skipButton = this.add.group();

        const text = this.game.add.text(0, 0, "Skip", { font: `30px ${ this.config.fonts.primary }` });
        text.anchor.setTo(0, 0.5);

        const triangle = this.game.add.image(0, 0, 'triangle');
        triangle.anchor.setTo(0.5, 0.5);
        triangle.angle = -25;
        triangle.x = text.width + 25;
        triangle.y = - 5;

        skipButton.add(triangle);
        skipButton.add(text);

        skipButton.x = this.game.width - skipButton.width - 30;
        skipButton.y = this.game.height - skipButton.height - 50;

        text.inputEnabled = true;

        text.events.onInputOver.add(() =>
        {
            text.fill = '#3BA185';
        });
        text.events.onInputOut.add(() =>
        {
            text.fill = '#000000';
        })
        text.events.onInputUp.add(() =>
        {
            text.fill = '#000000';
            this.playClickAudio();
            this.skippedQuizQuestions.push(this.quizNumber);
            this.gotoNextQuestion();
        });

        text.input.useHandCursor = true;

        this.skipButton = skipButton;
    }

    /**
     * Create Skip Button
     * Allows the user to go back to categories
     */
    createCategoriesButton()
    {
        const categories = this.add.group();

        const text = this.game.add.text(0, 0, "Categories", { font: `30px ${ this.config.fonts.primary }` });
        text.anchor.setTo(0, 0.5);

        const triangle = this.game.add.image(0, 0, 'triangle');
        triangle.anchor.setTo(0.5, 0.5);
        triangle.angle = 25;
        triangle.x = -25;
        triangle.y = - 5;

        categories.add(triangle);
        categories.add(text);

        categories.x = 55;
        categories.y = this.game.height - categories.height - 50;

        text.inputEnabled = true;

        text.events.onInputOver.add(() =>
        {
            text.fill = '#3BA185';
        });
        text.events.onInputOut.add(() =>
        {
            text.fill = '#000000';
        })
        text.events.onInputUp.add(() =>
        {
            text.fill = '#000000';
            this.playClickAudio();
            this.game.state.start("Categories");
        });

        text.input.useHandCursor = true;

    }

    /**
     * Goto Next Question
     */
    gotoNextQuestion()
    {
        if (this.answeredQuizQuestions.length === this.quizQuestions.length)
        {
            this.showSummaryDialog();
        }
        else
        {
            let nextQuizNumber = this.quizNumber + 1;

            if (nextQuizNumber > this.quizNumberMax)
            {
                nextQuizNumber = 0;
            }

            if (this.answeredQuizQuestions.indexOf(nextQuizNumber) === -1
                && this.skippedQuizQuestions.indexOf(nextQuizNumber) === -1)
            {
                this.setQuizNumber(nextQuizNumber);
            }
            else
            {
                const skippedQuizNumber = this.skippedQuizQuestions.shift();

                this.setQuizNumber(skippedQuizNumber);
            }

        }
    }

    /**
     * Set Quiz Number
     * @param {number} number 
     */
    setQuizNumber(number)
    {
        this.quizNumber = number;
        this.currentQuizNumberDot = this.progressIndicators.getChildAt(number)

        // Set the current question text
        const quizQuestion = this.quizQuestions[this.quizNumber];
        this.quizQuestionText.text = quizQuestion.word.word;

        // Set the current question answers
        const answers = quizQuestion.answers;
        const answersText = this.answersGroup.getAll();

        answersText.forEach((answerText, index) =>
        {
            answerText.text = `${ index + 1 }) ${ this.uppercaseFirst(answers[index]) }`;
        });

        this.quizStudyText.text = quizQuestion.word.translation;
    }

    /**
     * Create Quiz Group
     */
    createQuizGroup()
    {
        const centerX = this.game.width / 2;

        const quizQuestion = this.game.add.text(centerX, 300, '', { font: `50px ${ this.config.fonts.secondary }`, align: "center" });
        quizQuestion.anchor.setTo(0.5, 0.5);

        const playAudioGroup = this.game.add.group();
        playAudioGroup.x = centerX;
        playAudioGroup.y = 400;

        // Play Audio
        const audioPlayButton = this.game.add.image(0, 0, 'play-audio');
        audioPlayButton.scale.setTo(0.3, 0.3);
        audioPlayButton.anchor.setTo(0.5, 0.5);
        audioPlayButton.inputEnabled = true;
        audioPlayButton.input.useHandCursor = true;

        // Audio Play Progress
        const audioPlayProgress = this.game.add.image(0, 0, 'play-audio-overlay');
        audioPlayProgress.scale.setTo(0.3, 0.3);
        audioPlayProgress.anchor.setTo(0.5, 0.5);
        audioPlayProgress.inputEnabled = true;
        audioPlayProgress.visible = false;
        audioPlayButton.events.onInputUp.add(this.playAudio, this);

        // Audio Progress Mask
        const audioPlayProgressMask = this.game.add.graphics(0, 0);
        audioPlayProgressMask.beginFill(0x000000, 1);
        audioPlayProgressMask.drawRect(
            -(audioPlayProgress.width / 2), -(audioPlayProgress.height / 2),
            audioPlayProgress.width, audioPlayProgress.height
        );
        audioPlayProgressMask.anchor.setTo(0.5, 0.5);
        audioPlayProgress.mask = audioPlayProgressMask;

        playAudioGroup.add(audioPlayButton);
        playAudioGroup.add(audioPlayProgress);
        playAudioGroup.add(audioPlayProgressMask);

        const answersGroup = this.game.add.group();

        const answersFont = { font: `35px ${ this.config.fonts.primary }`, align: "center" };

        for (let i = 0; i < 4; i++)
        {
            const answerText = this.game.add.text(0, 65 * i, `${ i + 1 })`, answersFont);
            answerText.inputEnabled = true;
            answerText.input.useHandCursor = true;
            answerText.events.onInputDown.add(() =>
            {
                answerText.fill = this.config.colours.primary
            });
            answerText.events.onInputUp.add(() =>
            {
                answerText.fill = '#000000';
            });
            answerText.events.onInputUp.add(this.giveAnswer.bind(this, i));

            answersGroup.add(answerText);
        }

        const quizStudyText = this.game.add.text(this.game.width / 2, 500, "", answersFont);
        quizStudyText.anchor.setTo(0.5, 0.5);

        answersGroup.y = 525;
        answersGroup.x = 50;

        this.quizStudyText = quizStudyText;
        this.answersGroup = answersGroup;
        this.quizQuestionText = quizQuestion;
        this.audioPlayProgress = audioPlayProgress;
        this.audioPlayProgressMask = audioPlayProgressMask;
    }

    /**
     * Play Audio
     */
    playAudio()
    {
        const word = this.quizQuestions[this.quizNumber].word;

        if (!word.audioInstance)
        {
            word.audioInstance = this.game.add.audio(word.audio);
        }

        word.audioInstance.play();

        // Reset play progress
        this.audioPlayProgress.visible = true;
        this.audioPlayProgressMask.x = -this.audioPlayProgress.width;
        this.audioPlayProgress.alpha = 1;

        // Animate play progress
        const playTween = this.game.add.tween(this.audioPlayProgressMask).to({ x: 0 }, word.audioInstance.durationMS, "Linear", false);
        const playFadeTween = this.game.add.tween(this.audioPlayProgress).to({ alpha: 0 }, 100, "Linear", false);
        playTween.chain(playFadeTween);
        playTween.start();

        // Hide play progress once complete
        playFadeTween.onComplete.add(() => { this.audioPlayProgress.visible = false });
    }

    /**
     * Update
     * Part of the Phaser LifeCycle
     * https://phaser.io/docs/2.6.2/Phaser.State.html#update
     */
    update()
    {
        super.update();

        if (this.currentQuizNumberDot != null)
        {
            this.quizNumberArrowIndicator.y = this.currentQuizNumberDot.worldPosition.y - 30;
            this.quizNumberArrowIndicator.x = this.currentQuizNumberDot.worldPosition.x;
        }

        this.skipButton.visible = false;

        if (this.answeredQuizQuestions.length < this.quizNumberMax)
        {
            this.skipButton.visible = true;
        }

        this.answersGroup.visible = false;
        this.quizStudyText.visible = false;
        this.studyButtons.visible = false;
        this.skipButton.visible = false;
        if (this.mode === MODES.STUDY)
        {
            this.quizStudyText.visible = true;
            this.studyButtons.visible = true;
        }
        else
        {
            this.skipButton.visible = true;
            this.answersGroup.visible = true;
        }

    }

    /**
     * Uppercase First Character
     * @param {string} string 
     */
    uppercaseFirst(string) 
    {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    /**
     * Create
     * Part of the Phaser LifeCycle
     * https://phaser.io/docs/2.6.2/Phaser.State.html#craete
     */
    create()
    {
        this.createProgressIndicators();
        this.createQuizGroup();
        this.createSkipButton();
        this.createStudyButtons();
        this.setQuizNumber(0);
        this.createSummaryDialog();
        this.createCategoriesButton();
        this.createTitle();
        this.createAnswerDialog();
        this.createRotateDevice();

        this.startTime = Date.now();
    }
}

export default Main;