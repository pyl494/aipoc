
var check = {
    isDefined: function(p)
    {
        return typeof(p) !== 'undefined' && p !== null && p !== '';
    },

    isProvided: function(p)
    {
        return typeof(p) !== 'undefined' && p !== null && p !== '';
    },

    isEmpty: function(p)
    {
        return !this.isDefined(p) || (this.isDefined(p) && Object.keys(p).length == 0);
    },

    hasResult: function(p)
    {
        return this.isDefined(p) && !this.isEmpty(p);
    }
}

module.exports = check;