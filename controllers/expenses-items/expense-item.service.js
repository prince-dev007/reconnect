var _ = require('lodash');
var db = require(`${PROJECT_DIR}/utility/selectQueries`);
var response = { "status": 200, "response": "" };
var moment = require('moment');
var validation = require(`${PROJECT_DIR}/utility/validation`);
const uuidv4 = require('uuid/v4');
var component = require(`${PROJECT_DIR}/controllers/expenses-items/expense-item.component`);
var dtUtil = require(`${PROJECT_DIR}/utility/dateUtility`);


module.exports = {
    getAll,
    getAllLocalExpense,
    getAllOutstationExpense,
    updateExpense,
    addRemark,

    addExpenseItem,
    addExpenseItemNew,
    updateExpenseItem,
    deleteExpenseItem,
    updateStatus,
    moveToLocalExpense,
    moveToOutstationExpense,
    expenseItemByTour

};
momenttz = require('moment-timezone');
/**
 * This method is used to get all invoices using follwing parameters
 * @param {*} offset - start point
 * @param {*} limit - record limit
 * @param {*} sellerid - account id 
 * @param {*} type Dealer/retailer
 
 */
var fields = [`Expense_Item_SS__c.sfid`,`Expense_Item_SS__c.Amount__c`,`Expense_Item_SS__c.Customer__c`,`date_part('epoch'::text, Expense_Item_SS__c.date__c) * (1000)::double precision as date__c`,`Expense_Item_SS__c.Food__c`,`Expense_Item_SS__c.From__c`,`Expense_Item_SS__c.Kilometers_Travelled__c`,`Expense_Item_SS__c.Mode__c`,`Expense_Item_SS__c.Team__c`,`Expense_Item_SS__c.To__c`,`Expense_Item_SS__c.Toll_Parking_Charges__c`,`Expense_Item_SS__c.Visits__c`,`Expense_Item_SS__c.name`,`date_part('epoch'::text, Expense_Item_SS__c.createddate) * (1000)::double precision as createddate`,
`EXTRACT(month from visits__c.visit_date__c) as month`
];

async function taggedVisit(visitIds,expense__c){
        
                /** New Implementation as per discussion with Gaurav 07-04-2020 */
                var expItemsFieldsArray = [
                    'visits__c.sfid',
                    'visits__c.Retailer_Dealer__c',
                    `visits__c.cancelled_reason__c`,
                    `visits__c.visit_owner__c`,
                    `visits__c.asm__c`,
                    `visits__c.name`, 
                    `Expense_Item_SS__c.sfid as expense_sfid`,
                    `account.name as retailer_dealer_name`,
                    `account.sfid as retailer_dealer_sfid`,
                    `Expense_SS__c.expense_type__c as expense_type__c`,
                    `Expense_Item_SS__c.expense_type__c as expense_item_type__c`
                ]; 
                var expItemsJoins = [
                    {
                        "type": "LEFT",
                        "table_name": "visits__c",
                        "p_table_field": `Expense_Item_SS__c.visits__c`,
                        "s_table_field": "visits__c.sfid"
                    },
                    {
                        "type": "LEFT",
                        "table_name": "account",
                        "p_table_field": `visits__c.retailer_dealer__c`,
                        "s_table_field": "account.sfid"
                    },
                    {
                        "type": "LEFT",
                        "table_name": "Expense_SS__c",
                        "p_table_field": `Expense_Item_SS__c.expense__c`,
                        "s_table_field": "Expense_SS__c.sfid"
                    },
                    
                ];
                var expItemsWhereClouse = [];
                expItemsWhereClouse.push({ "fieldName": "Expense_Item_SS__c.visits__c", "fieldValue": visitIds, "type":"IN" });
                expItemsWhereClouse.push({ "fieldName": `Expense_Item_SS__c.expense_type__c`, "fieldValue": "Outstation Expense" });
                expItemsWhereClouse.push({ "fieldName": `Expense_SS__c.expense_type__c`, "fieldValue": 'Local Expense'});
                var expItemsTableName = 'Expense_Item_SS__c';
                var sqlExp = db.fetchAllWithJoinQry(expItemsFieldsArray, expItemsTableName,expItemsJoins, expItemsWhereClouse, '0', '1000', '');
                console.log('sqlExp >>> ', sqlExp)
                var ExpItems = await client.query(sqlExp);
                console.log(ExpItems);
                if (ExpItems.rowCount) {


                    var expense_item_ids = [];
                    for (i in ExpItems.rows) {
                        console.log(ExpItems.rows[i].expense_sfid)
                        expense_item_ids.push(ExpItems.rows[i].expense_sfid);
                    }
                    console.log('expense_item_ids >>> ', expense_item_ids)
                    var tableNameExpItm = 'Expense_Item_SS__c',
                    fieldValueExpItm = [];
                    fieldValueExpItm.push({ "field": "outstation_type__c", "value": 'Local Expense' });
                    //fieldValueExpItm.push({ "field": "expense_type__c", "value": 'Local Expense' });
                    fieldValueExpItm.push({ "field": "expense__c", "value": expense__c });
                    var WhereClouseExpItm = [];
                    WhereClouseExpItm.push({ "field": "sfid", "value": expense_item_ids, "type": "IN" });
                    //WhereClouse.push({ "field": "expense__c", "value": req.body.expense_id});
                    var eventExp = await db.updateRecord(tableNameExpItm, fieldValueExpItm, WhereClouseExpItm);
                    console.log('eventExp >>>> ', eventExp);
                }
} 

async function getAll(req) {
    try {
        console.log(req.body);
        is_Validate = true;
        is_Validate = is_Validate ? validation.issetNotEmpty(req.headers.agentid) : false;
        is_Validate = is_Validate ? (validation.issetNotEmpty(req.query.id) || validation.issetNotEmpty(req.body.visit_ids) ) : false;

        if (is_Validate) {

            const tableName = 'Expense_Item_SS__c';

            const WhereClouse = [];
            var offset = '0', limit = '1000';
            
            if (validation.issetNotEmpty(req.query.id)) {
                WhereClouse.push({ "fieldName": "expense___c", "fieldValue": req.query.id });
            }
            // if (validation.issetNotEmpty(req.body.visit_ids)) {
            //     var visitIds = req.body.visit_ids;
            //     WhereClouse.push({ "fieldName": "visits__c", "fieldValue": visitIds, "type":"IN" });
            //     if(validation.issetNotEmpty(req.query.id)){
            //         taggedVisit(visitIds,req.query.id);
            //     }

            // }
            if (validation.issetNotEmpty(req.query.id) && validation.issetNotEmpty(req.headers.type) && req.headers.type=='local') {
                console.log('-----------');
                console.log('req.query.id >>> ', req.query.id);
                console.log('req.headers.type >>> ', req.headers.type);
                const expfields = ['sfid, tour__c, pg_id__c'];
                const expTable = 'Expense_SS__c';
                const expWhereClouse = [];
                var expoffset = '0', explimit = '1';
                expWhereClouse.push({ "fieldName": "sfid", "fieldValue": req.query.id });
                var expSql = db.SelectAllQry(expfields, expTable, expWhereClouse, expoffset, explimit,' order by createddate desc');
                var expenseDetail = await client.query(expSql);
                    console.log('expenseDetail.rows[0].tour__c >>> ', expenseDetail.rows[0].tour__c)
                if (expenseDetail.rowCount > 0 && validation.issetNotEmpty(expenseDetail.rows[0].tour__c)) {
                    var tour_ids = expenseDetail.rows[0].tour__c.split(" , ");
                    
                    // update Expense Item
                    var tableNameExpItm = 'Expense_Item_SS__c',
                    fieldValueExpItm = [];
                    fieldValueExpItm.push({ "field": "expense__c", "value": req.query.id});

                    
                    var WhereClouseExpItm = [];
                    WhereClouseExpItm.push({ "field": "Expense_Item_SS__c.tour__c", "value": tour_ids , "type":"IN"});
                    WhereClouseExpItm.push({ "field": "Expense_Item_SS__c.expense_type__c", "value": "Outstation Expense" });
                    WhereClouseExpItm.push({ "field": "Expense_Item_SS__c.team__c", "value": req.headers.agentid });
                    WhereClouseExpItm.push({ "field": "Expense_Item_SS__c.outstation_type__c", "value": 'Local Expense' });
                    var eventExp = await db.updateRecord(tableNameExpItm, fieldValueExpItm, WhereClouseExpItm);
                    console.log('Expense Item Tagged Successfully.', eventExp);
                }

            }
            console.log('============================================= ');
            console.log('req.headers.type == ', req.headers.type);
            console.log('req.headers.agentid == ', req.headers.agentid);
            console.log('============================================= ');
            if (validation.issetNotEmpty(req.headers.type)) {
                var type='Travel Details';
                switch(req.headers.type){
                    case 'travel':
                        type = 'Travel Details';
                    break;
                    // case 'convenience':
                    //     type = 'Conveyance';
                    break;
                    case 'hotel':
                        type = 'Hotel/Own Arrangement/DA';
                    break;
                    case 'incidental':
                        type = 'Incidental Expense';
                    break;
                    case 'food':
                        type = 'Food Expense';
                    break;
                    case 'other':
                        type = 'Other Expenses';
                    break;
                    case 'local':
                        type = 'Local Expense';
                    break;
                }
                WhereClouse.push({ "fieldName": "outstation_type__c", "fieldValue": type });
                
            }
            if (validation.issetNotEmpty(req.query.offset)) {
                offset = req.query.offset;
            }
            if (validation.issetNotEmpty(req.query.limit)) {
                limit = req.query.limit;
            }

            joins = [];
            
            
            var fields = [
                `Expense_Item_SS__c.sfid`,
                `Expense_Item_SS__c.expense_status__c`,
                `Expense_Item_SS__c.remark__c`,
                `Expense_Item_SS__c.expense_type__c`,
                `Expense_Item_SS__c.food__c`,
                `Expense_Item_SS__c.from__c`,
                `Expense_Item_SS__c.kilometers_travelled__c`,
                `Expense_Item_SS__c.amount__c`,
                `Expense_Item_SS__c.customer__c`,
                `Expense_Item_SS__c.mode__c`,
                `Expense_Item_SS__c.team__c`,
                `Expense_Item_SS__c.to__c`,
                `Expense_Item_SS__c.toll_parking_charges__c`,
                `Expense_Item_SS__c.name`,
                `Expense_Item_SS__c.stay_type__c`,
                
                `Expense_Item_SS__c.Ticket_Number__c`,
                `Expense_Item_SS__c.To_Date__c`,
                `Expense_Item_SS__c.Toll_Parking_Charges__c`,
                `Expense_Item_SS__c.Type__c`,
                `Expense_Item_SS__c.Approved_by_Head__c`,
                `Expense_Item_SS__c.Approved_by_Manager__c`,
                `Expense_Item_SS__c.Arrival_Date__c`,
                `Expense_Item_SS__c.Bill_Number__c`,
                `Expense_Item_SS__c.Bills__c`,
                `Expense_Item_SS__c.City__c`,
                `Expense_Item_SS__c.Company_Paid__c`,
                `Expense_Item_SS__c.Date__c`,
                `Expense_Item_SS__c.Departure_Date__c`,
                `Expense_Item_SS__c.expense__c`,
                `Expense_Item_SS__c.Expense_Item_Approver__c`,
                `Expense_Item_SS__c.From_Date__c`,
                `Expense_Item_SS__c.Have_Bills__c`,
                `Expense_Item_SS__c.Month__c	`,
                `Expense_Item_SS__c.Number_of_Nights__c`,
                `Expense_Item_SS__c.Outstation_Mode__c`,
                `Expense_Item_SS__c.Outstation_Type__c`,
                `Expense_Item_SS__c.Place__c`,
                `Expense_Item_SS__c.pg_id__c`,
                `Expense_Item_SS__c.exception__c`,
                `Expense_Item_SS__c.system_calculated_kilometer__c`,

                `date_part('epoch'::text, Expense_Item_SS__c.date__c) * (1000)::double precision as date__c`,
                `date_part('epoch'::text, Expense_Item_SS__c.createddate) * (1000)::double precision as createddate`,
                
            ];
            var orderBy = ' order by Expense_Item_SS__c.createddate asc';
            if (validation.issetNotEmpty(req.query.type) && req.query.type == 'local') {
                var fields = [
                    `Expense_Item_SS__c.sfid`,
                    `Expense_Item_SS__c.pg_id__c`,
                    `date_part('epoch'::text, Expense_Item_SS__c.date__c) * (1000)::double precision as date__c`,
                    `date_part('epoch'::text, Expense_Item_SS__c.createddate) * (1000)::double precision as createddate`,
                    `Expense_Item_SS__c.customer__c`,
                    `Expense_Item_SS__c.mode__c`,
                    `Expense_Item_SS__c.kilometers_travelled__c`,
                    `Expense_Item_SS__c.food__c`,
                    `Expense_Item_SS__c.toll_parking_charges__c`,
                    `Expense_Item_SS__c.amount__c`,
                    `Expense_Item_SS__c.exception__c`,
                    `Expense_Item_SS__c.expense__c`,
                    `Expense_Item_SS__c.system_calculated_kilometer__c`,
                    `Expense_Item_SS__c.from__c`,
                    `Expense_Item_SS__c.to__c`,
                    //`COALESCE(SUM(Expense_Item_SS__c.amount__c),0) AS amount__c`,
                    //`COALESCE(SUM(Expense_Item_SS__c.food__c),0) AS food__c`,
                    //`COALESCE(SUM(Expense_Item_SS__c.toll_parking_charges__c),0) AS toll_parking_charges__c`
                   
                     `COALESCE(Expense_Item_SS__c.toll_parking_charges__c,0) + COALESCE(Expense_Item_SS__c.food__c,0) + COALESCE(Expense_Item_SS__c.amount__c,0) as total_amount`

                ];
                orderBy = ' order by Expense_Item_SS__c.createddate asc ';
                // TODO: ROHIT 11-04-2020
                //WhereClouse.push({ "fieldName": "expense_type__c", "fieldValue": 'Local Expense' });
            } else {
                WhereClouse.push({ "fieldName": "expense_type__c", "fieldValue": 'Outstation Expense' });
            }
            console.log('fields  >>> ', fields);
            var sql = db.fetchAllWithJoinQry(fields, tableName, joins, WhereClouse, offset, limit, orderBy);

            console.log(`INFO::: Get expense = ${sql}`);

            var expenses = await client.query(sql);
            console.log('====================================')
            console.log('expenses.rowCount ===  ', expenses.rowCount);
            console.log('====================================')
            if (expenses.rowCount != undefined && expenses.rowCount > 0) {
                response.response = { 'success': true, "data": { "expenses": expenses.rows } };
                response.status = 200;
                return response;
            } else {
                response.response = { 'success': false, "data": { "expenses": [] }, "message": "No record found." };
                response.status = 400;
                return response;
            }
        } else {
            response.response = { 'success': false, "data": { "expenses": [] }, "message": "Mandatory parameter(s) are missing." };
            response.status = 400;
            return response;
        }
    } catch (e) {
        console.log(e);
        response.response = { 'success': false, "data": { "expenses": [] }, "message": "Internal server error." };
        response.status = 500;
        return response;
    }
}

