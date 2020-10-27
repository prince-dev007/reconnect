var db = require(`${PROJECT_DIR}/utility/selectQueries`);
const uuidv4 = require('uuid/v4');
var dtUtil = require(`${PROJECT_DIR}/utility/dateUtility`);
var response = { "status": 200, "response": "" };
var validation = require(`${PROJECT_DIR}/utility/validation`);
var monthArray = { "01": "January", "02": "February", "03": "March", "04": "April", "05": "May", "06": "June", "07": "July", "08": "August", "09": "September", "10": "October", "11": "November", "12": "December" };
var month_field = `CASE 
                        WHEN month__c = 'January' THEN '01'
                        WHEN month__c = 'February' THEN '02'
                        WHEN month__c = 'March' THEN '03'
                        WHEN month__c = 'April' THEN '04'
                        WHEN month__c = 'May' THEN '05'
                        WHEN month__c = 'June' THEN '06'
                        WHEN month__c = 'July' THEN '07'
                        WHEN month__c = 'August' THEN '08'
                        WHEN month__c = 'September' THEN '09'
                        WHEN month__c = 'October' THEN '10'
                        WHEN month__c = 'November' THEN '11'
                        WHEN month__c = 'December' THEN '12'
                        ELSE null
                    END
                        as month`;



module.exports = {

    getOrderValue,
    getCounters,
    getVisitCount,
    getSiteCount,
    getEventParticipantCount,
    getEventCount
};



async function isPSMCheck(reqObj) {
    var isPSM, psmId;
    var loginAgentInfo = await db.agentDetail(reqObj.headers.agentid);

    if (reqObj.query.psm__c != undefined && reqObj.query.psm__c != '') {

        var psmInfo = await db.agentDetail(reqObj.query.psm__c);

        if (psmInfo.rowCount > 0 && psmInfo.rows[0].member_type == 'PSM') {
            isPSM = true;
        } else {
            isPSM = false;
        }
    } else {
        if (loginAgentInfo.rowCount > 0 && loginAgentInfo.rows[0].member_type == 'PSM') {
            isPSM = true;
            psmId = reqObj.headers.agentid;
        } else if (loginAgentInfo.rowCount > 0 && loginAgentInfo.rows[0].member_type == 'ASM') {
            isPSM = false;
        }
    }
    return { isPSM, psmId };

}


async function getMonthList(reqObj) {

    var monthList = [],
        error = false,
        offset = '0',
        limit = '1000';
    try {
        if (validation.issetNotEmpty(reqObj.query.startDate) && validation.issetNotEmpty(reqObj.query.endDate)) {

            if (reqObj.query.startDate > reqObj.query.endDate) {
                error = true;
            }
            var startDate = dtUtil.timestampToDate(reqObj.query.startDate, 'MM');
            var endDate = dtUtil.timestampToDate(reqObj.query.endDate, 'MM');

            for (counter = startDate; counter <= endDate; counter++) {
                console.log('counter >>> ', counter);
                counter = (counter.toString().length == 1) ? '0' + counter : counter;
                monthList.push(monthArray[counter]);
            }

            //WhereClouse.push({ "fieldName": `Month__c`, "fieldValue": monthList, "type": "IN" });
        }


        if (reqObj.query.offset != undefined && reqObj.query.offset != "") {
            offset = reqObj.query.offset;
        }
        if (reqObj.query.limit != undefined && reqObj.query.limit != "") {
            limit = reqObj.query.limit;
        }
    } catch (e) {
        console.log(e);
        error = true;
    }
    return { offset, limit, monthList, error };

}

async function parserResponseFormat(data){
    var respData = {};
    try{
        for(const i in data) {
            
            if(respData[data[i].psm__c]!=undefined){
                var psm = data[i].psm__c;
                delete data[i].psm__c;
                respData[psm].push(data[i])
            }else{
                var psm = data[i].psm__c;
                respData[psm] = [];
                delete data[i].psm__c;
                respData[psm].push(data[i])
            }
        }
    }catch(e){
        console.log(e);
    }
    return respData;
}

