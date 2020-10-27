var _ = require('lodash');
var db = require(`${PROJECT_DIR}/utility/selectQueries`);
var response = { "status": 200, "response": "" };
var moment = require('moment');
var validation = require(`${PROJECT_DIR}/utility/validation`);
const uuidv4 = require('uuid/v4');
// var component = require(`${PROJECT_DIR}/controllers/dashboard/dashboard.component`);
var component_new = require(`${PROJECT_DIR}/controllers/dashboard/dashboard.component2`);
var dtUtil = require(`${PROJECT_DIR}/utility/dateUtility`);


module.exports = {
    getOrderValue,
    getCounters,
    getVisitCount,
    getSiteCount,
    getEventCount,


    updateMonthlyTarget
    
};


momenttz = require('moment-timezone');

TARGET_FIELDS = [`Orders__c`,`Orders_Target__c`,`Sites_Visited__c`,`Sites_Visited_Target__c`,`Team__c`,`Visits__c`,`Visits_Target__c`,`Electrician_Engaged_Target__c`,`Electricians_Engaged__c`,`Events__c`,`Events_Target__c`,`Name`,`Month__c`];
TARGET_TABLE ='kpi__c';

async function getOrderValue(req) {
    try {

        is_Validate = true;
        is_Validate = is_Validate ? validation.issetNotEmpty(req.headers.agentid) : false;
        if (is_Validate) {

            counters = await component_new.getOrderValue(req);

            response.response = { 'success': false, "data": { counters }, "message": "" };
            response.status = 200;
            return response;
        } else {
            response.response = { 'success': false, "data": {}, "message": "Mandatory parameter(s) are missing." };
            response.status = 400;
            return response;
        }
    } catch (e) {
        console.log(e);
        response.response = { 'success': false, "data": {}, "message": "Internal server error." };
        response.status = 500;
        return response;
    }
}



async function getCounters(req) {
    try {

        is_Validate = true;
        is_Validate = is_Validate ? validation.issetNotEmpty(req.headers.agentid) : false;
        if (is_Validate) {

            counters = await component_new.getCounters(req);
            response.response = { 'success': false, "data": {counters}, "message": "" };
            response.status = 200;
            return response;
            //return ;
           
        } else {
            response.response = { 'success': false, "data": {  }, "message": "Mandatory parameter(s) are missing." };
            response.status = 400;
            return response;
        }
    } catch (e) {
        console.log(e);
        response.response = { 'success': false, "data": { }, "message": "Internal server error." };
        response.status = 500;
        return response;
    }
}

async function getVisitCount(req) {
    try {

        is_Validate = true;
        is_Validate = is_Validate ? validation.issetNotEmpty(req.headers.agentid) : false;
        //is_Validate = is_Validate ? validation.issetNotEmpty() : false;
        if (is_Validate) {

            counters = await component_new.getVisitCount(req);
            response.response = { 'success': false, "data": { counters }, "message": "" };
            response.status = 200;
            return response;
            //return ;

        } else {
            response.response = { 'success': false, "data": {}, "message": "Mandatory parameter(s) are missing." };
            response.status = 400;
            return response;
        }
    } catch (e) {
        console.log(e);
        response.response = { 'success': false, "data": {}, "message": "Internal server error." };
        response.status = 500;
        return response;
    }
}

async function getSiteCount(req) {
    try {

        is_Validate = true;
        is_Validate = is_Validate ? validation.issetNotEmpty(req.headers.agentid) : false;
        //is_Validate = is_Validate ? validation.issetNotEmpty() : false;
        if (is_Validate) {

            counters = await component_new.getSiteCount(req);
            response.response = { 'success': false, "data": { counters }, "message": "" };
            response.status = 200;
            return response;
            //return ;

        } else {
            response.response = { 'success': false, "data": {}, "message": "Mandatory parameter(s) are missing." };
            response.status = 400;
            return response;
        }
    } catch (e) {
        console.log(e);
        response.response = { 'success': false, "data": {}, "message": "Internal server error." };
        response.status = 500;
        return response;
    }
}


