/* add-on script */

var APIBuilder = function(){
    this.parameters = {};
    this.url = "";
    this.builturl = null;
    
    this.build = function(){
        let uri = [];

        for (let [key, value] of Object.entries(this.parameters)) {
            uri.push(`${key}=${value}`);
        }

        uri = encodeURIComponent(uri.join("&"));
        uri = `${this.url}?${uri}`;
        this.builturl = uri;
    };
};

var APIRunner = function(apibuilder){
    this.apibuilder = apibuilder;
    this.success = undefined;
    this.failure = undefined;
    this.run = function(){
        this.apibuilder.build();
        AP.request(apibuilder.builturl, {
            error: this.failure,
            success: this.success
        });
    };
};