// UPdated
async function getOrderValue(req) {
    try {

        //var isPSM = false;
        var WhereClouse = [];
        var monthArray = { "01": "January", "02": "February", "03": "March", "04": "April", "05": "May", "06": "June", "07": "July", "08": "August", "09": "September", "10": "October", "11": "November", "12": "December" };

        var orderBy = ' ';
        var fields = `Orders__c as count , Orders_Target__c as target__c, ${month_field}, Team__c as psm__c	 `;
        var psmIdArr = [];
        const tableName = `kpi__c`;
        var isPsmObj = await isPSMCheck(req);

        if (isPsmObj.psmId != undefined) {
            req.query.psm__c = isPsmObj.psmId
        }
        if (isPsmObj.isPSM) {
            WhereClouse.push({ "fieldName": "team__c", "fieldValue": req.query.psm__c });
        } else {
            teamDetail = await db.getAsmHirarchy(req.headers.agentid);
            if (teamDetail.success) {
                psmIdArr = teamDetail.ASM;
                psmIdArr = psmIdArr.concat(teamDetail.PSM);
            }


            // psmIDs = await getAllPSM(req.headers.agentid);
            // console.log(psmIDs);
            // psmIdArr.push(req.headers.agentid); // to add asm targets and details 
            // for (const i in psmIDs) {
            //     psmIdArr.push(psmIDs[i]['sfid']);
            // }
            WhereClouse.push({ "fieldName": "team__c", "fieldValue": psmIdArr, "type": "IN" });
        }

        var params = await getMonthList(req);

        if (!params.error && params.monthList != undefined && params.monthList.length) {
            WhereClouse.push({ "fieldName": `Month__c`, "fieldValue": params.monthList, "type": "IN" });
        }

        sql = db.SelectAllQry(fields, tableName, WhereClouse, params.offset, params.limit, orderBy);
        console.log(`INFO::: Get all Order Value = ${sql}`);

        var orderValues = await client.query(sql);
        var respData;
        if(orderValues.rows.length > 0) {
            respData = await parserResponseFormat(orderValues.rows);
        }

        return respData;
    } catch (e) {
        console.log(e);
        return [];

    }
}
// updated
async function getCounters(req) {
    try {
        var isPSM = false;
        var WhereClouse = [];
        var monthArray = { "01": "January", "02": "February", "03": "March", "04": "April", "05": "May", "06": "June", "07": "July", "08": "August", "09": "September", "10": "October", "11": "November", "12": "December" };

        var orderBy = ' ';
        var fields = `New_Counters__c as count , New_Counters_Target__c as target__c,  ${month_field}, Team__c as psm__c	 `;
        var psmIdArr = [];
        const tableName = `kpi__c`;


        var isPsmObj = await isPSMCheck(req);

        if (isPsmObj.psmId != undefined) {
            req.query.psm__c = isPsmObj.psmId
        }
        if (isPsmObj.isPSM) {
            WhereClouse.push({ "fieldName": "team__c", "fieldValue": req.query.psm__c });
        } else {
            teamDetail = await db.getAsmHirarchy(req.headers.agentid);
            if (teamDetail.success) {
                psmIdArr = teamDetail.ASM;
                psmIdArr = psmIdArr.concat(teamDetail.PSM);
            }
            // psmIDs = await getAllPSM(req.headers.agentid);
            // console.log(psmIDs);
            // psmIdArr.push(req.headers.agentid); // to add asm targets and details 
            // for (const i in psmIDs) {
            //     psmIdArr.push(psmIDs[i]['sfid']);
            // }
            WhereClouse.push({ "fieldName": "team__c", "fieldValue": psmIdArr, "type": "IN" });
        }

        var params = await getMonthList(req);

        if (!params.error && params.monthList != undefined && params.monthList.length) {
            WhereClouse.push({ "fieldName": `Month__c`, "fieldValue": params.monthList, "type": "IN" });
        }

        sql = db.SelectAllQry(fields, tableName, WhereClouse, params.offset, params.limit, orderBy);
        console.log(`INFO::: Get all Counters = ${sql}`);

        var counters = await client.query(sql);
        var respData;
        if(counters.rows.length > 0) {
            respData = await parserResponseFormat(counters.rows);
        }

        return respData;
        

    } catch (e) {
        console.log(e);
        return [];

    }
}

