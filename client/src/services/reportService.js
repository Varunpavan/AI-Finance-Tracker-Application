import API from './api'

let getMonthlyReport = (params) => {
  return API.get('/reports/monthly', { params })
}

let downloadMonthlyReport = (params) => {
  return API.get('/reports/monthly', {
    params: { ...params, format: 'pdf' },
    responseType: 'blob'
  })
}

export { getMonthlyReport, downloadMonthlyReport }
