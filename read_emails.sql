select trim(e01.rcnum) as RCNUM, trim(d01.rmail) as "emailaddr" from odmprd.odmt_employee e01 inner join odmprd.odmt_e_directory d01 on e01.rcnum = d01.rcnum 

