var _ = require('lodash');
var db = require(`${PROJECT_DIR}/utility/selectQueries`);
var moment = require('moment');
var validation = require(`${PROJECT_DIR}/utility/validation`);
const uuidv4 = require('uuid/v4');
var dtUtil = require(`${PROJECT_DIR}/utility/dateUtility`);
var response = { "status": 200, "response": "" };

const AWS = require('aws-sdk');
const s3 = new AWS.S3({
  accessKeyId: process.env.CLOUDCUBE_ACCESS_KEY_ID,
  secretAccessKey: process.env.CLOUDCUBE_SECRET_ACCESS_KEY,
  region: 'us-west-2' //process.env.CLOUDCUBE_REGION
});
var path = require("path");
const fs = require('fs');


module.exports = {
    addTravel,
    addConvenience,
    addHotel,
    addIncidental,
    addFood,
    addOther,

    updateTravel,
    updateConvenience,
    updateHotel,
    updateIncidental,
    updateFood,
    updateOther,
    addAttachment

};


async function addTravel(req) {
    var is_Validate = true;
    try {
        var reqBody = req.body;

        console.log(`Array.isArray(reqBody)   `, Array.isArray(reqBody));
        if (Array.isArray(reqBody)) {
            for (i in reqBody) {
                var reqInput = reqBody[i];
                is_Validate = is_Validate ? validation.issetNotEmpty(req.query.id) : false;
                // is_Validate = is_Validate ? validation.isValidDate(reqInput.arrival_date__c) : false;
                // is_Validate = is_Validate ? validation.isValidDate(reqInput.departure_date__c) : false;
                // is_Validate = is_Validate ? validation.issetNotEmpty(reqInput.mode__c) : false;
                // is_Validate = is_Validate ? validation.issetNotEmpty(reqInput.ticket_number__c) : false;
                // is_Validate = is_Validate ? validation.issetNotEmpty(reqInput.company_paid__c) : false;
                // is_Validate = is_Validate ? validation.issetNotEmpty(reqInput.have_bills__c) : false;
                // is_Validate = is_Validate ? validation.issetNotEmpty(reqInput.amount__c) : false;
                // is_Validate = is_Validate ? validation.issetNotEmpty(reqInput.from__c) : false;
                // is_Validate = is_Validate ? validation.issetNotEmpty(reqInput.to__c) : false;    
            }
        }else{
            is_Validate = false;
        }
        console.log(`is_Validate: ${is_Validate}`)
        if (is_Validate) {
            var inputValues = '';
            for (i in reqBody) {
                var reqInput = reqBody[i];
                var pg_id__c = uuidv4();
                expenseId = req.query.id;

                console.log('Request Body >> ', reqInput);

                if(validation.isValidDate(reqInput.arrival_date__c)){
                    reqInput.from_date__c = dtUtil.timestampToDate(reqInput.arrival_date__c,'YYYY-MM-DD');
                }
                if(validation.isValidDate(reqInput.departure_date__c)){
                    reqInput.to_date__c = dtUtil.timestampToDate(reqInput.departure_date__c,'YYYY-MM-DD');
                }

                if(validation.isValidDate(reqInput.from_date__c)){
                    reqInput.from_date__c = dtUtil.timestampToDate(reqInput.from_date__c,'YYYY-MM-DD');
                }
                if(validation.isValidDate(reqInput.to_date__c)){
                    reqInput.to_date__c = dtUtil.timestampToDate(reqInput.to_date__c,'YYYY-MM-DD');
                }
                if (i > 0) {
                    inputValues += ', ';
                }
                inputValues +=`(  '${pg_id__c}',
                    '${expenseId}',
                     ${validation.issetNotEmpty(reqInput.outstation_mode__c) ? "'"+reqInput.outstation_mode__c+"'" : null } ,
                     ${validation.issetNotEmpty(reqInput.from_date__c) ? "'"+reqInput.from_date__c+"'" : null } ,
                     ${validation.issetNotEmpty(reqInput.to_date__c) ? "'"+reqInput.to_date__c+"'" : null } ,
                     ${validation.issetNotEmpty(reqInput.mode__c) ? "'"+reqInput.mode__c+"'" : null } ,
                     ${validation.issetNotEmpty(reqInput.ticket_number__c) ? "'"+reqInput.ticket_number__c+"'" : null } ,
                     ${validation.issetNotEmpty(reqInput.company_paid__c) ? "'"+reqInput.company_paid__c+"'" : null } ,
                     ${validation.issetNotEmpty(reqInput.have_bills__c) ? "'"+reqInput.have_bills__c+"'" : null } ,
                     ${validation.issetNotEmpty(reqInput.amount__c) ? "'"+reqInput.amount__c+"'" : null } ,
                     ${validation.issetNotEmpty(reqInput.from__c) ? "'"+reqInput.from__c+"'" : null } ,
                     ${validation.issetNotEmpty(reqInput.to__c) ? "'"+reqInput.to__c+"'" : null } ,
                    'travel', 'Travel Details', 'Outstation Expense',
                    ${validation.issetNotEmpty(req.headers.agentid) ? "'"+req.headers.agentid+"'" : null },
                    'a0L1m000000Dqb2EAC' 
                    )`;
            }
            console.log('inputValues >>> ',inputValues);
            //arrival_date__c -->>> From_Date__c
            //departure_date__c -->>> To_Date__c
            expenseFields = `pg_id__c,expense__c,outstation_mode__c,from_date__c,to_date__c,mode__c,ticket_number__c ,company_paid__c,have_bills__c,amount__c, from__c, to__c, type__c, outstation_type__c, expense_type__c, team__c, city__c`;
            
            tableName = 'Expense_Item_SS__c'; 
            var sql = `INSERT into ${process.env.TABLE_SCHEMA_NAME}.${tableName} (${expenseFields}) VALUES ${inputValues} RETURNING pg_id__c`;
            console.log(`sql : ${sql} `);
            var expense =  await db.getDbResult(sql)
            if (expense.rowCount > 0 ) {
                if(expense.rows[0].pg_id__c!=undefined){
                    // add attachment
                    if (req.body[0] != undefined) {
                        addAttachment(req.body[0], expense.rows[0].pg_id__c);
                    }
                }

                response.response = { 'success': true,"data":expense.rows, "message": "expense created successfully." };
                response.status = 200;
                return response;
            } else {
                response.response = { 'success': false, "data": {}, "message": "Due to internal error expense creation failed." };
                response.status = 400;
                return response;
            }
        } else {
            response.response = { 'success': false, "data": {}, "message": "Mandatory parameter missing." };
            response.status = 400;
            return response;
        }

    } catch (e) {
        console.log(e)
        response.response = { 'success': false, "data": {}, "message": "Internal server error." };
        response.status = 500;
        return response;

    }
}

async function addConvenience(req) {
    var reqBody = req.body;
    var is_Validate = true;

    try {

        console.log(`Array.isArray(reqBody)   `, Array.isArray(reqBody));
        if (Array.isArray(reqBody)) {
            for (i in reqBody) {
                is_Validate = is_Validate ? validation.issetNotEmpty(req.query.id) : false;
                // is_Validate = is_Validate ? validation.isValidDate(reqBody[i].date__c) : false;
                // is_Validate = is_Validate ? validation.issetNotEmpty(reqBody[i].from__c) : false;
                // is_Validate = is_Validate ? validation.issetNotEmpty(reqBody[i].to__c) : false;
                // is_Validate = is_Validate ? validation.issetNotEmpty(reqBody[i].mode__c) : false;
                // is_Validate = is_Validate ? validation.issetNotEmpty(reqBody[i].city__c) : false;
                // is_Validate = is_Validate ? validation.issetNotEmpty(reqBody[i].company_paid__c) : false;
                // is_Validate = is_Validate ? validation.issetNotEmpty(reqBody[i].have_bills__c) : false;
                // is_Validate = is_Validate ? validation.issetNotEmpty(reqBody[i].amount__c) : false;
                // is_Validate = is_Validate ? validation.issetNotEmpty(reqBody[i].toll_parking_charges__c) : false;
                // is_Validate = is_Validate ? validation.issetNotEmpty(reqBody[i].bills__c) : false;
            }
        }else{
            is_Validate = false;
        }

        
        if (is_Validate) {

            var expenseFields = `pg_id__c, expense__c, date__c, from__c, to__c, mode__c, city__c, company_paid__c, have_bills__c, amount__c, toll_parking_charges__c, bills__c, type__c, outstation_type__c, expense_type__c, team__c`;
            
            var inputValues = '';
            for (i in reqBody) {
                var reqInput = reqBody[i];
                var pg_id__c = uuidv4();
                expenseId = req.query.id;
                if (validation.isValidDate(reqInput.date__c)) {
                    reqInput.date__c = dtUtil.timestampToDate(reqInput.date__c,'YYYY-MM-DD');
                }
                if (i > 0) {
                    inputValues += ', ';
                }
                reqInput.city__c ='a0L1m000000Dqb2EAC'; // TODO:: wil change it later
                inputValues +=`(  
                    '${pg_id__c}',
                    '${expenseId}',
                    ${validation.issetNotEmpty(reqInput.date__c) ? "'"+reqInput.date__c+"'" : null } ,
                    ${validation.issetNotEmpty(reqInput.from__c) ? "'"+reqInput.from__c+"'" : null } ,
                    ${validation.issetNotEmpty(reqInput.to__c) ? "'"+reqInput.to__c+"'" : null } ,
                    ${validation.issetNotEmpty(reqInput.mode__c) ? "'"+reqInput.mode__c+"'" : null } ,
                    ${validation.issetNotEmpty(reqInput.city__c) ? "'"+reqInput.city__c+"'" : null } ,
                    ${validation.issetNotEmpty(reqInput.company_paid__c) ? "'"+reqInput.company_paid__c+"'" : null } ,
                    ${validation.issetNotEmpty(reqInput.have_bills__c) ? "'"+reqInput.have_bills__c+"'" : null } ,
                    ${validation.issetNotEmpty(reqInput.amount__c) ? "'"+reqInput.amount__c+"'" : null } ,
                    ${validation.issetNotEmpty(reqInput.toll_parking_charges__c) ? "'"+reqInput.toll_parking_charges__c+"'" : null } ,
                    ${validation.issetNotEmpty(reqInput.bills__c) ? "'"+reqInput.bills__c+"'" : null } ,
                   'convenience',
                   'Conveyance','Outstation Expense',
                   ${validation.issetNotEmpty(req.headers.agentid) ? "'"+req.headers.agentid+"'" : null } 
                   )`;
            }
            
            
            tableName = 'Expense_Item_SS__c';
            var sql = `INSERT into ${process.env.TABLE_SCHEMA_NAME}.${tableName} (${expenseFields}) VALUES ${inputValues} RETURNING pg_id__c`;
            console.log(`sql : ${sql} `);
            var expense =  await db.getDbResult(sql)
            if (expense.rowCount > 0 ) {
                if(expense.rows[0].pg_id__c!=undefined){
                    // add attachment
                    if (req.body[0] != undefined) {
                        addAttachment(req.body[0], expense.rows[0].pg_id__c);
                    }
                }

                response.response = { 'success': true,"data":expense.rows, "message": "expense created successfully." };
                response.status = 200;
                return response;
            } else {
                response.response = { 'success': false, "data": {}, "message": "Due to internal error expense creation failed." };
                response.status = 400;
                return response;
            }
        } else {
            response.response = { 'success': false, "data": {}, "message": "Mandatory parameter missing." };
            response.status = 400;
            return response;
        }
    } catch (e) {
        response.response = { 'success': false, "data": {}, "message": "Internal server error." };
        response.status = 500;
        return response;

    }

}

