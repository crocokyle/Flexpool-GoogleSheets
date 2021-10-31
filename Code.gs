function main() {
  // Update these variables to set your preferences
  var address = "0x2eceacd95221e2b4e97acac24d725f8a529da391" // Wallet address
  var currency = "usd" // See available currencies below - Currency to convert ETH to
  const soldETH = 0 // Amount subtracted from Paid ETH if you want to exclude it

  // Get the unpaid balances
  unpaidETH = getFlexpoolUnpaid(address)
  unpaidCurrency = ethToCurrency(unpaidETH, currency)

  // Get the paid balances
  paidETH = getFlexpoolPaid(address, soldETH)
  paidCurrency = ethToCurrency(paidETH, currency)

  // Log everything we got
  Logger.log(`Unpaid ETH: ${unpaidETH}`)
  Logger.log(`Unpaid ${currency}: ${unpaidCurrency}`)
  Logger.log(`Paid ETH: ${paidETH}`)
  Logger.log(`Paid ${currency}: ${paidCurrency}`)

  // Update the cells
  // Specify the row, col for each variable
  updateCell(3, 5, unpaidETH) 
  updateCell(3, 4, unpaidCurrency)
  updateCell(4, 5, paidETH)
  updateCell(4, 4, paidCurrency)
}

// Available currencies
// "aed"
// "ars"
// "aud"
// "bch"
// "bdt"
// "bhd"
// "bmd"
// "bnb"
// "brl"
// "btc"
// "cad"
// "chf"
// "clp"
// "cny"
// "czk"
// "dkk"
// "dot"
// "eos"
// "eth"
// "eur"
// "gbp"
// "hkd"
// "huf"
// "idr"
// "ils"
// "inr"
// "jpy"
// "krw"
// "kwd"
// "lkr"
// "ltc"
// "mmk"
// "mxn"
// "myr"
// "ngn"
// "nok"
// "nzd"
// "php"
// "pkr"
// "pln"
// "rub"
// "sar"
// "sek"
// "sgd"
// "thb"
// "try"
// "twd"
// "uah"
// "usd"
// "vef"
// "vnd"
// "xag"
// "xau"
// "xdr"
// "xlm"
// "xrp"
// "yfi"
// "zar"
// "bits"
// "link"
// "sats"

function updateCell(row, col, value) {
  // Updates a specific cell with a value
  var sheet = SpreadsheetApp.getActiveSheet();
  sheet.getRange(row,col).setValue([value]);
}

function unitTest() {
  Logger.log(ethToCurrency(1, "eur"))
}

function ethToCurrency(eth_amount, currency) {
  // Converts an amount of ETH to a currency specified in main
  try {
    var options={muteHttpExceptions:false}
    var response = UrlFetchApp.fetch("https://api.coingecko.com/api/v3/coins/ethereum", options)

    var json = JSON.parse(response.getContentText())
    var eth_price = json.market_data.current_price[currency]
    var converted = eth_price*eth_amount

    return converted

  } catch (error) {
    Logger.log(error)
    Logger.log(response)
  }
}

function getFlexpoolUnpaid(address) {
  // Gets the unpaid balance from Flexpool
  var url = `https://api.flexpool.io/v2/miner/balance?coin=eth&address=${address}`
  var response = UrlFetchApp.fetch(url)
  var json = JSON.parse(response.getContentText())

  if (!json.error)
  {
    var unpaidETH = json.result.balance*0.000000000000000001
    return unpaidETH
  }
  else
  {
    Logger.log(json.error)
  }
}

function getFlexpoolPaid(address, soldETH) {
  // Gets the total paid balance from Flexpool by iterating through pagination
  var response = UrlFetchApp.fetch(`https://api.flexpool.io/v2/miner/payments?coin=eth&address=${address}&page=0`)
  var json = JSON.parse(response.getContentText())
  
  if (!json.error)
  {
    var totalPages = json.result.totalPages
    Logger.log(`Payment Pages: ${totalPages}`)

    var total = fetchFlexpoolPageTotal(address, 0)
    for (let pageNumber=1; pageNumber < totalPages; pageNumber++)
    {
      pageTotal = fetchFlexpoolPageTotal(address, pageNumber)
      total = total + pageTotal
    }

    var paidETH = total - soldETH
    
    return paidETH
  }
  else
  {
    Logger.log(json.error)
  }
}

function fetchFlexpoolPageTotal(address, pageNumber) {
  // Handles fetching an individual page for getFlexpoolPaid
  var response = UrlFetchApp.fetch(`https://api.flexpool.io/v2/miner/payments?coin=eth&address=${address}&page=${pageNumber}`)

  var json = JSON.parse(response.getContentText())
  
  if (!json.error)
  {
    var data = json.result.data
    const frac = 0.000000000000000001
    var total = 0
    for (var payment = 0 in data) 
    {
      var payment = data[payment]['value']*frac
      total = total + payment
    }
    Logger.log(`Total Flexpool Payments (ETH): ${total}`)
    return total
  }
  else
  {
    Logger.log(json.error)
  }
}
