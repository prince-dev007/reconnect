var db = require(`${PROJECT_DIR}/utility/selectQueries`);
const uuidv4 = require('uuid/v4');
var dtUtil = require(`${PROJECT_DIR}/utility/dateUtility`);
var response = { "status": 200, "response": "" };
var validation = require(`${PROJECT_DIR}/utility/validation`);
var dashboard = require(`${PROJECT_DIR}/controllers/dashboard/dashboard.service`);




module.exports = {
    addevent,
    editevent
};
async function addevent(myDetails,event){
    try{
        var is_Validate = true;
            is_Validate = is_Validate ? validation.issetNotEmpty(event.event_date__c) : false;
            is_Validate = is_Validate ? validation.issetNotEmpty(event.type__c) : false;
        if (myDetails.rowCount > 0) {
            eventFields =`name, pg_id__c, area__c, actual_expense__c, asm__c, budget__c, status__c, target_audience__c, venue_details__c, createddate, event_date__c, type__c,expected_participation__c`; // ,
            var UUID_Event = uuidv4();
            var createdDate = dtUtil.todayDatetime();
            event.event_date__c = dtUtil.timestampToDate(event.event_date__c,'YYYY-MM-DD');

            if(event.actual_expense__c==undefined){
                event.actual_expense__c = null;
            }
            if(event.target_audience__c==undefined){
                event.target_audience__c = null;
            }
            eventFieldsValues =[event.name, UUID_Event, event.area__c, event.actual_expense__c, event.asm__c, event.budget__c,  event.status__c, event.target_audience__c, event.venue_details__c, createdDate, event.event_date__c, event.type__c, (event.expected_participation__c)?event.expected_participation__c:null]; // event.expected_participation__c,
            tableName = 'events__c';
            var eventDetail = await db.insertRecord(eventFields, eventFieldsValues, tableName, `, pg_id__c`);
           
            if (eventDetail.success) {
                    
                    //dashboard.updateMonthlyTarget(req.headers.agentid,'event',dtUtil.currentMonth(),{'events__c':'events__c+1'});

                    response.response = { 'success': true, "data": eventDetail.data[0], "message": "Event created successfully." };
                    response.status = 200;
                    return response;
            }else{
                console.log(eventDetail);
                response.response = { 'success': false, "data": {}, "message": "Due to internal error Event creation failed." };
                response.status = 400;
                return response;
            }
        }else{
                response.response = { 'success': false, "data": {}, "message": "Invalid login user." };
                response.status = 400;
                return response;
        }
    }catch(e){
        console.log(e);
        response.response = { 'success': false, "data": {}, "message": "Internal server error." };
        response.status = 500;
        return response;

    }
}


async function editevent(myDetails,event){
    try{
        
        if (myDetails.rowCount > 0) {
           
            
            tableName = 'events__c';

            fieldValue = [];
            //eventFields =`name, pg_id__c, area__c, actual_expense__c, asm__c, budget__c, expected_participation__c, status__c, target_audience__c, venue_details__c, createddate`;

            fieldValue.push({ "field": "name", "value": event.name });
            fieldValue.push({ "field": "area__c", "value": event.area__c });
            if(event.actual_expense__c!=undefined){
                fieldValue.push({ "field": "actual_expense__c", "value": event.actual_expense__c });
            }
            fieldValue.push({ "field": "asm__c", "value": event.asm__c });
            fieldValue.push({ "field": "budget__c", "value": event.budget__c });
            if(event.expected_participation__c!=undefined && event.expected_participation__c!='')
                fieldValue.push({ "field": "expected_participation__c", "value": event.expected_participation__c });
            fieldValue.push({ "field": "status__c", "value": event.status__c });

            event.event_date__c = dtUtil.timestampToDate(event.event_date__c,'YYYY-MM-DD');

            fieldValue.push({ "field": "event_date__c", "value": event.event_date__c });
            fieldValue.push({ "field": "type__c", "value": event.type__c });
            

            if(event.target_audience__c!=undefined){
                fieldValue.push({ "field": "target_audience__c", "value": event.target_audience__c });
            }
            fieldValue.push({ "field": "venue_details__c", "value": event.venue_details__c });

            const WhereClouse = [];
            WhereClouse.push({ "field": "pg_id__c", "value": event.pg_id__c });
         
            eventDetail = await db.updateRecord(tableName, fieldValue, WhereClouse);

            if (eventDetail.success) {
                    // UPDATE KPI -- when status = Completed

                    response.response = { 'success': true, "data": {  }, "message": "Event updated successfully." };
                    response.status = 200;
                    return response;
            }else{
                console.log(eventDetail);
                response.response = { 'success': false, "data": {}, "message": "Due to internal error Event update failed." };
                response.status = 400;
                return response;
            }
        }else{
                response.response = { 'success': false, "data": {}, "message": "Invalid login user." };
                response.status = 400;
                return response;
        }
    }catch(e){
        console.log(e);
        response.response = { 'success': false, "data": {}, "message": "Internal server error." };
        response.status = 500;
        return response;

    }
}




 
        
        
        