async function addHotel(req) {
    var reqBody = req.body;
    is_Validate = true;



    try {
        if (Array.isArray(reqBody)) {
            for (i in reqBody) {
                is_Validate = is_Validate ? validation.issetNotEmpty(req.query.id) : false;
                // is_Validate = is_Validate ? validation.isValidDate(reqBody[i].arrival_date__c) : false;
                // is_Validate = is_Validate ? validation.isValidDate(reqBody[i].departure_date__c) : false;
                // is_Validate = is_Validate ? validation.issetNotEmpty(reqBody[i].city__c) : false;
                // is_Validate = is_Validate ? validation.issetNotEmpty(reqBody[i].bill_number__c) : false;
                // is_Validate = is_Validate ? validation.issetNotEmpty(reqBody[i].number_of_nights__c) : false;
                // is_Validate = is_Validate ? validation.issetNotEmpty(reqBody[i].company_paid__c) : false;
                // is_Validate = is_Validate ? validation.issetNotEmpty(reqBody[i].have_bills__c) : false;
                // is_Validate = is_Validate ? validation.issetNotEmpty(reqBody[i].amount__c) : false;
            }
        }else{
            is_Validate = false;
        }
 
        if (is_Validate) {
            var expenseFields = `pg_id__c, stay_type__c, expense__c, arrival_date__c, departure_date__c,  city__c, bill_number__c, number_of_nights__c, company_paid__c, have_bills__c , amount__c, type__c, outstation_type__c, expense_type__c, team__c`;
            var inputValues = '';
            for (i in reqBody) {
                var reqInput = reqBody[i];
                var pg_id__c = uuidv4();
                expenseId = req.query.id;
                if(validation.isValidDate(reqInput.arrival_date__c)){
                    reqInput.arrival_date__c = dtUtil.timestampToDate(reqInput.arrival_date__c,'YYYY-MM-DD');
                }
                if(validation.isValidDate(reqInput.departure_date__c)){
                    reqInput.departure_date__c = dtUtil.timestampToDate(reqInput.departure_date__c,'YYYY-MM-DD');
                }
                if (i > 0) {
                    inputValues += ', ';
                }
                reqInput.city__c ='a0L1m000000Dqb2EAC'; // TODo will change it later
                inputValues +=`(  
                    '${pg_id__c}',
                    ${validation.issetNotEmpty(reqInput.stay_type__c) ? "'"+reqInput.stay_type__c+"'" : null } ,
                    '${expenseId}',
                    ${validation.issetNotEmpty(reqInput.arrival_date__c) ? "'"+reqInput.arrival_date__c+"'" : null } ,
                    ${validation.issetNotEmpty(reqInput.departure_date__c) ? "'"+reqInput.departure_date__c+"'" : null } ,
                    ${validation.issetNotEmpty(reqInput.city__c) ? "'"+reqInput.city__c+"'" : null } ,
                    ${validation.issetNotEmpty(reqInput.bill_number__c) ? "'"+reqInput.bill_number__c+"'" : null } ,
                    ${validation.issetNotEmpty(reqInput.number_of_nights__c) ? "'"+reqInput.number_of_nights__c+"'" : null } ,
                    ${validation.issetNotEmpty(reqInput.company_paid__c) ? "'"+reqInput.company_paid__c+"'" : null } ,
                    ${validation.issetNotEmpty(reqInput.have_bills__c) ? "'"+reqInput.have_bills__c+"'" : null } ,
                    ${validation.issetNotEmpty(reqInput.amount__c) ? "'"+reqInput.amount__c+"'" : null } ,
                    'hotel','Hotel/Own Arrangement/DA', 'Outstation Expense',
                    ${validation.issetNotEmpty(req.headers.agentid) ? "'"+req.headers.agentid+"'" : null } 
                    )`;
            }
              
            tableName = 'Expense_Item_SS__c';
            var sql = `INSERT into ${process.env.TABLE_SCHEMA_NAME}.${tableName} (${expenseFields}) VALUES ${inputValues} RETURNING pg_id__c`;
            console.log(`sql : ${sql} `);
            var expense =  await db.getDbResult(sql)
            if (expense.rowCount > 0 ) {

                if(expense.rows[0].pg_id__c!=undefined){
                    // add attachment
                    if (req.body[0] != undefined) {
                        addAttachment(req.body[0], expense.rows[0].pg_id__c);
                    }
                }



                response.response = { 'success': true,"data":expense.rows, "message": "expense created successfully." };
                response.status = 200;
                return response;
            } else {
                response.response = { 'success': false, "data": {}, "message": "Due to internal error expense creation failed." };
                response.status = 400;
                return response;
            }
        } else {
            response.response = { 'success': false, "data": {}, "message": "Mandatory parameter missing." };
            response.status = 400;
            return response;
        }
    } catch (e) {
        response.response = { 'success': false, "data": {}, "message": "Internal server error." };
        response.status = 500;
        return response;

    }

}

async function addIncidental(req) {
    var reqBody = req.body;


    try {

        is_Validate = true;
        
        if (Array.isArray(reqBody)) {
            for (i in reqBody) {
        
                is_Validate = is_Validate ? validation.issetNotEmpty(req.query.id) : false;
                // is_Validate = is_Validate ? validation.isValidDate(reqBody[i].from_date__c) : false;
                // is_Validate = is_Validate ? validation.issetNotEmpty(reqBody[i].place__c) : false;
                // is_Validate = is_Validate ? validation.issetNotEmpty(reqBody[i].remark__c) : false;
                // is_Validate = is_Validate ? validation.issetNotEmpty(reqBody[i].amount__c) : false;
            }
        }else{
            is_Validate = false;
        }

        if (is_Validate) {
            var expenseFields = `pg_id__c, expense__c, from_date__c,to_date__c, place__c,  remark__c, amount__c, type__c, outstation_type__c, expense_type__c, team__c, city__c`;
            var inputValues = '';
            for (i in reqBody) {

                var reqInput = reqBody[i];
                var pg_id__c = uuidv4();
                expenseId = req.query.id;
    
                if(validation.isValidDate(reqInput.from_date__c)){
                    reqInput.from_date__c = dtUtil.timestampToDate(reqInput.from_date__c,'YYYY-MM-DD');
                } 
                if(validation.isValidDate(reqInput.to_date__c)){
                    reqInput.to_date__c = dtUtil.timestampToDate(reqInput.to_date__c,'YYYY-MM-DD');
                }
                if (i > 0) {
                    inputValues += ', ';
                }
                inputValues +=`(  
                    '${pg_id__c}',
                    ${validation.issetNotEmpty(expenseId) ? "'"+expenseId+"'" : null } ,
                    ${validation.issetNotEmpty(reqInput.from_date__c) ? "'"+reqInput.from_date__c+"'" : null } ,
                    ${validation.issetNotEmpty(reqInput.to_date__c) ? "'"+reqInput.to_date__c+"'" : null } ,
                    ${validation.issetNotEmpty(reqInput.place__c) ? "'"+reqInput.place__c+"'" : null } ,
                    ${validation.issetNotEmpty(reqInput.remark__c) ? "'"+reqInput.remark__c+"'" : null } ,
                    ${validation.issetNotEmpty(reqInput.amount__c) ? "'"+reqInput.amount__c+"'" : null } ,
                    'incidental', 
                    'Incidental Expense', 'Outstation Expense',
                    ${validation.issetNotEmpty(req.headers.agentid) ? "'"+req.headers.agentid+"'" : null },
                    'a0L1m000000Dqb2EAC' 
                    )`;
            }


            tableName = 'Expense_Item_SS__c';
            var sql = `INSERT into ${process.env.TABLE_SCHEMA_NAME}.${tableName} (${expenseFields}) VALUES ${inputValues} RETURNING pg_id__c`;
            console.log(`sql : ${sql} `);
            var expense =  await db.getDbResult(sql)
            if (expense.rowCount > 0 ) {
                response.response = { 'success': true,"data":expense.rows, "message": "expense created successfully." };
                response.status = 200;
                return response;
            } else {
                response.response = { 'success': false, "data": {}, "message": "Due to internal error expense creation failed." };
                response.status = 400;
                return response;
            }
            
        } else {
            response.response = { 'success': false, "data": {}, "message": "Mandatory parameter missing." };
            response.status = 400;
            return response;
        }
    } catch (e) {
        response.response = { 'success': false, "data": {}, "message": "Internal server error." };
        response.status = 500;
        return response;

    }


}

