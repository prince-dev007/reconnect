var validator = require('validator');
var validation = require(`${PROJECT_DIR}/utility/validation`);
var restClient = require('node-rest-client').Client;

module.exports = {
    SelectAllQry,
    SelectWithSubAllQry,
    fetchAllWithJoinQry,
    getDbResult,
    agentDetail,
    insertRecord,
    updateRecord,
    getLocationAddr,

    getAsmHirarchy
};


function SelectAllQry(fieldsArray, tableName, WhereClouse, offset, limit, orderBy ) {
    const fields = fieldsArray.toString();
    var sql = `SELECT ${fields} FROM ${process.env.TABLE_SCHEMA_NAME}.${tableName}`;
    if (WhereClouse != undefined && WhereClouse.length > 0) {
        sql+= ` where`;
        
        var couter = 0;
        WhereClouse.forEach(element => {
            if(couter > 0){
                sql+= ` and`;
            }

            if(element.type!=undefined && element.type!=''){
                switch(element.type){
                    case 'IN':
                        teamsMemString = element.fieldValue.join("','");
                        sql+=` ${element.fieldName} IN ('${teamsMemString}')`;
                    break;
                    case 'NOTIN':
                        teamsMemString = element.fieldValue.join("','");
                        sql+=` ${element.fieldName} NOT IN ('${teamsMemString}')`;
                    break;
                    case 'LIKE':
                        sql+=` ${element.fieldName} LIKE '%${element.fieldValue}%'`;
                    break;  
                    case 'GTE':
                        sql+=` ${element.fieldName} >= '${element.fieldValue}'`;
                    break;  
                    case 'LTE':
                        sql+=` ${element.fieldName} <= '${element.fieldValue}'`;
                    break;  
                    case 'BETWEEN':
                        sql+=` ${element.fieldName} BETWEEN ${element.fieldValue}`;
                    break; 
                    case 'NOTNULL':
                        sql+=` ${element.fieldName} is not null`;
                    break;   
                }
            }else{
                sql+=` ${element.fieldName}='${element.fieldValue}'`;
            }
            couter++;
        });
    }

    console.log('orderBy >>>>> ',orderBy  )
    if(orderBy!=undefined && orderBy!=''){
        sql+=` ${orderBy}`;
    }
    if(offset!=undefined && validator.isInt(offset,{ min: 0, max: 9999999999999 })){
        sql+=` offset ${offset}`;
    }
    if(limit!=undefined && validator.isInt(limit,{ min: 0, max: 1000 })){
        sql+=` limit ${limit}`;
    }
    return sql;
}

function SelectWithSubAllQry(fieldsArray, subQuery, WhereClouse, offset, limit, orderBy ) {
    const fields = fieldsArray.toString();
    var sql = `SELECT ${fields} FROM ${subQuery}`;
    if (WhereClouse != undefined && WhereClouse.length > 0) {
        sql+= ` where`;
        
        var couter = 0;
        WhereClouse.forEach(element => {
            if(couter > 0){
                sql+= ` and`;
            }

            if(element.type!=undefined && element.type!=''){
                switch(element.type){
                    case 'IN':
                        teamsMemString = element.fieldValue.join("','");
                        sql+=` ${element.fieldName} IN ('${teamsMemString}')`;
                    break;
                    case 'LIKE':
                        sql+=` ${element.fieldName} LIKE '%${element.fieldValue}%'`;
                    break;  
                    case 'GTE':
                        sql+=` ${element.fieldName} >= '${element.fieldValue}'`;
                    break;  
                    case 'LTE':
                        sql+=` ${element.fieldName} <= '${element.fieldValue}'`;
                    break;  
                    case 'BETWEEN':
                        sql+=` ${element.fieldName} BETWEEN ${element.fieldValue}`;
                    break;   
                    case 'NOTNULL':
                        sql+=` ${element.fieldName} is not null`;
                    break;  
                }
            }else{
                sql+=` ${element.fieldName}='${element.fieldValue}'`;
            }
            couter++;
        });
    }

    console.log('orderBy >>>>> ',orderBy  )
    if(orderBy!=undefined && orderBy!=''){
        sql+=` ${orderBy}`;
    }
    if(offset!=undefined && validator.isInt(offset,{ min: 0, max: 9999999999999 })){
        sql+=` offset ${offset}`;
    }
    if(limit!=undefined && validator.isInt(limit,{ min: 0, max: 1000 })){
        sql+=` limit ${limit}`;
    }
    return sql;
}