async function getAllLocalExpense(req){
    try {
        console.log(req.body);
        is_Validate = true;
        is_Validate = is_Validate ? validation.issetNotEmpty(req.headers.agentid) : false;
        is_Validate = is_Validate ? validation.issetNotEmpty(req.query.month) : false;
        if (is_Validate) {

            const tableName = 'Expense_Item_SS__c';

            const WhereClouse = [];
            var offset = '0', limit = '1000';
            WhereClouse.push({ "fieldName": "Expense_Item_SS__c.expense_type__c", "fieldValue": 'Local Expense' });
            WhereClouse.push({ "fieldName": "Expense_Item_SS__c.team__c", "fieldValue": req.headers.agentid });
            WhereClouse.push({ "fieldName": "Expense_Item_SS__c.month__c", "fieldValue": req.query.month });
            WhereClouse.push({ "fieldName": "Expense_Item_SS__c.expense_status__c", "fieldValue": 'Draft' });
            if (validation.issetNotEmpty(req.query.offset)) {
                offset = req.query.offset;
            }
            if (validation.issetNotEmpty(req.query.limit)) {
                limit = req.query.limit;
            }
            joins = [
                {
                    "type": "LEFT",
                    "table_name": "visits__c",
                    "p_table_field": "Expense_Item_SS__c.visits__c",
                    "s_table_field": "visits__c.sfid"
                },
                {
                    "type": "LEFT",
                    "table_name": "account",
                    "p_table_field": "visits__c.retailer_dealer__c",
                    "s_table_field": "account.sfid"
                },
            ];
            
            var fields = [
                `Expense_Item_SS__c.sfid`,
                `Expense_Item_SS__c.pg_id__c`,
                `date_part('epoch'::text, Expense_Item_SS__c.date__c) * (1000)::double precision as date__c`,
                `date_part('epoch'::text, Expense_Item_SS__c.createddate) * (1000)::double precision as createddate`,
                `Expense_Item_SS__c.customer__c`,
                `Expense_Item_SS__c.mode__c`,
                `Expense_Item_SS__c.kilometers_travelled__c`,
                `Expense_Item_SS__c.food__c`,
                `Expense_Item_SS__c.toll_parking_charges__c`,
                `Expense_Item_SS__c.amount__c`,
                `Expense_Item_SS__c.exception__c`,
                `Expense_Item_SS__c.expense__c`,
                `Expense_Item_SS__c.system_calculated_kilometer__c`,
                `Expense_Item_SS__c.from__c`,
                `Expense_Item_SS__c.to__c`,                   
                `COALESCE(Expense_Item_SS__c.toll_parking_charges__c,0) + COALESCE(Expense_Item_SS__c.food__c,0) + COALESCE(Expense_Item_SS__c.amount__c,0) as total_amount`,
                `visits__c.name as visit_name`,
                `visits__c.sfid as visit_sfid`,
                `visits__c.retailer_dealer__c as visit_retailer_dealer__c`,
                `account.sfid as visit_retailer_dealer_sfid`,
                `account.name as visit_retailer_dealer_name`,
            ];
            orderBy = ' order by Expense_Item_SS__c.date__c desc ';

            console.log('fields  >>> ', fields);
            var sql = db.fetchAllWithJoinQry(fields, tableName, joins, WhereClouse, offset, limit, orderBy);

            console.log(`INFO::: Get Local expense = ${sql}`);

            var expenses = await client.query(sql);
           
            if (expenses.rowCount != undefined && expenses.rowCount > 0) {
                response.response = { 'success': true, "data": { "expenses": expenses.rows } };
                response.status = 200;
                return response;
            } else {
                response.response = { 'success': false, "data": { "expenses": [] }, "message": "No record found." };
                response.status = 400;
                return response;
            }
        } else {
            response.response = { 'success': false, "data": { "expenses": [] }, "message": "Mandatory parameter(s) are missing." };
            response.status = 400;
            return response;
        }
    } catch (e) {
        console.log(e);
        response.response = { 'success': false, "data": { "expenses": [] }, "message": "Internal server error." };
        response.status = 500;
        return response;
    }

}

async function getAllOutstationExpense(req){
    try {
        console.log(req.body);
        is_Validate = true;
        is_Validate = is_Validate ? validation.issetNotEmpty(req.headers.agentid) : false;
        is_Validate = is_Validate ? validation.issetNotEmpty(req.query.month) : false;

        if (is_Validate) {

            const tableName = 'Expense_Item_SS__c';

            const WhereClouse = [];
            var offset = '0', limit = '1000';
            WhereClouse.push({ "fieldName": "Expense_Item_SS__c.expense_type__c", "fieldValue": 'Outstation Expense' });
            WhereClouse.push({ "fieldName": "Expense_Item_SS__c.outstation_type__c", "fieldValue": 'Local Expense' });
            WhereClouse.push({ "fieldName": "Expense_Item_SS__c.team__c", "fieldValue": req.headers.agentid });
            WhereClouse.push({ "fieldName": "Expense_Item_SS__c.month__c", "fieldValue": req.query.month });
            WhereClouse.push({ "fieldName": "Expense_Item_SS__c.expense_status__c", "fieldValue": 'Draft' });


            if (validation.issetNotEmpty(req.query.offset)) {
                offset = req.query.offset;
            }
            if (validation.issetNotEmpty(req.query.limit)) {
                limit = req.query.limit;
            }
            joins = [
                {
                    "type": "LEFT",
                    "table_name": "visits__c",
                    "p_table_field": "Expense_Item_SS__c.visits__c",
                    "s_table_field": "visits__c.sfid"
                },
                {
                    "type": "LEFT",
                    "table_name": "account",
                    "p_table_field": "visits__c.retailer_dealer__c",
                    "s_table_field": "account.sfid"
                },
            ];
            
            var fields = [
                `Expense_Item_SS__c.sfid`,
                `Expense_Item_SS__c.pg_id__c`,
                `date_part('epoch'::text, Expense_Item_SS__c.date__c) * (1000)::double precision as date__c`,
                `date_part('epoch'::text, Expense_Item_SS__c.createddate) * (1000)::double precision as createddate`,
                `Expense_Item_SS__c.expense_type__c`,
                `Expense_Item_SS__c.outstation_type__c`,
                `Expense_Item_SS__c.outstation_mode__c`,
                `Expense_Item_SS__c.customer__c`,
                `Expense_Item_SS__c.mode__c`,
                `Expense_Item_SS__c.kilometers_travelled__c`,
                `Expense_Item_SS__c.food__c`,
                `Expense_Item_SS__c.toll_parking_charges__c`,
                `Expense_Item_SS__c.amount__c`,
                `Expense_Item_SS__c.exception__c`,
                `Expense_Item_SS__c.expense__c`,
                `Expense_Item_SS__c.system_calculated_kilometer__c`,
                `Expense_Item_SS__c.from__c`,
                `Expense_Item_SS__c.to__c`,                   
                `COALESCE(Expense_Item_SS__c.toll_parking_charges__c,0) + COALESCE(Expense_Item_SS__c.food__c,0) + COALESCE(Expense_Item_SS__c.amount__c,0) as total_amount`,
                `visits__c.name as visit_name`,
                `visits__c.sfid as visit_sfid`,
                `visits__c.retailer_dealer__c as visit_retailer_dealer__c`,
                `account.sfid as visit_retailer_dealer_sfid`,
                `account.name as visit_retailer_dealer_name`,
            ];
            orderBy = ' order by Expense_Item_SS__c.date__c desc ';

            console.log('fields  >>> ', fields);
            var sql = db.fetchAllWithJoinQry(fields, tableName, joins, WhereClouse, offset, limit, orderBy);

            console.log(`INFO::: Get Local expense = ${sql}`);

            var expenses = await client.query(sql);
           
            if (expenses.rowCount != undefined && expenses.rowCount > 0) {
                response.response = { 'success': true, "data": { "expenses": expenses.rows } };
                response.status = 200;
                return response;
            } else {
                response.response = { 'success': false, "data": { "expenses": [] }, "message": "No record found." };
                response.status = 400;
                return response;
            }
        } else {
            response.response = { 'success': false, "data": { "expenses": [] }, "message": "Mandatory parameter(s) are missing." };
            response.status = 400;
            return response;
        }
    } catch (e) {
        console.log(e);
        response.response = { 'success': false, "data": { "expenses": [] }, "message": "Internal server error." };
        response.status = 500;
        return response;
    }

}


