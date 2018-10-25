with A as 
(select 
   trim(RCNUM) as RCNUM, 
   trim(RCNUM) as "id", 
   'ibm' as "issuer" 
   from odmprd.odmt_employee E01
   -- condition
   union select 
   trim(e01.RCNUM) as RCNUM, 
   trim(e01.RPERSID) as "id", 
   'workday' as "issuer" 
   from odmprd.odmt_employee e01 
   inner join odmprd.odmt_employee E01A
   on E01.RCNUM = E01A.RCNUM
   and e01.RPERSID <> ''
   -- condition
) 
select A.* from A 
inner join  
ODMPRD.ODMT_EMPLOYEE E01 
ON A.RCNUM = E01.RCNUM  
-- condition