// Updated
async function getVisitCount(req) {
    try {

        var WhereClouse = [];
        var orderBy = ' ';
        var fields = `Visits__c as count, Visits_Target__c as target__c,  ${month_field}, Team__c as psm__c	 `;
        var psmIdArr = [];
        var isPsmObj = await isPSMCheck(req);

        if (isPsmObj.psmId != undefined) {
            req.query.psm__c = isPsmObj.psmId
        }
        if (isPsmObj.isPSM) {
            WhereClouse.push({ "fieldName": "team__c", "fieldValue": req.query.psm__c });

        } else {

            teamDetail = await db.getAsmHirarchy(req.headers.agentid);
            if (teamDetail.success) {
                psmIdArr = teamDetail.ASM;
                psmIdArr = psmIdArr.concat(teamDetail.PSM);
            }
            // var psmIDs = await getAllPSM(req.headers.agentid);

            // console.log(psmIDs);
            // psmIdArr.push(req.headers.agentid); // to add asm targets and details 
            // for (const i in psmIDs) {
            //     psmIdArr.push(psmIDs[i]['sfid']);
            // }

            WhereClouse.push({ "fieldName": "team__c", "fieldValue": psmIdArr, "type": "IN" });

        }

        var params = await getMonthList(req);

        if (!params.error && params.monthList != undefined && params.monthList.length) {
            WhereClouse.push({ "fieldName": `Month__c`, "fieldValue": params.monthList, "type": "IN" });
        }
        const tableName = 'kpi__c';

        sql = db.SelectAllQry(fields, tableName, WhereClouse, params.offset, params.limit, orderBy);
        console.log(`INFO::: Get all Visits = ${sql}`);

        var visits = await client.query(sql);
        var respData;
        if(visits.rows.length > 0) {
            respData = await parserResponseFormat(visits.rows);
        }

        return respData;
    } catch (e) {
        console.log(e);
        return [];

    }
}

async function getAllPSM(agentid) {

    var WhereClouse = [];
    WhereClouse.push({ "fieldName": "member_type__c", "fieldValue": "PSM" })
    if (validation.issetNotEmpty(agentid)) {
        WhereClouse.push({ "fieldName": "manager__c", "fieldValue": agentid })
    }
    sql = db.SelectAllQry(['sfid'], 'team__c', WhereClouse, '0', '999');

    var psm = await client.query(sql);
    return psm.rows;
}


// Updated
async function getSiteCount(req) {
    try {

        var isPSM = false, fields = '', orderBy = '', psmIdArr = [], monthList = [];
        var WhereClouse = [];
        fields = `Sites_Visited__c as count, Sites_Visited_Target__c as target__c, Team__c as psm__c, ${month_field}`;
        const tableName = `kpi__c`;
        orderBy = '';

        var isPsmObj = await isPSMCheck(req);

        if (isPsmObj.psmId != undefined) {
            req.query.psm__c = isPsmObj.psmId
        }
        if (isPsmObj.isPSM) {

            WhereClouse.push({ "fieldName": "team__c", "fieldValue": req.query.psm__c });
        } else {
            teamDetail = await db.getAsmHirarchy(req.headers.agentid);
            if (teamDetail.success) {
                psmIdArr = teamDetail.ASM;
                psmIdArr = psmIdArr.concat(teamDetail.PSM);
            }
            // psmIDs = await getAllPSM(req.headers.agentid);
            // psmIdArr.push(req.headers.agentid); // to add asm targets and details 
            // for (const i in psmIDs) {
            //     psmIdArr.push(psmIDs[i]['sfid']);
            // }
            WhereClouse.push({ "fieldName": "team__c", "fieldValue": psmIdArr, "type": "IN" });
        }
        if (validation.issetNotEmpty(req.query.startDate) && validation.issetNotEmpty(req.query.startDate)) {
            startDate = dtUtil.timestampToDate(req.query.startDate, 'MM');
            endDate = dtUtil.timestampToDate(req.query.endDate, 'MM')
            for (counter = startDate; counter <= endDate; counter++) {
                console.log('counter >>> ', counter);
                counter = (counter.toString().length == 1) ? '0' + counter : counter;
                monthList.push(monthArray[counter]);
            }

            WhereClouse.push({ "fieldName": `month__c`, "fieldValue": monthList, "type": "IN" });
        }

        var offset = '0', limit = '999';

        if (req.query.offset != undefined && req.query.offset != "") {
            offset = req.query.offset;
        }
        if (req.query.limit != undefined && req.query.limit != "") {
            limit = req.query.limit;
        }

        sql = db.SelectAllQry(fields, tableName, WhereClouse, offset, limit, orderBy);
        console.log(`INFO::: Get all Sites Count  = ${sql}`);

        var site = await client.query(sql);
        var respData;
        if(site.rows.length > 0) {
            respData = await parserResponseFormat(site.rows);
        }

        return respData;
    } catch (e) {
        console.log(e);
        return [];
    }
}