/**
 * This method is used to get order details using follwing parameters
 * @param {*} id - order_is
 * 
*  */
async function updateExpense(req) {

    try {
        is_Validate = true;
        is_Validate = is_Validate ? validation.issetNotEmpty(req.query.id) : false;
        is_Validate = is_Validate ? validation.issetNotEmpty(req.headers.agentid) : false;
        //is_Validate = is_Validate ? validation.issetNotEmpty(req.body.food__c) : false;
        //is_Validate = is_Validate ? validation.issetNotEmpty(req.body.amount__c) : false;
        //is_Validate = is_Validate ? validation.issetNotEmpty(req.body.kilometers_travelled__c) : false;

        if (is_Validate) {
            console.log(req.body);
            var tableName = 'Expense_Item_SS__c';

            const SelWhereClouse = [];
            SelWhereClouse.push({ "fieldName": "sfid", "fieldValue": req.query.id });
            sqlsql = db.SelectAllQry(['sfid', 'pg_id__c'], tableName, SelWhereClouse, '0', '1', '');

            console.log(`INFO::: Get expense item SQK = ${sqlsql}`);

            var expItmList = await client.query(sqlsql);
            if (expItmList.rowCount > 0) {

                fieldValue = [];
                if (validation.issetNotEmpty(req.body.food__c)) {
                    fieldValue.push({ "field": "food__c", "value": req.body.food__c });
                }
                if (validation.issetNotEmpty(req.body.kilometers_travelled__c)) {
                    fieldValue.push({ "field": "kilometers_travelled__c", "value": req.body.kilometers_travelled__c });
                }
                if (validation.issetNotEmpty(req.body.mode__c)) {
                    fieldValue.push({ "field": "mode__c", "value": req.body.mode__c });
                }
                if (validation.issetNotEmpty(req.body.toll_parking_charges__c)) {
                    fieldValue.push({ "field": "toll_parking_charges__c", "value": req.body.toll_parking_charges__c });
                }
                var pgId = uuidv4();
                if (!validation.issetNotEmpty(expItmList.rows[0].pg_id__c)) {
                    fieldValue.push({ "field": "pg_id__c", "value": pgId });
                }

                //TODO
                fieldValue.push({ "field": "city__c", "value": 'a0L1m000000Dqb2EAC' });
                //fieldValue.push({ "field": "amount__c", "value": req.body.amount__c });

                const WhereClouse = [];
                WhereClouse.push({ "field": "sfid", "value": req.query.id });

                var eventExp = await db.updateRecord(tableName, fieldValue, WhereClouse);
                console.log('INFO::::  fieldValue ', fieldValue);
                console.log('INFO::::  WhereClouse ', WhereClouse);
                console.log('INFO::::  eventExp ', eventExp);
                if (eventExp.success) {
                    // add attachment
                    if (req.body != undefined) {
                        if (!validation.issetNotEmpty(req.body.pg_id__c)) {
                            component.addAttachment(req.body, pgId);
                        } else {
                            component.addAttachment(req.body, req.body.pg_id__c);
                        }

                    }
                    response.response = { 'success': true, "data": {}, "message": "Expense updated successfully." };
                    response.status = 200;
                    return response;
                } else {
                    response.response = { 'success': false, "data": {}, "message": "Due to internal error Expense update failed." };
                    response.status = 400;
                    return response;
                }
            } else {
                response.response = { 'success': false, "data": {}, "message": "Invalid Expense ID." };
                response.status = 400;
                return response;
            }
        } else {
            response.response = { 'success': false, "data": {}, "message": "Mandatory parameter(s) are missing." };
            response.status = 400;
            return response;
        }
    } catch (e) {
        console.log(e);
        response.response = { 'success': false, "data": {}, "message": "Internal Server error." };
        response.status = 500;
        return response;
    }
}

async function addRemark(req) {

    try {
        is_Validate = true;
        is_Validate = is_Validate ? validation.issetNotEmpty(req.query.id) : false;
        is_Validate = is_Validate ? validation.issetNotEmpty(req.headers.agentid) : false;
        is_Validate = is_Validate ? validation.issetNotEmpty(req.body.remark__c) : false;
        //is_Validate = is_Validate ? await CheckExpenseManager(req) : false;

        if (is_Validate) {

            var tableName = 'Expense_Item_SS__c',
                fieldValue = [];
            fieldValue.push({ "field": "remark__c", "value": req.body.remark__c });

            const WhereClouse = [];
            WhereClouse.push({ "field": "sfid", "value": req.query.id });

            var eventExp = await db.updateRecord(tableName, fieldValue, WhereClouse);
            if (eventExp.success) {
                response.response = { 'success': true, "data": {}, "message": "Expense updated successfully." };
                response.status = 200;
                return response;
            } else {
                console.log(eventExp);
                response.response = { 'success': false, "data": {}, "message": "Due to internal error Expense update failed." };
                response.status = 400;
                return response;
            }
        } else {
            response.response = { 'success': false, "data": {}, "message": "Mandatory parameter(s) are missing." };
            response.status = 400;
            return response;
        }
    } catch (e) {
        console.log(e);
        response.response = { 'success': false, "data": {}, "message": "Internal Server error." };
        response.status = 500;
        return response;
    }

}


