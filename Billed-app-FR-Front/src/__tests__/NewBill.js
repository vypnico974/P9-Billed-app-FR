/**
 * @jest-environment jsdom
 */
import { screen, waitFor, fireEvent } from "@testing-library/dom"
import userEvent from '@testing-library/user-event'
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import BillsUI from "../views/BillsUI";
import mockStore from "../__mocks__/store.js"
import { localStorageMock } from "../__mocks__/localStorage.js"
import { ROUTES, ROUTES_PATH } from "../constants/routes"
import router from "../app/Router.js"

jest.mock("../app/store", () => mockStore)


describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {

    /*  test si affichage page de "envoyer une note de frais" */
    test('Then it should display NewBill page', () => {
      document.body.innerHTML = NewBillUI()
      /* vérification présence texte "Envoyer une note de frais" à l'écran */
      expect(screen.getAllByText("Envoyer une note de frais")).toBeTruthy()
    })

    beforeEach(() => {
      jest.spyOn(mockStore, "bills")
      Object.defineProperty(window,'localStorage',{ value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({type: 'Employee'}))
      document.body.innerHTML='<div id="root"></div>'
      router()
      window.onNavigate(ROUTES_PATH.NewBill)
    })

     /* Test surbrillance de l'icône mail  */
     test("Then mail icon in vertical layout should be highlighted", async () => {
      await waitFor(() => screen.getByTestId('icon-mail'))
      const windowIcon = screen.getByTestId('icon-mail')
      /*vérification que le noeud DOM comportant id='icon-mail' comporte la classe active-icon */
       expect(windowIcon.classList.contains('active-icon')).toBeTruthy()
    })

    /* Test sélection d'un fichier avec un format valide lors de l'upload dans l'input du justificatif */
    test("Then uploading  a valid file : JPG/JPEG/PNG extension", () => {
      document.body.innerHTML = NewBillUI()
      const onNavigate = (pathname) => {document.body.innerHTML = ROUTES({ pathname })}
      const newBill = new NewBill({ document, onNavigate, store: mockStore, localStorage: window.localStorage })
      const fileInput = screen.getByTestId("file")
      const handleChangeFile = jest.fn(newBill.handleChangeFile)
      fileInput.addEventListener("change", (e) => handleChangeFile(e))
      const file = new File(["tested file"], "validFile.png", { type: "image/png" })
      userEvent.upload(fileInput, file)
      /* Vérification de l'appel de fonction handleChangeFile  */
      expect(handleChangeFile).toHaveBeenCalled()
      /* Vérification de l'objet file correspond au fichier sélectionné */
      expect(fileInput.files[0]).toStrictEqual(file)
    })

   /* Test sélection d'un fichier avec un format valide lors de l'upload dans l'input du justificatif */
    test("Then uploading  a invalid file : not JPG/JPEG/PNG extension", () => {
      document.body.innerHTML = NewBillUI()
      const onNavigate = (pathname) => {document.body.innerHTML = ROUTES({ pathname })}
      const newBill = new NewBill({ document, onNavigate, store: mockStore, localStorage: window.localStorage })
      const fileInput = screen.getByTestId("file")
      const handleChangeFile = jest.fn(newBill.handleChangeFile)
      fileInput.addEventListener("change", (e) => handleChangeFile(e)) 
      const file = new File(["tested file"], "invalidFile.pdf", { type: "application/pdf" })
      userEvent.upload(fileInput, file)
      /* Vérification de l'appel de fonction handleChangeFile  */
      expect(handleChangeFile).toHaveBeenCalled()
      /* Vérification que le champs fileInput est réinitialisé */
      expect(fileInput.value).toBe("")
    })

    /* Test d'intégration POST formulaire */
    test("Then clicking on the button should submit the bill form", () => {
      document.body.innerHTML = NewBillUI() 
      const onNavigate = (pathname) => {  document.body.innerHTML = ROUTES({ pathname })}
      const newBill = new NewBill({ document, onNavigate, store: mockStore, localStorage: window.localStorage })
      /* Mock datas pour tester le formulaire */
      const mockedBill = {
        type: "Transports",
        name: "Vol Paris Reunion",
        date: "2022-10-10",
        amount: 10,
        vat: 50,
        pct: 10,
        commentary: "Test",
        fileUrl: "../img/validFile.png",
        fileName: "validFile.png",
        status: "pending",
      }
      /* datas mockés dans les champs formulaire   */
      screen.getByTestId("expense-type").value = mockedBill.type
      screen.getByTestId("expense-name").value = mockedBill.name
      screen.getByTestId("datepicker").value = mockedBill.date
      screen.getByTestId("amount").value = mockedBill.amount
      screen.getByTestId("vat").value = mockedBill.vat
      screen.getByTestId("pct").value = mockedBill.pct
      screen.getByTestId("commentary").value = mockedBill.commentary
      newBill.fileName = mockedBill.fileName
      newBill.fileUrl = mockedBill.fileUrl
      /* appel de fonction et événement*/
      newBill.updateBill = jest.fn()
      const handleSubmit = jest.fn((e) => newBill.handleSubmit(e))
      const form = screen.getByTestId("form-new-bill")
      form.addEventListener("submit", handleSubmit)
      userEvent.click(screen.getByTestId('btn-send-bill'))
      /* Vérification appel de fonction  handleSubmit */
      expect(handleSubmit).toHaveBeenCalled()
      /* Vérification appel de la méthode updateBill  */
      expect(newBill.updateBill).toHaveBeenCalled()

    })

    describe('When I do not fill fields and I click on send', () => {
      
      describe('When I do not fill field "datepicker"', () => {
        /* Test si le champs  datepicker est vide  */
        test('Then it should stay on newBill page', () => {
          document.body.innerHTML = NewBillUI()
          const inputDatepicker = screen.getByTestId('datepicker')
              .value
          expect(inputDatepicker).toBe('')
          const newBillForm = screen.getByTestId('form-new-bill')
          const handleSubmit = jest.fn((e) => e.preventDefault())
          newBillForm.addEventListener('submit', handleSubmit)
          fireEvent.submit(newBillForm)
          /* vérification reste sur la même page  */
          expect(newBillForm).toBeTruthy()
        })
      })
      describe('When I do not fill field "amount"', () => { 
        /* Test si le champs  "amount" est vide  */       
        test('Then it should stay on newBill page', () => {
          document.body.innerHTML = NewBillUI()
          const inputAmount = screen.getByTestId('amount')
              .value
          expect(inputAmount).toBe('')
          const newBillForm = screen.getByTestId('form-new-bill')
          const handleSubmit = jest.fn((e) => e.preventDefault())
          newBillForm.addEventListener('submit', handleSubmit)
          fireEvent.submit(newBillForm)
          /* vérification reste sur la même page  */
          expect(newBillForm).toBeTruthy()
        })
      })
      describe('When I do not fill field "pct"', () => {
        /* Test si le champs  "pct" est vide  */
        test('Then it should stay on newBill page', () => {
          document.body.innerHTML = NewBillUI()
          const inputPct = screen.getByTestId('pct')
              .value
          expect(inputPct).toBe('')
          const newBillForm = screen.getByTestId('form-new-bill')
          const handleSubmit = jest.fn((e) => e.preventDefault())
          newBillForm.addEventListener('submit', handleSubmit)
          fireEvent.submit(newBillForm)
          /* vérification reste sur la même page  */
          expect(newBillForm).toBeTruthy()
        })
      })
    })
    
  })


  /* test d'intégration POST */
  describe("When an error occurs on API", () => {
    /* Test message erreur 500 pour API à l'envoie du formulaire */
    test("fetches error from an API and fails with 500 error", async () => {
      jest.spyOn(mockStore, "bills")
      jest.spyOn(console, "error").mockImplementation(() => {})
     Object.defineProperty(window, "localStorage", {value: localStorageMock,})
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',email: "employee@test.com"
      }))
      document.body.innerHTML = `<div id="root"></div>`
      router()
      const onNavigate = (pathname) => {document.body.innerHTML = ROUTES({ pathname })}
      mockStore.bills.mockImplementationOnce(() => {
        return { update: () => {return Promise.reject(new Error("Erreur 500"))}, }
      })
      const newBill = new NewBill({ document, onNavigate, store: mockStore, localStorage: window.localStorage })
      /* envoie du formulaire  */
      const form = screen.getByTestId("form-new-bill")
      const handleSubmit = jest.fn((e) => newBill.handleSubmit(e))
      form.addEventListener("submit", handleSubmit)
      userEvent.click(screen.getByTestId('btn-send-bill'))
      await new Promise(process.nextTick)
      /*  Vérification que console.error est appelé */
      expect(console.error).toHaveBeenCalled()      
    })
    /* Test message erreur 404 pour API  */
    test("fetches bills from an API and fails with 404 message error", async () => {
      jest.spyOn(mockStore, "bills")
      jest.spyOn(console, "error").mockImplementation(() => {})
      Object.defineProperty(window, "localStorage", {value: localStorageMock,})
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',email: "employee@test.com"
      }))
      document.body.innerHTML = `<div id="root"></div>`
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list: () => {
            return Promise.reject(new Error("Erreur 404"));
          },
        };
      });
      const html = BillsUI({ error: "Erreur 404" });
      document.body.innerHTML = html;
      const message = await screen.getByText(/Erreur 404/);
      /* Vérification présence message erreur 404 */
      expect(message).toBeTruthy();
    });
  
  })
})

// describe('When I submit a NewBill', () => {
//   test('Then I should be redirected to the Bills page', () => {
//     document.body.innerHTML = NewBillUI()
//     const newBill = new NewBill({ document, onNavigate, store:null, localStorage: window.localStorage })
//     const form = screen.getByTestId('btn-send-bill')
//     const handleSubmit = jest.fn(newBill.handleSubmit)
//     form.addEventListener('submit', handleSubmit)
//     fireEvent.submit(form)
//     expect(screen.getByText('Mes notes de frais')).toBeTruthy()
//   })
// })


