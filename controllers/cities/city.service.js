var _ = require('lodash');
var db = require(`${PROJECT_DIR}/utility/selectQueries`);
var response = { "status": 200, "response": "" };
var moment = require('moment');
var validation = require(`${PROJECT_DIR}/utility/validation`);
const uuidv4 = require('uuid/v4');
var dtUtil = require(`${PROJECT_DIR}/utility/dateUtility`);


module.exports = {
    getAll
   
};

var CITY_FIELD = [`name`,`sfid`,`city_code__c`,`date_part('epoch'::text, createddate) * (1000)::double precision as createddate`];
var CITY_TABLE_NAME = `City_SS__c`;
momenttz = require('moment-timezone');
/**
 * This method is used to get all orders using follwing parameters
 * @param {*} offset - start point
 * @param {*} limit - record limit
 * @param {*} sellerid - account id 
 * @param {*} type Dealer/retailer
 
 */
async function getAll(req) {
    try {

        is_Validate = true;
        is_Validate = is_Validate ? validation.issetNotEmpty(req.headers.agentid) : false;
        if((req.query.type==undefined || req.query.type=='') && (req.query.sellerid!=undefined && req.query.sellerid!='')){
            is_Validate = false;
        }else if((req.query.type!=undefined && req.query.type!='') && (req.query.sellerid==undefined || req.query.sellerid=='')){
            is_Validate = false;
        }
        if (is_Validate) {

            const fields = CITY_FIELD.join(', ');
            const tableName = CITY_TABLE_NAME;

            const WhereClouse = [];
            var offset = '0', limit = '4000';
           
            if (validation.issetNotEmpty(req.query.offset)) {
                offset = req.query.offset;
            }
            if (validation.issetNotEmpty(req.query.limit)) {
                limit = req.query.limit;
            }
            
            sql = db.SelectAllQry(fields, tableName, WhereClouse, offset, limit,' order by createddate desc');
            console.log(`INFO::: Get all Cities = ${sql}`);

            var cities = await client.query(sql);

            if (cities.rowCount != undefined && cities.rowCount > 0) {
                response.response = { 'success': true, 'count': cities.rowCount, "data": { "cities": cities.rows } };
                response.status = 200;
                return response;
            } else {
                response.response = { 'success': false, "data": { "cities": [] }, "message": "No record found." };
                response.status = 400;
                return response;
            }
        } else {
            response.response = { 'success': false, "data": { "cities": [] }, "message": "Mandatory parameter(s) are missing." };
            response.status = 400;
            return response;
        }
    } catch (e) {
        console.log(e);
        response.response = { 'success': false, "data": { "cities": [] }, "message": "Internal server error." };
        response.status = 500;
        return response;
    }
}