function fetchAllWithJoinQry(fieldsArray, tableName,joins, WhereClouse, offset, limit, orderBy ) {
    const fields = fieldsArray.toString();
    var sql = `SELECT ${fields} FROM ${process.env.TABLE_SCHEMA_NAME}.${tableName}`;
    var joinString = ``;
    if (joins != undefined && joins.length > 0) {
       
        joins.forEach(async element => {
           
            joinString += ` ${element.type} JOIN ${process.env.TABLE_SCHEMA_NAME}.${element.table_name} ON ${element.p_table_field} = ${element.s_table_field}`;
            
        });
        sql+=joinString;
    }

    if (WhereClouse != undefined && WhereClouse.length > 0) {
        sql+=` where`;
        var couter = 0;
        WhereClouse.forEach(element => {
            if(couter > 0){
                sql += ` and`;
            }
            if(element.type!=undefined && element.type!=''){
                switch(element.type){
                    case 'IN':
                        teamsMemString = element.fieldValue.join("','");
                        sql+=` ${element.fieldName} IN ('${teamsMemString}')`;
                    break;
                    case 'LIKE':
                        sql+=` ${element.fieldName} LIKE '%${element.fieldValue}%'`;
                    break;  
                    case 'GTE':
                        sql+=` ${element.fieldName} >= '${element.fieldValue}'`;
                    break;  
                    case 'LTE':
                        sql+=` ${element.fieldName} <= '${element.fieldValue}'`;
                    break;  
                    case 'BETWEEN':
                        sql+=` ${element.fieldName} BETWEEN ${element.fieldValue}`;
                    break;  
                    case 'NOTNULL':
                        sql+=` ${element.fieldName} is not null `;
                    break;  

                }
            }else{
                sql+=` ${element.fieldName}='${element.fieldValue}'`;
            }
            couter++;
        });
    }
    
    if(orderBy!=undefined && orderBy!=''){
        sql +=` ${orderBy}`;
    }
    if(offset!=undefined && validator.isInt(offset,{ min: 0, max: 9999999999999 })){
        sql+=` offset ${offset}`;
    }
    if(limit!=undefined && validator.isInt(limit,{ min: 0, max: 1000 })){
        sql+=` limit ${limit}`;
    }
    return sql;
} 






async function getDbResult(sql) {
    return await client.query(sql)
        .then(data => {
            console.log('INFO::: Fetch DB result');
            return data;
        })
        .catch(err => {
            console.log('err ====>>>  ',err);
            return [];
        });
}


async function insertRecord(fieldsToBeInsert, fieldValues, tableName, returnIds){
   

    sql = `INSERT into ${process.env.TABLE_SCHEMA_NAME}.${tableName} (${fieldsToBeInsert}) VALUES(`;
    if(fieldValues.length > 0){
        var counter = 1;
        fieldValues.forEach(element => {
            if(counter > 1){ sql += `,`; }
            sql += `$${counter}`;
            counter++
        })
    }
    sql += `) RETURNING id`;
    if(returnIds!=undefined){
        sql +=` ${returnIds}`;
    }
    console.log('INFO ::::::  SQL::::  ', sql);
    return await client.query(sql,fieldValues)
        .then(data => { 
            console.log(` INFO::::: INSERT RESPONSE table =${tableName} >>>>> `,data)
            if(data.rowCount > 0){
                return { "success": true, "message": "", "data": data.rows };

            }else{
                return { "success": false, "message": "Error while create record. Please try again.", "data": {} };
            }
        }).catch(err => {
            console.log('Error::: Catch 162 >>>> ', err);
            return { "success": false, "message": "Error while insert", "data": {} };
        });

}

