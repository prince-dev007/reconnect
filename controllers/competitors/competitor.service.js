var _ = require('lodash');
var validator = require('validator');
var db = require(`${PROJECT_DIR}/utility/selectQueries`);
var response = {"status":200,"response":""};
var moment = require('moment');
var validation = require(`${PROJECT_DIR}/utility/validation`);



module.exports = {
    getAll
};
momenttz = require('moment-timezone');


/**
 * function is used to get all competitors.
 * @param {*} search : optional
 * @param {*} agentid : mandatory
 * @param {*} offset : optional 
 * @param {*} limit : optional
 */
async function getAll(req) {
    try {

        is_Validate = true;
        is_Validate = is_Validate ? validation.issetNotEmpty(req.headers.agentid) : false;

        if (is_Validate) {
            const fields = [`sfid`,`Name`,`date_part('epoch'::text, createddate) * (1000)::double precision as createddate`];
            const tableName = `Competitor__c`;

            const WhereClouse = [];
            
            var offset = '0', limit = '1000';
            
            if (validation.issetNotEmpty(req.query.offset)) {
                offset = req.query.offset;
            }
            if (validation.issetNotEmpty(req.query.limit)) {
                limit = req.query.limit;
            }
            if (validation.issetNotEmpty(req.query.search)) {
                WhereClouse.push({ "fieldName": "name", "fieldValue": req.query.search, "type":"LIKE" })
            }
            sql = db.SelectAllQry(fields, tableName, WhereClouse, offset, limit);
            console.log(`INFO::: Get All Competitor = ${sql}`);
            
          
            var orders = await client.query(sql);
            
            if (orders.rowCount != undefined && orders.rowCount > 0) {
                response.response={ 'success': true, "data": {"competitors":orders.rows} };
                response.status = 200;
                return response; 
            }else{
                response.response={ 'success': false, "data": {"competitors":[]}, "message":"No record found." };
                response.status = 400;
                return response; 
            }
        }else{
            response.response={ 'success': false, "data": {"competitors":[]}, "message":"Mandatory parameter(s) are missing." };
            response.status = 400;
            return response; 
        }
    } catch (e) {
        console.log(e);
        response.response={ 'success': false, "data": {"competitors":[]}, "message":"Internal server error." };
        response.status = 500;
        return response; 
    }
}

