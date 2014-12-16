formatDateString = (date) ->
  twoSymbolsDate = date.getDate()
  twoSymbolsDate = "0#{twoSymbolsDate}" if twoSymbolsDate.toString().length is 1
  return "#{date.getFullYear()}/#{date.getMonth() + 1}/#{twoSymbolsDate}"

getDateOfISOWeek = (week, year) ->
  simple = new Date(year, 0, 1 + (week - 1) * 7)
  dow = simple.getDay()
  ISOweekStart = simple
  if dow <= 4
    ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1)
  else
    ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay())
  ISOweekStart

getMonthNameByNumber = (monthNum) ->
  switch(monthNum)
    when 0 then 'січень'
    when 1 then 'лютий'
    when 2 then 'березень'
    when 3 then 'квітень'
    when 4 then 'травень'
    when 5 then 'червень'
    when 6 then 'липень'
    when 7 then 'серпень'
    when 8 then 'вересень'
    when 9 then 'жовтень'
    when 10 then 'листопад'
    when 11 then 'грудень'