async function addFood(req) {
    var reqBody = req.body;
    is_Validate = true;



    try {

        if (Array.isArray(reqBody)) {
            for (i in reqBody) {
                is_Validate = is_Validate ? validation.issetNotEmpty(req.query.id) : false;
                // is_Validate = is_Validate ? validation.isValidDate(reqBody[i].date__c) : false;
                // is_Validate = is_Validate ? validation.issetNotEmpty(reqBody[i].bill_number__c) : false;
                // is_Validate = is_Validate ? validation.issetNotEmpty(reqBody[i].city__c) : false;
                // is_Validate = is_Validate ? validation.issetNotEmpty(reqBody[i].company_paid__c) : false;
                // is_Validate = is_Validate ? validation.issetNotEmpty(reqBody[i].have_bills__c) : false;
                // is_Validate = is_Validate ? validation.issetNotEmpty(reqBody[i].amount__c) : false;
                // is_Validate = is_Validate ? validation.issetNotEmpty(reqBody[i].bills__c) : false;
            }
        }else{
            is_Validate = false;
        }

        if (is_Validate) {
            var expenseFields = `pg_id__c, expense__c, date__c, bill_number__c, city__c, company_paid__c, have_bills__c, amount__c, bills__c, type__c, outstation_type__c, expense_type__c, team__c`;
            var inputValues = '';
            for (i in reqBody) {
                var reqInput = reqBody[i];
                var pg_id__c = uuidv4();
                expenseId = req.query.id;
                if(validation.isValidDate(reqInput.date__c)){
                    reqInput.date__c = dtUtil.timestampToDate(reqInput.date__c,'YYYY-MM-DD');
                }
                if (i > 0) {
                    inputValues += ', ';
                }
                reqInput.city__c ='a0L1m000000Dqb2EAC'; // TODo will change it later

                inputValues +=`(  
                    '${pg_id__c}',
                    '${expenseId}',
                    ${validation.issetNotEmpty(reqInput.date__c) ? "'"+reqInput.date__c+"'" : null } ,
                    ${validation.issetNotEmpty(reqInput.bill_number__c) ? "'"+reqInput.bill_number__c+"'" : null } ,
                    ${validation.issetNotEmpty(reqInput.city__c) ? "'"+reqInput.city__c+"'" : null } ,
                    ${validation.issetNotEmpty(reqInput.company_paid__c) ? "'"+reqInput.company_paid__c+"'" : null } ,
                    ${validation.issetNotEmpty(reqInput.have_bills__c) ? "'"+reqInput.have_bills__c+"'" : null } ,
                    ${validation.issetNotEmpty(reqInput.amount__c) ? "'"+reqInput.amount__c+"'" : null } ,
                    ${validation.issetNotEmpty(reqInput.bills__c) ? "'"+reqInput.bills__c+"'" : null } ,
                    'food',
                    'Food Expense', 'Outstation Expense',
                    ${validation.issetNotEmpty(req.headers.agentid) ? "'"+req.headers.agentid+"'" : null } 
                    )`;
            }
            
            tableName = 'Expense_Item_SS__c';
            var sql = `INSERT into ${process.env.TABLE_SCHEMA_NAME}.${tableName} (${expenseFields}) VALUES ${inputValues} RETURNING pg_id__c`;
            console.log(`sql : ${sql} `);
            var expense =  await db.getDbResult(sql)
            if (expense.rowCount > 0 ) {

                if(expense.rows[0].pg_id__c!=undefined){
                    // add attachment
                    if (req.body[0] != undefined) {
                        addAttachment(req.body[0], expense.rows[0].pg_id__c);
                    }
                }

                response.response = { 'success': true,"data":expense.rows, "message": "expense created successfully." };
                response.status = 200;
                return response;
            } else {
                response.response = { 'success': false, "data": {}, "message": "Due to internal error expense creation failed." };
                response.status = 400;
                return response;
            }
        } else {
            response.response = { 'success': false, "data": {}, "message": "Mandatory parameter missing." };
            response.status = 400;
            return response;
        }
    } catch (e) {
        response.response = { 'success': false, "data": {}, "message": "Internal server error." };
        response.status = 500;
        return response;

    }

}

async function addOther(req) {

    var reqBody = req.body;
    is_Validate = true;

    try {

        if (Array.isArray(reqBody)) {
            for (i in reqBody) {
                is_Validate = is_Validate ? validation.issetNotEmpty(req.query.id) : false;
                // is_Validate = is_Validate ? validation.issetNotEmpty(reqBody[i].place__c) : false;
                // is_Validate = is_Validate ? validation.issetNotEmpty(reqBody[i].bill_number__c) : false;
                // is_Validate = is_Validate ? validation.issetNotEmpty(reqBody[i].remark__c) : false;
                // is_Validate = is_Validate ? validation.issetNotEmpty(reqBody[i].have_bills__c) : false;
                // is_Validate = is_Validate ? validation.issetNotEmpty(reqBody[i].amount__c) : false;
                // is_Validate = is_Validate ? validation.issetNotEmpty(reqBody[i].bills__c) : false;
            }
        }else{
            is_Validate = false;
        }

        if (is_Validate) {
            var expenseFields = `pg_id__c,expense__c, place__c, bill_number__c, remark__c, have_bills__c, amount__c, bills__c, type__c, outstation_type__c, expense_type__c, team__c, stay_type__c, from_date__c, to_date__c,date__c, city__c`;
            
             
            var inputValues = '';
            for (i in reqBody) {
                var reqInput = reqBody[i];
                var pg_id__c = uuidv4();
                expenseId = req.query.id;
                
                if (i > 0) {
                    inputValues += ', ';
                }
                if(validation.isValidDate(reqInput.from_date__c)){
                    reqInput.from_date__c = dtUtil.timestampToDate(reqInput.from_date__c,'YYYY-MM-DD');
                }
                if(validation.isValidDate(reqInput.to_date__c)){
                    reqInput.to_date__c = dtUtil.timestampToDate(reqInput.to_date__c,'YYYY-MM-DD');
                } 
                if(validation.isValidDate(reqInput.date__c)){
                    reqInput.date__c = dtUtil.timestampToDate(reqInput.date__c,'YYYY-MM-DD');
                }
                inputValues +=`(  
                    '${pg_id__c}',
                    '${expenseId}',
                    ${validation.issetNotEmpty(reqInput.place__c) ? "'"+reqInput.place__c+"'" : null } ,
                    ${validation.issetNotEmpty(reqInput.bill_number__c) ? "'"+reqInput.bill_number__c+"'" : null } ,
                    ${validation.issetNotEmpty(reqInput.remark__c) ? "'"+reqInput.remark__c+"'" : null } ,
                    ${validation.issetNotEmpty(reqInput.have_bills__c) ? "'"+reqInput.have_bills__c+"'" : null } ,
                    ${validation.issetNotEmpty(reqInput.amount__c) ? "'"+reqInput.amount__c+"'" : null } ,
                    ${validation.issetNotEmpty(reqInput.bills__c) ? "'"+reqInput.bills__c+"'" : null } ,
                    'other','Other Expenses', 'Outstation Expense',
                    ${validation.issetNotEmpty(req.headers.agentid) ? "'"+req.headers.agentid+"'" : null },
                    ${validation.issetNotEmpty(reqInput.stay_type__c) ? "'"+reqInput.stay_type__c+"'" : null },
                    ${validation.issetNotEmpty(reqInput.from_date__c) ? "'"+reqInput.from_date__c+"'" : null },
                    ${validation.issetNotEmpty(reqInput.to_date__c) ? "'"+reqInput.to_date__c+"'" : null },
                    ${validation.issetNotEmpty(reqInput.date__c) ? "'"+reqInput.date__c+"'" : null },
                    'a0L1m000000Dqb2EAC'
                    )`;
                }

            tableName = 'Expense_Item_SS__c';
            var sql = `INSERT into ${process.env.TABLE_SCHEMA_NAME}.${tableName} (${expenseFields}) VALUES ${inputValues} RETURNING pg_id__c`;
            console.log(`sql : ${sql} `);
            var expense =  await db.getDbResult(sql)
            if (expense.rowCount > 0 ) {

                if (expense.rows[0].pg_id__c != undefined) {
                    // add attachment
                    if (req.body[0] != undefined) {
                        addAttachment(req.body[0], expense.rows[0].pg_id__c);
                    }
                }
                response.response = { 'success': true,"data":expense.rows, "message": "expense created successfully." };
                response.status = 200;
                return response;
            } else {
                response.response = { 'success': false, "data": {}, "message": "Due to internal error expense creation failed." };
                response.status = 400;
                return response;
            }

        } else {
            response.response = { 'success': false, "data": {}, "message": "Mandatory parameter missing." };
            response.status = 400;
            return response;
        }
    } catch (e) {
        response.response = { 'success': false, "data": {}, "message": "Internal server error." };
        response.status = 500;
        return response;

    }

}

