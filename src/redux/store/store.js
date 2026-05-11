import {configureStore} from '@reduxjs/toolkit'
import loginSlice from '../slice/auth/auth-login-slice'
import userSlice from '../slice/auth/user-slice'
import ticketsReducer from '../slice/ticket-slice/ticket-slice'
import companiesReducer from '../slice/companies/company-slice'
import avisosSlice from '../slice/briefing/briefing-slice'
import alertReducer from'../slice/alert-slice/alert-slice'


export const store = configureStore({
    reducer:{
        auth: loginSlice,
        users: userSlice,
        tickets: ticketsReducer,
        companies: companiesReducer,
        alerts: alertReducer,
        avisos: avisosSlice
    },

})