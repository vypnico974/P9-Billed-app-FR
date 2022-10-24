import VerticalLayout from './VerticalLayout.js'
import ErrorPage from "./ErrorPage.js"
import LoadingPage from "./LoadingPage.js"
import {formatDate} from "../app/format.js"

import Actions from './Actions.js'

const row = (bill) => {
  return (`
    <tr>
      <td>${bill.type}</td>
      <td>${bill.name}</td>
      <td>${bill.date}</td>     
      <td>${bill.amount} €</td>
      <td>${bill.status}</td>
      <td>
        ${Actions(bill.fileUrl)}
      </td>
    </tr>
    `)
  }

// const rows = (data) => {
//   return (data && data.length) ? data.map(bill => row(bill)).join("") : ""
// } 
/*  rajout trie date desc */
// export const rowsData = (data) => {
//   const sortDescByDate = (a, b) => (a.date < b.date ? 1 : -1)
//   if (data && data.length) {
//         return [...data].sort(sortDescByDate)
//   }
//    return [];
// } 
//  const rows = (data) => {
//   const dataSortedFormat = []
//   const sortDescByDate = (a, b) => (a.date < b.date ? 1 : -1)
//   if (data && data.length) {
//     const dataSorted = [...data].sort(sortDescByDate)
//     for (const dataLine of dataSorted) {
//       dataLine.date = formatDate(dataLine.date)
//       console.log(dataLine.date)
//       dataSortedFormat.push(dataLine)
//     }
//     return dataSortedFormat.map((bill) => row(bill)).join("")
//   }
//    return [];
// }

/* tri dates desc avant creation HTML de bill */
// export const rowsData = (data) => {
//   if (data && data.length) {
//       data.map((data) => {data.date = new Date(data.date)})      
//       return data.sort((a, b) => b.date - a.date)
//   } else return []
// }
// const rows = (data) => {
//   if (data && data.length) {
//       const datas = rowsData(data)
//       return datas.map((bill) => row(bill)).join('')
//   } else return []
// }

/* tri dates desc avant creation HTML de bill */
// const rows = (data) => {
//   if (data && data.length) {
//     return data
//       .sort((a, b) => ((a.date < b.date) ? 1 : -1))
//       .map(bill => row(bill))
//       .join("")
//   }
//   return "";
// }

const rows = (data) => {
  return data && data.length
    ? data
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .map((bill) => row(bill))
        .join("")
    : "";
};

export default ({ data: bills, loading, error }) => {
  
  const modal = () => (`
    <div class="modal fade" id="modaleFile" tabindex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="exampleModalLongTitle">Justificatif</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
          </div>
        </div>
      </div>
    </div>
  `)

  if (loading) {
    return LoadingPage()
  } else if (error) {
    return ErrorPage(error)
  }
  
  return (`
    <div class='layout'>
      ${VerticalLayout(120)}
      <div class='content'>
        <div class='content-header'>
          <div class='content-title' data-testid='content-title'> Mes notes de frais </div>
          <button type="button" data-testid='btn-new-bill' class="btn btn-primary">Nouvelle note de frais</button>
        </div>
        <div id="data-table">
        <table id="example" class="table table-striped" style="width:100%">
          <thead>
              <tr>
                <th>Type</th>
                <th>Nom</th>
                <th>Date</th>
                <th>Montant</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
          </thead>
          <tbody data-testid="tbody">
            ${rows(bills)}
          </tbody>
          </table>
        </div>
      </div>
      ${modal()}
    </div>`
  )
}