var db = require(`${PROJECT_DIR}/utility/selectQueries`);
const uuidv4 = require('uuid/v4');
var dtUtil = require(`${PROJECT_DIR}/utility/dateUtility`);
var response = { "status": 200, "response": "" };
var validation = require(`${PROJECT_DIR}/utility/validation`);
var dashboard = require(`${PROJECT_DIR}/controllers/dashboard/dashboard.service`);





module.exports = {
    addEventParticipants,
    editEventParticipants
};
async function addEventParticipants(myDetails,eventParticipants){
    try{
        
        if (myDetails.rowCount > 0) {

            // Get event detail 
            var eventWhereClouse = [];
            if (validation.issetNotEmpty(eventParticipants[0]['event__c'])) {
                eventWhereClouse.push({ "fieldName": "pg_id__c", "fieldValue": eventParticipants[0]['event_pg_id__c'] });
            }
            eventSql = db.SelectAllQry(['name'], 'events__c', eventWhereClouse, '0', '1',' ');
            var eventDetail = await client.query(eventSql);
            console.log('INFO:: eventDetail ', eventDetail.rows)
            // Get contact Name
            var contactIds = []; 
            eventParticipants.forEach(ePrat => {
                contactIds.push(ePrat.event_participants__c);
            });
            var contactWhereClouse = [];
            if (contactIds.length > 0) {
                contactWhereClouse.push({ "fieldName": "sfid", "fieldValue": contactIds, "type":"IN","fieldName":"event_participants__c","fieldValue":"Service Engineer" });
            }
            contactSql = db.SelectAllQry(['sfid','name'], 'contact', contactWhereClouse, '0', '999',' ');
            
            console.log('INFO::: contactSql  ',contactSql);
            var contacts = await client.query(contactSql);
            var contactList = contacts.rows; 
            console.log('INFO::: contactLIST  ',contacts.rows);
            eventFields =`name, asm__c, event__c, event_pg_id__c,pg_id__c, createddate, event_participants__c`;
            
            var createdDate = dtUtil.todayDatetime();
            
            tableName = 'event_participants__c';
            var fieldValues='';
            counnter = 0 ;
            
            for (const i in eventParticipants) {
                contactName='';
                var UUID_Event = uuidv4();
                if (counnter > 0) {
                    fieldValues += ', ';
                }
                for (const j in contactList) {
                    
                    console.log(eventParticipants[i].event_participants__c +'  ===   '+ contactList[j].sfid)
                    if (eventParticipants[i].event_participants__c == contactList[j].sfid)
                        contactName = eventDetail.rows[0].name+' - '+contactList[j].name;
                }
                eventId = (eventParticipants[i].event__c!=undefined && eventParticipants[i].event__c != null)?eventParticipants[i].event__c:'';
                fieldValues += `('${contactName}','${eventParticipants[i].asm__c}', '${eventParticipants[i].event__c}', '${eventParticipants[i].event_pg_id__c}', '${UUID_Event}', '${createdDate}', '${eventParticipants[i].event_participants__c}')`;
                counnter++;
            }

            fieldsToBeInsert = 'name, asm__c, event__c, event_pg_id__c,pg_id__c, createddate, event_participants__c';
            sql = `INSERT into ${process.env.TABLE_SCHEMA_NAME}.${tableName} (${fieldsToBeInsert}) VALUES ${fieldValues}`;
            console.log('Field Values >>> ', fieldValues);
            sql += ` RETURNING id,pg_id__c,sfid`;
            console.log('--------------------------------------')
            console.log('INFO::: INSERT eventParticipants SQL = ',sql)
            console.log('--------------------------------------')

            eventDetail =  await db.getDbResult(sql)


            //var eventDetail = await db.insertRecord(eventFields, eventFieldsValues, tableName);
           
            if (eventDetail.rowCount > 0) {
                    //dashboard.updateMonthlyTarget(req.headers.agentid,'eventPart',dtUtil.currentMonth(),{'electricians_engaged__c':'electricians_engaged__c+1'});
                    response.response = { 'success': true, "data": eventDetail.rows, "message": "Event Participant created successfully." };
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


async function editEventParticipants(myDetails,eventParticipant){
    try{
        
        if (myDetails.rowCount > 0) {
           
            
            tableName = 'event_participants__c';

            fieldValue = [];
            //fieldValue.push({ "field": "name", "value": eventParticipant.name });
            fieldValue.push({ "field": "area__c", "value": eventParticipant.asm__c });
            fieldValue.push({ "field": "actual_expense__c", "value": eventParticipant.event__c });
            fieldValue.push({ "field": "event_participants__c", "value": eventParticipant.event_participants__c });


            const WhereClouse = [];
            WhereClouse.push({ "field": "pg_id__c", "value": eventParticipant.pg_id__c,"field":"event_participants__c","value":"other" });
         
            eventDetail = await db.updateRecord(tableName, fieldValue, WhereClouse);

            if (eventDetail.success) {
                    response.response = { 'success': true, "data": {  }, "message": "eventParticipant updated successfully." };
                    response.status = 200;
                    return response;
            }else{
                console.log(eventDetail);
                response.response = { 'success': false, "data": {}, "message": "Due to internal error Campaign update failed." };
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




 
        
        
        