var validator = require('validator');
var moment = require('moment');

module.exports = {
    issetNotEmpty,
    isset,
    isValidDate,
    isPicklistValueValid,
    isValidSalesforceId
};

function issetNotEmpty(str){
    if(str!=undefined && typeof(str)=='string' && str.trim()!='')
        return true;
    else if(str!=undefined && str!='')
        return true;    
    else
        return false;
}

function isset(str){
    if(str!=undefined)
        return true;
    else
        return false;
}

function isValidDate(timestamp){
    if(issetNotEmpty(timestamp)){
        if((typeof(timestamp) =='string' && timestamp.length == 13) || (typeof(timestamp) =='number' && timestamp.toString().length == 13) )
            timestamp = (typeof(timestamp) =='number')?timestamp.toString().substring(0, timestamp.length-3):timestamp.substring(0, timestamp.length-3);
            
            console.log('Is valid Date >>>   ',moment.unix(timestamp).format("YYYY-MM-DD HH:mm:ss"));
            
            if(moment.unix(timestamp).format("YYYY-MM-DD HH:mm:ss")=='Invalid date'){
                return false;
            }else{
                return true;
            }
    }else{
        return false;
    }
}

/**
 * Compare picklist values from constant files 
 * @param {*} fieldValue | input field value
 * @param {*} objName | Salesforce object name
 * @param {*} apiName | Salesforce field api name
 */

function picklistValidation(fieldValue, objName, apiName){
    if (objName == "Site") {
        return (site_PickList[apiName].indexOf(fieldValue) >= 0) ? true : false;
    } else if (objName == "Influencer") {
        return (influencers_PickList[apiName].indexOf(fieldValue) >= 0) ? true : false;
    } else if (objName == "Event") {
        return (event_PickList[apiName].indexOf(fieldValue) >= 0) ? true : false;
    } else if (objName == "Visit") {
        return (visit_PickList[apiName].indexOf(fieldValue) >= 0) ? true : false;
    } else if (objName == "attendance") {
        return (attendance_PickList[apiName].indexOf(fieldValue) >= 0) ? true : false;
    } else {
        return false;
    }
}
/**
 * This function is used to validate salesforce picklist values 
 * @param {*} fieldValue 
 * @param {*} objName Salesforce object name
 * @param {*} apiName Salesforce field api name
 * @param {*} isMandatory true|false
 * @author Rohit Ramawat
 */

function isPicklistValueValid(fieldValue, objName, apiName, isMandatory) {
    var ValidationResponse =  false;
    try {
        if (isMandatory==undefined || isMandatory) {
            ValidationResponse = picklistValidation(fieldValue, objName, apiName);
        } else {
            if (fieldValue != undefined && fieldValue != null && fieldValue != '') {
                ValidationResponse = picklistValidation(fieldValue, objName, apiName);
            } else {
                ValidationResponse = true;
            }
        }
        console.log(`INFO(Validation)::::   isMandatory = ${isMandatory}   objName = ${objName}  apiName = ${apiName} fieldValue = ${fieldValue}  ValidationResponse = ${ValidationResponse}`)
        return ValidationResponse;
    } catch (e) {
        return false;
    }
}
var db = require(`${PROJECT_DIR}/utility/selectQueries`);


    // console.log('Start Time:  ', moment().format('YYYY-MM-DD HH:mm:ss'))
    // await isValidSalesforceId('Contact','0031m0000071LKyAAM', true);
    // console.log('End Time:  ', moment().format('YYYY-MM-DD HH:mm:ss'))

async function checkSFIDReference(objName, sfid) {
    
    if (issetNotEmpty(sfid) && issetNotEmpty(objName)) {

        var WhereClouse = [];
        WhereClouse.push({ "fieldName": "sfid", "fieldValue": sfid });
        sql = db.SelectAllQry('sfid', objName, WhereClouse, '0', '1', '');
        var records = await client.query(sql);
        console.log('INFO :: sql = ',sql)
        console.log('INFO :: records.rowCount = ',records.rowCount)
        if (records.rowCount != undefined && records.rowCount > 0) {
            return {"success": true , "message":""};
        } else {
            return {"success": false , "message":"No record found."};
        }
    } else {
        return {"success": false , "message":"Field api name and object name should not be blank."};
    }
} 

async function isValidSalesforceId(objName, sfid, isMandatory) {
    try {
        response = { "success": false, "message": "No Record found." };
        if (isMandatory != undefined && isMandatory) {
            response = await checkSFIDReference(objName, sfid);
        } else {
            if (issetNotEmpty(sfid)) {
                response = await checkSFIDReference(objName, sfid);
            } else {
                response = { "success": true, "message": "" };
            }
        }
        console.log(`INFO:: IS valid Object = ${objName}   sfid = ${sfid}  isMandatory = ${isMandatory}  response = `, response);
        return response;

    } catch (e) {
        console.log('ERROR: SERVER ERROR ', e)
        return { "success": false, "message": "Internal server error" };
    }
}