var db = require(`${PROJECT_DIR}/utility/selectQueries`);
const uuidv4 = require('uuid/v4');
var dtUtil = require(`${PROJECT_DIR}/utility/dateUtility`);
var response = { "status": 200, "response": "" };
var validation = require(`${PROJECT_DIR}/utility/validation`);




module.exports = {
    getOrderCount,
    
    getOrderValue,
    getCounters,
    getVisitCount,
    getSiteCount,
    getEventCount,
    
    getNewRetailer

   
};


async function getOrderCount(req){
    try{

        
        var isPSM = false;
        var WhereClouse = [];
        var loginAgentInfo = await db.agentDetail(req.headers.agentid);


        if (req.query.psm__c != undefined && req.query.psm__c != '') {

            var psmInfo = await db.agentDetail(req.query.psm__c);

            if (psmInfo.rowCount > 0 && psmInfo.rows[0].member_type == 'PSM') {
                isPSM = true;
            } else {
                isPSM = false;
            }
        } else {
            if (loginAgentInfo.rowCount > 0 && loginAgentInfo.rows[0].member_type == 'PSM') {
                isPSM = true;
                req.query.psm__c = req.headers.agentid;
            } else if (loginAgentInfo.rowCount > 0 && loginAgentInfo.rows[0].member_type == 'ASM') {
                isPSM = false;
            }
        }
        
        if (isPSM) {
            WhereClouse.push({ "fieldName": "psm__c", "fieldValue": req.query.psm__c });
        } else {
            if (validation.issetNotEmpty(req.headers.agentid) && validation.issetNotEmpty(req.headers.agentid)) {
                WhereClouse.push({ "fieldName": "asm__c", "fieldValue": req.headers.agentid });
            }
        }

        
        if(validation.issetNotEmpty(req.query.startDate) && validation.issetNotEmpty(req.query.endDate)){
            startDate = dtUtil.timestampToDate(req.query.startDate,'YYYY-MM-DD');
            endDate = dtUtil.timestampToDate(req.query.endDate,'YYYY-MM-DD')
            WhereClouse.push({ "fieldName": `order_date__c`, "fieldValue": `'${startDate}' and '${endDate}'` ,"type":"BETWEEN" });
        }

        const fields = `count(sfid) as record_count`;
        const tableName = SF_ORDER_TABLE_NAME;

        
        var offset = '0', limit = '1';
       
        sql = db.SelectAllQry(fields, tableName, WhereClouse, offset, limit,' ');
        console.log(`INFO::: Get all Visits = ${sql}`);

        var visits = await client.query(sql);
        response.response = { 'success': true, "data": visits.rows, "message": "" };
        response.status = 500;
        return response;
    }catch(e){
        console.log(e);
        response.response = { 'success': false, "data": {}, "message": "Internal server error." };
        response.status = 500;
        return response;

    }
}    

async function getSiteCount(req) {
    try {

        var isPSM = false;
        var WhereClouse = [];
        var loginAgentInfo = await db.agentDetail(req.headers.agentid);


        if (req.query.psm__c != undefined && req.query.psm__c != '') {

            var psmInfo = await db.agentDetail(req.query.psm__c);

            if (psmInfo.rowCount > 0 && psmInfo.rows[0].member_type == 'PSM') {
                isPSM = true;
            } else {
                isPSM = false;
            }
        } else {
            if (loginAgentInfo.rowCount > 0 && loginAgentInfo.rows[0].member_type == 'PSM') {
                isPSM = true;
                req.query.psm__c = req.headers.agentid;
            } else if (loginAgentInfo.rowCount > 0 && loginAgentInfo.rows[0].member_type == 'ASM') {
                isPSM = false;
            }
        }

        if (isPSM) {
            WhereClouse.push({ "fieldName": "psm__c", "fieldValue": req.query.psm__c });
        } else {
            if (validation.issetNotEmpty(req.headers.agentid) && validation.issetNotEmpty(req.headers.agentid)) {
                WhereClouse.push({ "fieldName": "asm__c", "fieldValue": req.headers.agentid });
            }
        }
        if (validation.issetNotEmpty(req.query.startDate) && validation.issetNotEmpty(req.query.startDate)) {
            startDate = dtUtil.timestampToDate(req.query.startDate, 'YYYY-MM-DD');
            endDate = dtUtil.timestampToDate(req.query.endDate, 'YYYY-MM-DD')
            WhereClouse.push({ "fieldName": `createddate`, "fieldValue": `'${startDate}' and '${endDate}'`, "type": "BETWEEN" });
        }



        const fields = `count(sfid) as record_count`;
        const tableName = `sites__c`;


        var offset = '0', limit = '1';

        sql = db.SelectAllQry(fields, tableName, WhereClouse, offset, limit, ' ');
        console.log(`INFO::: Get all SITES = ${sql}`);

        var visits = await client.query(sql);
        response.response = { 'success': true, "data": visits.rows, "message": "" };
        response.status = 500;
        return response;
    } catch (e) {
        console.log(e);
        response.response = { 'success': false, "data": {}, "message": "Internal server error." };
        response.status = 500;
        return response;

    }
}

