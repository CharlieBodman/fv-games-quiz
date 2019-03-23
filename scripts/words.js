class Words
{
    constructor()
    {
        this.words = {};
        this.groups = {};
    }

    add(words)
    {
        for( const word of words )
        {
            const group = word.group;
            
            if (typeof this.groups[group] === 'undefined')
            {
                this.groups[group] = new Set();
            }
            
            this.groups[group].add(word.indigenous);
            this.words[word.indigenous] = word;
        };
    }
}

export default new Words();