async function updateTravel(req) {

    try {
        var is_Validate = true;
        is_Validate = is_Validate ? validation.issetNotEmpty(req.query.id) : false;
        is_Validate = is_Validate ? validation.issetNotEmpty(req.body.pg_id__c) : false;
        is_Validate = is_Validate ? validation.issetNotEmpty(req.headers.agentid) : false;
        if (is_Validate) {
            var myDetails = await db.agentDetail(req.headers.agentid);
            if (myDetails.rowCount > 0) {


                tableName = 'Expense_Item_SS__c';

                fieldValue = [];
                //  expenseFields = `pg_id__c,expense__c,arrival_date__c,departure_date__c,mode__c,ticket_number__c ,company_paid__c,have_bills__c,amount__c, from__c, to__c, type__c`;`;

                if (req.body.outstation_mode__c != undefined) {
                    fieldValue.push({ "field": "outstation_mode__c", "value": req.body.outstation_mode__c });
                }
                if (req.body.expense__c != undefined) {
                    fieldValue.push({ "field": "expense__c", "value": req.body.expense__c });
                }

                //arrival_date__c, departure_date__c,from_date__c,to_date__c
                if (validation.isValidDate(req.body.from_date__c)) {
                    req.body.from_date__c = dtUtil.timestampToDate(req.body.from_date__c,'YYYY-MM-DD');
                    fieldValue.push({ "field": "from_date__c", "value": req.body.from_date__c });
                }else if(validation.isValidDate(req.body.arrival_date__c)){
                    req.body.from_date__c = dtUtil.timestampToDate(req.body.arrival_date__c,'YYYY-MM-DD');
                    fieldValue.push({ "field": "from_date__c", "value": req.body.from_date__c });
                }
                if (validation.isValidDate(req.body.to_date__c)) {
                    req.body.to_date__c = dtUtil.timestampToDate(req.body.to_date__c,'YYYY-MM-DD');
                    fieldValue.push({ "field": "to_date__c", "value": req.body.to_date__c });
                }else if (validation.isValidDate(req.body.departure_date__c)) {
                    req.body.to_date__c = dtUtil.timestampToDate(req.body.departure_date__c,'YYYY-MM-DD');
                    fieldValue.push({ "field": "to_date__c", "value": req.body.to_date__c });
                } 
                if (req.body.mode__c != undefined) {
                    fieldValue.push({ "field": "mode__c", "value": req.body.mode__c });
                }
                if (req.body.ticket_number__c != undefined) {
                    fieldValue.push({ "field": "ticket_number__c", "value": req.body.ticket_number__c });
                }
                if (req.body.company_paid__c != undefined) {
                    fieldValue.push({ "field": "company_paid__c", "value": req.body.company_paid__c });
                }
                if (req.body.have_bills__c != undefined) {
                    fieldValue.push({ "field": "have_bills__c", "value": req.body.have_bills__c });
                }
                if (req.body.amount__c != undefined) {
                    fieldValue.push({ "field": "amount__c", "value": req.body.amount__c });
                }
                if (req.body.from__c != undefined) {
                    fieldValue.push({ "field": "from__c", "value": req.body.from__c });
                }
                if (req.body.to__c != undefined) {
                    fieldValue.push({ "field": "to__c", "value": req.body.to__c });
                }


                const WhereClouse = [];
                WhereClouse.push({ "field": "pg_id__c", "value": req.body.pg_id__c });

                expenseDetail = await db.updateRecord(tableName, fieldValue, WhereClouse);

                if (expenseDetail.success) {
                    // UPDATE KPI -- when status = Completed

                    console.log('req.body >>>>>>>>>>>>>.    ', req.body   )
                    if (req.body.pg_id__c != undefined) {
                        // add attachment
                        if (req.body != undefined) {
                            console.log('Add Attachment .............. ')
                            addAttachment(req.body, req.body.pg_id__c);
                        }
                    }
                    response.response = { 'success': true, "data": {}, "message": "Expense updated successfully." };
                    response.status = 200;
                    return response;
                } else {
                    console.log(expenseDetail);
                    response.response = { 'success': false, "data": {}, "message": "Due to internal error Expense update failed." };
                    response.status = 400;
                    return response;
                }
            } else {
                response.response = { 'success': false, "data": {}, "message": "Invalid login user." };
                response.status = 400;
                return response;
            }
        } else {
            response.response = { 'success': false, "data": {}, "message": "Mandatory parameter(s) are missing." };
            response.status = 400;
            return response;

        }
    } catch (e) {
        response.response = { 'success': false, "data": {}, "message": "Internal server error." };
        response.status = 500;
        return response;
    }

}

async function updateConvenience(req) {
    try {
        var is_Validate = true;
        is_Validate = is_Validate ? validation.issetNotEmpty(req.query.id) : false;
        is_Validate = is_Validate ? validation.issetNotEmpty(req.body.pg_id__c) : false;
        is_Validate = is_Validate ? validation.issetNotEmpty(req.headers.agentid) : false;
        if (is_Validate) {
            var myDetails = await db.agentDetail(req.headers.agentid);

            if (myDetails.rowCount > 0) {


                tableName = 'Expense_Item_SS__c';

                fieldValue = [];
                //              var expenseFields = `pg_id__c, expense__c, date__c, from__c, to__c, mode__c, city__c, company_paid__c, have_bills__c, amount__c, toll_parking_charges__c, bills__c, type__c`;
                if (validation.isValidDate(req.body.date__c)) {
                    req.body.date__c = dtUtil.timestampToDate(req.body.date__c,'YYYY-MM-DD');

                    fieldValue.push({ "field": "date__c", "value": req.body.date__c });
                }
                
                if (req.body.from__c != undefined) {
                    fieldValue.push({ "field": "from__c", "value": req.body.from__c });
                }
                if (req.body.to__c != undefined) {
                    fieldValue.push({ "field": "to__c", "value": req.body.to__c });
                }
                if (req.body.mode__c != undefined) {
                    fieldValue.push({ "field": "mode__c", "value": req.body.mode__c });
                }
                if (req.body.city__c != undefined) {
                    fieldValue.push({ "field": "city__c", "value": req.body.city__c });
                }
                if (req.body.company_paid__c != undefined) {
                    fieldValue.push({ "field": "company_paid__c", "value": req.body.company_paid__c });
                }
                if (req.body.have_bills__c != undefined) {
                    fieldValue.push({ "field": "have_bills__c", "value": req.body.have_bills__c });
                }
                if (req.body.amount__c != undefined) {
                    fieldValue.push({ "field": "amount__c", "value": req.body.amount__c });
                }
                if (req.body.toll_parking_charges__c != undefined) {
                    fieldValue.push({ "field": "toll_parking_charges__c", "value": req.body.toll_parking_charges__c });
                }
                if (req.body.bills__c != undefined) {
                    fieldValue.push({ "field": "bills__c", "value": req.body.bills__c });
                }


                const WhereClouse = [];
                WhereClouse.push({ "field": "pg_id__c", "value": req.body.pg_id__c });

                expenseDetail = await db.updateRecord(tableName, fieldValue, WhereClouse);

                if (expenseDetail.success) {
                    if (req.body.pg_id__c != undefined) {
                        // add attachment
                        if (req.body != undefined) {
                            addAttachment(req.body, req.body.pg_id__c);
                        }
                    }
                    response.response = { 'success': true, "data": {}, "message": "Expense updated successfully." };
                    response.status = 200;
                    return response;
                } else {
                    console.log(expenseDetail);
                    response.response = { 'success': false, "data": {}, "message": "Due to internal error Expense update failed." };
                    response.status = 400;
                    return response;
                }
            } else {
                response.response = { 'success': false, "data": {}, "message": "Invalid login user." };
                response.status = 400;
                return response;
            }
        } else {
            response.response = { 'success': false, "data": {}, "message": "Mandatory parameter(s) are missing." };
            response.status = 400;
            return response;
        }
    } catch (e) {
        response.response = { 'success': false, "data": {}, "message": "Internal server error." };
        response.status = 500;
        return response;
    }

}

async function updateHotel(req) {
    try {

        var is_Validate = true;
        is_Validate = is_Validate ? validation.issetNotEmpty(req.query.id) : false;
        is_Validate = is_Validate ? validation.issetNotEmpty(req.body.pg_id__c) : false;
        is_Validate = is_Validate ? validation.issetNotEmpty(req.headers.agentid) : false;
        if (is_Validate) {
            var myDetails = await db.agentDetail(req.headers.agentid);

            if (myDetails.rowCount > 0) {


                tableName = 'Expense_Item_SS__c';

                fieldValue = [];
                //    var expenseFields = `pg_id__c, expense__c, arrival_date__c, departure_date__c,  city__c, bill_number__c, number_of_nights__c, company_paid__c, have_bills__c , amount__c, type__c`;




                if (validation.isValidDate(req.body.arrival_date__c)) {
                    req.body.arrival_date__c = dtUtil.timestampToDate(req.body.arrival_date__c,'YYYY-MM-DD');

                    fieldValue.push({ "field": "arrival_date__c", "value": req.body.arrival_date__c });
                }
                if (validation.isValidDate(req.body.departure_date__c)) {
                    req.body.departure_date__c = dtUtil.timestampToDate(req.body.departure_date__c,'YYYY-MM-DD');
                    fieldValue.push({ "field": "departure_date__c", "value": req.body.departure_date__c });
                }
                if (req.body.city__c != undefined) {
                    fieldValue.push({ "field": "city__c", "value": req.body.city__c });
                }
                if (req.body.stay_type__c != undefined) {
                    fieldValue.push({ "field": "stay_type__c", "value": req.body.stay_type__c });
                }
                if (req.body.bill_number__c != undefined) {
                    fieldValue.push({ "field": "bill_number__c", "value": req.body.bill_number__c });
                }
                if (req.body.number_of_nights__c != undefined) {
                    fieldValue.push({ "field": "number_of_nights__c", "value": req.body.number_of_nights__c });
                }
                if (req.body.company_paid__c != undefined) {
                    fieldValue.push({ "field": "company_paid__c", "value": req.body.company_paid__c });
                }
                if (req.body.have_bills__c != undefined) {
                    fieldValue.push({ "field": "have_bills__c", "value": req.body.have_bills__c });
                }
                if (req.body.amount__c != undefined) {
                    fieldValue.push({ "field": "amount__c", "value": req.body.amount__c });
                }


                const WhereClouse = [];
                WhereClouse.push({ "field": "pg_id__c", "value": req.body.pg_id__c });

                expenseDetail = await db.updateRecord(tableName, fieldValue, WhereClouse);

                if (expenseDetail.success) {
                    // UPDATE KPI -- when status = Completed
                    if (req.body.pg_id__c != undefined) {
                        // add attachment
                        if (req.body != undefined) {
                            addAttachment(req.body, req.body.pg_id__c);
                        }
                    }
                    response.response = { 'success': true, "data": {}, "message": "Expense updated successfully." };
                    response.status = 200;
                    return response;
                } else {
                    console.log(expenseDetail);
                    response.response = { 'success': false, "data": {}, "message": "Due to internal error Expense update failed." };
                    response.status = 400;
                    return response;
                }
            } else {
                response.response = { 'success': false, "data": {}, "message": "Invalid login user." };
                response.status = 400;
                return response;
            }
        } else {
            response.response = { 'success': false, "data": {}, "message": "Mandatory parameter(s) are missing." };
            response.status = 400;
            return response;
        }
    } catch (e) {
        response.response = { 'success': false, "data": {}, "message": "Internal server error." };
        response.status = 500;
        return response;
    }

}