/**
 * getOrderValue
 * @param {*} req 
 */
async function getOrderValue(req){
    try{

        var isPSM = false;
        var WhereClouse = [];
        var loginAgentInfo = await db.agentDetail(req.headers.agentid);
        var fields = '';

        if (req.query.psm__c != undefined && req.query.psm__c != '') {

            var psmInfo = await db.agentDetail(req.query.psm__c);

            if (psmInfo.rowCount > 0 && psmInfo.rows[0].member_type == 'PSM') {
                isPSM = true;
            } else {
                isPSM = false;
            }
        } else {
            if (loginAgentInfo.rowCount > 0 && loginAgentInfo.rows[0].member_type == 'PSM') {
                isPSM = true;
                req.query.psm__c = req.headers.agentid;
            } else if (loginAgentInfo.rowCount > 0 && loginAgentInfo.rows[0].member_type == 'ASM') {
                isPSM = false;
            }
        }
        
        fields = `SUM(order_value__c) as order_value, to_char(order_date__c, 'MM') as order_month, psm__c`;
        if (isPSM) {
            WhereClouse.push({ "fieldName": "psm__c", "fieldValue": req.query.psm__c });
        } else {
         
            orderBy = ' group by order_month,psm__c order by order_month asc';
            
            if (validation.issetNotEmpty(req.headers.agentid) && validation.issetNotEmpty(req.headers.agentid)) {
                WhereClouse.push({ "fieldName": "asm__c", "fieldValue": req.headers.agentid });
            }
        }

        
        if(validation.issetNotEmpty(req.query.startDate) && validation.issetNotEmpty(req.query.endDate)){
            startDate = dtUtil.timestampToDate(req.query.startDate,'YYYY-MM-DD');
            endDate = dtUtil.timestampToDate(req.query.endDate,'YYYY-MM-DD')
            WhereClouse.push({ "fieldName": `order_date__c`, "fieldValue": `'${startDate}' and '${endDate}'` ,"type":"BETWEEN" });

            fields = `SUM(order_value__c) as order_value, psm__c`;
            orderBy = ' group by psm__C ';
        }

        
       
        const tableName = SF_ORDER_TABLE_NAME;

        
        var offset = '0', limit = '1000';
       
        sql = db.SelectAllQry(fields, tableName, WhereClouse, offset, limit,orderBy);
        console.log(`INFO::: Get all Visits = ${sql}`);

        var orderValues = await client.query(sql);
       
        return orderValues.rows;
    }catch(e){
        
        return [];

    }
}

