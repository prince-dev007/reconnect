//// https://github.com/validatorjs/validator.js
//const config = require('config.json');
require("dotenv").config();

const config = {
    "secret": `${process.env.JWT_SECRET}`
}
var _ = require('lodash');

var validation = require(`${PROJECT_DIR}/utility/validation`);

var response = { "status": 200, "response": "" };
var db = require(`${PROJECT_DIR}/utility/selectQueries`);



module.exports = {
    updateRegistrationToken
};


/**
 * Due to some reason agent is not able to work so he cam mark as absent.
 * Mandatory Parameter(s): absentReason, leaveType, date, headers: agentid
 * @param {*} req 
 */

async function updateRegistrationToken(req) {
    try {
        is_Validate = true;
        is_Validate = is_Validate ? validation.issetNotEmpty(req.headers.agentid) : false;
        is_Validate = is_Validate ? validation.issetNotEmpty(req.body.token_key) : false;

        // day should be start before end it
        if (is_Validate) {

            var tableName = 'team__c',
                fields = ['sfid'],
                offset = '0',
                limit = '1',
                orderby = '',
                WhereClouse = [];
            WhereClouse.push({ "fieldName": "sfid", "fieldValue": req.headers.agentid });
            //WhereClouse.push({ "fieldName": "sfid", "fieldValue": req.body.token_key});

            sql = await db.SelectAllQry(fields, tableName, WhereClouse, offset, limit, orderby);
            console.log(`INFO::: Get Agent Detail = ${sql}`);
            var agentDetail = await client.query(sql);
            if (agentDetail.rows.length > 0) {
                console.log('agentDetail.rows  >>>  ', agentDetail.rows);
                var fieldValue = [];
                fieldValue.push({ "field": "app_registration_token__c", "value": req.body.token_key });
                var WhereClouse = [];
                WhereClouse.push({ "field": "sfid", "value": req.headers.agentid });
                updatesAgentDetail = await db.updateRecord(tableName, fieldValue, WhereClouse);

                console.log('updatesAgentDetail.rows  >>>  ', updatesAgentDetail);
                if (updatesAgentDetail.success) {
                    response.status = 200;
                    response.response = { "success": true, "message": "" };
                    return response;
                } else {
                    response.status = 400;
                    response.response = { "success": false, "message": "No Agent found" };
                    return response;
                }
            } else {
                response.status = 400;
                response.response = { "success": false, "message": "No Agent found" };
                return response;
            }

        } else {
            response.status = 400;
            response.response = { "success": false, "message": "Mandatory parameter(s) are missing.", "data": {} };
            return response;
        }
    } catch (e) {
        console.log(e);
        response.status = 500;
        response.response = { "success": false, "message": "Internal server error.", "data": {} };
        return response;
    }
}