async function addExpenseItem(req){
    try {
        is_Validate = true;
        is_Validate = is_Validate ? validation.issetNotEmpty(req.query.id) : false;
        is_Validate = is_Validate ? validation.issetNotEmpty(req.headers.agentid) : false;
        is_Validate = is_Validate ? validation.issetNotEmpty(req.headers.type) : false;
        if (is_Validate) { console.log(req.body);
            switch (req.headers.type) {
                case 'travel':
                    response = await component.addTravel(req);
                    break;
                // case 'convenience': // TODO: 
                //         response = await component.addConvenience(req);
                //     break;
                case 'hotel':
                        response = await component.addHotel(req);
                    break;
                case 'incidental':
                        response = await component.addIncidental(req);
                    break;
                case 'food':
                        response = await component.addFood(req);
                    break;
                case 'other':
                        response = await component.addOther(req);
                    break;
                default :
                    response.response = { 'success': false, "data": {}, "message": "Mandatory parameter(s) are missing." };
                    response.status = 400;
                break;
                
            }
            return response;

        } else {
            response.response = { 'success': false, "data": {}, "message": "Mandatory parameter(s) are missing." };
            response.status = 400;
            return response;
        }
    } catch (e) {
        console.log(e);
        response.response = { 'success': false, "data": {}, "message": "Internal Server error." };
        response.status = 500;
        return response;
    }

}
/*async function addExpenseItemNew(req){
    try {
        is_Validate = true;
        is_Validate = is_Validate ? validation.issetNotEmpty(req.headers.agentid) : false;
        is_Validate = is_Validate ? validation.issetNotEmpty(req.query.id) : false;
        
        console.log('req.headers.agentid > ',req.headers.agentid);
        console.log('is_Validate > ',is_Validate);
        if (is_Validate) { 
            var myDetails = await db.agentDetail(req.headers.agentid);
            targetFields = `Expense_Approvar__c, Expense_Owner__c, Expense_Status__c, Expense_Type__c, PG_ID__c`;
            console.log('myDetails ', myDetails);
            pgId = uuidv4();
            expenseApprovar = validation.issetNotEmpty(myDetails.rows[0].manager_id)? myDetails.rows[0].manager_id : null;
            targetFieldsValues = [ `${expenseApprovar}`, `${req.headers.agentid}`, `Draft`, `Outstation Expense`, `${pgId}`];
            Expense_TABLE = 'expense__c';
            //expenseDetail = await db.insertRecord(targetFields, targetFieldsValues, Expense_TABLE, ', pg_id__c');
            //console.log('expenseDetail.rowCount ', expenseDetail.rowCount );
            //console.log('-----------------------------------expenseDetail.rows ', expenseDetail );

            if(1===1){
                //expense_pg_id__c = expenseDetail.data[0].pg_id__c;
            

            var isUpdated = false;
            var expenseItemsBody = req.body; 
            var addNewExpenseItem = ''; 
            var updateNewExpenseItem = []; 
            var tableName = 'expense_item__c';
            var fieldsToBeInsert = `amount__c, approved_by_head__c, approved_by_manager__c, arrival_date__c, bill_number__c, bills__c, city__c, company_paid__c, customer__c, date__c, departure_date__c , exception__c, expense__c, expense_item_approver__c, name, expense_status__c, expense_type__c, food__c, from__c, from_date__c, have_bills__c, kilometers_travelled__c, mode__c, month__c, number_of_nights__c, outstation_mode__c, outstation_type__c, pg_id__c, place__c, team__c, ticket_number__c, to__c, to_date__c, toll_parking_charges__c, type__c, visits__c, expense_pg_id__c`;
            console.log('expenseItemsBody >>>  ',expenseItemsBody);
            for(i in expenseItemsBody){
                if(validation.isValidDate(expenseItemsBody[i].arrival_date__c)){
                    expenseItemsBody[i].arrival_date__c = dtUtil.timestampToDate(expenseItemsBody[i].arrival_date__c,'YYYY-MM-DD');
                }
                if(validation.isValidDate(expenseItemsBody[i].date__c)){
                    expenseItemsBody[i].date__c = dtUtil.timestampToDate(expenseItemsBody[i].date__c,'YYYY-MM-DD');
                }
                if(validation.isValidDate(expenseItemsBody[i].departure_date__c)){
                    expenseItemsBody[i].departure_date__c = dtUtil.timestampToDate(expenseItemsBody[i].departure_date__c,'YYYY-MM-DD');
                }
                if(validation.isValidDate(expenseItemsBody[i].from_date__c)){
                    expenseItemsBody[i].from_date__c = dtUtil.timestampToDate(expenseItemsBody[i].from_date__c,'YYYY-MM-DD');
                }
                 if(validation.isValidDate(expenseItemsBody[i].to_date__c)){
                    expenseItemsBody[i].to_date__c = dtUtil.timestampToDate(expenseItemsBody[i].to_date__c,'YYYY-MM-DD');
                }
                 
                
                if( validation.isValidDate(expenseItemsBody[i].expense_pg_id__c)){
                    if (i > 0) {
                        addNewExpenseItem += ', ';
                    }
                    

                    var pg_id = uuidv4();
                    addNewExpenseItem += `(
                            ${validation.isValidDate(expenseItemsBody[i].amount__c) ? "'"+expenseItemsBody[i].amount__c+"'" : null } ,
                            ${validation.isValidDate(expenseItemsBody[i].approved_by_head__c) ? "'"+expenseItemsBody[i].approved_by_head__c+"'" : null } , 
                            ${validation.isValidDate(expenseItemsBody[i].approved_by_manager__c) ? "'"+expenseItemsBody[i].approved_by_manager__c+"'" : null } , 
                            ${validation.isValidDate(expenseItemsBody[i].arrival_date__c) ? "'"+expenseItemsBody[i].arrival_date__c+"'" : null } , 
                            ${validation.isValidDate(expenseItemsBody[i].bill_number__c) ? "'"+expenseItemsBody[i].bill_number__c+"'" : null } , 
                            ${validation.isValidDate(expenseItemsBody[i].bills__c) ? "'"+expenseItemsBody[i].bills__c+"'" : null } , 
                            ${validation.isValidDate(expenseItemsBody[i].city__c) ? "'"+expenseItemsBody[i].city__c+"'" : null } , 
                            ${validation.isValidDate(expenseItemsBody[i].company_paid__c) ? "'"+expenseItemsBody[i].company_paid__c+"'" : null } , 
                            ${validation.isValidDate(expenseItemsBody[i].customer__c) ? "'"+expenseItemsBody[i].customer__c+"'" : null } , 
                            ${validation.isValidDate(expenseItemsBody[i].date__c) ? "'"+expenseItemsBody[i].date__c+"'" : null } , 
                            ${validation.isValidDate(expenseItemsBody[i].departure_date__c) ? "'"+expenseItemsBody[i].departure_date__c+"'" : null } , 
                            ${validation.isValidDate(expenseItemsBody[i].exception__c) ? "'"+expenseItemsBody[i].exception__c+"'" : null } , 
                            ${validation.isValidDate(req.query.id) ? "'"+req.query.id+"'" : null } , 
                            ${validation.isValidDate(expenseItemsBody[i].expense_item_approver__c) ? "'"+expenseItemsBody[i].expense_item_approver__c+"'" : null } , 
                            ${validation.isValidDate(expenseItemsBody[i].name) ? "'"+expenseItemsBody[i].name+"'" : null } , 
                            ${validation.isValidDate(expenseItemsBody[i].expense_status__c) ? "'"+expenseItemsBody[i].expense_status__c+"'" : null } , 
                            ${validation.isValidDate(expenseItemsBody[i].expense_type__c) ? "'"+expenseItemsBody[i].expense_type__c+"'" : null } , 
                            ${validation.isValidDate(expenseItemsBody[i].food__c) ? "'"+expenseItemsBody[i].food__c+"'" : null } , 
                            ${validation.isValidDate(expenseItemsBody[i].from__c) ? "'"+expenseItemsBody[i].from__c+"'" : null } , 
                            ${validation.isValidDate(expenseItemsBody[i].from_date__c) ? "'"+expenseItemsBody[i].from_date__c+"'" : null } , 
                            ${validation.isValidDate(expenseItemsBody[i].have_bills__c) ? "'"+expenseItemsBody[i].have_bills__c+"'" : null } , 
                            ${validation.isValidDate(expenseItemsBody[i].kilometers_travelled__c) ? "'"+expenseItemsBody[i].kilometers_travelled__c+"'" : null } , 
                            ${validation.isValidDate(expenseItemsBody[i].mode__c) ? "'"+expenseItemsBody[i].mode__c+"'" : null } , 
                            ${validation.isValidDate(expenseItemsBody[i].month__c) ? "'"+expenseItemsBody[i].month__c+"'" : null } , 
                            ${validation.isValidDate(expenseItemsBody[i].number_of_nights__c) ? "'"+expenseItemsBody[i].number_of_nights__c+"'" : null } , 
                            ${validation.isValidDate(expenseItemsBody[i].outstation_mode__c) ? "'"+expenseItemsBody[i].outstation_mode__c+"'" : null } , 
                            ${validation.isValidDate(expenseItemsBody[i].outstation_type__c) ? "'"+expenseItemsBody[i].outstation_type__c+"'" : null } , 
                            ${validation.isValidDate(expenseItemsBody[i].pg_id__c) ? "'"+expenseItemsBody[i].pg_id__c+"'" : "'"+pg_id+"'" } , 
                            ${validation.isValidDate(expenseItemsBody[i].place__c) ? "'"+expenseItemsBody[i].place__c+"'" : null } , 
                            ${validation.isValidDate(expenseItemsBody[i].team__c) ? "'"+expenseItemsBody[i].team__c+"'" : null } , 
                            ${validation.isValidDate(expenseItemsBody[i].ticket_number__c) ? "'"+expenseItemsBody[i].ticket_number__c+"'" : null } ,  
                            ${validation.isValidDate(expenseItemsBody[i].to__c) ? "'"+expenseItemsBody[i].to__c+"'" : null } , 
                            ${validation.isValidDate(expenseItemsBody[i].to_date__c) ? "'"+expenseItemsBody[i].to_date__c+"'" : null } , 
                            ${validation.isValidDate(expenseItemsBody[i].toll_parking_charges__c) ? "'"+expenseItemsBody[i].toll_parking_charges__c+"'" : null } , 
                            ${validation.isValidDate(expenseItemsBody[i].type__c) ? "'"+expenseItemsBody[i].type__c+"'" : null } , 
                            ${validation.isValidDate(expenseItemsBody[i].visits__c) ? "'"+expenseItemsBody[i].visits__c+"'" : null } , 
                            ${validation.isValidDate(expenseItemsBody[i].expense_pg_id__c) ? "'"+expenseItemsBody[i].expense_pg_id__c+"'" : null }
                        )` ;

                }else{
                    tableName = 'expense_item__c';
                    var fieldValue = [];
                    if ( validation.isValidDate(expenseItemsBody[i].amount__c)) {
                        fieldValue.push({ "field": "amount__c", "value": expenseItemsBody[i].amount__c });
                    }

                    if ( validation.isValidDate(expenseItemsBody[i].approved_by_head__c)) {
                        fieldValue.push({ "field": "approved_by_head__c", "value": expenseItemsBody[i].approved_by_head__c });
                    }
                    if ( validation.isValidDate(expenseItemsBody[i].approved_by_manager__c)) {
                        fieldValue.push({ "field": "approved_by_manager__c", "value": expenseItemsBody[i].approved_by_manager__c });
                    }
                    if ( validation.isValidDate(expenseItemsBody[i].arrival_date__c)) {
                        
                        fieldValue.push({ "field": "arrival_date__c", "value": expenseItemsBody[i].arrival_date__c });
                    }
                    if ( validation.isValidDate(expenseItemsBody[i].bill_number__c)) {
                        fieldValue.push({ "field": "bill_number__c", "value": expenseItemsBody[i].bill_number__c });
                    }
                    if ( validation.isValidDate(expenseItemsBody[i].bills__c)) {
                        fieldValue.push({ "field": "bills__c", "value": expenseItemsBody[i].bills__c });
                    }
                    if ( validation.isValidDate(expenseItemsBody[i].city__c)) {
                        fieldValue.push({ "field": "city__c", "value": expenseItemsBody[i].city__c });
                    }
                    if ( validation.isValidDate(expenseItemsBody[i].company_paid__c)) {
                        fieldValue.push({ "field": "company_paid__c", "value": expenseItemsBody[i].company_paid__c });
                    }
                    if ( validation.isValidDate(expenseItemsBody[i].customer__c)) {
                        fieldValue.push({ "field": "customer__c", "value": expenseItemsBody[i].customer__c });
                    }
                    if ( validation.isValidDate(expenseItemsBody[i].date__c)) {
                        fieldValue.push({ "field": "date__c", "value": expenseItemsBody[i].date__c });
                    }
                    if ( validation.isValidDate(expenseItemsBody[i].departure_date__c)) {
                        fieldValue.push({ "field": "departure_date__c", "value": expenseItemsBody[i].departure_date__c });
                    }
                    if ( validation.isValidDate(expenseItemsBody[i].exception__c)) {
                        fieldValue.push({ "field": "exception__c", "value": expenseItemsBody[i].exception__c });
                    }
                    if ( validation.isValidDate(expenseItemsBody[i].expense__c)) {
                        fieldValue.push({ "field": "expense__c", "value": expenseItemsBody[i].expense__c });
                    }
                    if ( validation.isValidDate(expenseItemsBody[i].expense_item_approver__c)) {
                        fieldValue.push({ "field": "expense_item_approver__c", "value": expenseItemsBody[i].expense_item_approver__c });
                    }
                    if ( validation.isValidDate(expenseItemsBody[i].name)) {
                        fieldValue.push({ "field": "name", "value": expenseItemsBody[i].name });
                    }
                    if ( validation.isValidDate(expenseItemsBody[i].expense_status__c)) {
                        fieldValue.push({ "field": "expense_status__c", "value": expenseItemsBody[i].expense_status__c });
                    }
                    if ( validation.isValidDate(expenseItemsBody[i].expense_type__c)) {
                        fieldValue.push({ "field": "expense_type__c", "value": expenseItemsBody[i].expense_type__c });
                    }
                    if ( validation.isValidDate(expenseItemsBody[i].food__c)) {
                        fieldValue.push({ "field": "food__c", "value": expenseItemsBody[i].food__c });
                    }
                    if ( validation.isValidDate(expenseItemsBody[i].from__c)) {
                        fieldValue.push({ "field": "from__c", "value": expenseItemsBody[i].from__c });
                    }
                    if ( validation.isValidDate(expenseItemsBody[i].from_date__c)) {
                        fieldValue.push({ "field": "from_date__c", "value": expenseItemsBody[i].from_date__c });
                    }
                    if ( validation.isValidDate(expenseItemsBody[i].have_bills__c)) {
                        fieldValue.push({ "field": "have_bills__c", "value": expenseItemsBody[i].have_bills__c });
                    }
                    if ( validation.isValidDate(expenseItemsBody[i].kilometers_travelled__c)) {
                        fieldValue.push({ "field": "kilometers_travelled__c", "value": expenseItemsBody[i].kilometers_travelled__c });
                    }
                    if ( validation.isValidDate(expenseItemsBody[i].mode__c)) {
                        fieldValue.push({ "field": "mode__c", "value": expenseItemsBody[i].mode__c });
                    }
                    if ( validation.isValidDate(expenseItemsBody[i].month__c)) {
                        fieldValue.push({ "field": "month__c", "value": expenseItemsBody[i].month__c });
                    }
                    if ( validation.isValidDate(expenseItemsBody[i].number_of_nights__c)) {
                        fieldValue.push({ "field": "number_of_nights__c", "value": expenseItemsBody[i].number_of_nights__c });
                    }
                    if ( validation.isValidDate(expenseItemsBody[i].outstation_mode__c)) {
                        fieldValue.push({ "field": "outstation_mode__c", "value": expenseItemsBody[i].outstation_mode__c });
                    }
                    if ( validation.isValidDate(expenseItemsBody[i].outstation_type__c)) {
                        fieldValue.push({ "field": "outstation_type__c", "value": expenseItemsBody[i].outstation_type__c });
                    }
                   
                    if ( validation.isValidDate(expenseItemsBody[i].place__c)) {
                        fieldValue.push({ "field": "place__c", "value": expenseItemsBody[i].place__c });
                    }
                    if ( validation.isValidDate(expenseItemsBody[i].team__c)) {
                        fieldValue.push({ "field": "team__c", "value": expenseItemsBody[i].team__c });
                    }
                    if ( validation.isValidDate(expenseItemsBody[i].ticket_number__c)) {
                        fieldValue.push({ "field": "ticket_number__c", "value": expenseItemsBody[i].ticket_number__c });
                    }
                    if ( validation.isValidDate(expenseItemsBody[i].to__c)) {
                        fieldValue.push({ "field": "to__c", "value": expenseItemsBody[i].to__c });
                    }
                    if ( validation.isValidDate(expenseItemsBody[i].to_date__c)) {
                        fieldValue.push({ "field": "to_date__c", "value": expenseItemsBody[i].to_date__c });
                    }
                    if ( validation.isValidDate(expenseItemsBody[i].toll_parking_charges__c)) {
                        fieldValue.push({ "field": "toll_parking_charges__c", "value": expenseItemsBody[i].toll_parking_charges__c });
                    }
                    if ( validation.isValidDate(expenseItemsBody[i].total__c)) {
                        fieldValue.push({ "field": "total__c", "value": expenseItemsBody[i].total__c });
                    }
                    if ( validation.isValidDate(expenseItemsBody[i].type__c)) {
                        fieldValue.push({ "field": "type__c", "value": expenseItemsBody[i].type__c });
                    }
                    if ( validation.isValidDate(expenseItemsBody[i].visits__c)) {
                        fieldValue.push({ "field": "visits__c", "value": expenseItemsBody[i].visits__c });
                    }
                    if ( validation.isValidDate(expense_pg_id__c)) {
                        fieldValue.push({ "field": "expense_pg_id__c", "value": expense_pg_id__c });
                    }
                    
                    var WhereClouse = [];
                    WhereClouse.push({ "field": "pg_id__c", "value": expenseItemsBody[i].pg_id__c });
                    expenseDetail = await db.updateRecord(tableName, fieldValue, WhereClouse);
                    console.log(expenseDetail);
                    isUpdated = true;
                }
            }
            var insertedExpense = '';
            console.log('addNewExpenseItem >>> ', addNewExpenseItem)
            if(addNewExpenseItem!=''){
                var sql = `INSERT into ${process.env.TABLE_SCHEMA_NAME}.${tableName} (${fieldsToBeInsert}) VALUES ${addNewExpenseItem} RETURNING pg_id__c`;
                console.log(`sql : ${sql} `);

                var insertedExpense =  await db.getDbResult(sql)
            }

            if(insertedExpense.rowCount){
                response.response = { 'success': true, "data": insertedExpense.rows, "message": "" };
                response.status = 200;
                return response;
            }else if(insertedExpense.rowCount!=undefined && insertedExpense.rowCount > 0){
                response.response = { 'success': true, "data": insertedExpense.rows, "message": "" };
                response.status = 200;
                return response;
            }else if(isUpdated){
                response.response = { 'success': true, "data": {}, "message": "" };
                response.status = 200;
                return response;
            }else{
                response.response = { 'success': false, "data": {}, "message": "" };
                response.status = 401;
                return response;
            }

            }else{
                response.response = { 'success': false, "data": {}, "message": "Record insert failed." };
                response.status = 402;
                return response;    
            }
        
        } else {
            console.log('566')
            response.response = { 'success': false, "data": {}, "message": "Mandatory parameter(s) are missing." };
            response.status = 403;
            return response;
        }
    } catch (e) {
        console.log(e);
        response.response = { 'success': false, "data": {}, "message": "Internal Server error." };
        response.status = 500;
        return response;
    }

}*/