async function updateIncidental(req) {
    try {

        var is_Validate = true;
        is_Validate = is_Validate ? validation.issetNotEmpty(req.query.id) : false;
        is_Validate = is_Validate ? validation.issetNotEmpty(req.body.pg_id__c) : false;
        is_Validate = is_Validate ? validation.issetNotEmpty(req.headers.agentid) : false;
        if (is_Validate) {
            var myDetails = await db.agentDetail(req.headers.agentid);

            if (myDetails.rowCount > 0) {


                tableName = 'Expense_Item_SS__c';

                fieldValue = [];
                //              var expenseFields = `pg_id__c, expense__c, from_date__c, place__c,  remark__c, amount__c, type__c`;

                if (validation.isValidDate(req.body.from_date__c)) {
                    req.body.from_date__c = dtUtil.timestampToDate(req.body.from_date__c,'YYYY-MM-DD');
                 
                    fieldValue.push({ "field": "from_date__c", "value": req.body.from_date__c });
                }
                if (validation.isValidDate(req.body.to_date__c )) {
                    req.body.to_date__c  = dtUtil.timestampToDate(req.body.to_date__c ,'YYYY-MM-DD');
                 
                    fieldValue.push({ "field": "to_date__c ", "value": req.body.to_date__c  });
                }
                if (req.body.place__c != undefined) {
                    fieldValue.push({ "field": "place__c", "value": req.body.place__c });
                }
                if (req.body.amount__c != undefined) {
                    fieldValue.push({ "field": "amount__c", "value": req.body.amount__c });
                }



                const WhereClouse = [];
                WhereClouse.push({ "field": "pg_id__c", "value": req.body.pg_id__c });

                expenseDetail = await db.updateRecord(tableName, fieldValue, WhereClouse);

                if (expenseDetail.success) {
                    // UPDATE KPI -- when status = Completed
                    if (req.body.pg_id__c != undefined) {
                        // add attachment
                        if (req.body != undefined) {
                            addAttachment(req.body, req.body.pg_id__c);
                        }
                    }
                    response.response = { 'success': true, "data": {}, "message": "Expense updated successfully." };
                    response.status = 200;
                    return response;
                } else {
                    console.log(expenseDetail);
                    response.response = { 'success': false, "data": {}, "message": "Due to internal error Expense update failed." };
                    response.status = 400;
                    return response;
                }
            } else {
                response.response = { 'success': false, "data": {}, "message": "Invalid login user." };
                response.status = 400;
                return response;
            }
        } else {
            response.response = { 'success': false, "data": {}, "message": "Mandatory parameter(s) are missing." };
            response.status = 400;
            return response;
        }
    } catch (e) {
        response.response = { 'success': false, "data": {}, "message": "Internal server error." };
        response.status = 500;
        return response;
    }

}

async function updateFood(req) {
    try {

        var is_Validate = true;
        is_Validate = is_Validate ? validation.issetNotEmpty(req.query.id) : false;
        is_Validate = is_Validate ? validation.issetNotEmpty(req.body.pg_id__c) : false;
        is_Validate = is_Validate ? validation.issetNotEmpty(req.headers.agentid) : false;
        if (is_Validate) {

            var myDetails = await db.agentDetail(req.headers.agentid);

            if (myDetails.rowCount > 0) {


                tableName = 'Expense_Item_SS__c';

                fieldValue = [];
                //              var expenseFields = `pg_id__c, expense__c, date__c, bill_number__c, city__c, company_paid__c, have_bills__c, amount__c, bills__c, type__c`;



                if (validation.isValidDate(req.body.date__c)) {
                    req.body.date__c = dtUtil.timestampToDate(req.body.date__c,'YYYY-MM-DD');
                 
                    fieldValue.push({ "field": "date__c", "value": req.body.date__c });
                }
                if (req.body.bill_number__c != undefined) {
                    fieldValue.push({ "field": "bill_number__c", "value": req.body.bill_number__c });
                }
                if (req.body.city__c != undefined) {
                    fieldValue.push({ "field": "city__c", "value": req.body.city__c });
                }
                if (req.body.company_paid__c != undefined) {
                    fieldValue.push({ "field": "company_paid__c", "value": req.body.company_paid__c });
                }
                if (req.body.have_bills__c != undefined) {
                    fieldValue.push({ "field": "have_bills__c", "value": req.body.have_bills__c });
                }
                if (req.body.amount__c != undefined) {
                    fieldValue.push({ "field": "amount__c", "value": req.body.amount__c });
                }
                if (req.body.bills__c != undefined) {
                    fieldValue.push({ "field": "bills__c", "value": req.body.bills__c });
                }

                const WhereClouse = [];
                WhereClouse.push({ "field": "pg_id__c", "value": req.body.pg_id__c });

                expenseDetail = await db.updateRecord(tableName, fieldValue, WhereClouse);

                if (expenseDetail.success) {
                    // UPDATE KPI -- when status = Completed
                    if (req.body.pg_id__c != undefined) {
                        // add attachment
                        if (req.body != undefined) {
                            addAttachment(req.body, req.body.pg_id__c);
                        }
                    }
                    response.response = { 'success': true, "data": {}, "message": "Expense updated successfully." };
                    response.status = 200;
                    return response;
                } else {
                    console.log(expenseDetail);
                    response.response = { 'success': false, "data": {}, "message": "Due to internal error Expense update failed." };
                    response.status = 400;
                    return response;
                }
            } else {
                response.response = { 'success': false, "data": {}, "message": "Invalid login user." };
                response.status = 400;
                return response;
            }
        } else {
            response.response = { 'success': false, "data": {}, "message": "Mandatory parameter(s) are missing." };
            response.status = 400;
            return response;
        }
    } catch (e) {
        response.response = { 'success': false, "data": {}, "message": "Internal server error." };
        response.status = 500;
        return response;
    }
}

async function updateOther(req) {
    try {
        var is_Validate = true;
        is_Validate = is_Validate ? validation.issetNotEmpty(req.query.id) : false;
        is_Validate = is_Validate ? validation.issetNotEmpty(req.body.pg_id__c) : false;
        is_Validate = is_Validate ? validation.issetNotEmpty(req.headers.agentid) : false;
        if (is_Validate) {

            var myDetails = await db.agentDetail(req.headers.agentid);

            if (myDetails.rowCount > 0) {


                tableName = 'Expense_Item_SS__c';

                fieldValue = [];
                //      var expenseFields = `pg_id__c,expense__c, place__c, bill_number__c, remark__c, have_bills__c, amount__c, bills__c, type__c`;


                if (req.body.place__c != undefined) {
                    fieldValue.push({ "field": "place__c", "value": req.body.place__c });
                }
                if (req.body.bill_number__c != undefined) {
                    fieldValue.push({ "field": "bill_number__c", "value": req.body.bill_number__c });
                }

                if (req.body.have_bills__c != undefined) {
                    fieldValue.push({ "field": "have_bills__c", "value": req.body.have_bills__c });
                }
                if (req.body.amount__c != undefined) {
                    fieldValue.push({ "field": "amount__c", "value": req.body.amount__c });
                }
                if (req.body.bills__c != undefined) {
                    fieldValue.push({ "field": "bills__c", "value": req.body.bills__c });
                }
                if (validation.isValidDate(req.body.from_date__c)) {
                    req.body.from_date__c = dtUtil.timestampToDate(req.body.from_date__c,'YYYY-MM-DD');
                    fieldValue.push({ "field": "from_date__c", "value": req.body.from_date__c });
                }
                if (validation.isValidDate(req.body.to_date__c)) {
                    req.body.to_date__c = dtUtil.timestampToDate(req.body.to_date__c,'YYYY-MM-DD');
                    fieldValue.push({ "field": "to_date__c", "value": req.body.to_date__c });
                }
                if (validation.isValidDate(req.body.date__c)) {
                    req.body.date__c = dtUtil.timestampToDate(req.body.date__c,'YYYY-MM-DD');
                    fieldValue.push({ "field": "date__c", "value": req.body.date__c });
                }


                const WhereClouse = [];
                WhereClouse.push({ "field": "pg_id__c", "value": req.body.pg_id__c });

                expenseDetail = await db.updateRecord(tableName, fieldValue, WhereClouse);

                if (expenseDetail.success) {
                    // UPDATE KPI -- when status = Completed
                    if (req.body.pg_id__c != undefined) {
                        // add attachment
                        if (req.body != undefined) {
                            addAttachment(req.body, req.body.pg_id__c);
                        }
                    }
                    response.response = { 'success': true, "data": {}, "message": "Expense updated successfully." };
                    response.status = 200;
                    return response;
                } else {
                    console.log(expenseDetail);
                    response.response = { 'success': false, "data": {}, "message": "Due to internal error Expense update failed." };
                    response.status = 400;
                    return response;
                }
            } else {
                response.response = { 'success': false, "data": {}, "message": "Invalid login user." };
                response.status = 400;
                return response;
            }
        } else {
            response.response = { 'success': false, "data": {}, "message": "Mandatory parameter(s) are missing." };
            response.status = 400;
            return response;
        }
    } catch (e) {
        console.log(e)
        response.response = { 'success': false, "data": {}, "message": "Internal server error." };
        response.status = 500;
        return response;
    }

}