async function updateRecord(tableName, fieldValue, WhereClouse){
    try {

        //sql = `update zoxima.${tableName} set End_Day__c='true', End_Time__c='${attendance_time}' where Team__c='${agentid}' and Attendance_Date__c='${attendance_date}'`;
        
         var sql = `update ${process.env.TABLE_SCHEMA_NAME}.${tableName} set`;


        counter = 1;
        fieldValue.forEach(element => {
            if(counter > 1)
                sql+=`,`;
            if(element.type!=undefined && element.type == 'BOOLEAN')
                sql +=` ${element.field}=${element.value}`;
            else
                sql +=` ${element.field}='${element.value}'`;
            counter++;
        });

        sql +=` where `;


        counter = 1;
        WhereClouse.forEach(element => {
            if(counter > 1)
                sql+=` and `;
            if(element.type!=undefined && element.type=='IN'){
                teamsMemString =element.value.join("','");
                sql +=` ${element.field} IN ('${teamsMemString}')`;
            }  else
                sql +=` ${element.field}='${element.value}'`;
            counter++;
        });

        console.log(`INFO::::: ${sql}`);

        return await client.query(sql)
            .then(data => {
                if(data.rowCount > 0){
                    return { "success": true, "message": "Record updated successfully.","data":data };
                }else{
                    return { "success": false, "message": "Record updated failed.","data":{} };
                }
            }).catch(err => {
                console.log('ERROR:::: err 137 >>>> ', err);
                return { "success": false, "message": "Error while update record." };
            });
    } catch (e) {
        return { "success": false, "message": "Error while update record." };
    }
  
}


async function agentDetail(agentId){
    if (validation.issetNotEmpty(agentId)) {
        fieldsArray = [
            `team__c.member_type__c as member_type`,
            `team__c.email__c as email`, `team__c.name as team_member_name`,
            `team__c.dob__c as dob`, `team__c.designation__c as designation`,
            `team__c.phone_no__c as phone_no`,
            `team__c.Business__c as business`,
            `team__c.Manager__c as manager_id`,
            `team__c.sfid as team_id`
        ];
        tableName = `team__c`;
        WhereClouse = [];
            WhereClouse.push({ "fieldName": "sfid", "fieldValue": agentId  })
        
        orderBy = '';
        var sql = SelectAllQry(fieldsArray, tableName, WhereClouse, '0', '1', orderBy );
        console.log(`INFO:::: GET AGENT DETAIL: ${sql}`);
        var result =  await getDbResult(sql);
        return result;
    }else{
        return false;
    }
}

//getAsmHirarchy('a0H1m000001Owv4EAC');
async function getAsmHirarchy(agentid) {
    var team = {};
    team['ASM'] = [];
    team['PSM'] = [];
    team['memberType'] = '';
    team['success'] = true;
    try {
        myDetails = await agentDetail(agentid);
        
        if (myDetails.rowCount > 0) {
            team['memberType'] = myDetails.rows[0].member_type;
            var sql = '';
            if (myDetails.rowCount > 0 && myDetails.rows[0].member_type == 'PSM') {
                team['PSM'].push(agentid)
            } else {
                sql = `WITH RECURSIVE subordinates AS (
                SELECT
                sfid,
                manager__c,
                name,
                member_type__c
                FROM
                ${process.env.TABLE_SCHEMA_NAME}.team__c
                WHERE
                sfid = '${agentid}'
                UNION
                SELECT
                    e.sfid,
                    e.manager__c,
                    e.name,
                    e.member_type__c
                FROM
                ${process.env.TABLE_SCHEMA_NAME}.team__c e
                INNER JOIN subordinates s ON s.sfid = e.manager__c
            ) SELECT
                *
            FROM
                subordinates`;
                var result = await getDbResult(sql);
                if (result.rows.length > 0) {
                    for (i in result.rows) {
                        if (result.rows[i].member_type__c == 'PSM') {
                            team['PSM'].push(result.rows[i].sfid);
                        } else {
                            team['ASM'].push(result.rows[i].sfid);
                        }
                    }
                }else{
                    team['success'] = false;
                }
            }
            
            console.log('result  > ', team)
            return team;
        }
    } catch (e) {
        team['success'] = false;
        return team;
    }
}



var rp = require('request-promise');
//getLocationAddr('28.5796079','77.3386758')
async function getLocationAddr(lat, long) {
    if (lat != null && lat != '' && long != null && long != '') {
        return rp(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${long}&key=${process.env.GOOGLE_API_KEY}`)
            .then(async function (data) {

                data = JSON.parse(data);

                var isResultFound = false, address = 'N/A';
                if (data != undefined && data.results.length > 0) {
                    for (i in data.results) {
                        if (isResultFound == false) {

                            for (j in data.results[i].address_components) {
                                if (data.results[i].geometry.location_type == 'GEOMETRIC_CENTER' && isResultFound == false) {
                                    isResultFound = true;
                                    address = data.results[i].formatted_address;
                                }
                            }
                        }
                    }
                }
                return address;
            })
            .catch(function (err) {
                console.log(err);
                // Crawling failed...
            });
    } else {
        return 'N/A';
    }
}