//updateMonthlyTarget('a0H1m000000E92OEAS','visit','02',{'visits__c':"visits__c + 1"})
async function updateMonthlyTarget(agentId, type, month, values) {

    console.log(`agentId = ${agentId}  ,type = ${type},  month = > ${month},  values=>  ${values}`);

    var monthArray = { "01": "January", "02": "February", "03": "March", "04": "April", "05": "May", "06": "June", "07": "July", "08": "August", "09": "September", "10": "October", "11": "November", "12": "December" };

    //TARGET_FIELDS = [`Orders__c`,`Orders_Target__c`,`Sites_Visited__c`,`Sites_Visited_Target__c`,`Team__c`,`Visits__c`,`Visits_Target__c`,`Electrician_Engaged_Target__c`,`Electricians_Engaged__c`,`Events__c`,`Events_Target__c`,`Name`,`Month__c`];
    TARGET_TABLE = 'kpi__c';

    var fieldsType = {
        "eventPart": { "ob": "electricians_engaged__c" }, "target": "electrician_engaged_target__c",
        "seller": { "ob": "new_counters__c" }, "target": "new_counters_target__c",
        "order": { "ob": "orders__c" }, "target": "orders_target__c",
        "site": { "ob": "sites_visited__c" }, "target": "sites_visited_target__c",
        "visit": { "ob": "visits__c" }, "target": "visits_target__c",
        //"elect": { "ob": "Electricians_Engaged__c" }, "target": "electrician_engaged_target__c",
        "event": { "ob": "events__c" }, "target": "events_target__c"
    };

    WhereClouse = [];
    WhereClouse.push({ "fieldName": `month__c`, "fieldValue": `${monthArray[month]}` });
    WhereClouse.push({ "fieldName": `team__c`, "fieldValue": `${agentId}` });
    //WhereClouse.push({ "fieldName": `month__c`, "fieldValue": `'${startDate}' and '${endDate}'` ,"type":"BETWEEN" });

    var offset = '0', limit = '999', orderBy = ' ';
    sql = db.SelectAllQry([`count(id) as count`], TARGET_TABLE, WhereClouse, offset, limit, orderBy);
    console.log(`INFO::: Get all Visits = ${sql}`);
    var agentTargets = await client.query(sql);
    console.log('agentTargets.rows.count  ===>     ', agentTargets.rows[0].count);

    if (agentTargets.rows[0].count > 0) {
        // Update Records
        var fieldValue = [];
        if (type == 'visit' || type == 'seller' || type == 'site' || type == 'order'|| type == 'eventPart'|| type == 'event' )
            fieldValue.push({ "field": `${fieldsType[type].ob}`, "value": `${values[fieldsType[type].ob]}`, "type": "BOOLEAN" });
        else
            fieldValue.push({ "field": `${fieldsType[type].ob}`, "value": `${values[fieldsType[type].ob]}` });
        const WhereClouse = [];
        WhereClouse.push({ "field": "Team__c", "value": agentId });
        WhereClouse.push({ "field": "month__c", "value": monthArray[month] });
        console.log(` sdasdasdasd--->>>>   ${values[fieldsType[type].ob]}`);

        eventDetail = await db.updateRecord(TARGET_TABLE, fieldValue, WhereClouse);

    } else {
        targetFields = `PG_ID__c, team__c, createddate, month__c`;
        if (type != '' && fieldsType[type]) {
            targetFields += ',' + fieldsType[type].ob;  // +','+fieldsType[type].target
        }
        var UUIDVal = uuidv4();
        var createdDate = dtUtil.todayDatetime();
        console.log(` sdasdasdasd--->>>>   `, values);
        console.log(` type--->>>>   ${type}`);
        console.log(` fieldsType[type]--->>>>   ${fieldsType[type]}`);
        console.log(` fieldsType[type].ob--->>>>   ${fieldsType[type].ob}`);
        var fieldvalue = '1';
        if (type == 'visit') {

        }
        //${values[fieldsType[type].ob]}

        targetFieldsValues = [`${UUIDVal}`, `${agentId}`, `${createdDate}`, `${monthArray[month]}`, `${fieldvalue}`];
        console.log(targetFieldsValues);
        insertTarget = await db.insertRecord(targetFields, targetFieldsValues, TARGET_TABLE);

        // Update Record
    }
}


async function getEventCount(req) {
    try {
        // Completed
        is_Validate = true;
        is_Validate = is_Validate ? validation.issetNotEmpty(req.headers.agentid) : false;
        //is_Validate = is_Validate ? validation.issetNotEmpty() : false;
        if (is_Validate) {

            counters = await component_new.getEventParticipantCount(req);
            //eventParticipants = await component_new.getEventCount(req);
            response.response = { 'success': false, "data": { counters }, "message": "" };
            response.status = 200;
            return response;

        } else {
            response.response = { 'success': false, "data": {}, "message": "Mandatory parameter(s) are missing." };
            response.status = 400;
            return response;
        }
    } catch (e) {
        console.log(e);
        response.response = { 'success': false, "data": {}, "message": "Internal server error." };
        response.status = 500;
        return response;
    }
}