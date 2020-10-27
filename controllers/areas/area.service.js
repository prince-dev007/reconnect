var _ = require('lodash');
var validator = require('validator');
var db = require(`${PROJECT_DIR}/utility/selectQueries`);
var response = {"status":200,"response":""};


module.exports = {
    getAll,
    detail
};

/**
 * FUnction is used to get all area and its city 
 * @param {*} req 
 */
async function getAll(req) {
    try {

        is_Validate = true;
        is_Validate = is_Validate ? !validator.isEmpty(req.query.offset) : false;
        is_Validate = is_Validate ? !validator.isEmpty(req.query.limit) : false;
        is_Validate = is_Validate ? !validator.isEmpty(req.headers.agentid) : false;

        if (is_Validate) {
           
            var offset = '0', limit = '10';
           
            if (req.query.offset!=undefined && !validator.isEmpty(req.query.offset)) {
                offset = req.query.offset;
            }
            if (req.query.limit!=undefined && !validator.isEmpty(req.query.limit)) {
                limit = req.query.limit;
            }
            let sql = `SELECT Area_SS__c.name as areaName, Area_SS__c.sfid as areaid,City_SS__c.name as cityName  
            FROM ${process.env.TABLE_SCHEMA_NAME}.Area_SS__c 
            LEFT JOIN ${process.env.TABLE_SCHEMA_NAME}.City_SS__c  ON Area_SS__c.city__c = City_SS__c.sfid 
            offset ${offset} limit ${limit}`;

            console.log(`INFO::: Get All Areas = ${sql}`);

            var areas = await client.query(sql);
           
            if (areas.rowCount != undefined && areas.rowCount > 0) {
                response.response={ 'success': true, "data": {"areas":areas.rows} };
                response.status = 200;
                return response; 
            }else{
                response.response={ 'success': false, "data": {"areas":[]}, "message":"No record found." };
                response.status = 400;
                return response; 
            }
        }else{
            response.response={ 'success': false, "data": {"areas":[]}, "message":"Mandatory parameter(s) are missing." };
            response.status = 400;
            return response; 
        }
    } catch (e) {
        console.log(e);
        response.response={ 'success': false, "data": {"orders":[]}, "message":"Internal server error." };
        response.status = 500;
        return response; 
    }
}


/**
 * FUnction is used to ger area detail
 * @param {*} areaId 
 * TODO: for not its not in use
 */
async function detail(areaId) {
    try {
        if (!_.isEmpty(productId)) {
            let sql = `SELECT * FROM public.areas where id='${areaId}' limit 1`;
            var sDetail = await client.query(sql);

            if (sDetail.rowCount != undefined && sDetail.rowCount > 0) {
                return sDetail.rows[0];
            }
        }
    } catch (e) {
        return {};
    }
}