select distinct 
trim(E01.RCNUM) as RCNUM, 
case when trim(E02.TADDRLN1) = 'See UTF8 Address' THEN
'##UTF8##'||HEX(F02.UADDR1L1)
ELSE   trim(E02.TADDRLN1)  END as "line1", 

case when trim(E02.TADDRLN2) = 'See UTF8 Address' THEN
'##UTF8##'||HEX(F02.UADDR1L2)
ELSE   trim(E02.TADDRLN2)  END as "line2", 

case when trim(E02.TADDRLN3) = 'See UTF8 Address' THEN
'##UTF8##'||HEX(F02.UADDR1L3)
ELSE   trim(E02.TADDRLN3)  END as "city", 

case when trim(E02.TADDRLN4) = 'See UTF8 Address' THEN
'##UTF8##'||HEX(F02.UADDR1L4)
ELSE   trim(E02.TADDRLN4)  END as "state", 

case when trim(E02.TADDRLN5) = 'See UTF8 Address' THEN
'##UTF8##'||HEX(F02.UADDR1L5)
ELSE   trim(E02.TADDRLN5)  END as "country" , 

trim(E02.TADDRLN6)  as "postcode"

from odmprd.odmt_employee e01 
inner join  odmprd.odmt_address e02 
on E01.CCOUNTRY = E02.CCOUNTRY 
AND E01.CCOUNTRQ = E02.CCOUNTRQ 
AND E01.RSERNUM = E02.RSERNUM  
left outer join ODMPRD.ODMU_ADDRESS F02
on E01.CCOUNTRY = F02.CCOUNTRY 
AND E01.CCOUNTRQ = F02.CCOUNTRQ 
AND E01.RSERNUM = F02.RSERNUM  

left outer join odmprd.odmt_hriw_country RAU 
on E02.CISOCTRY = RAU.CISOCTRY 
and RAU.FDISCONT <> 'Y' 
AND RAU.CLANGUAG = ''  
-- condition