async function getCounters(req){
    try {
        var isPSM = false;
        var WhereClouse = [];
        
        var orderBy = '', fields = '';
        var loginAgentInfo = await db.agentDetail(req.headers.agentid);


        if (req.query.psm__c != undefined && req.query.psm__c != '') {

            var psmInfo = await db.agentDetail(req.query.psm__c);

            if (psmInfo.rowCount > 0 && psmInfo.rows[0].member_type == 'PSM') {
                isPSM = true;
            } else {
                isPSM = false;
                
            }
        } else {
            if (loginAgentInfo.rowCount > 0 && loginAgentInfo.rows[0].member_type == 'PSM') {
                isPSM = true;
                req.query.psm__c = req.headers.agentid;
            } else if (loginAgentInfo.rowCount > 0 && loginAgentInfo.rows[0].member_type == 'ASM') {
                isPSM = false;
            }
        }
        
        if (isPSM) {
            fields = `count(sfid),psm__c,0 as target__c`;
            WhereClouse.push({ "fieldName": "psm__c", "fieldValue": req.query.psm__c });
        } else {
            orderBy = ' group by month,psm__c order by month asc';
            fields = `count(sfid) , to_char(createddate, 'MM') as month, psm__c, 0 as target__c`;

            if (validation.issetNotEmpty(req.headers.agentid) && validation.issetNotEmpty(req.headers.agentid)) {
                WhereClouse.push({ "fieldName": "asm__c", "fieldValue": req.headers.agentid });
            }
        }
        
        if(validation.issetNotEmpty(req.query.startDate) && validation.issetNotEmpty(req.query.endDate)){
            startDate = dtUtil.timestampToDate(req.query.startDate,'YYYY-MM-DD');
            endDate = dtUtil.timestampToDate(req.query.endDate,'YYYY-MM-DD')
            WhereClouse.push({ "fieldName": `createddate`, "fieldValue": `'${startDate}' and '${endDate}'` ,"type":"BETWEEN" });

            orderBy = ' group by psm__c';
            fields = `count(sfid) , psm__c, , 0 as target__c`;
        }

        //to_char(created_on, 'YYYY-WW')
        const tableName = `account`;

        
        var offset = '0', limit = '1000';
       
        sql = db.SelectAllQry(fields, tableName, WhereClouse, offset, limit,orderBy);
        console.log(`INFO::: Get all Counters = ${sql}`);

        var counters = await client.query(sql);
        return counters.rows;
       
    }catch(e){
        console.log(e);
        return [];

    }
}


async function getVisitCount(req){
    try{

        var isPSM = false;
        var WhereClouse = [];
        orderBy = '';
        var loginAgentInfo = await db.agentDetail(req.headers.agentid);


        if (req.query.psm__c != undefined && req.query.psm__c != '') {

            var psmInfo = await db.agentDetail(req.query.psm__c);

            if (psmInfo.rowCount > 0 && psmInfo.rows[0].member_type == 'PSM') {
                isPSM = true;
            } else {
                isPSM = false;
            }
        } else {
            if (loginAgentInfo.rowCount > 0 && loginAgentInfo.rows[0].member_type == 'PSM') {
                isPSM = true;
                req.query.psm__c = req.headers.agentid;
            } else if (loginAgentInfo.rowCount > 0 && loginAgentInfo.rows[0].member_type == 'ASM') {
                isPSM = false;
            }
        }
        
        if (isPSM) {
            WhereClouse.push({ "fieldName": "psm__c", "fieldValue": req.query.psm__c });
        } else {

            orderBy = ' group by month,psm__c order by month asc';
            fields = `count(sfid) as visit_count , to_char(visit_date__c, 'MM') as month, psm__c`;

            if (validation.issetNotEmpty(req.headers.agentid) && validation.issetNotEmpty(req.headers.agentid)) {
                WhereClouse.push({ "fieldName": "asm__c", "fieldValue": req.headers.agentid });
            }
        }
        
        if(validation.issetNotEmpty(req.query.startDate) && validation.issetNotEmpty(req.query.startDate)){
            startDate = dtUtil.timestampToDate(req.query.startDate,'YYYY-MM-DD');
            endDate = dtUtil.timestampToDate(req.query.endDate,'YYYY-MM-DD')
            WhereClouse.push({ "fieldName": `visit_date__c`, "fieldValue": `'${startDate}' and '${endDate}'` ,"type":"BETWEEN" });
            
            orderBy = ' group by psm__c';
            fields = `count(sfid)  as visit_count, psm__c`;
        }
        
        WhereClouse.push({ "fieldName": "status__c", "fieldValue": "Completed" });
        const tableName = SF_VISIT_TABLE_NAME;

        
        var offset = '0', limit = '999';
       
        sql = db.SelectAllQry(fields, tableName, WhereClouse, offset, limit,orderBy);
        console.log(`INFO::: Get all Visits = ${sql}`);

        var visits = await client.query(sql);
        
        return visits.rows;
    }catch(e){
        console.log(e);
        return [];

    }
}



