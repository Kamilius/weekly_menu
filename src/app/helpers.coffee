formatDateString = (date) ->
  twoSymbolsDate = date.getDate()
  twoSymbolsDate = "0#{twoSymbolsDate}" if twoSymbolsDate.toString().length is 1
  return "#{date.getFullYear()}/#{date.getMonth() + 1}/#{twoSymbolsDate}"
