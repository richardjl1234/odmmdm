with A as 
(select 
   trim(RCNUM) as RCNUM, 
   trim(RCNUM) as "id", 
   'ibm' as "issuer" 
   from odmprd.odmt_employee emp 
   union select 
   trim(RCNUM) as RCNUM, 
   trim(RPERSID) as "id", 
   'workday' as "issuer" 
   from odmprd.odmt_employee e01 
   where RPERSID <> ''
) 
select A.* from A 
inner join  
ODMPRD.ODMT_EMPLOYEE E01 
ON A.RCNUM = E01.RCNUM  