async function getEventParticipantCount(req) {
    try {

        var isPSM = false, fields = '', orderBy = '', psmIdArr = [];
        var WhereClouse = [];
        var monthList = [];
        fields = `Events__c as count, Events_Target__c as target__c, Team__c as psm__c, ${month_field}`;
        const tableName = `kpi__c`;
        orderBy = '';

        var isPsmObj = await isPSMCheck(req);

        if (isPsmObj.psmId != undefined) {
            req.query.psm__c = isPsmObj.psmId
        }
        if (isPsmObj.isPSM) {

            WhereClouse.push({ "fieldName": "team__c", "fieldValue": req.query.psm__c });
        } else {
            teamDetail = await db.getAsmHirarchy(req.headers.agentid);
            if (teamDetail.success) {
                psmIdArr = teamDetail.ASM;
                psmIdArr = psmIdArr.concat(teamDetail.PSM);
            }
            // psmIDs = await getAllPSM(req.headers.agentid);
            // psmIdArr.push(req.headers.agentid); // to add asm targets and details 
            // for (const i in psmIDs) {
            //     psmIdArr.push(psmIDs[i]['sfid']);
            // }
            WhereClouse.push({ "fieldName": "team__c", "fieldValue": psmIdArr, "type": "IN" });
        }
        if (validation.issetNotEmpty(req.query.startDate) && validation.issetNotEmpty(req.query.startDate)) {
            startDate = dtUtil.timestampToDate(req.query.startDate, 'MM');
            endDate = dtUtil.timestampToDate(req.query.endDate, 'MM')
            for (counter = startDate; counter <= endDate; counter++) {
                console.log('counter >>> ', counter);
                counter = (counter.toString().length == 1) ? '0' + counter : counter;
                monthList.push(monthArray[counter]);
            }

            WhereClouse.push({ "fieldName": `month__c`, "fieldValue": monthList, "type": "IN" });
        }

        var offset = '0', limit = '999';

        if (req.query.offset != undefined && req.query.offset != "") {
            offset = req.query.offset;
        }
        if (req.query.limit != undefined && req.query.limit != "") {
            limit = req.query.limit;
        }

        sql = db.SelectAllQry(fields, tableName, WhereClouse, offset, limit, orderBy);
        console.log(`INFO::: Get all Sites Count  = ${sql}`);

        var event = await client.query(sql);
        var respData;
        if(event.rows.length > 0) {
            respData = await parserResponseFormat(event.rows);
        }

        return respData;
    } catch (e) {
        console.log(e);
        return [];
    }
}






async function getParticipants(eventIds) {
    try {

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

        WhereClouse.push({ "fieldName": "event_participants__c.Event__c", "fieldValue": eventIds, "type": "IN" });

        sql = db.fetchAllWithJoinQry(fieldsArray, tableName, joins, WhereClouse, offset, limit, orderBy)
        var getParticipants = await client.query(sql);

        return getParticipants.rows;

    } catch (e) {
        console.log(e);
        return [];
    }
}


