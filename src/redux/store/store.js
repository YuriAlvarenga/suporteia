import {configureStore} from '@reduxjs/toolkit'
import loginSlice from '../slice/auth/auth-login-slice'
import companySlice from '../slice/company-slice/company-slice'


export const store = configureStore({
    reducer:{
        auth: loginSlice,
        companies: companySlice
    },

})