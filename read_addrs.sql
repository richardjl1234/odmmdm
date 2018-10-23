select distinct 
trim(E01.RCNUM) as RCNUM, 
trim(E02.TADDRLN1) as "line1", 
trim(e02.TADDRLN2) as "line2",
trim(e02.TADDRLN3) as "city",
trim(e02.TADDRLN4) as "state",
trim(e02.TADDRLN6) as "postalcode",
trim(e02.TADDRLN5) as "country" 
from odmprd.odmt_employee e01 
inner join  odmprd.odmt_address e02 
on E01.CCOUNTRY = E02.CCOUNTRY 
AND E01.CCOUNTRQ = E02.CCOUNTRQ 
AND E01.RSERNUM = E02.RSERNUM  
left outer join odmprd.odmt_hriw_country RAU 
on E02.CISOCTRY = RAU.CISOCTRY 
and RAU.FDISCONT <> 'Y' 
AND RAU.CLANGUAG = ''  