async function addAttachment(reqBody,expense_item_pg_id__c){

    try{
        is_Validate = true;
        //is_Validate = is_Validate ? validation.issetNotEmpty(req.headers.agentid) : false;
        is_Validate = is_Validate ? validation.issetNotEmpty(expense_item_pg_id__c) : false;
        is_Validate = is_Validate ? validation.issetNotEmpty(reqBody.attachment__c) : false;
        is_Validate = is_Validate ? validation.issetNotEmpty(reqBody.file_name) : false;
        //is_Validate = is_Validate ? (validation.issetNotEmpty(req.query.expense_id) || validation.issetNotEmpty(req.query.expense_item_id) ) : false;
        if (is_Validate) {

                fileName = reqBody.attachment__c;
                var fileExt = path.extname(reqBody.file_name);
                var content_type = '';
                
                if(filetype[fileExt]!=undefined)
                    content_type = filetype[fileExt];
                
                var newfileName = uuidv4()+fileExt;
                var filePath = PROJECT_DIR + '/public/uploads/expenses/';
        
                fs.writeFile(filePath + newfileName, reqBody.attachment__c, 'base64',async function (err, data) {
        
                    if (!err) {
                        fs.readFile(filePath + newfileName, async (err, data) => {
                            console.log('filePath + newfileName  ', filePath + newfileName);
        
                            if (!err) {
                                var fileStream = fs.createReadStream(filePath + newfileName);
                                fileStream.on('error', function(err) {
                                    console.log('File Error', err);
                                });
                                const params = {
                                    Bucket: 'cloud-cube',
                                    Key: 'safvczft2wy1/public/' + newfileName,
                                    Body: fileStream //JSON.stringify(data, null, 2)
                                };
                                
                                if(content_type!=undefined && content_type!='')
                                    params.ContentType = content_type;

                                s3.upload(params,async function (s3Err, data) {
                                    
                                    if (s3Err) {
                                        console.log('ERROR::: s3Err = ', s3Err);
                                        fs.unlinkSync(filePath + newfileName);
                                        response.response = { 'success': false, "data": { }, "message": "S3 Error." };
                                        response.status = 400;
                                        res.send(response.response);
                                        //return response;
                                
                                    } else {
                                        var UUIDVal = uuidv4();
                                        //console.log('data >>> ', data);
                                        console.log(`INFO:::  File uploaded successfully at ${data.ETag}`)
                                        console.log(`INFO:::  File uploaded successfully at ${data.Location}`)
                                        console.log(`INFO:::  File uploaded successfully at ${data.key}`)
                                        console.log(`INFO:::  File uploaded successfully at ${data.Bucket}`)
                                        file_TABLE = 'aws_files__c';
                                        // if (validation.issetNotEmpty(req.query.expense_id)) {
                                        //     filetargetFields = 'pg_id__c, expense_item_pg_id__c ,bucket__c, etag__c, key__c, location__c, expense__c';
                                        //     filetargetFieldsValues = [`${UUIDVal}`, `${expense_item_pg_id__c}` ,`${data.Bucket}`, `${data.ETag}`, `${data.key}`, `${data.Location}`, `${req.query.expense_id}`];
                                        // } else 
                                        if (validation.issetNotEmpty(expense_item_pg_id__c) && expense_item_pg_id__c.length == 18){
                                            filetargetFields = 'pg_id__c,expense_item__c,bucket__c, etag__c, key__c, location__c';
                                        }else {
                                            filetargetFields = 'pg_id__c,expense_item_pg_id__c,bucket__c, etag__c, key__c, location__c';
                                        }
                                        filetargetFieldsValues = [`${UUIDVal}`, `${expense_item_pg_id__c}`, `${data.Bucket}`, `${data.ETag}`, `${data.key}`, `${data.Location}`];
                                        
                                       
                                        insertTarget = await db.insertRecord(filetargetFields, filetargetFieldsValues, file_TABLE);
                                        setTimeout(function(){
                                            fs.unlinkSync(filePath + newfileName)}, 10000
                                        );
                                        setTimeout(function(){
                                            console.log('Sert time out ');
                                            mapExpenceItemWithAtachment(expense_item_pg_id__c);
                                        }, 180000 );
                                        if(insertTarget.success){
                                            console.log('insertTarget >>> ', insertTarget);
                                            // response.response = { 'success': true, "data": insertTarget.data, "message": "" };
                                            // response.status = 200;
                                            // res.send(response.response);
        //return response;


                                        }else{
                                            // response.response = { 'success': false, "data": {}, "message": "" };
                                            // response.status = 400;
                                            // res.send(response.response);
                                            //return response;
                                    
                                        }
                                    } //throw s3Err
                                }); 
                            } else {
                                // response.response = { 'success': false, "data": { }, "message": "File read error." };
                                // response.status = 400;
                                // res.send(response.response);
                                //return response;
                        
                            }
                            
                        });
                    } else {
                        // response.response = { 'success': false, "data": { }, "message": "File write error." };
                        // response.status = 400;
                        // res.send(response.response);
                        //return response;
                
                    }
                });
                
            
        }else{
            // response.response = { 'success': false, "data": {  }, "message": "mandatory parameter are missing." };
            // response.status = 400;
            // res.send(response.response);
            //return response;
    
        }

        

    }catch(e){
        console.log(e);
        // response.response = { 'success': false, "data": { "contacts": [] }, "message": "Internal server error." };
        // response.status = 500;
        // res.send(response.response);
        //return response;

    }


}





async function mapExpenceItemWithAtachment(expense_item_pg_id__c) {
    if (validation.issetNotEmpty(expense_item_pg_id__c)) {

        var tableName = 'Expense_Item_SS__c';
        var fields = ['sfid','pg_id__c','expense__c'];
        var WhereClouse = [];
        WhereClouse.push({ "fieldName": "pg_id__c", "fieldValue": expense_item_pg_id__c });
        var offset = '0';
        var limit = '1'
        var orderBy = '';
        var sql = db.SelectAllQry(fields, tableName, WhereClouse, offset, limit, orderBy);
        var expenseItem = await client.query(sql);
        
        if (expenseItem.rowCount > 0 && expenseItem.rows[0].sfid!=undefined) {
            
            var tableNameAtt = 'aws_files__c';
            var fieldValueAtt = [];
            
            fieldValueAtt.push({ "field": "expense_item__c", "value": expenseItem.rows[0].sfid });
            fieldValueAtt.push({ "field": "expense__c", "value": expenseItem.rows[0].expense__c });
  
            const WhereClouseAtt = [];
            WhereClouseAtt.push({ "field": "expense_item_pg_id__c", "value": expense_item_pg_id__c });

            attDetail = await db.updateRecord(tableNameAtt, fieldValueAtt, WhereClouseAtt);
            console.log(attDetail)
        }
    }
} 