async function addExpenseItemNew(req) {
    try {
        is_Validate = true;
        is_Validate = is_Validate ? validation.issetNotEmpty(req.headers.agentid) : false;
        is_Validate = is_Validate ? validation.issetNotEmpty(req.query.id) : false;
        is_Validate = is_Validate ? validation.issetNotEmpty(req.query.pg_id) : false;

        if (is_Validate) { 
            var myDetails = await db.agentDetail(req.headers.agentid);
           
            var pgId = uuidv4();
            var expense_pg_id__c = req.query.pg_id; // expenseDetail.data[0].pg_id__c;
            
            var isUpdated = false;
            var expenseItemsBody = req.body; 
            var addNewExpenseItem = ''; 
            var updateNewExpenseItem = []; 
            var expenseItemDetail;
            var tableName = 'Expense_Item_SS__c';

            var fieldsToBeInsert = `stay_type__c, amount__c, approved_by_head__c, approved_by_manager__c, arrival_date__c, bill_number__c, bills__c, city__c, company_paid__c, customer__c, date__c, departure_date__c , exception__c, expense__c, expense_item_approver__c, name, expense_status__c, expense_type__c, food__c, from__c, from_date__c, have_bills__c, kilometers_travelled__c, mode__c, month__c, number_of_nights__c, outstation_mode__c, outstation_type__c, pg_id__c, place__c, team__c, ticket_number__c, to__c, to_date__c, toll_parking_charges__c, type__c, visits__c, expense_pg_id__c`;

            console.log('expenseItemsBody >>>  ',expenseItemsBody);

           
            for(i in expenseItemsBody){
                if(validation.isValidDate(expenseItemsBody[i].arrival_date__c)){
                    expenseItemsBody[i].arrival_date__c = dtUtil.timestampToDate(expenseItemsBody[i].arrival_date__c,'YYYY-MM-DD');
                }
                if(validation.isValidDate(expenseItemsBody[i].date__c)){
                    expenseItemsBody[i].date__c = dtUtil.timestampToDate(expenseItemsBody[i].date__c,'YYYY-MM-DD');
                }
                if(validation.isValidDate(expenseItemsBody[i].departure_date__c)){
                    expenseItemsBody[i].departure_date__c = dtUtil.timestampToDate(expenseItemsBody[i].departure_date__c,'YYYY-MM-DD');
                }
                if(validation.isValidDate(expenseItemsBody[i].from_date__c)){
                    expenseItemsBody[i].from_date__c = dtUtil.timestampToDate(expenseItemsBody[i].from_date__c,'YYYY-MM-DD');
                }
                 if(validation.isValidDate(expenseItemsBody[i].to_date__c)){
                    expenseItemsBody[i].to_date__c = dtUtil.timestampToDate(expenseItemsBody[i].to_date__c,'YYYY-MM-DD');
                }
                 
                
                if( !validation.issetNotEmpty(expenseItemsBody[i].pg_id__c)){
                    
                    if (i > 0) {
                        addNewExpenseItem += ', ';
                    }
                    
                    var pg_id = uuidv4();
                    addNewExpenseItem += `(
                            ${validation.issetNotEmpty(expenseItemsBody[i].stay_type__c) ? "'"+expenseItemsBody[i].stay_type__c+"'" : null } ,
                            ${validation.issetNotEmpty(expenseItemsBody[i].amount__c) ? "'"+expenseItemsBody[i].amount__c+"'" : null } ,
                            ${validation.issetNotEmpty(expenseItemsBody[i].approved_by_head__c) ? "'"+expenseItemsBody[i].approved_by_head__c+"'" : null } , 
                            ${validation.issetNotEmpty(expenseItemsBody[i].approved_by_manager__c) ? "'"+expenseItemsBody[i].approved_by_manager__c+"'" : null } , 
                            ${validation.issetNotEmpty(expenseItemsBody[i].arrival_date__c) ? "'"+expenseItemsBody[i].arrival_date__c+"'" : null } , 
                            ${validation.issetNotEmpty(expenseItemsBody[i].bill_number__c) ? "'"+expenseItemsBody[i].bill_number__c+"'" : null } , 
                            ${validation.issetNotEmpty(expenseItemsBody[i].bills__c) ? "'"+expenseItemsBody[i].bills__c+"'" : null } , 
                            ${validation.issetNotEmpty(expenseItemsBody[i].city__c) ? "'"+expenseItemsBody[i].city__c+"'" : null } , 
                            ${validation.issetNotEmpty(expenseItemsBody[i].company_paid__c) ? "'"+expenseItemsBody[i].company_paid__c+"'" : null } , 
                            ${validation.issetNotEmpty(expenseItemsBody[i].customer__c) ? "'"+expenseItemsBody[i].customer__c+"'" : null } , 
                            ${validation.issetNotEmpty(expenseItemsBody[i].date__c) ? "'"+expenseItemsBody[i].date__c+"'" : null } , 
                            ${validation.issetNotEmpty(expenseItemsBody[i].departure_date__c) ? "'"+expenseItemsBody[i].departure_date__c+"'" : null } , 
                            ${validation.issetNotEmpty(expenseItemsBody[i].exception__c) ? "'"+expenseItemsBody[i].exception__c+"'" : null } , 
                            ${validation.issetNotEmpty(req.query.id) ? "'"+req.query.id+"'" : null } , 
                            ${validation.issetNotEmpty(expenseItemsBody[i].expense_item_approver__c) ? "'"+expenseItemsBody[i].expense_item_approver__c+"'" : null } , 
                            ${validation.issetNotEmpty(expenseItemsBody[i].name) ? "'"+expenseItemsBody[i].name+"'" : null } , 
                            ${validation.issetNotEmpty(expenseItemsBody[i].expense_status__c) ? "'"+expenseItemsBody[i].expense_status__c+"'" : null } , 
                            ${validation.issetNotEmpty(expenseItemsBody[i].expense_type__c) ? "'"+expenseItemsBody[i].expense_type__c+"'" : 'Outstation Expense' } , 
                            ${validation.issetNotEmpty(expenseItemsBody[i].food__c) ? "'"+expenseItemsBody[i].food__c+"'" : null } , 
                            ${validation.issetNotEmpty(expenseItemsBody[i].from__c) ? "'"+expenseItemsBody[i].from__c+"'" : null } , 
                            ${validation.issetNotEmpty(expenseItemsBody[i].from_date__c) ? "'"+expenseItemsBody[i].from_date__c+"'" : null } , 
                            ${validation.issetNotEmpty(expenseItemsBody[i].have_bills__c) ? "'"+expenseItemsBody[i].have_bills__c+"'" : null } , 
                            ${validation.issetNotEmpty(expenseItemsBody[i].kilometers_travelled__c) ? "'"+expenseItemsBody[i].kilometers_travelled__c+"'" : null } , 
                            ${validation.issetNotEmpty(expenseItemsBody[i].mode__c) ? "'"+expenseItemsBody[i].mode__c+"'" : null } , 
                            ${validation.issetNotEmpty(expenseItemsBody[i].month__c) ? "'"+expenseItemsBody[i].month__c+"'" : null } , 
                            ${validation.issetNotEmpty(expenseItemsBody[i].number_of_nights__c) ? "'"+expenseItemsBody[i].number_of_nights__c+"'" : null } , 
                            ${validation.issetNotEmpty(expenseItemsBody[i].outstation_mode__c) ? "'"+expenseItemsBody[i].outstation_mode__c+"'" : null } , 
                            ${validation.issetNotEmpty(expenseItemsBody[i].outstation_type__c) ? "'"+expenseItemsBody[i].outstation_type__c+"'" : null } , 
                            ${validation.issetNotEmpty(pg_id) ? "'"+pg_id+"'" : "'"+pg_id+"'" } , 
                            ${validation.issetNotEmpty(expenseItemsBody[i].place__c) ? "'"+expenseItemsBody[i].place__c+"'" : null } , 
                            ${validation.issetNotEmpty(expenseItemsBody[i].team__c) ? "'"+expenseItemsBody[i].team__c+"'" : null } , 
                            ${validation.issetNotEmpty(expenseItemsBody[i].ticket_number__c) ? "'"+expenseItemsBody[i].ticket_number__c+"'" : null } ,  
                            ${validation.issetNotEmpty(expenseItemsBody[i].to__c) ? "'"+expenseItemsBody[i].to__c+"'" : null } , 
                            ${validation.issetNotEmpty(expenseItemsBody[i].to_date__c) ? "'"+expenseItemsBody[i].to_date__c+"'" : null } , 
                            ${validation.issetNotEmpty(expenseItemsBody[i].toll_parking_charges__c) ? "'"+expenseItemsBody[i].toll_parking_charges__c+"'" : null } , 
                            ${validation.issetNotEmpty(expenseItemsBody[i].type__c) ? "'"+expenseItemsBody[i].type__c+"'" : null } , 
                            ${validation.issetNotEmpty(expenseItemsBody[i].visits__c) ? "'"+expenseItemsBody[i].visits__c+"'" : null } , 
                            ${validation.issetNotEmpty(req.query.pg_id) ? "'"+req.query.pg_id+"'" : null }
                        )` ;

                } else {

                    tableName = 'Expense_Item_SS__c';
                    var fieldValue = [];
                    if (validation.issetNotEmpty(expenseItemsBody[i].amount__c)) {
                        fieldValue.push({ "field": "amount__c", "value": expenseItemsBody[i].amount__c });
                    }
                    if (validation.issetNotEmpty(expenseItemsBody[i].stay_type__c)) {
                        fieldValue.push({ "field": "stay_type__c", "value": expenseItemsBody[i].stay_type__c });
                    }

                    if (validation.issetNotEmpty(expenseItemsBody[i].approved_by_head__c)) {
                        fieldValue.push({ "field": "approved_by_head__c", "value": expenseItemsBody[i].approved_by_head__c });
                    }
                    if (validation.issetNotEmpty(expenseItemsBody[i].approved_by_manager__c)) {
                        fieldValue.push({ "field": "approved_by_manager__c", "value": expenseItemsBody[i].approved_by_manager__c });
                    }
                    if (validation.issetNotEmpty(expenseItemsBody[i].arrival_date__c)) {

                        fieldValue.push({ "field": "arrival_date__c", "value": expenseItemsBody[i].arrival_date__c });
                    }
                    if (validation.issetNotEmpty(expenseItemsBody[i].bill_number__c)) {
                        fieldValue.push({ "field": "bill_number__c", "value": expenseItemsBody[i].bill_number__c });
                    }
                    if (validation.issetNotEmpty(expenseItemsBody[i].bills__c)) {
                        fieldValue.push({ "field": "bills__c", "value": expenseItemsBody[i].bills__c });
                    }
                    if (validation.issetNotEmpty(expenseItemsBody[i].city__c)) {
                        fieldValue.push({ "field": "city__c", "value": expenseItemsBody[i].city__c });
                    }
                    if (validation.issetNotEmpty(expenseItemsBody[i].company_paid__c)) {
                        fieldValue.push({ "field": "company_paid__c", "value": expenseItemsBody[i].company_paid__c });
                    }
                    if (validation.issetNotEmpty(expenseItemsBody[i].customer__c)) {
                        fieldValue.push({ "field": "customer__c", "value": expenseItemsBody[i].customer__c });
                    }
                    if (validation.issetNotEmpty(expenseItemsBody[i].date__c)) {
                        fieldValue.push({ "field": "date__c", "value": expenseItemsBody[i].date__c });
                    }
                    if (validation.issetNotEmpty(expenseItemsBody[i].departure_date__c)) {
                        fieldValue.push({ "field": "departure_date__c", "value": expenseItemsBody[i].departure_date__c });
                    }
                    if (validation.issetNotEmpty(expenseItemsBody[i].exception__c)) {
                        fieldValue.push({ "field": "exception__c", "value": expenseItemsBody[i].exception__c });
                    }
                    if (validation.issetNotEmpty(expenseItemsBody[i].expense__c)) {
                        fieldValue.push({ "field": "expense__c", "value": expenseItemsBody[i].expense__c });
                    }
                    if (validation.issetNotEmpty(expenseItemsBody[i].expense_item_approver__c)) {
                        fieldValue.push({ "field": "expense_item_approver__c", "value": expenseItemsBody[i].expense_item_approver__c });
                    }
                    if (validation.issetNotEmpty(expenseItemsBody[i].name)) {
                        fieldValue.push({ "field": "name", "value": expenseItemsBody[i].name });
                    }
                    if (validation.issetNotEmpty(expenseItemsBody[i].expense_status__c)) {
                        fieldValue.push({ "field": "expense_status__c", "value": expenseItemsBody[i].expense_status__c });
                    }
                    if (validation.issetNotEmpty(expenseItemsBody[i].expense_type__c)) {
                        fieldValue.push({ "field": "expense_type__c", "value": expenseItemsBody[i].expense_type__c });
                    }
                    if (validation.issetNotEmpty(expenseItemsBody[i].food__c)) {
                        fieldValue.push({ "field": "food__c", "value": expenseItemsBody[i].food__c });
                    }
                    if (validation.issetNotEmpty(expenseItemsBody[i].from__c)) {
                        fieldValue.push({ "field": "from__c", "value": expenseItemsBody[i].from__c });
                    }
                    if (validation.issetNotEmpty(expenseItemsBody[i].from_date__c)) {
                        fieldValue.push({ "field": "from_date__c", "value": expenseItemsBody[i].from_date__c });
                    }
                    if (validation.issetNotEmpty(expenseItemsBody[i].have_bills__c)) {
                        fieldValue.push({ "field": "have_bills__c", "value": expenseItemsBody[i].have_bills__c });
                    }
                    if (validation.issetNotEmpty(expenseItemsBody[i].kilometers_travelled__c)) {
                        fieldValue.push({ "field": "kilometers_travelled__c", "value": expenseItemsBody[i].kilometers_travelled__c });
                    }
                    if (validation.issetNotEmpty(expenseItemsBody[i].mode__c)) {
                        fieldValue.push({ "field": "mode__c", "value": expenseItemsBody[i].mode__c });
                    }
                    if (validation.issetNotEmpty(expenseItemsBody[i].month__c)) {
                        fieldValue.push({ "field": "month__c", "value": expenseItemsBody[i].month__c });
                    }
                    if (validation.issetNotEmpty(expenseItemsBody[i].number_of_nights__c)) {
                        fieldValue.push({ "field": "number_of_nights__c", "value": expenseItemsBody[i].number_of_nights__c });
                    }
                    if (validation.issetNotEmpty(expenseItemsBody[i].outstation_mode__c)) {
                        fieldValue.push({ "field": "outstation_mode__c", "value": expenseItemsBody[i].outstation_mode__c });
                    }
                    if (validation.issetNotEmpty(expenseItemsBody[i].outstation_type__c)) {
                        fieldValue.push({ "field": "outstation_type__c", "value": expenseItemsBody[i].outstation_type__c });
                    }

                    if (validation.issetNotEmpty(expenseItemsBody[i].place__c)) {
                        fieldValue.push({ "field": "place__c", "value": expenseItemsBody[i].place__c });
                    }
                    if (validation.issetNotEmpty(expenseItemsBody[i].team__c)) {
                        fieldValue.push({ "field": "team__c", "value": expenseItemsBody[i].team__c });
                    }
                    if (validation.issetNotEmpty(expenseItemsBody[i].ticket_number__c)) {
                        fieldValue.push({ "field": "ticket_number__c", "value": expenseItemsBody[i].ticket_number__c });
                    }
                    if (validation.issetNotEmpty(expenseItemsBody[i].to__c)) {
                        fieldValue.push({ "field": "to__c", "value": expenseItemsBody[i].to__c });
                    }
                    if (validation.issetNotEmpty(expenseItemsBody[i].to_date__c)) {
                        fieldValue.push({ "field": "to_date__c", "value": expenseItemsBody[i].to_date__c });
                    }
                    if (validation.issetNotEmpty(expenseItemsBody[i].toll_parking_charges__c)) {
                        fieldValue.push({ "field": "toll_parking_charges__c", "value": expenseItemsBody[i].toll_parking_charges__c });
                    }
                    if (validation.issetNotEmpty(expenseItemsBody[i].total__c)) {
                        fieldValue.push({ "field": "total__c", "value": expenseItemsBody[i].total__c });
                    }
                    if (validation.issetNotEmpty(expenseItemsBody[i].type__c)) {
                        fieldValue.push({ "field": "type__c", "value": expenseItemsBody[i].type__c });
                    }
                    if (validation.issetNotEmpty(expenseItemsBody[i].visits__c)) {
                        fieldValue.push({ "field": "visits__c", "value": expenseItemsBody[i].visits__c });
                    }
                    if (validation.issetNotEmpty(expense_pg_id__c)) {
                        fieldValue.push({ "field": "expense_pg_id__c", "value": expense_pg_id__c });
                    }

                    var WhereClouse = [];
                    WhereClouse.push({ "field": "pg_id__c", "value": expenseItemsBody[i].pg_id__c });
                    expenseItemDetail = await db.updateRecord(tableName, fieldValue, WhereClouse);
                    console.log(expenseItemDetail);
                    isUpdated = true;

                }
            }
            var insertedExpense = '';

            
            console.log('addNewExpenseItem >>> ', addNewExpenseItem);
            if (addNewExpenseItem != '') {
                var sql = `INSERT into ${process.env.TABLE_SCHEMA_NAME}.${tableName} (${fieldsToBeInsert}) VALUES ${addNewExpenseItem} RETURNING pg_id__c`;
                console.log(`sql : ${sql} `);

                var insertedExpense = await db.getDbResult(sql)
            }

            if (insertedExpense.rowCount != undefined && insertedExpense.rowCount) {
                response.response = { 'success': true, "data": insertedExpense.rows, "message": "" };
                response.status = 200;
                return response;
            } else if (isUpdated) {
                response.response = { 'success': true, "data": {}, "message": "Record updated successfully" };
                response.status = 200;
                return response;
            } else {
                response.response = { 'success': false, "data": {}, "message": "" };
                response.status = 401;
                return response;
            }
 
        } else {
            console.log('566')
            response.response = { 'success': false, "data": {}, "message": "Mandatory parameter(s) are missing." };
            response.status = 400;
            return response;
        }
    } catch (e) {
        console.log(e);
        response.response = { 'success': false, "data": {}, "message": "Internal Server error." };
        response.status = 500;
        return response;
    }

}

