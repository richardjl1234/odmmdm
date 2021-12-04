with TB1 AS(
select 
trim(E01.RCNUM) as   RCNUM, 
trim(TNAMLAST) AS "family", 
trim(TNAMFRST) AS "given" 
from odmprd.ODMT_EMPLOYEE E01 
-- condition
)
, TB2 AS (
select 
trim(E01.RCNUM) as   RCNUM, 
trim(E01.TNAMFAM) AS "family", 
trim(E01.TNAMFRST) AS "given" 
from odmprd.ODMT_EMPLOYEE E01 
inner join
odmprd.odmt_employee E01A 
ON E01.RCNUM = E01A.RCNUM
AND E01.TNAMFAM <> ''
-- condition
)
, TB3 AS (
select 
trim(E01.RCNUM) as   RCNUM, 
trim(E01.TNAMPREL) AS "family", 
trim(E01.TNAMPREF) AS "given" 
from odmprd.ODMT_EMPLOYEE E01 
inner join
odmprd.odmt_employee E01A 
ON E01.RCNUM = E01A.RCNUM
AND E01.TNAMPREL <> '' AND E01.TNAMPREF <> ''
-- condition
)
, TB4 AS (
select 
trim(E01.RCNUM) as   RCNUM, 
'##UTF8##'||HEX(UNAMLST1) AS "family", 
'##UTF8##'||HEX(UNAMFST1) AS "given" 
from odmprd.ODMU_EMPLOYEE F01 
INNER JOIN ODMPRD.ODMT_EMPLOYEE E01
ON F01.CCOUNTRY = E01.CCOUNTRY 
AND F01.CCOUNTRQ = E01.CCOUNTRQ
AND F01.RSERNUM = E01.RSERNUM
AND HEX(F01.UNAMLST1) <> '' AND HEX(F01.UNAMFST1) <> ''
-- condition
), TB5 AS (
select 
trim(E01.RCNUM) as   RCNUM, 
'##UTF8##'||HEX(UNAMLST2) AS "family", 
'##UTF8##'||HEX(UNAMFST2) AS "given" 
from odmprd.ODMU_EMPLOYEE F01 
INNER JOIN ODMPRD.ODMT_EMPLOYEE E01
ON F01.CCOUNTRY = E01.CCOUNTRY 
AND F01.CCOUNTRQ = E01.CCOUNTRQ
AND F01.RSERNUM = E01.RSERNUM
AND HEX(F01.UNAMLST2) <> '' AND HEX(F01.UNAMFST2) <> ''
-- condition
)

, TB6 AS (
SELECT * FROM TB1 
UNION 
select * from tb2
UNION 
select * from tb3
UNION 
select * from tb4
UNION 
select * from tb5
) 
select TB6.* FROM TB6 INNER JOIN ODMPRD.ODMT_EMPLOYEE E01 
ON E01.RCNUM = TB6.RCNUM  
-- condition