const filetype = {
	".323": "text/h323",
	".3g2": "video/3gpp2",
	".3gp": "video/3gpp",
	".3gp2": "video/3gpp2",
	".3gpp": "video/3gpp",
	".7z": "application/x-7z-compressed",
	".aa": "audio/audible",
	".AAC": "audio/aac",
	".aaf": "application/octet-stream",
	".aax": "audio/vnd.audible.aax",
	".ac3": "audio/ac3",
	".aca": "application/octet-stream",
	".accda": "application/msaccess.addin",
	".accdb": "application/msaccess",
	".accdc": "application/msaccess.cab",
	".accde": "application/msaccess",
	".accdr": "application/msaccess.runtime",
	".accdt": "application/msaccess",
	".accdw": "application/msaccess.webapplication",
	".accft": "application/msaccess.ftemplate",
	".acx": "application/internet-property-stream",
	".AddIn": "text/xml",
	".ade": "application/msaccess",
	".adobebridge": "application/x-bridge-url",
	".adp": "application/msaccess",
	".ADT": "audio/vnd.dlna.adts",
	".ADTS": "audio/aac",
	".afm": "application/octet-stream",
	".ai": "application/postscript",
	".aif": "audio/x-aiff",
	".aifc": "audio/aiff",
	".aiff": "audio/aiff",
	".air": "application/vnd.adobe.air-application-installer-package+zip",
	".amc": "application/x-mpeg",
	".application": "application/x-ms-application",
	".art": "image/x-jg",
	".asa": "application/xml",
	".asax": "application/xml",
	".ascx": "application/xml",
	".asd": "application/octet-stream",
	".asf": "video/x-ms-asf",
	".ashx": "application/xml",
	".asi": "application/octet-stream",
	".asm": "text/plain",
	".asmx": "application/xml",
	".aspx": "application/xml",
	".asr": "video/x-ms-asf",
	".asx": "video/x-ms-asf",
	".atom": "application/atom+xml",
	".au": "audio/basic",
	".avi": "video/x-msvideo",
	".axs": "application/olescript",
	".bas": "text/plain",
	".bcpio": "application/x-bcpio",
	".bin": "application/octet-stream",
	".bmp": "image/bmp",
	".c": "text/plain",
	".cab": "application/octet-stream",
	".caf": "audio/x-caf",
	".calx": "application/vnd.ms-office.calx",
	".cat": "application/vnd.ms-pki.seccat",
	".cc": "text/plain",
	".cd": "text/plain",
	".cdda": "audio/aiff",
	".cdf": "application/x-cdf",
	".cer": "application/x-x509-ca-cert",
	".chm": "application/octet-stream",
	".class": "application/x-java-applet",
	".clp": "application/x-msclip",
	".cmx": "image/x-cmx",
	".cnf": "text/plain",
	".cod": "image/cis-cod",
	".config": "application/xml",
	".contact": "text/x-ms-contact",
	".coverage": "application/xml",
	".cpio": "application/x-cpio",
	".cpp": "text/plain",
	".crd": "application/x-mscardfile",
	".crl": "application/pkix-crl",
	".crt": "application/x-x509-ca-cert",
	".cs": "text/plain",
	".csdproj": "text/plain",
	".csh": "application/x-csh",
	".csproj": "text/plain",
	".css": "text/css",
	".csv": "text/csv",
	".cur": "application/octet-stream",
	".cxx": "text/plain",
	".dat": "application/octet-stream",
	".datasource": "application/xml",
	".dbproj": "text/plain",
	".dcr": "application/x-director",
	".def": "text/plain",
	".deploy": "application/octet-stream",
	".der": "application/x-x509-ca-cert",
	".dgml": "application/xml",
	".dib": "image/bmp",
	".dif": "video/x-dv",
	".dir": "application/x-director",
	".disco": "text/xml",
	".dll": "application/x-msdownload",
	".dll.config": "text/xml",
	".dlm": "text/dlm",
	".doc": "application/msword",
	".docm": "application/vnd.ms-word.document.macroEnabled.12",
	".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
	".dot": "application/msword",
	".dotm": "application/vnd.ms-word.template.macroEnabled.12",
	".dotx": "application/vnd.openxmlformats-officedocument.wordprocessingml.template",
	".dsp": "application/octet-stream",
	".dsw": "text/plain",
	".dtd": "text/xml",
	".dtsConfig": "text/xml",
	".dv": "video/x-dv",
	".dvi": "application/x-dvi",
	".dwf": "drawing/x-dwf",
	".dwp": "application/octet-stream",
	".dxr": "application/x-director",
	".eml": "message/rfc822",
	".emz": "application/octet-stream",
	".eot": "application/octet-stream",
	".eps": "application/postscript",
	".etl": "application/etl",
	".etx": "text/x-setext",
	".evy": "application/envoy",
	".exe": "application/octet-stream",
	".exe.config": "text/xml",
	".fdf": "application/vnd.fdf",
	".fif": "application/fractals",
	".filters": "Application/xml",
	".fla": "application/octet-stream",
	".flr": "x-world/x-vrml",
	".flv": "video/x-flv",
	".fsscript": "application/fsharp-script",
	".fsx": "application/fsharp-script",
	".generictest": "application/xml",
	".gif": "image/gif",
	".group": "text/x-ms-group",
	".gsm": "audio/x-gsm",
	".gtar": "application/x-gtar",
	".gz": "application/x-gzip",
	".h": "text/plain",
	".hdf": "application/x-hdf",
	".hdml": "text/x-hdml",
	".hhc": "application/x-oleobject",
	".hhk": "application/octet-stream",
	".hhp": "application/octet-stream",
	".hlp": "application/winhlp",
	".hpp": "text/plain",
	".hqx": "application/mac-binhex40",
	".hta": "application/hta",
	".htc": "text/x-component",
	".htm": "text/html",
	".html": "text/html",
	".htt": "text/webviewhtml",
	".hxa": "application/xml",
	".hxc": "application/xml",
	".hxd": "application/octet-stream",
	".hxe": "application/xml",
	".hxf": "application/xml",
	".hxh": "application/octet-stream",
	".hxi": "application/octet-stream",
	".hxk": "application/xml",
	".hxq": "application/octet-stream",
	".hxr": "application/octet-stream",
	".hxs": "application/octet-stream",
	".hxt": "text/html",
	".hxv": "application/xml",
	".hxw": "application/octet-stream",
	".hxx": "text/plain",
	".i": "text/plain",
	".ico": "image/x-icon",
	".ics": "application/octet-stream",
	".idl": "text/plain",
	".ief": "image/ief",
	".iii": "application/x-iphone",
	".inc": "text/plain",
	".inf": "application/octet-stream",
	".inl": "text/plain",
	".ins": "application/x-internet-signup",
	".ipa": "application/x-itunes-ipa",
	".ipg": "application/x-itunes-ipg",
	".ipproj": "text/plain",
	".ipsw": "application/x-itunes-ipsw",
	".iqy": "text/x-ms-iqy",
	".isp": "application/x-internet-signup",
	".ite": "application/x-itunes-ite",
	".itlp": "application/x-itunes-itlp",
	".itms": "application/x-itunes-itms",
	".itpc": "application/x-itunes-itpc",
	".IVF": "video/x-ivf",
	".jar": "application/java-archive",
	".java": "application/octet-stream",
	".jck": "application/liquidmotion",
	".jcz": "application/liquidmotion",
	".jfif": "image/pjpeg",
	".jnlp": "application/x-java-jnlp-file",
	".jpb": "application/octet-stream",
	".jpe": "image/jpeg",
	".jpeg": "image/jpeg",
	".jpg": "image/jpeg",
	".js": "application/x-javascript",
	".json": "application/json",
	".jsx": "text/jscript",
	".jsxbin": "text/plain",
	".latex": "application/x-latex",
	".library-ms": "application/windows-library+xml",
	".lit": "application/x-ms-reader",
	".loadtest": "application/xml",
	".lpk": "application/octet-stream",
	".lsf": "video/x-la-asf",
	".lst": "text/plain",
	".lsx": "video/x-la-asf",
	".lzh": "application/octet-stream",
	".m13": "application/x-msmediaview",
	".m14": "application/x-msmediaview",
	".m1v": "video/mpeg",
	".m2t": "video/vnd.dlna.mpeg-tts",
	".m2ts": "video/vnd.dlna.mpeg-tts",
	".m2v": "video/mpeg",
	".m3u": "audio/x-mpegurl",
	".m3u8": "audio/x-mpegurl",
	".m4a": "audio/m4a",
	".m4b": "audio/m4b",
	".m4p": "audio/m4p",
	".m4r": "audio/x-m4r",
	".m4v": "video/x-m4v",
	".mac": "image/x-macpaint",
	".mak": "text/plain",
	".man": "application/x-troff-man",
	".manifest": "application/x-ms-manifest",
	".map": "text/plain",
	".master": "application/xml",
	".mda": "application/msaccess",
	".mdb": "application/x-msaccess",
	".mde": "application/msaccess",
	".mdp": "application/octet-stream",
	".me": "application/x-troff-me",
	".mfp": "application/x-shockwave-flash",
	".mht": "message/rfc822",
	".mhtml": "message/rfc822",
	".mid": "audio/mid",
	".midi": "audio/mid",
	".mix": "application/octet-stream",
	".mk": "text/plain",
	".mmf": "application/x-smaf",
	".mno": "text/xml",
	".mny": "application/x-msmoney",
	".mod": "video/mpeg",
	".mov": "video/quicktime",
	".movie": "video/x-sgi-movie",
	".mp2": "video/mpeg",
	".mp2v": "video/mpeg",
	".mp3": "audio/mpeg",
	".mp4": "video/mp4",
	".mp4v": "video/mp4",
	".mpa": "video/mpeg",
	".mpe": "video/mpeg",
	".mpeg": "video/mpeg",
	".mpf": "application/vnd.ms-mediapackage",
	".mpg": "video/mpeg",
	".mpp": "application/vnd.ms-project",
	".mpv2": "video/mpeg",
	".mqv": "video/quicktime",
	".ms": "application/x-troff-ms",
	".msi": "application/octet-stream",
	".mso": "application/octet-stream",
	".mts": "video/vnd.dlna.mpeg-tts",
	".mtx": "application/xml",
	".mvb": "application/x-msmediaview",
	".mvc": "application/x-miva-compiled",
	".mxp": "application/x-mmxp",
	".nc": "application/x-netcdf",
	".nsc": "video/x-ms-asf",
	".nws": "message/rfc822",
	".ocx": "application/octet-stream",
	".oda": "application/oda",
	".odc": "text/x-ms-odc",
	".odh": "text/plain",
	".odl": "text/plain",
	".odp": "application/vnd.oasis.opendocument.presentation",
	".ods": "application/oleobject",
	".odt": "application/vnd.oasis.opendocument.text",
	".one": "application/onenote",
	".onea": "application/onenote",
	".onepkg": "application/onenote",
	".onetmp": "application/onenote",
	".onetoc": "application/onenote",
	".onetoc2": "application/onenote",
	".orderedtest": "application/xml",
	".osdx": "application/opensearchdescription+xml",
	".p10": "application/pkcs10",
	".p12": "application/x-pkcs12",
	".p7b": "application/x-pkcs7-certificates",
	".p7c": "application/pkcs7-mime",
	".p7m": "application/pkcs7-mime",
	".p7r": "application/x-pkcs7-certreqresp",
	".p7s": "application/pkcs7-signature",
	".pbm": "image/x-portable-bitmap",
	".pcast": "application/x-podcast",
	".pct": "image/pict",
	".pcx": "application/octet-stream",
	".pcz": "application/octet-stream",
	".pdf": "application/pdf",
	".pfb": "application/octet-stream",
	".pfm": "application/octet-stream",
	".pfx": "application/x-pkcs12",
	".pgm": "image/x-portable-graymap",
	".pic": "image/pict",
	".pict": "image/pict",
	".pkgdef": "text/plain",
	".pkgundef": "text/plain",
	".pko": "application/vnd.ms-pki.pko",
	".pls": "audio/scpls",
	".pma": "application/x-perfmon",
	".pmc": "application/x-perfmon",
	".pml": "application/x-perfmon",
	".pmr": "application/x-perfmon",
	".pmw": "application/x-perfmon",
	".png": "image/png",
	".pnm": "image/x-portable-anymap",
	".pnt": "image/x-macpaint",
	".pntg": "image/x-macpaint",
	".pnz": "image/png",
	".pot": "application/vnd.ms-powerpoint",
	".potm": "application/vnd.ms-powerpoint.template.macroEnabled.12",
	".potx": "application/vnd.openxmlformats-officedocument.presentationml.template",
	".ppa": "application/vnd.ms-powerpoint",
	".ppam": "application/vnd.ms-powerpoint.addin.macroEnabled.12",
	".ppm": "image/x-portable-pixmap",
	".pps": "application/vnd.ms-powerpoint",
	".ppsm": "application/vnd.ms-powerpoint.slideshow.macroEnabled.12",
	".ppsx": "application/vnd.openxmlformats-officedocument.presentationml.slideshow",
	".ppt": "application/vnd.ms-powerpoint",
	".pptm": "application/vnd.ms-powerpoint.presentation.macroEnabled.12",
	".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
	".prf": "application/pics-rules",
	".prm": "application/octet-stream",
	".prx": "application/octet-stream",
	".ps": "application/postscript",
	".psc1": "application/PowerShell",
	".psd": "application/octet-stream",
	".psess": "application/xml",
	".psm": "application/octet-stream",
	".psp": "application/octet-stream",
	".pub": "application/x-mspublisher",
	".pwz": "application/vnd.ms-powerpoint",
	".qht": "text/x-html-insertion",
	".qhtm": "text/x-html-insertion",
	".qt": "video/quicktime",
	".qti": "image/x-quicktime",
	".qtif": "image/x-quicktime",
	".qtl": "application/x-quicktimeplayer",
	".qxd": "application/octet-stream",
	".ra": "audio/x-pn-realaudio",
	".ram": "audio/x-pn-realaudio",
	".rar": "application/octet-stream",
	".ras": "image/x-cmu-raster",
	".rat": "application/rat-file",
	".rc": "text/plain",
	".rc2": "text/plain",
	".rct": "text/plain",
	".rdlc": "application/xml",
	".resx": "application/xml",
	".rf": "image/vnd.rn-realflash",
	".rgb": "image/x-rgb",
	".rgs": "text/plain",
	".rm": "application/vnd.rn-realmedia",
	".rmi": "audio/mid",
	".rmp": "application/vnd.rn-rn_music_package",
	".roff": "application/x-troff",
	".rpm": "audio/x-pn-realaudio-plugin",
	".rqy": "text/x-ms-rqy",
	".rtf": "application/rtf",
	".rtx": "text/richtext",
	".ruleset": "application/xml",
	".s": "text/plain",
	".safariextz": "application/x-safari-safariextz",
	".scd": "application/x-msschedule",
	".sct": "text/scriptlet",
	".sd2": "audio/x-sd2",
	".sdp": "application/sdp",
	".sea": "application/octet-stream",
	".searchConnector-ms": "application/windows-search-connector+xml",
	".setpay": "application/set-payment-initiation",
	".setreg": "application/set-registration-initiation",
	".settings": "application/xml",
	".sgimb": "application/x-sgimb",
	".sgml": "text/sgml",
	".sh": "application/x-sh",
	".shar": "application/x-shar",
	".shtml": "text/html",
	".sit": "application/x-stuffit",
	".sitemap": "application/xml",
	".skin": "application/xml",
	".sldm": "application/vnd.ms-powerpoint.slide.macroEnabled.12",
	".sldx": "application/vnd.openxmlformats-officedocument.presentationml.slide",
	".slk": "application/vnd.ms-excel",
	".sln": "text/plain",
	".slupkg-ms": "application/x-ms-license",
	".smd": "audio/x-smd",
	".smi": "application/octet-stream",
	".smx": "audio/x-smd",
	".smz": "audio/x-smd",
	".snd": "audio/basic",
	".snippet": "application/xml",
	".snp": "application/octet-stream",
	".sol": "text/plain",
	".sor": "text/plain",
	".spc": "application/x-pkcs7-certificates",
	".spl": "application/futuresplash",
	".src": "application/x-wais-source",
	".srf": "text/plain",
	".SSISDeploymentManifest": "text/xml",
	".ssm": "application/streamingmedia",
	".sst": "application/vnd.ms-pki.certstore",
	".stl": "application/vnd.ms-pki.stl",
	".sv4cpio": "application/x-sv4cpio",
	".sv4crc": "application/x-sv4crc",
	".svc": "application/xml",
	".swf": "application/x-shockwave-flash",
	".t": "application/x-troff",
	".tar": "application/x-tar",
	".tcl": "application/x-tcl",
	".testrunconfig": "application/xml",
	".testsettings": "application/xml",
	".tex": "application/x-tex",
	".texi": "application/x-texinfo",
	".texinfo": "application/x-texinfo",
	".tgz": "application/x-compressed",
	".thmx": "application/vnd.ms-officetheme",
	".thn": "application/octet-stream",
	".tif": "image/tiff",
	".tiff": "image/tiff",
	".tlh": "text/plain",
	".tli": "text/plain",
	".toc": "application/octet-stream",
	".tr": "application/x-troff",
	".trm": "application/x-msterminal",
	".trx": "application/xml",
	".ts": "video/vnd.dlna.mpeg-tts",
	".tsv": "text/tab-separated-values",
	".ttf": "application/octet-stream",
	".tts": "video/vnd.dlna.mpeg-tts",
	".txt": "text/plain",
	".u32": "application/octet-stream",
	".uls": "text/iuls",
	".user": "text/plain",
	".ustar": "application/x-ustar",
	".vb": "text/plain",
	".vbdproj": "text/plain",
	".vbk": "video/mpeg",
	".vbproj": "text/plain",
	".vbs": "text/vbscript",
	".vcf": "text/x-vcard",
	".vcproj": "Application/xml",
	".vcs": "text/plain",
	".vcxproj": "Application/xml",
	".vddproj": "text/plain",
	".vdp": "text/plain",
	".vdproj": "text/plain",
	".vdx": "application/vnd.ms-visio.viewer",
	".vml": "text/xml",
	".vscontent": "application/xml",
	".vsct": "text/xml",
	".vsd": "application/vnd.visio",
	".vsi": "application/ms-vsi",
	".vsix": "application/vsix",
	".vsixlangpack": "text/xml",
	".vsixmanifest": "text/xml",
	".vsmdi": "application/xml",
	".vspscc": "text/plain",
	".vss": "application/vnd.visio",
	".vsscc": "text/plain",
	".vssettings": "text/xml",
	".vssscc": "text/plain",
	".vst": "application/vnd.visio",
	".vstemplate": "text/xml",
	".vsto": "application/x-ms-vsto",
	".vsw": "application/vnd.visio",
	".vsx": "application/vnd.visio",
	".vtx": "application/vnd.visio",
	".wav": "audio/wav",
	".wave": "audio/wav",
	".wax": "audio/x-ms-wax",
	".wbk": "application/msword",
	".wbmp": "image/vnd.wap.wbmp",
	".wcm": "application/vnd.ms-works",
	".wdb": "application/vnd.ms-works",
	".wdp": "image/vnd.ms-photo",
	".webarchive": "application/x-safari-webarchive",
	".webtest": "application/xml",
	".wiq": "application/xml",
	".wiz": "application/msword",
	".wks": "application/vnd.ms-works",
	".WLMP": "application/wlmoviemaker",
	".wlpginstall": "application/x-wlpg-detect",
	".wlpginstall3": "application/x-wlpg3-detect",
	".wm": "video/x-ms-wm",
	".wma": "audio/x-ms-wma",
	".wmd": "application/x-ms-wmd",
	".wmf": "application/x-msmetafile",
	".wml": "text/vnd.wap.wml",
	".wmlc": "application/vnd.wap.wmlc",
	".wmls": "text/vnd.wap.wmlscript",
	".wmlsc": "application/vnd.wap.wmlscriptc",
	".wmp": "video/x-ms-wmp",
	".wmv": "video/x-ms-wmv",
	".wmx": "video/x-ms-wmx",
	".wmz": "application/x-ms-wmz",
	".wpl": "application/vnd.ms-wpl",
	".wps": "application/vnd.ms-works",
	".wri": "application/x-mswrite",
	".wrl": "x-world/x-vrml",
	".wrz": "x-world/x-vrml",
	".wsc": "text/scriptlet",
	".wsdl": "text/xml",
	".wvx": "video/x-ms-wvx",
	".x": "application/directx",
	".xaf": "x-world/x-vrml",
	".xaml": "application/xaml+xml",
	".xap": "application/x-silverlight-app",
	".xbap": "application/x-ms-xbap",
	".xbm": "image/x-xbitmap",
	".xdr": "text/plain",
	".xht": "application/xhtml+xml",
	".xhtml": "application/xhtml+xml",
	".xla": "application/vnd.ms-excel",
	".xlam": "application/vnd.ms-excel.addin.macroEnabled.12",
	".xlc": "application/vnd.ms-excel",
	".xld": "application/vnd.ms-excel",
	".xlk": "application/vnd.ms-excel",
	".xll": "application/vnd.ms-excel",
	".xlm": "application/vnd.ms-excel",
	".xls": "application/vnd.ms-excel",
	".xlsb": "application/vnd.ms-excel.sheet.binary.macroEnabled.12",
	".xlsm": "application/vnd.ms-excel.sheet.macroEnabled.12",
	".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
	".xlt": "application/vnd.ms-excel",
	".xltm": "application/vnd.ms-excel.template.macroEnabled.12",
	".xltx": "application/vnd.openxmlformats-officedocument.spreadsheetml.template",
	".xlw": "application/vnd.ms-excel",
	".xml": "text/xml",
	".xmta": "application/xml",
	".xof": "x-world/x-vrml",
	".XOML": "text/plain",
	".xpm": "image/x-xpixmap",
	".xps": "application/vnd.ms-xpsdocument",
	".xrm-ms": "text/xml",
	".xsc": "application/xml",
	".xsd": "text/xml",
	".xsf": "text/xml",
	".xsl": "text/xml",
	".xslt": "text/xml",
	".xsn": "application/octet-stream",
	".xss": "application/xml",
	".xtp": "application/octet-stream",
	".xwd": "image/x-xwindowdump",
	".z": "application/x-compress",
	".zip": "application/x-zip-compressed"
};