async function getSiteCount(req) {
    try {

        var isPSM = false, fields = '', orderBy ='';
        var WhereClouse = [];
        var loginAgentInfo = await db.agentDetail(req.headers.agentid);


        if (req.query.psm__c != undefined && req.query.psm__c != '') {

            var psmInfo = await db.agentDetail(req.query.psm__c);

            if (psmInfo.rowCount > 0 && psmInfo.rows[0].member_type == 'PSM') {
                isPSM = true;
            } else {
                isPSM = false;
            }
        } else {
            if (loginAgentInfo.rowCount > 0 && loginAgentInfo.rows[0].member_type == 'PSM') {
                isPSM = true;
                req.query.psm__c = req.headers.agentid;
            } else if (loginAgentInfo.rowCount > 0 && loginAgentInfo.rows[0].member_type == 'ASM') {
                isPSM = false;
            }
        }

        if (isPSM) {
            WhereClouse.push({ "fieldName": "psm__c", "fieldValue": req.query.psm__c });
        } else {

            orderBy = ' group by month order by month asc';
            fields = `count(sfid) , to_char(createddate, 'MM') as month`;

            if (validation.issetNotEmpty(req.headers.agentid) && validation.issetNotEmpty(req.headers.agentid)) {
                WhereClouse.push({ "fieldName": "asm__c", "fieldValue": req.headers.agentid });
            }
        }
        if (validation.issetNotEmpty(req.query.startDate) && validation.issetNotEmpty(req.query.startDate)) {
            startDate = dtUtil.timestampToDate(req.query.startDate, 'YYYY-MM-DD');
            endDate = dtUtil.timestampToDate(req.query.endDate, 'YYYY-MM-DD')
            WhereClouse.push({ "fieldName": `createddate`, "fieldValue": `'${startDate}' and '${endDate}'`, "type": "BETWEEN" });

            orderBy = '';
            fields = `count(sfid)`;
        }



        const tableName = `sites__c`;


        var offset = '0', limit = '999';

        sql = db.SelectAllQry(fields, tableName, WhereClouse, offset, limit, orderBy);
        console.log(`INFO::: Get all Visits = ${sql}`);

        var visits = await client.query(sql);
        return visits.rows;
    } catch (e) {
        console.log(e);
        return [];

    }
}

























async function getNewRetailer(req){
    try {
        var isPSM = false;
        var WhereClouse = [];
        
        var orderBy = '', fields = '';
        var loginAgentInfo = await db.agentDetail(req.headers.agentid);


        if (req.query.psm__c != undefined && req.query.psm__c != '') {

            var psmInfo = await db.agentDetail(req.query.psm__c);

            if (psmInfo.rowCount > 0 && psmInfo.rows[0].member_type == 'PSM') {
                isPSM = true;
            } else {
                isPSM = false;
                
            }
        } else {
            if (loginAgentInfo.rowCount > 0 && loginAgentInfo.rows[0].member_type == 'PSM') {
                isPSM = true;
                req.query.psm__c = req.headers.agentid;
            } else if (loginAgentInfo.rowCount > 0 && loginAgentInfo.rows[0].member_type == 'ASM') {
                isPSM = false;
            }
        }
        
        if (isPSM) {
            fields = `count(DISTINCT sfid),psm__c`;
            WhereClouse.push({ "fieldName": "psm__c", "fieldValue": req.query.psm__c });
        } else {
            orderBy = ' group by createdMonth order by createdMonth asc';
            fields = `count(DISTINCT sfid) , to_char(createddate, 'MM') as month, psm__c`;

            if (validation.issetNotEmpty(req.headers.agentid) && validation.issetNotEmpty(req.headers.agentid)) {
                WhereClouse.push({ "fieldName": "asm__c", "fieldValue": req.headers.agentid });
            }
        }
        
        if(validation.issetNotEmpty(req.query.startDate) && validation.issetNotEmpty(req.query.endDate)){
            startDate = dtUtil.timestampToDate(req.query.startDate,'YYYY-MM-DD');
            endDate = dtUtil.timestampToDate(req.query.endDate,'YYYY-MM-DD')
            WhereClouse.push({ "fieldName": `createddate`, "fieldValue": `'${startDate}' and '${endDate}'` ,"type":"BETWEEN" });
        }

        //to_char(created_on, 'YYYY-WW')
        const tableName = `account`;

        
        var offset = '0', limit = '1';
       
        sql = db.SelectAllQry(fields, tableName, WhereClouse, offset, limit,orderBy);
        console.log(`INFO::: Get all Visits = ${sql}`);

        var visits = await client.query(sql);
        return visits.rows;
       
    }catch(e){
        console.log(e);
        response = {  };
        return response;

    }
}


