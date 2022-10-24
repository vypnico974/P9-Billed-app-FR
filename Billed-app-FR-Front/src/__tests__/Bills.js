/**
 * @jest-environment jsdom
 */
//@ts-nocheck
import {screen, waitFor,fireEvent} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import Bills from "../containers/Bills.js";
import { bills } from "../fixtures/bills.js"
import userEvent from '@testing-library/user-event'
import { ROUTES, ROUTES_PATH } from "../constants/routes"
import {localStorageMock} from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store"
import router from "../app/Router.js";
import { rowsData } from '../views/BillsUI.js'

jest.mock("../app/store", () => mockStore)

describe("Given I am connected as an employee", () => {
    
   describe("When I am on Bills Page", () => {

    /* Test surbrillance de l'icône note de frais  */
    test("Then bill icon in vertical layout should be highlighted", async () => {
      /* mock connexion employé  */
      Object.defineProperty(window, "localStorage", {value: localStorageMock, });
      window.localStorage.setItem("user", JSON.stringify({ type: "Employee",}));
      document.body.innerHTML='<div id="root"></div>'
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      /*vérification que le noeud DOM comportant id='icon-window' comporte la classe active-icon */
       expect(windowIcon.classList.contains('active-icon')).toBeTruthy()
    })

    /* Test tri dates ordre décroissant  */
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map((a) => a.innerHTML);
      const antiChrono = (a, b) => (a < b ? 1 : -1);
      const datesSorted = [...dates].sort(antiChrono);
      /* vérification affichage dates par ordre décroissant   */
      expect(dates).toEqual(datesSorted);
    })

    /* Test d'intégration GET du mock API*/
      test("fetches bills from mock API GET", async () => {
      /* mock connexion employé  */
      window.localStorage.setItem("user", JSON.stringify({ type: "Employee",}));
      document.body.innerHTML='<div id="root"></div>'
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      const onNavigate = (pathname) => { document.body.innerHTML = ROUTES({ pathname })}
      const billsList = new Bills({document, onNavigate, store : mockStore, localStorage: null})
      const bills = await billsList.getBills()
      document.body.innerHTML = BillsUI({ data: bills })
      const billsCount  = screen.getByTestId("tbody").childElementCount  
      /* Vérification si les 4 notes de frais du mock (store.js) sont présents par le nombre
      d'élément enfants du noeud DOM "tbody" égal à 4 */
      expect(billsCount).toEqual(4)
    })
    
    /* action et affichage modale quand clic bouton "nouvelle note de frais" */
    describe("When I click on new bill button ", () => {
      test("Then a modal should open", () => {
        const onNavigate = (pathname) => {document.body.innerHTML = ROUTES({ pathname, }); };
        /* mock connexion employé  */
        Object.defineProperty(window, "localStorage", {value: localStorageMock, });
        window.localStorage.setItem("user", JSON.stringify({ type: "Employee",}));
        document.body.innerHTML = BillsUI({data: bills,});
        const newBill = new Bills({ document, onNavigate, store: null, bills, localStorage: localStorageMock})          
        const handleClickNewBill = jest.fn((e) => newBill.handleClickNewBill(e, bills)) 
        const iconNewBill = screen.getByTestId("btn-new-bill");
        iconNewBill.addEventListener("click", handleClickNewBill);
        fireEvent.click(iconNewBill);
        /* vérification de l'appel de la fonction handleClickNewBill */
        expect(handleClickNewBill).toHaveBeenCalled();
         /* vérification de l'affichage de la modale par la présence du noeud DOM
         id="form-new-bill") */
        const modale = screen.getAllByTestId("form-new-bill");
        expect(modale).toBeTruthy();
      })
    })

    /* test action et affichage modale quand clic icône oeil bleu */
    describe("When I click on the blue eye icon", () => {
      test("Then modal should be displayed with its content", async () => {
        /* mock connexion employé  */
        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({type: 'Employee' }))
        document.body.innerHTML='<div id="root"></div>'
        router()
        window.onNavigate(ROUTES_PATH.Bills)
        const onNavigate = (pathname) => {document.body.innerHTML = ROUTES({ pathname })}
        $.fn.modal= jest.fn(function() {this[0].classList.add('show') })
        const billsList = new Bills({document, onNavigate, store : mockStore, localStorage: null})
        const bills = await billsList.getBills()
        document.body.innerHTML = BillsUI({ data: bills })
        const firstEye = screen.getAllByTestId("icon-eye").shift()
        const handleClickIconEye = jest.fn(() => billsList.handleClickIconEye(firstEye))
        firstEye.addEventListener('click', handleClickIconEye)
        userEvent.click(firstEye)
        /* vérification de l'appel de la fonction handleClickIconEye */
        expect(handleClickIconEye).toBeCalled()
         /* vérification de l'affichage de la modale par la présence de la classe .show */
         expect(document.querySelector(".show")).toBeTruthy()
      })
    })

      /*  erreur sur la page */
      describe('When there is an error', () => {
        /*  test présence du message d'erreur */
        test('Then error page should be displayed', () => {
            const html = BillsUI({ data: bills, error: true })
            document.body.innerHTML = html
            const error = screen.getByTestId('error-message')
            expect(error).toBeTruthy()
        })
    })

     /* Test d'intégration GET */
     test("fetches bills from mock API GET", async () => {
      /* mock connexion employé  */
      window.localStorage.setItem('user', JSON.stringify({ type: 'Employee'}))
      document.body.innerHTML='<div id="root"></div>'
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      const onNavigate = (pathname) => {document.body.innerHTML = ROUTES({ pathname })}
      const billsList = new Bills({document, onNavigate, store : mockStore, localStorage: null})
      const bills = await billsList.getBills()
      document.body.innerHTML = BillsUI({ data: bills })
      const billsCount  = await screen.getByTestId("tbody").childElementCount
      /* Vérification si les 4 bills du mock sont récupérées*/
      expect(billsCount).toEqual(4)
    })

    describe('When I am on Bills page but it is loading', () => {
      /* Test affichage chargement page  */
      test('Then loading page should be rendered', () => {
        document.body.innerHTML = BillsUI({ loading: true })
        /*  vérification affichage du texte 'Loading...'  */
        expect(screen.getAllByText('Loading...')).toBeTruthy()
      })
    })

    /* Test de la gestion d'erreur par API */
    describe("When an error occurs on API", () => {
      beforeEach(() => {
        jest.spyOn(mockStore, "bills")
        Object.defineProperty(window,'localStorage',{ value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({type: 'Employee'}))
        document.body.innerHTML='<div id="root"></div>'
        router()
      })
      /* Test message erreur 404 */
      test("fetches bills from an API and fails with 404 message error", async () => {
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list : () =>  {
              return Promise.reject(new Error("Erreur 404"))
            }
          }})
        window.onNavigate(ROUTES_PATH.Bills)
        await new Promise(process.nextTick);
        const message = await screen.getByText(/Erreur 404/)
        /* vérification présence message d'erreur contenant texte  Erreur 404  */
        expect(message).toBeTruthy()
      })
      /* Test message erreur 500 */
      test("fetches messages from an API and fails with 500 message error", async () => {
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list : () =>  {
              return Promise.reject(new Error("Erreur 500"))
            }
          }})
        window.onNavigate(ROUTES_PATH.Bills)
        await new Promise(process.nextTick);
        const message = await screen.getByText(/Erreur 500/)
        /* vérification présence message d'erreur contenant texte  Erreur 500  */
        expect(message).toBeTruthy()
      })
    })
  })
})