async function getEventCount(req) {
    try {


        var isPSM = false, fields = `count(sfid) , psm__c`;
        var WhereClouse = [];


        var isPsmObj = await isPSMCheck(req);

        if (isPsmObj.psmId != undefined) {
            req.query.psm__c = isPsmObj.psmId
        }
        if (isPsmObj.isPSM) {

            orderBy = ' order by month asc';
            fields = `sfid , to_char(event_date__c, 'MM') as month, psm__c`;
            WhereClouse.push({ "fieldName": "psm__c", "fieldValue": req.query.psm__c });
        } else {
            teamDetail = await db.getAsmHirarchy(req.headers.agentid);
            TeamMembers = [];
            if (teamDetail.success) {
                TeamMembers = TeamMembers.concat(teamDetail.ASM);
                TeamMembers = TeamMembers.concat(teamDetail.PSM);
            }
            orderBy = ' order by month asc';
            fields = `sfid , to_char(event_date__c, 'MM') as month, psm__c`;
            WhereClouse.push({ "fieldName": "asm__c", "fieldValue": TeamMembers, "type":"IN" });
            // if (validation.issetNotEmpty(req.headers.agentid) && validation.issetNotEmpty(req.headers.agentid)) {
            //     WhereClouse.push({ "fieldName": "asm__c", "fieldValue": req.headers.agentid });
            // }
        }

        var isSearchByDate = false;
        if (validation.issetNotEmpty(req.query.startDate) && validation.issetNotEmpty(req.query.endDate)) {
            startDate = dtUtil.timestampToDate(req.query.startDate, 'MM');
            endDate = dtUtil.timestampToDate(req.query.endDate, 'MM')
            WhereClouse.push({ "fieldName": `createddate`, "fieldValue": `'${startDate}' and '${endDate}'`, "type": "BETWEEN" });
            orderBy = ' ';
            fields = `sfid, psm__c`;
            isSearchByDate = true;
        }

        const tableName = `events__c`;

        var offset = '0', limit = '999';

        sql = db.SelectAllQry(fields, tableName, WhereClouse, offset, limit, orderBy);
        //console.log(`INFO::: Get all event count sql = ${sql}`);

        var events = await client.query(sql);
        var eventIds = [],
            eventIdByMonth = [];
        console.log('events.rows.length >>>>  ', events.rows.length)
        if (events.rows.length > 0) {
            events.rows.forEach(element => {
                eventIds.push(element.sfid);
                if (!isSearchByDate)
                    eventIdByMonth.push({ "month": element.month, "eventid": element.sfid });
            });

            eventParticipants = await getParticipants(eventIds);

            if (!isSearchByDate) {
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
                        if (eventIdByMonth[i]['month'] == eventParticipants[j]['month']) {
                            if (evp[eventParticipants[j]['month']] != undefined)
                                evp[eventParticipants[j]['month']] = evp[eventParticipants[j]['month']] + 1;
                        }
                    }
                }

                var eventPartiCount = [];
                for (const k in evp) {
                    console.log('k >>> ', k)
                    console.log('evp[k] >>> ', evp[k])
                    if (evp[k] != 0) {
                        eventPartiCount.push({ "month": k, "count": evp[k] });
                    }
                }
                return eventPartiCount;
            } else {
                return eventParticipants.length;

            }
        } else {
            return [];
        }


    } catch (e) {
        console.log(e);

        return [];

    }
}


async function getEventCount_NEW(req) {
    try {


        var isPSM = false, fields = `count(sfid) , psm__c`;
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

        if (validation.issetNotEmpty(req.query.startDate) && validation.issetNotEmpty(req.query.endDate)) {
            startDate = dtUtil.timestampToDate(req.query.startDate, 'YYYY-MM-DD');
            endDate = dtUtil.timestampToDate(req.query.endDate, 'YYYY-MM-DD')
            WhereClouse.push({ "fieldName": `createddate`, "fieldValue": `'${startDate}' and '${endDate}'`, "type": "BETWEEN" });
            orderBy = ' ';
            fields = `count(sfid) , psm__c`;
        }





        const tableName = `events__c`;


        var offset = '0', limit = '999';

        sql = db.SelectAllQry(fields, tableName, WhereClouse, offset, limit, orderBy);
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


    } catch (e) {
        console.log(e);
        response.response = { 'success': false, "data": {}, "message": "Internal server error." };
        response.status = 500;
        return response;

    }
}