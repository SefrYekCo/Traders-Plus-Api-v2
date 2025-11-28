const axios = require('axios')


function getHistory  (code, startDate, endDate ) {
    const data = axios({
        method: 'get',
        url: `http://tsetmc.com/tse/data/Export-txt.aspx?a=InsTrade&InsCode=${code}&DateFrom=${startDate}&DateTo=${endDate}&b=0`
    }).then((response) => response.data)
    return data
}

module.exports = {
    getHistory
}
