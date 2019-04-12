import './utils/shuffle';
import shuffle from './utils/shuffle';

/**
 * Words 
 */
class Words
{
    constructor()
    {
        this._words = {};
        this._categories = {};
    }

    /**
     * Get groups
     * @TODO change this to group
     */
    getGroups()
    {
        return this._categories;
    }

    /**
     * Get 
     * @param {*} category 
     */
    getGroupWords(category)
    {
        return Array.from(this._categories[category]).map((word) =>
        {
            return this._words[word];
        });
    }

    /**
     * Returns a random set of words from the group
     * This doesn't actually grab randomly. 
     * When words are loaded they are loaded randomly. 
     * This will just grab the next "set" of words
     * @param {string} category 
     * @param {number} numberOfWords 
     */
    getWords(category, numberOfWords)
    {
        const categoryWords = this._categories[category];
        const unusedWordsSet = categoryWords.unusedWords;
        const usedWordsSet = categoryWords.usedWords;
        const totalWordCount = unusedWordsSet.size + usedWordsSet.size;

        numberOfWords = Math.min(numberOfWords, totalWordCount);

        let unusedWordsArray = Array.from(unusedWordsSet);
        const usedWordsArray = Array.from(usedWordsSet);
        
        const words = [];
        
        for (let i = 0; i < numberOfWords; i++)
        {
            if (unusedWordsArray.length === 0)
            {
                for(let usedWord of usedWordsArray)
                {
                    unusedWordsSet.add(usedWord);
                }   
                unusedWordsArray = Array.from(unusedWordsSet);
            }

            const word = unusedWordsArray.shift();
            unusedWordsSet.delete(word);
            usedWordsSet.add(word);
            
            words.push(word);
        }

        console.log(usedWordsSet, unusedWordsSet);
        
        return words.map((word) =>
        {
            return this._words[word];
        });
    }

    /**
     * Returns word details based on word
     * @param {*} word 
     */
    getWord(word)
    {
        return this._words[word];
    }

    /**
     * Adds words
     * @param {array} words 
     */
    add(words)
    {
        words = shuffle(words);

        for (const word of words)
        {
            const group = word.group;

            if (typeof this._categories[group] === 'undefined')
            {
                this._categories[group] = {
                    unusedWords: new Set(),
                    usedWords: new Set()
                }
            }

            this._categories[group].unusedWords.add(word.word);
            this._words[word.word] = word;
        }
    }
    
    _addArrayToSet(arr, set)
    {
        for(let o of arr)
        {
            set.add(o);
        }
    }
}

export default new Words();