async function updateExpenseItem(req){
    try {
        is_Validate = true;
        is_Validate = is_Validate ? validation.issetNotEmpty(req.query.id) : false;
        is_Validate = is_Validate ? validation.issetNotEmpty(req.headers.agentid) : false;
        is_Validate = is_Validate ? validation.issetNotEmpty(req.headers.type) : false;
        if (is_Validate) {
            switch (req.headers.type) {
                case 'travel':
                    response = await component.updateTravel(req);
                    break;
                // case 'convenience':
                //     response = await  component.updateConvenience(req);
                //     break;
                case 'hotel':
                    response = await    component.updateHotel(req);
                    break;
                case 'incidental':
                    response = await component.updateIncidental(req);
                    break;
                case 'food':
                    response = await component.updateFood(req);
                    break;
                case 'other':
                    response = await component.updateOther(req);
                    break;
                case 'other':
                    response = await component.updateOther(req);
                    break;
                default:
                    response.response = { 'success': false, "data": {}, "message": "Mandatory parameter(s) are missing." };
                    response.status = 400;
                break;
                
            }
            return response;

        } else {
            console.log('req.headers',req.headers);
            response.response = { 'success': false, "data": {}, "message": "Mandatory parameter(s) are missing." };
            response.status = 400;
            return response;
        }
    } catch (e) {
        console.log(e);
        response.response = { 'success': false, "data": {}, "message": "Internal Server error." };
        response.status = 500;
        return response;
    }

}

