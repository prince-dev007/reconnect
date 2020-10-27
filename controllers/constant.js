/**
 * Database tables 
 */

const PARAMETER_MISSING = 'Mandatory parameter(s) are missing.';
var apiResponse = {
    success : true,
    error : '',
    data : '',
    totalRecord : ''
}


/** Database table and its fields */
global.SF_PRODUCT_FIELD =  [`Name`, `Product_Group__c`, `Name, Product_Name__c`, `promoted_product__c`, `Type__c`, `CreatedById`]; 
global.SF_PRODUCT_TABLE_NAME = `Product__c`;

global.SF_PRODUCT_GROUP_FIELD =  [`Product_ID__c`, `Name`, `OwnerId, LastModifiedById`, `CreatedById`]; 
global.SF_PRODUCT_TABLE_NAME = `Product_Group__c`;

global.SF_VISIT_FIELD =  [`cancelled_reason__c`,`visit_owner__c`,`asm__c`,`visit_sequnce_no__c`, `Name`, `Match__c, Location__c`, `LastModifiedById`,`Duration__c`,`Day__c`,`CreatedById`]; 
global.SF_VISIT_TABLE_NAME = `visits__c`;

global.SF_ORDER_FIELD =  [`pg_id__c`,`psm__c`,`sfid`,`dealer__c`,`order_value__c`, `date_part('epoch'::text, Order_Date__c) * (1000)::double precision as Order_Date__c`,`retailer__c`,`name`,`Unique_Product_Count__c`,`promoted_product_count__c`,`Total_Product_SKU__c`, `date_part('epoch'::text, createddate) * (1000)::double precision as createddate`]; //`CreatedById`, , `LastModifiedById, Name`,`OwnerId`,`Unique_Product_Count__c`,`promoted_product_count__c`,`Total_sku_count__c`
global.SF_ORDER_TABLE_NAME = `Order__c`;

global.SF_MATERIAL_REQUESTS_FIELD =  [`CreatedById`, `Dealer__c`, `LastModifiedById, Name`, `Order_Date__c`,`OwnerId`,`promoted_product_count__c`,`Retailer__c`,`Total_sku_count__c`,`Unique_Product_Count__c`]; 
global.SF_MATERIAL_REQUESTS_TABLE_NAME = `Material_Requests__c`;

global.SF_CAMPAIGNS_FIELD =  [`Actual__c`, `Approved_by__c`, `Campaign_Budget__c, Name`, `CreatedById`,`Differencw__c`,`Gift__c`,`LastModifiedById`,`OwnerId`,`Reuested_by__c`,`Status__c`,`Type__c`,`Venue__c`]; 
global.SF_CAMPAIGNS_TABLE_NAME = `Campaign__c`;

global.SF_AREA_FIELD =  [`Area_Code__c`, `Name`, `Branch__c, City__c`, `CreatedById`,`LastModifiedById`,`OwnerId`,`State__c`]; 
global.SF_AREA_TABLE_NAME = `Area_SS__c`;

global.SF_TEAM_FIELD =  [`Anniversary__c`, `CreatedById`, `Designation__c, DOB__c`, `Joining_Date__c`,`LastModifiedById`,`Manager__c`,`Member_type__c`,`OwnerId`,`Role__c`,`Team_Member_Code__c`,`Name`,`User__c`]; 
global.SF_TEAM_TABLE_NAME = `Team__c	`;


global.SF_TEAM_AREA_FIELD =  [`Area__c`, `CreatedById`, `LastModifiedById, OwnerId`, `Name`,`Team_Member__c`]; 
global.SF_TEAM_AREA_TABLE_NAME = `Team_Area__c	`;


global.SF_DEALERS_FIELD =  [`pg_id__c`,`sfid`,`Name`,`Email__c`,`Mobile_Contact__c`,`Mobile__c`,`BillingCity`,`BillingCountry`,`BillingPostalCode`,`BillingState`,`BillingStreet`,`BillingCountry`,  `Competitor__c`,  `area__c`,  `Location__Latitude__s`,`Location__Longitude__s`,  `GSTIN__c`,`date_part('epoch'::text, Associated_Date__c) * (1000)::double precision as Associated_Date__c`,`ASM__c`,`Total_Order_Value__c`,`Potential_Value__c`,`No_of_Retailers__c`,`Sales_Team__c`,`Total_Credit_Limit__c`,`Credit_Used__c`,`Credit_Block__c`,`date_part('epoch'::text, last_visit_date__c) * (1000)::double precision as last_visit_date__c`,`type1__c`,`Dealer__c`,`Category__c`,`date_part('epoch'::text, last_order_date__c) * (1000)::double precision as last_order_date__c`,`owner_name__c`,`owner_phone__c`]; 

global.SF_RETAILER_FIELD =  [`pg_id__c`,`date_part('epoch'::text, createddate) * (1000)::double precision as createddate`,`sfid`,`Name`,`Email__c`,`Mobile_Contact__c`,`Mobile__c`,`BillingCity`,`BillingCountry`,`BillingPostalCode`,`BillingState`,`BillingStreet`,`BillingCountry`,`Competitor__c`,  `area__c`,  `Location__Latitude__s`,`Location__Longitude__s`,`Owner_Name__c`,`Owner_Phone__c`,  `GSTIN__c`,`date_part('epoch'::text, Associated_Date__c) * (1000)::double precision as Associated_Date__c`,`Total_Order_Value__c`,`Potential_Value__c`,`ASM__c`,`Dealer__c`,`date_part('epoch'::text, last_visit_date__c) * (1000)::double precision as last_visit_date__c`,`Category__c`,`date_part('epoch'::text, last_order_date__c) * (1000)::double precision as last_order_date__c`,`type1__c`,`owner_name__c`,`owner_phone__c`]; 

global.SF_RETAILER_FIELD_old =  [`sfid`,`Name`,`area__c`,`ASM__c`,`Type1__c`,`Email__c`,`Mobile_Contact__c`,`Mobile__c`,`Potential_Value__c`,`Potential_Retailer__c`,`Dealer__c`,`Category__c`,`Retailer_category__c`];
global.SF_RETAILER_TABLE_NAME = `Account`;