async function getParticipants(eventIds){
    try{

        var tableName = EVENT_TABLE_NAME = 'event_participants__c';
        fieldsArray = [
            `${EVENT_TABLE_NAME}.name`,
            `${EVENT_TABLE_NAME}.sfid`,
            `${EVENT_TABLE_NAME}.pg_id__c`,
            `${EVENT_TABLE_NAME}.event_pg_id__c`,
            `${EVENT_TABLE_NAME}.ASM__c`,
           // `${EVENT_TABLE_NAME}.psm__c`,
            `${EVENT_TABLE_NAME}.Event__c`,
            `${EVENT_TABLE_NAME}.Event_Participants__c`,
            `date_part('epoch'::text, ${EVENT_TABLE_NAME}.createddate) * (1000)::double precision as createddate`,
            `events__c.sfid as event_sfid`,
            `events__c.event_date__c`,
            `to_char(events__c.event_date__c, 'MM') as month`,
        ];


        joins = [
            {
                "type": "LEFT",
                "table_name": "events__c",
                "p_table_field": `${tableName}.event_pg_id__c`,
                "s_table_field": "events__c.pg_id__c"
            }
        ];
      
        const WhereClouse = [], orderBy = '';
        var offset = '0', limit = '1000';
       
        WhereClouse.push({ "fieldName": "event_participants__c.Event__c", "fieldValue": eventIds, "type":"IN"  });
        
        sql = db.fetchAllWithJoinQry(fieldsArray, tableName,joins, WhereClouse, offset, limit, orderBy )
        var getParticipants = await client.query(sql);
        
        return getParticipants.rows;
        
    }catch(e){
        console.log(e);
        return [];
    }
} 





async function getEventCount(req){
    try{


        var isPSM = false,fields = `count(sfid) , psm__c`;
        var WhereClouse = [];
        var loginAgentInfo = await db.agentDetail(req.headers.agentid);


        if (req.query.psm__c != undefined && req.query.psm__c != '') {

            var psmInfo = await db.agentDetail(req.query.psm__c);

            if (psmInfo.rowCount > 0 && psmInfo.rows[0].member_type == 'PSM') {
                isPSM = true;
            } else {
                isPSM = false;
            }
        } else {
            if (loginAgentInfo.rowCount > 0 && loginAgentInfo.rows[0].member_type == 'PSM') {
                isPSM = true;
                req.query.psm__c = req.headers.agentid;
            } else if (loginAgentInfo.rowCount > 0 && loginAgentInfo.rows[0].member_type == 'ASM') {
                isPSM = false;
            }
        }
        
        if (isPSM) {
            orderBy = ' order by month asc';
            fields = `sfid , to_char(event_date__c, 'MM') as month, psm__c`;
            WhereClouse.push({ "fieldName": "psm__c", "fieldValue": req.query.psm__c });
        } else {
            orderBy = ' order by month asc';
            fields = `sfid , to_char(event_date__c, 'MM') as month, psm__c`;
            if (validation.issetNotEmpty(req.headers.agentid) && validation.issetNotEmpty(req.headers.agentid)) {
                WhereClouse.push({ "fieldName": "asm__c", "fieldValue": req.headers.agentid });
            }
        }
        
        var isSearchByDate = false;
        if(validation.issetNotEmpty(req.query.startDate) && validation.issetNotEmpty(req.query.endDate)){
            startDate = dtUtil.timestampToDate(req.query.startDate,'YYYY-MM-DD');
            endDate = dtUtil.timestampToDate(req.query.endDate,'YYYY-MM-DD')
            WhereClouse.push({ "fieldName": `createddate`, "fieldValue": `'${startDate}' and '${endDate}'` ,"type":"BETWEEN" });
            orderBy = ' ';
            fields = `sfid, psm__c`;
            isSearchByDate = true;
        }

        const tableName = `events__c`;
        
        var offset = '0', limit = '999';
       
        sql = db.SelectAllQry(fields, tableName, WhereClouse, offset, limit,orderBy);
        //console.log(`INFO::: Get all event count sql = ${sql}`);

        var events = await client.query(sql);
        var eventIds = [],
        eventIdByMonth = [];
        console.log('events.rows.length >>>>  ', events.rows.length)
        if(events.rows.length > 0){
            events.rows.forEach(element => {
                eventIds.push(element.sfid);
                if(!isSearchByDate)
                    eventIdByMonth.push({"month":element.month,"eventid":element.sfid});    
            });
            
            eventParticipants = await getParticipants(eventIds);
            
            if(!isSearchByDate){
            var evp = {
                "01": 0,
                "02": 0,
                "03": 0,
                "04": 0,
                "05": 0,
                "06": 0,
                "07": 0,
                "08": 0,
                "09": 0,
                "10": 0,
                "11": 0,
                "12": 0,
            };

            for (const i in eventIdByMonth) {
                for (const j in eventParticipants) {
                    if(eventIdByMonth[i]['month']==eventParticipants[j]['month']){
                        if(evp[eventParticipants[j]['month']]!=undefined)
                        evp[eventParticipants[j]['month']] = evp[eventParticipants[j]['month']] + 1;
                    }
                }
            }

            var eventPartiCount = [];
            for (const k in evp) {
                console.log('k >>> ',k)
                console.log('evp[k] >>> ',evp[k])
                if(evp[k]!=0){
                    eventPartiCount.push({"month" : k , "count" : evp[k]});
                }
            }
            return eventPartiCount;
            }else{
                return eventParticipants.length;

            }
        }else{
            return [];
        }

         
    }catch(e){
        console.log(e);
      
        return [];

    }
}










