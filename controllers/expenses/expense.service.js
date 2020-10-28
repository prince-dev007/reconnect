var _ = require('lodash');
var db = require(`${PROJECT_DIR}/utility/selectQueries`);
var response = { "status": 200, "response": "" };
var moment = require('moment');
var validation = require(`${PROJECT_DIR}/utility/validation`);
const uuidv4 = require('uuid/v4');
//var component = require(`${PROJECT_DIR}/controllers/invoices/invoice.component`);
var dtUtil = require(`${PROJECT_DIR}/utility/dateUtility`);


module.exports = {
    getAll,
    // updateExpense,
    addExpense,
    approveRejectExpence,
    sendingForApproval,
    updateEmailStatus
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
async function getAll(req) {
    try {

        is_Validate = true;
        is_Validate = is_Validate ? validation.issetNotEmpty(req.headers.agentid) : false;
        // is_Validate = is_Validate ? (validation.issetNotEmpty(req.query.visitid) || validation.issetNotEmpty(req.query.month)) : false;
        is_Validate = is_Validate ? validation.issetNotEmpty(req.query.month) : false;
        is_Validate = is_Validate ? validation.issetNotEmpty(req.query.type) : false;

        expense_type = 'other-self';
        is_Validate = is_Validate ? (validation.issetNotEmpty(req.query.expense_type) && expense_type.indexOf(req.query.expense_type) > -1) : false;

        if (is_Validate) {

            const tableName = 'Expense_SS__c';

            const WhereClouse = [];
            var offset = '0', limit = '1000';
            if (validation.issetNotEmpty(req.query.type)) {
                WhereClouse.push({ "fieldName": "Expense_SS__c.expense_type__c", "fieldValue": (req.query.type=='local')?'Local Expense':(req.query.type=='outstation')?'Outstation Expense':'None',"fieldName":"Customer__c","fieldValue":"ASC" });
            }
           
            if (validation.issetNotEmpty(req.query.month)) {
                WhereClouse.push({ "fieldName": "Expense_SS__c.month__c", "fieldValue": req.query.month });
            }

            if (validation.issetNotEmpty(req.query.expense_type) && req.query.expense_type == 'self') {
                WhereClouse.push({ "fieldName": "Expense_SS__c.expense_owner__c", "fieldValue": req.headers.agentid });
            } else if (validation.issetNotEmpty(req.query.expense_type) && req.query.expense_type == 'other') {
                WhereClouse.push({ "fieldName": "Expense_SS__c.expense_approvar__c", "fieldValue": req.headers.agentid });
                WhereClouse.push({ "fieldName": "Expense_SS__c.expense_status__c", "fieldValue": "Pending for Approval" });
            }
            // if (req.query.type == 'local') {
            //     //WhereClouse.push({ "fieldName": "expense_item.sfid", "type": "NOTNULL" });
            // }else{
            // }
            WhereClouse.push({ "fieldName": "Expense_SS__c.sfid", "type": "NOTNULL" });
            //var agentInfo = await db.agentDetail(req.headers.agentid);

            if (validation.issetNotEmpty(req.query.offset)) {
                offset = req.query.offset;
            }
            if (validation.issetNotEmpty(req.query.limit)) {
                limit = req.query.limit;
            }

            joins = [
                {
                    "type": "LEFT",
                    "table_name": "team__c member",
                    "p_table_field": "Expense_SS__c.expense_owner__c",
                    "s_table_field": "member.sfid"
                },
                {
                    "type": "LEFT",
                    "table_name": "team__c approvar",
                    "p_table_field": "Expense_SS__c.expense_approvar__c",
                    "s_table_field": "approvar.sfid"
                },
                {
                    "type": "LEFT",
                    "table_name": "Branch_SS__c member_branch",
                    "p_table_field": "member.branch__c",
                    "s_table_field": "member_branch.sfid"
                }
                // ,
                // {
                //     "type": "LEFT",
                //     "table_name": "expense_item__c expense_item",
                //     "p_table_field": "expense__c.sfid",
                //     "s_table_field": "expense_item.expense__c"
                // }
            ];
            var fields = [
                `Expense_SS__c__c.sfid`, //DISTINCT ON (expense__c.sfid) expense__c.sfid
                `Expense_SS__c__c.name`,
                `Expense_SS__c.expense_owner__c`,
                `Expense_SS__c.month__c`,
                //`expense__c.Roll_Up_on_Expense_Item_Total__c`,
                `Expense_SS__c.expense_approvar__c`,
                `Expense_SS__c.expense_status__c`,
                `Expense_SS__c.total_amount__c`,
                `Expense_SS__c.tour__c`,
                `Expense_SS__c.send_email__c`,
                `Expense_SS__c.pg_id__c`,
                `Expense_SS__c.exception_case__c`,
                `date_part('epoch'::text, Expense_SS__c.createddate) * (1000)::double precision as createddate`,
                `member.name as member_name`,
                `member.team_member_name__c as member_team_member_name__c`,
                `member.branch__c as member_branch__c`,
                `member.sfid as member_sfid`,
                `member_branch.name as member_branch_name`,

                `approvar.name as approvar_name`,
                `approvar.team_member_name__c as approvar_team_member_name__c`,
                `approvar.branch__c as approvar_branch__c`,
                `approvar.sfid as approvar_sfid`,
                //`expense_item.sfid as expense_item_sfid`,
                `1 as expense_item_sfid`,
                `(SELECT COUNT(id) FROM ${process.env.TABLE_SCHEMA_NAME}.Expense_Item_SS__c WHERE Expense_Item_SS__c.expense__c = Expense_SS__c.sfid) AS expense_item_count`
            ];
            var sql = db.fetchAllWithJoinQry(fields, tableName, joins, WhereClouse, offset, limit, '  order by  Expense_SS__c.createddate desc '); //
           
            console.log(`INFO::: Get expense = ${sql}`);

            var expenses = await client.query(sql);
            console.log('client',expenses);
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


async function sendingForApproval(req) {

    try {
        is_Validate = true;
        is_Validate = is_Validate ? validation.issetNotEmpty(req.body.expense_ids) : false;
        is_Validate = is_Validate ? validation.issetNotEmpty(req.headers.agentid) : false;
        //is_Validate = is_Validate ? await CheckExpenseMember(req) : false;
        console.log(typeof(req.body.expense_ids));
        console.log(req.body.expense_ids);

        if (is_Validate && req.body.expense_ids.length > 0) {


            var tableName = 'Expense_SS__c',
            fieldValue = [];
            fieldValue.push({ "field": "expense_status__c", "value": 'Pending For Approval' });

            const WhereClouse = [];

           
            WhereClouse.push({ "field": "sfid", "value": req.body.expense_ids , "type":"IN" });
            WhereClouse.push({ "field": "expense_owner__c", "value": req.headers.agentid });

            var eventExp = await db.updateRecord(tableName, fieldValue, WhereClouse);

            if (eventExp.success) {
                response.response = { 'success': true, "data": {}, "message": "Expense sending for approval successfully." };
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

async function updateEmailStatus(req) {

    try {
        is_Validate = true;
        is_Validate = is_Validate ? validation.issetNotEmpty(req.body.expense_ids) : false;
        is_Validate = is_Validate ? validation.issetNotEmpty(req.headers.agentid) : false;
        //is_Validate = is_Validate ? await CheckExpenseMember(req) : false;
        console.log(typeof(req.body.expense_ids));
        console.log(req.body.expense_ids);

        if (is_Validate && req.body.expense_ids.length > 0) {

            var tableName = 'Expense_SS__c',
            fieldValue = [];
            fieldValue.push({ "field": "send_email__c", "value": true ,"type":"BOOLEAN" });

            var WhereClouse = [];
            WhereClouse.push({ "field": "sfid", "value": req.body.expense_ids , "type":"IN" });
            var eventExp = await db.updateRecord(tableName, fieldValue, WhereClouse);

            if (eventExp.success) {
                response.response = { 'success': true, "data": {}, "message": `Expense email status changed to ${req.body.send_email__c} successfully.` };
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



// async function updateExpense(req) {

//     try {
//         is_Validate = true;
//         is_Validate = is_Validate ? validation.issetNotEmpty(req.query.id) : false;
//         is_Validate = is_Validate ? validation.issetNotEmpty(req.headers.agentid) : false;
//         is_Validate = is_Validate ? validation.issetNotEmpty(req.body.food__c) : false;
//         is_Validate = is_Validate ? validation.issetNotEmpty(req.body.amount__c) : false;
//         is_Validate = is_Validate ? validation.issetNotEmpty(req.body.kilometers_travelled__c) : false;

//         if (is_Validate) {
           
//             tableName = 'expense_item__c';
            
//             fieldValue = [];
//             fieldValue.push({ "field": "food__c", "value": req.body.food__c });
//             fieldValue.push({ "field": "kilometers_travelled__c", "value": req.body.kilometers_travelled__c });
//             fieldValue.push({ "field": "mode__c", "value": req.body.mode__c });
//             fieldValue.push({ "field": "toll_parking_charges__c", "value": req.body.toll_parking_charges__c });
//             fieldValue.push({ "field": "amount__c", "value": req.body.amount__c });
 
//             const WhereClouse = [];
//             WhereClouse.push({ "field": "sfid", "value": req.query.id });
         
//             var eventExp = await db.updateRecord(tableName, fieldValue, WhereClouse);
//             if (eventExp.success) {
//                 response.response = { 'success': true, "data": {}, "message": "Expense updated successfully." };
//                 response.status = 200;
//                 return response;
//             } else {
//                 console.log(eventExp);
//                 response.response = { 'success': false, "data": {}, "message": "Due to internal error Expense update failed." };
//                 response.status = 400;
//                 return response;
//             }
//         } else {
//             response.response = { 'success': false, "data": {}, "message": "Mandatory parameter(s) are missing." };
//             response.status = 400;
//             return response;
//         }
//     } catch (e) {
//         console.log(e);
//         response.response = { 'success': false, "data": {}, "message": "Internal Server error." };
//         response.status = 500;
//         return response;
//     }
// }


async function CheckExpenseManager(req) {
    try {
        var tableName = 'Expense_Item_SS__c',
            WhereClouse = [],
            offset = '0',
            limit = '10';
        WhereClouse.push({ "fieldName": "sfid", "fieldValue": req.query.id });
        WhereClouse.push({ "fieldName": "expense_item_approver__c", "fieldValue": req.headers.agentid });

        var sql = db.SelectAllQry(['sfid'], tableName, WhereClouse, offset, limit, ' ');
        var expenses = await client.query(sql);

        if (expenses.rowCount > 0) {
            return true;
        } else {
            return false;
        }
    } catch (e) {
        console.log('= ', e);
        return false;
    }
}

async function CheckExpenseMember(req) {
    try {


        var tableName = 'Expense_Item_SS__c',
            WhereClouse = [];
        offset = '0';
        limit = '10';
        WhereClouse.push({ "fieldName": "sfid", "fieldValue": req.query.id });
        WhereClouse.push({ "fieldName": "team__c", "fieldValue": req.headers.agentid });
        WhereClouse.push({ "fieldName": "Expense_Status__c", "fieldValue": "Draft" });
        joins = [];
        var sql = db.SelectAllQry(['sfid'], tableName, WhereClouse, offset, limit, ' ');

        var expenses = await client.query(sql);

        if (expenses.rowCount > 0) {
            return true;
        } else {
            return false;
        }
    } catch (e) {
        console.log('= ', e);
        return false;
    }
}


async function approveRejectExpence(req) {

    try {
        is_Validate = true;
        is_Validate = is_Validate ? validation.issetNotEmpty(req.query.id) : false;
        is_Validate = is_Validate ? validation.issetNotEmpty(req.headers.agentid) : false;
        is_Validate = is_Validate ? validation.issetNotEmpty(req.body.expense_status__c) : false;
        //is_Validate = is_Validate ? await CheckExpenseManager(req) : false;

        if (is_Validate) {


            var tableName = 'Expense_SS__c',
            fieldValue = [];
            fieldValue.push({ "field": "expense_status__c", "value": req.body.expense_status__c });
            if(validation.issetNotEmpty(req.body.approver_remarks__c))
                fieldValue.push({ "field": "approver_remarks__c", "value": req.body.approver_remarks__c });

            const WhereClouse = [];
            WhereClouse.push({ "field": "sfid", "value": req.query.id });
            WhereClouse.push({ "field": "expense_approvar__c", "value": req.headers.agentid });
            var eventExp = await db.updateRecord(tableName, fieldValue, WhereClouse);

            //getExpenseItems
            const expItableName = 'Expense_Item_SS__c';
            var expIoffset = '0', expIlimit = '1';
            const expIWhereClouse = [];
            expIWhereClouse.push({ "fieldName": "expense__c", "fieldValue": req.query.id });
            var expIsql = db.SelectAllQry(['sfid'], expItableName, expIWhereClouse, expIoffset, expIlimit, ' ');
            var expItemDetail = await client.query(expIsql);
        




            if( expItemDetail.rowCount > 0 && (req.body.expense_status__c=='Approved' || req.body.expense_status__c=='Rejected' )){
                var eitableName = 'Expense_Item_SS__c',
                eifieldValue = [];
                if(req.body.expense_status__c=='Approved')
                    eifieldValue.push({ "field": "expense_status__c", "value": 'Approved' });
                if(req.body.expense_status__c=='Rejected')
                    eifieldValue.push({ "field": "expense_status__c", "value": 'Rejected' });
                

                const eiWhereClouse = [];
                eiWhereClouse.push({ "field": "expense__c", "value": req.query.id });

                var eventItExp = await db.updateRecord(eitableName, eifieldValue, eiWhereClouse);
            }

            if (eventExp.success && eventItExp!=undefined && eventItExp.success) {
                response.response = { 'success': true, "data": {}, "message": "Expense updated successfully." };
                response.status = 200;
                return response;
            } else if (eventExp.success && eventItExp==undefined) {
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

async function addExpense(req) {

    try {
        is_Validate = true;
        is_Validate = is_Validate ? validation.issetNotEmpty(req.headers.agentid) : false;
        //is_Validate = is_Validate ? validation.issetNotEmpty(req.body.name) : false;
        is_Validate = is_Validate ? validation.issetNotEmpty(req.body.expense_type__c) : false;
        is_Validate = is_Validate ? validation.issetNotEmpty(req.body.month__c) : false;
        is_Validate = is_Validate ? validation.issetNotEmpty(req.body.total_amount__c) : false;
        console.log('is_Validate >> ',is_Validate)
        if (is_Validate) {

            var UUID_Expense = uuidv4();
            var createdDate = dtUtil.todayDatetime();
            var tableName = 'Expense_SS__c',
            expenseFields =`pg_id__c,name,expense_approvar__c,expense_owner__c,expense_status__c,expense_type__c,month__c,total_amount__c,tour__c,createddate`; 

            myDetails = await db.agentDetail(req.headers.agentid);

            var expense_owner__c =  req.headers.agentid;
            var expense_approvar__c = validation.issetNotEmpty(myDetails.rows[0].manager_id)?myDetails.rows[0].manager_id:null;
            expenseFieldsValues =[UUID_Expense,
                validation.issetNotEmpty(req.body.name)? req.body.name : null,
                validation.issetNotEmpty(expense_approvar__c)? expense_approvar__c : null,
                validation.issetNotEmpty(expense_owner__c)? expense_owner__c : null,
                'Draft',
                validation.issetNotEmpty(req.body.expense_type__c)? req.body.expense_type__c : null,
                validation.issetNotEmpty(req.body.month__c)? req.body.month__c : null,
                validation.issetNotEmpty(req.body.total_amount__c)? req.body.total_amount__c : null,
                validation.issetNotEmpty(req.body.tour__c)? req.body.tour__c : null,
                createdDate];
            console.log('expenseFieldsValues >>> ',expenseFieldsValues)
            var expenseDetail = await db.insertRecord(expenseFields, expenseFieldsValues, tableName, `, pg_id__c`);

            if (expenseDetail.success) {
                response.response = { 'success': true, "data": expenseDetail.data[0], "message": "Expense created successfully." };
                response.status = 200;
                return response;
            } else {
                console.log(expenseDetail);
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


