const fs = require('fs');
const path = require('path');

let backup_routes = undefined;
let file = path.join(__dirname, 'external.js');

module.exports = function(app, addon) {
    function loadRoutes(){
        app._router.stack = Object.assign([], backup_routes);
        var source = fs.readFileSync(file, 'utf8');
    
        eval(source);
    }

    if (typeof backup_routes === 'undefined')
    {
        backup_routes = Object.assign([], app._router.stack);
        
        loadRoutes();
        fs.watch(file, loadRoutes);        
    }
};