async function getEventCount_NEW(req){
    try{


        var isPSM = false,fields = `count(sfid) , psm__c`;
        var WhereClouse = [];
        var loginAgentInfo = await db.agentDetail(req.headers.agentid);


        if (req.query.psm__c != undefined && req.query.psm__c != '') {

            var psmInfo = await db.agentDetail(req.query.psm__c);

            if (psmInfo.rowCount > 0 && psmInfo.rows[0].member_type == 'PSM') {
                isPSM = true;
            } else {
                isPSM = false;
            }
        } else {
            if (loginAgentInfo.rowCount > 0 && loginAgentInfo.rows[0].member_type == 'PSM') {
                isPSM = true;
                req.query.psm__c = req.headers.agentid;
            } else if (loginAgentInfo.rowCount > 0 && loginAgentInfo.rows[0].member_type == 'ASM') {
                isPSM = false;
            }
        }
        
        if (isPSM) {
            orderBy = ' group by month,psm__c order by month asc';
            fields = `count(sfid) , to_char(event_date__c, 'MM') as month, psm__c`;
            WhereClouse.push({ "fieldName": "psm__c", "fieldValue": req.query.psm__c });
        } else {
            orderBy = ' group by month,psm__c order by month asc';
            fields = `count(sfid) , to_char(event_date__c, 'MM') as month, psm__c`;
            if (validation.issetNotEmpty(req.headers.agentid) && validation.issetNotEmpty(req.headers.agentid)) {
                WhereClouse.push({ "fieldName": "asm__c", "fieldValue": req.headers.agentid });
            }
        }
        
        if(validation.issetNotEmpty(req.query.startDate) && validation.issetNotEmpty(req.query.endDate)){
            startDate = dtUtil.timestampToDate(req.query.startDate,'YYYY-MM-DD');
            endDate = dtUtil.timestampToDate(req.query.endDate,'YYYY-MM-DD')
            WhereClouse.push({ "fieldName": `createddate`, "fieldValue": `'${startDate}' and '${endDate}'` ,"type":"BETWEEN" });
            orderBy = ' ';
            fields = `count(sfid) , psm__c`;
        }


        
        
      
        const tableName = `events__c`;

        
        var offset = '0', limit = '999';
       
        sql = db.SelectAllQry(fields, tableName, WhereClouse, offset, limit,orderBy);
        console.log(`INFO::: Get all event count sql = ${sql}`);

        var events = await client.query(sql);
        return events.rows;
        // console.log('EVEBT COUNT ', events.rows);
        // var eventIds = [];
        // if(events.rows.length > 0){
        //     events.rows.forEach(element => {
        //         eventIds.push(element.sfid)
        //     });

        //     console.log(events.rows);
        //     part = await getParticipants(eventIds)
        //     return part;
        // }else{
        //     return [];
        // }

         
    }catch(e){
        console.log(e);
        response.response = { 'success': false, "data": {}, "message": "Internal server error." };
        response.status = 500;
        return response;

    }
}