async function deleteExpenseItem(req){
    try {
        is_Validate = true;
        is_Validate = is_Validate ? validation.issetNotEmpty(req.query.id) : false;
        is_Validate = is_Validate ? validation.issetNotEmpty(req.headers.agentid) : false;
        if (is_Validate) {
            var tableName = 'Expense_Item_SS__c',

            sql = `delete from ${process.env.TABLE_SCHEMA_NAME}.${tableName} where pg_id__c='${req.query.id}'`;
            var expense =  await db.getDbResult(sql)
            console.log(expense);
            if(expense.rowCount > 0){
                response.response = { 'success': true, "data": {}, "message": "Record deleted successfully." };
                response.status = 200;
                return response;
            }else{
                response.response = { 'success': false, "data": {}, "message": "Error in deleting record." };
                response.status = 400;
                return response;
            }
            
           // return response;

        } else {
            console.log('req.headers',req.headers);
            response.response = { 'success': false, "data": {}, "message": "Mandatory parameter(s) are missing." };
            response.status = 400;
            return response;
        }
    } catch (e) {
        console.log(e);
        response.response = { 'success': false, "data": {}, "message": "Internal Server error." };
        response.status = 500;
        return response;
    }

}


async function test(){
    targetFields = `expense_approvar__c, expense_owner__c, expense_status__c, expense_type__c, pg_id__c`;
    pg_id__c = uuidv4();
    expense_approvar__c = 'a0H1m000001Owv4EAC';
    expense_owner__c = 'a0H1m000001OwvEEAS';
  
    targetFieldsValues = [ `${expense_approvar__c}`, `${expense_owner__c}`, `Draft`, `Outstation Expense`, `${pg_id__c}`];
    Expense_TABLE = 'Expense_SS__c';
    expenseDetail = await db.insertRecord(targetFields, targetFieldsValues, Expense_TABLE, ', pg_id__c');
    console.log('Expense Response >> ',expenseDetail.data);
    console.log('Expense Response >> ',expenseDetail.data);

    // var sql = `select id, sfid, pg_id__c from cns.expense__c where pg_id__c='${expenseDetail.data[0].pg_id__c}'`
    // var expense =  await db.getDbResult(sql)
    // console.log('----------------------------------')
    // console.log(expense)

   // var fieldsToBeInsert = `amount__c, approved_by_head__c, approved_by_manager__c, arrival_date__c, bill_number__c, bills__c, city__c, company_paid__c, customer__c, date__c, departure_date__c , exception__c, expense__c, expense_item_approver__c, name, expense_status__c, expense_type__c, food__c, from__c, from_date__c, have_bills__c, kilometers_travelled__c, mode__c, month__c, number_of_nights__c, outstation_mode__c, outstation_type__c, pg_id__c, place__c, team__c, ticket_number__c, to__c, to_date__c, toll_parking_charges__c, type__c, visits__c, expense_pg_id__c`;
   
   var fieldsToBeInsert = `pg_id__c, expense_pg_id__c`;
   var pg_id2__c = uuidv4();
   var addNewExpenseItem = `(
    '${pg_id2__c}' , 
    '${pg_id__c}' 
    )` ;
    var tableName = 'Expense_Item_SS__c';
    var sql = `INSERT into ${process.env.TABLE_SCHEMA_NAME}.${tableName} (${fieldsToBeInsert}) VALUES ${addNewExpenseItem} RETURNING pg_id__c`;
        console.log(`sql : ${sql} `);

    var insertedExpense =  await db.getDbResult(sql)
    console.log('insertedExpense >>> ', insertedExpense.rows)
}

async function updateStatus(req) {

    try {
        is_Validate = true;
        is_Validate = is_Validate ? validation.issetNotEmpty(req.body.expense_id) : false;
        is_Validate = is_Validate ? validation.issetNotEmpty(req.headers.agentid) : false;
        is_Validate = is_Validate ? validation.issetNotEmpty(req.body.expense_type__c) : false;
        //is_Validate = is_Validate ? await CheckExpenseMember(req) : false;
        

        if (is_Validate) {

            var tableName = 'Expense_Item_SS__c',
            fieldValue = [];
            fieldValue.push({ "field": "expense_type__c", "value": req.body.expense_type__c });

            var WhereClouse = [];
            WhereClouse.push({ "field": "sfid", "value": req.body.expense_id});
            var eventExp = await db.updateRecord(tableName, fieldValue, WhereClouse);

            if (eventExp.success) {
                response.response = { 'success': true, "data": {}, "message": `Expense status changed to ${req.body.expense_type__c} successfully.` };
                response.status = 200;
                return response;
            } else {
                console.log(eventExp);
                response.response = { 'success': false, "data": {}, "message": "Due to internal error Expense update failed." };
                response.status = 400;
                return response;
            }
        } else {
            response.response = { 'success': false, "data": {}, "message": "Mandatory parameter(s) are missing." };
            response.status = 400;
            return response;
        }
    } catch (e) {
        console.log(e);
        response.response = { 'success': false, "data": {}, "message": "Internal Server error." };
        response.status = 500;
        return response;
    }

}

async function moveToLocalExpense(req) {

    try {
        is_Validate = true;
        is_Validate = is_Validate ? validation.issetNotEmpty(req.body.expense_item_id) : false;
        is_Validate = is_Validate ? validation.issetNotEmpty(req.headers.agentid) : false;

        if (is_Validate) {


            const eifields = [`sfid`, `Name`, `date_part('epoch'::text, date__c) * (1000)::double precision as date__c`];
            const eitableName = `Expense_Item_SS__c`;
            const eiWhereClouse = [];
            var eioffset = '0', eilimit = '1';

            if (validation.issetNotEmpty(req.body.expense_item_id)) {
                eiWhereClouse.push({ "fieldName": "sfid", "fieldValue": req.body.expense_item_id })
            }
            eisql = db.SelectAllQry(eifields, eitableName, eiWhereClouse, eioffset, eilimit);
            var eiList = await client.query(eisql);

            if (eiList.rowCount > 0) {
                // FIND EXPENSE U
                var ei_date = dtUtil.timestampToDate(eiList.rows[0].date__c, "YYYY-MM-DD");
                var expense_month = dtUtil.timestampToDate(eiList.rows[0].date__c, "MMM");
                
                console.log(`INFO::: Expense month = ${expense_month} `);
                const expfields = [`sfid`];
                const exptableName = `Expense_SS__c`;
                var expWhereClouse = [];
                var expoffset = '0', explimit = '1';

                //expWhereClouse.push({ "fieldName": "createddate", "fieldValue": `'${ei_date} 00:00:00' and '${ei_date} 23:59:59'` , "type":"BETWEEN" })
                expWhereClouse.push({ "fieldName": "month__c", "fieldValue": expense_month })
                expWhereClouse.push({ "fieldName": "expense_owner__c", "fieldValue": req.headers.agentid});
                expWhereClouse.push({ "fieldName": "expense_type__c", "fieldValue": 'Local Expense'});
                
                var expsql = db.SelectAllQry(expfields, exptableName, expWhereClouse, expoffset, explimit);
                
                console.log(`INFO:::: Expense =  ${expsql}`)
                var expList = await client.query(expsql);

                if (expList.rowCount > 0) {

                    console.log(`INFO::: Expense Details = `, expList.rows);
                    var tableName = 'Expense_Item_SS__c',
                        fieldValue = [];

                    fieldValue.push({ "field": "outstation_type__c", "value": 'Local Expense' });
                    fieldValue.push({ "field": "expense_type__c", "value": 'Local Expense' });
                    fieldValue.push({ "field": "expense__c", "value": expList.rows[0].sfid });
                    
                    var WhereClouse = [];
                    WhereClouse.push({ "field": "sfid", "value": req.body.expense_item_id });

                    // Update outstation expense item to Local expense
                    var eventExp = await db.updateRecord(tableName, fieldValue, WhereClouse);
                   
                    if (eventExp.success) {
                        response.response = { 'success': true, "data": {}, "message": `Expense status changed to Local Expense successfully.` };
                        console.log('response.response  1150 ', response.response);
                        response.status = 200;
                        return response;
                    } else {
                        console.log(eventExp);
                        response.response = { 'success': false, "data": {}, "message": "Due to internal error Expense update failed." };
                        console.log('response.response  1155 ', response.response);
                        response.status = 400;
                        return response;
                    }

                } else {
                    response.response = { 'success': false, "data": {}, "message": "Local Expense not found." };
                    console.log('response.response  1162 ', response.response);
                    response.status = 401;
                    return response;

                }
            } else {

                response.response = { 'success': false, "data": {}, "message": "Expense item not found." };
                console.log('response.response  1169 ', response.response);
                response.status = 400;
                return response;
            }
        } else {

            response.response = { 'success': false, "data": {}, "message": "Mandatory parameter(s) are missing." };
            console.log('response.response  1176 ', response.response);
            response.status = 400;
            return response;
        }
    } catch (e) {
        console.log(e);
        response.response = { 'success': false, "data": {}, "message": "Internal Server error." };
        response.status = 500;
        return response;
    }

}

