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
    let self = this;
    self.apibuilder = apibuilder;
    self.success = undefined;
    self.failure = undefined;
    self.run = function(){
        self.apibuilder.build();
        AP.request(apibuilder.builturl, {
            error: self.failure,
            success: function(data){
                let jsonObject = JSON.parse(data);
                self.success(jsonObject);
            }
        });
    };
};
