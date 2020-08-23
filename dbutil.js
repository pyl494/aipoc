const Promise = require("bluebird");
const sqlite = require('sqlite');
const SQL = require("sql-template-strings");

import sqlite3 from 'sqlite3'

const check = require('./check.js');

var dbutil = {
    dbPromise: sqlite.open({
      filename: './database.db',
      driver: sqlite3.Database
    }),

    errors: {
        NotFound: {
            reason: "could not find a match"
        }
    },

    catchError: function(output, reason){
        console.log("Error:", reason, '\nStack: ', new Error().stack);
        output.success = false;
        output.reason = reason;
    },

    tableExists: async function (table)
    {
        try 
        {
            var db = await this.dbPromise;
            const [name] = await Promise.all([
                db.get(SQL`SELECT name FROM sqlite_master WHERE type='table' AND name = ${table}`)
            ]);

            return check.hasResult(name);
        }
        catch(err)
        {
            //console.log("Error:", err, new Error().stack);
            return false;
        }
    },

    createTable: async function (definition)
    {
        var output = {
            success: true,
            reason: ""
        };
        
        try
        {
            var db = await this.dbPromise;
            await Promise.all([
                db.run(definition).catch(reason => this.catchError(output, reason))
            ]).catch(reason => this.catchError(output, reason));
        }
        catch (err)
        {
            this.catchError(output, err.toString());
        }

        return output;
    },

    selectOne: async function(query)
    {
        var output = {
            found: false,
            reason: "",
            result: {}
        }

        try 
        {
            var db = await this.dbPromise;
            
            var queryResult = {
                success: true,
                reason: ""
            };
            
            var [result] = await Promise.all([
               db.get(query).catch(reason => this.catchError(queryResult, reason))
            ]).catch(reason => this.catchError(queryResult, reason));

            if (queryResult.success)
            {
                if (check.hasResult(result))
                {
                    output.found = true;
                    output.result = result;
                }
                else
                {
                    throw this.errors.NotFound.reason;
                }
            }
            else
            {
                throw queryResult.reason;
            }
        }
        catch (err)
        {
            //console.log("Error:", err, new Error().stack);
            output.found = false;
            output.reason = err.toString();
        }

        return output;
    },

    select: async function(query)
    {
        var output = {
            found: false,
            reason: "",
            result: []
        }

        try 
        {
            var db = await this.dbPromise;
            
            var queryResult = {
                success: true,
                reason: ""
            };

            var [result] = await Promise.all([
               db.all(query).catch(reason => this.catchError(queryResult, reason))
            ]).catch(reason => this.catchError(queryResult, reason));
            
            if (queryResult.success)
            {
                if (check.hasResult(result))
                {
                    output.found = true;
                    output.result = result;
                }
                else
                {
                    throw this.errors.NotFound.reason;
                }
            }
            else
            {
                throw queryResult.reason;
            }
        }
        catch (err)
        {
            //console.log("Error:", err, new Error().stack);
            output.found = false;
            output.reason = err.toString();
        }

        return output;
    },

    modify: async function(definition)
    {
        var output = {
            success: true,
            reason: ""
        };

        try
        {
            var db = await this.dbPromise;

            await Promise.all([
                db.run(definition).catch(reason => this.catchError(output, reason))
            ]).catch(reason => this.catchError(output, reason));
        }
        catch (err)
        {
            this.catchError(output, err);
        }

        return output;
    },

    insert: async function(definition) {return await this.modify(definition)},
    update: async function(definition) {return await this.modify(definition)}
};

module.exports = dbutil;