async function moveToOutstationExpense(req) {
    

    try {
        is_Validate = true;
        is_Validate = is_Validate ? validation.issetNotEmpty(req.body.expense_item_id) : false;
        is_Validate = is_Validate ? validation.issetNotEmpty(req.headers.agentid) : false;
        console.log(`INFO::: req.body.expense_item_id = ${req.body.expense_item_id}`);
        if (is_Validate) {


            const eifields = [`sfid`, `Name`];
            const eitableName = `Expense_Item_SS__c`;
            const eiWhereClouse = [];
            var eioffset = '0', eilimit = '1';

            if (validation.issetNotEmpty(req.body.expense_item_id)) {
                eiWhereClouse.push({ "fieldName": "sfid", "fieldValue": req.body.expense_item_id })
            }
            eisql = db.SelectAllQry(eifields, eitableName, eiWhereClouse, eioffset, eilimit);
            var eiList = await client.query(eisql);

            if (eiList.rowCount > 0) {

                console.log(`INFO::: Expense Item Details = `, eiList.rows);
                var tableName = 'Expense_Item_SS__c',
                    fieldValue = [];

                fieldValue.push({ "field": "outstation_type__c", "value": 'Local Expense' });
                fieldValue.push({ "field": "expense_type__c", "value": 'Outstation Expense' });

                var WhereClouse = [];
                WhereClouse.push({ "field": "sfid", "value": req.body.expense_item_id });

                // Update outstation expense item to Local expense
                var eventExp = await db.updateRecord(tableName, fieldValue, WhereClouse);
                console.log(`INFO:::: Update Expense Item =  `, eventExp);
                if (eventExp.success) {
                    response.response = { 'success': true, "data": {}, "message": `Expense status changed to Local Expense successfully.` };
                    console.log('response.response  1150 ', response.response);
                    response.status = 200;
                    return response;
                } else {
                    
                    response.response = { 'success': false, "data": {}, "message": "Due to internal error Expense update failed." };
                    console.log('response.response  1155 ', response.response);
                    response.status = 400;
                    return response;
                }


            } else {

                response.response = { 'success': false, "data": {}, "message": "Expense item not found." };
                console.log('response.response  1169 ', response.response);
                response.status = 400;
                return response;
            }
        } else {

            response.response = { 'success': false, "data": {}, "message": "Mandatory parameter(s) are missing." };
            console.log('response.response  1176 ', response.response);
            response.status = 400;
            return response;
        }
    } catch (e) {
        console.log(e);
        response.response = { 'success': false, "data": {}, "message": "Internal Server error." };
        response.status = 500;
        return response;
    }

}



async function moveToLocalExpense_OLD(req) {

    try {
        is_Validate = true;
        is_Validate = is_Validate ? validation.issetNotEmpty(req.body.expense_item_id) : false;
        //is_Validate = is_Validate ? validation.issetNotEmpty(req.body.expense_id) : false;
        is_Validate = is_Validate ? validation.issetNotEmpty(req.headers.agentid) : false;
        //is_Validate = is_Validate ? await CheckExpenseMember(req) : false;
        console.log('req.body >>>>> ', req.body);

        if (is_Validate) {


            //--------------
            const eifields = [`sfid`, `Name`, `date_part('epoch'::text, date__c) * (1000)::double precision as date__c`];
            const eitableName = `Expense_Item_SS__c`;
            const eiWhereClouse = [];
            var eioffset = '0', eilimit = '1';

            if (validation.issetNotEmpty(req.body.expense_item_id)) {
                eiWhereClouse.push({ "fieldName": "sfid", "fieldValue": req.body.expense_item_id })
            }
            eisql = db.SelectAllQry(eifields, eitableName, eiWhereClouse, eioffset, eilimit);
            var eiList = await client.query(eisql);
            console.log('11111111111 ===> ', eiList.rows);


            if (eiList.rowCount > 0) {

                var ei_date = dtUtil.timestampToDate(eiList.rows[0].date__c, "YYYY-MM-DD");
                const expfields = [`sfid`];
                const exptableName = `Expense_SS__c`;
                const expWhereClouse = [];
                var expoffset = '0', explimit = '1';

                
                expWhereClouse.push({ "fieldName": "createddate", "fieldValue": `'${ei_date} 00:00:00' and '${ei_date} 23:59:59'` , "type":"BETWEEN" })
                expWhereClouse.push({ "fieldName": "expense_owner__c", "fieldValue": req.headers.agentid});
                
                expsql = db.SelectAllQry(expfields, exptableName, expWhereClouse, expoffset, explimit);
                console.log('Expense: ', expsql);
                var expList = await client.query(expsql);
                console.log('222222222 ===> ', expList.rows);
                if (expList.rowCount > 0) {
                    var tableName = 'Expense_Item_SS__c',
                        fieldValue = [];
                    fieldValue.push({ "field": "expense_type__c", "value": 'Local Expense' });
                    fieldValue.push({ "field": "expense__c", "value": expList.rows[0].sfid });
                    

                    var WhereClouse = [];
                    WhereClouse.push({ "field": "sfid", "value": req.body.expense_item_id });
                    //WhereClouse.push({ "field": "expense__c", "value": req.body.expense_id});
                    var eventExp = await db.updateRecord(tableName, fieldValue, WhereClouse);

                    if (eventExp.success) {
                        response.response = { 'success': true, "data": {}, "message": `Expense status changed to Local Expense successfully.` };
                        console.log('response.response  1150 ', response.response);
                        response.status = 200;
                        return response;
                    } else {
                        console.log(eventExp);
                        response.response = { 'success': false, "data": {}, "message": "Due to internal error Expense update failed." };
                        console.log('response.response  1155 ', response.response);
                        response.status = 400;
                        return response;
                    }

                } else {
                    response.response = { 'success': false, "data": {}, "message": "Local Expense not found." };
                    console.log('response.response  1162 ', response.response);
                    response.status = 401;
                    return response;

                }
            } else {

                response.response = { 'success': false, "data": {}, "message": "Expense item not found." };
                console.log('response.response  1169 ', response.response);
                response.status = 400;
                return response;
            }



        } else {

            response.response = { 'success': false, "data": {}, "message": "Mandatory parameter(s) are missing." };
            console.log('response.response  1176 ', response.response);
            response.status = 400;
            return response;
        }
    } catch (e) {
        console.log(e);
        response.response = { 'success': false, "data": {}, "message": "Internal Server error." };
        response.status = 500;
        return response;
    }

}

async function expenseItemByTour(req) {
    try {

        is_Validate = true;
        is_Validate = is_Validate ? validation.issetNotEmpty(req.headers.agentid) : false;
        tour_type = 'other-self';
        // is_Validate = is_Validate ? (validation.issetNotEmpty(req.query.tour_type) && tour_type.indexOf(req.query.tour_type) > -1) : false;

        if (is_Validate) {

            const tableName = 'Tour_SS__c';
            const WhereClouse = [];
            var offset = '0', limit = '1000';
            
            WhereClouse.push({ "fieldName": "tour_owner__c", "fieldValue": req.headers.agentid });
            WhereClouse.push({ "fieldName": "tour_status__c", "fieldValue": "Approved" });
            WhereClouse.push({ "fieldName": "expense_item.expense_type__c", "fieldValue": "Outstation Expense" });
            WhereClouse.push({ "fieldName": "expense_item.outstation_type__c", "fieldValue": "Local Expense" });
            WhereClouse.push({ "fieldName": "expense_item.visits__c", "type": "NOTNULL" });
            // if (validation.issetNotEmpty(req.query.tour_type) && req.query.tour_type == 'self') {
            // } else if (validation.issetNotEmpty(req.query.tour_type) && req.query.tour_type == 'other') {
            //     WhereClouse.push({ "fieldName": "tour_approver__c", "fieldValue": req.headers.agentid });
            // }
            // if (validation.issetNotEmpty(req.query.status)) {
            //     WhereClouse.push({ "fieldName": "tour_status__c", "fieldValue": req.query.status });
            // }

            if (validation.issetNotEmpty(req.query.offset)) {
                offset = req.query.offset;
            }
            if (validation.issetNotEmpty(req.query.limit)) {
                limit = req.query.limit;
            }

            var joins = [
                {
                    "type": "LEFT",
                    "table_name": "team__c member",
                    "p_table_field": "Tour_SS__c.tour_owner__c",
                    "s_table_field": "member.sfid"
                },
                {
                    "type": "LEFT",
                    "table_name": "team__c approvar",
                    "p_table_field": "Tour_SS__c.tour_approver__c",
                    "s_table_field": "approvar.sfid"
                },
                {
                    "type": "LEFT",
                    "table_name": "Expense_Item_SS__c expense_item",
                    "p_table_field": "Tour_SS__c.sfid",
                    "s_table_field": "expense_item.tour__c"
                }
            ];
            var fields = [
                `DISTINCT on (Tour_SS__c.sfid) Tour_SS__c.sfid as tour_sfid`,
                `Tour_SS__c.name as tour_name`,
                `Tour_SS__c.pg_id__c as tour_pg_id__c`,
                `Tour_SS__c.food__c as tour_food__c`,
                `Tour_SS__c.hotel__c as tour_hotel__c`,
                `Tour_SS__c.remark__c as tour_remark__c`,
                `date_part('epoch'::text, Tour_SS__c.tour_from__c) * (1000)::double precision as tour_from__c`,
                `Tour_SS__c.tour_approver__c as tour_approver__c`,
                `Tour_SS__c.tour_owner__c`,
                `Tour_SS__c.tour_status__c`,
                `date_part('epoch'::text, Tour_SS__c.tour_to__c) * (1000)::double precision as tour_to__c`,
                `Tour_SS__c.tour_purpose__c`,
                `date_part('epoch'::text, Tour_SS__c.createddate) * (1000)::double precision as createddate`,
             
                `member.name as member_name`,
                `member.team_member_name__c as member_team_member_name__c`,

                `approvar.name as approvar_name`,
                `approvar.team_member_name__c as approvar_team_member_name__c`,
                `expense_item.sfid as expense_item_sfid`,
                `expense_item.name as expense_item_name`,
                `expense_item.outstation_type__c as outstation_type__c`,
                `expense_item.expense_type__c as expense_type__c`,

                // `date_part('epoch'::text, visits__c.visit_date__c) * (1000)::double precision as visit_date__c`,
                // `visits__c.sfid as visit_sfid`,
                // `visits__c.name as visit_name`,

            ];
            var sql = db.fetchAllWithJoinQry(fields, tableName, joins, WhereClouse, offset, limit, '');

            console.log(`INFO::: Get Tour = ${sql}`);

            var tours = await client.query(sql);

            if (tours.rowCount != undefined && tours.rowCount > 0) {
                response.response = { 'success': true, "data": { "tours": tours.rows } };
                response.status = 200;
                return response;
            } else {
                response.response = { 'success': false, "data": { "tours": [] }, "message": "No record found." };
                response.status = 400;
                return response;
            }
        } else {
            response.response = { 'success': false, "data": { "tours": [] }, "message": "Mandatory parameter(s) are missing." };
            response.status = 400;
            return response;
        }
    } catch (e) {
        console.log(e);
        response.response = { 'success': false, "data": { "tours": [] }, "message": "Internal server error." };
        response.status = 500;
        return response;
    }
}