var db = require(`${PROJECT_DIR}/utility/selectQueries`);
const uuidv4 = require('uuid/v4');
var dtUtil = require(`${PROJECT_DIR}/utility/dateUtility`);
var response = { "status": 200, "response": "" };




module.exports = {
    addOrderAndOrderLine
};
async function addOrderAndOrderLine(myDetails,order,orderLineItems){
    try{
        
        if (myDetails.rowCount > 0) {
            var psm__c = null,
            asm__c = null,
            business__c = null;
            if (myDetails.rowCount > 0 && myDetails.rows[0].member_type == 'ASM') {
                asm__c = myDetails.rows[0].team_id;
            } else if (myDetails.rowCount > 0 && myDetails.rows[0].member_type == 'PSM') {
                psm__c =myDetails.rows[0].team_id;
                asm__c = (myDetails.rows[0].manager_id) ? myDetails.rows[0].manager_id : null;
            }
            business__c = (myDetails.rows[0].business) ? myDetails.rows[0].business : null
        
            orderFields = `PG_ID__c,asm__c,psm__c,business__c,dealer__c,retailer__c,order_date__c,order_value__c,promoted_product_count__c,total_product_sku__c,unique_product_count__c,createddate,visit__c`;

            var UUID_Order = uuidv4();
            order.order_date__c = dtUtil.removeMiliSec(order.order_date__c);
            
            order.order_date__c =   dtUtil.timestampToDate(order.order_date__c,"YYYY-MM-DD");
            var createdDate = dtUtil.todayDatetime();
            console.log('DATE ===> ', order.order_date__c)
            orderFieldValues = [UUID_Order, asm__c, psm__c, business__c, order.dealer__c, order.retailer__c, order.order_date__c, order.order_value__c, order.promoted_product_count__c, order.total_product_sku__c, order.unique_product_count__c,createdDate,order.visit__c];
            tableName = 'order__c';
            console.log('orderFieldValues   ', orderFieldValues);
            orderDetail = await db.insertRecord(orderFields, orderFieldValues, tableName);
            
            fieldValues = '';
            if (orderDetail.success) {
                counter = 0;
                for (const item of orderLineItems) {
                    if(counter > 0){
                        fieldValues += `, `;    
                    }
                    var pg_id__c =  uuidv4();
                    fieldValues += `('${pg_id__c}','${UUID_Order}', `;
                    fieldValues +=(asm__c==null)?null:`'${asm__c}'`;
                    fieldValues +=`, '${business__c}', '${order.order_date__c}', '${order.dealer__c}', '${item.item__c}',`;
                    fieldValues +=(psm__c==null)?null:`'${psm__c}'`;
                    fieldValues += `, '${item.quantity__c}', '${order.retailer__c}'`;
                    fieldValues += `, '${createdDate}')`;
                    counter++;
                }


                // orderLineFields = `Order_PG_ID__c, ASM__c, Business__c, Date__c, Account__c, Item__c,  PSM__c, Quantity__c, Retailer__c`;
                // //Product_Category__c, Product_Sub_Category__c, Product_Sub_Sub_Category__c,
                // orderLineFieldValues = [Order_PG_ID__c, asm__c, business__c, order.order_date__c, order.dealer__c, order.item__c, psm__c, order.quantity__c, order.retailer__c];
                // // order.Product_Category__c, order.Product_Sub_Category__c, order.Product_Sub_Sub_Category__c,
                 orderLineTableName = 'order_line__c';
                // orderDetail = await db.insertRecord(orderLineFields, orderLineFieldValues, orderLineTableName);
                
                fieldsToBeInsert = `pg_id__c,order_pg_id__c, asm__c, business__c, date__c, account__c, item__c,  psm__c, quantity__c, retailer__c, createddate`;
                sql = `INSERT into ${process.env.TABLE_SCHEMA_NAME}.${orderLineTableName} (${fieldsToBeInsert}) VALUES ${fieldValues}`;
                
                sql += ` RETURNING id`;
                console.log('orderLineResponse sql = ', sql);
                orderLineResponse =  await db.getDbResult(sql)
                        
                console.log('INFO::: INSERT RESPONSE  orderLineResponse  ====>>>>  ', orderLineResponse);
                
                if (orderDetail.success && orderLineResponse.rowCount > 0) {
                    // // UPDATE KPI -- when status = Completed
                    response.response = { 'success': true, "data": {  }, "message": "Order created successfully." };
                    response.status = 200;
                    return response;
                } else {
                    response.response = { 'success': false, "data": {}, "message": "Insert failed." };
                    response.status = 400;
                    return response;
                }

            }else{
                console.log(orderDetail);
                response.response = { 'success': false, "data": {}, "message": "Due to internal error order creation failed." };
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




 
        
        
        