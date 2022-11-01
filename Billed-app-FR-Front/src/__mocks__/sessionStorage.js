import {localStorageMock} from "./localStorage.js"

export const sessionStorageMock = (userType) => {
    Object.defineProperty(window, 'localStorage', { value: localStorageMock })
    const user = JSON.stringify({type: userType })
    window.localStorage.setItem('user', user)
}