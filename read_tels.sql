select 
trim(e01.rcnum) as RCNUM, 
trim(e03.TTELNR) as "phone" 
from odmprd.odmt_employee e01  
inner join odmprd.ODMT_TELNUMBR e03 
on e01.ccountry = e03.ccountry 
and e01.ccountrq = e03.ccountrq 
and e01.rsernum = e03.rsernum 
-- condition
