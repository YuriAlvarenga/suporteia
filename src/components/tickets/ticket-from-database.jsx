import * as React from 'react'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchTickets, updateTicketStatus } from '../../redux/slice/ticket-slice/ticket-slice'
import { fetchCompanies } from '../../redux/slice/companies/company-slice' 
import { useParams, useOutletContext } from 'react-router-dom'
import TicketTable from './tickets-tables'
import TicketDetailsDrawer from './tickets-details'
import ClassificationModal from './tickets-classification-modal'

const normalizeName = (name) => {
    if (!name) return ''
    return name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s.]/g, "").trim()
}

const capitalizeName = (name) => {
    if (!name) return ''
    return name.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
}

export default function Tickets() {
    const dispatch = useDispatch()
    const { companyId } = useParams() // Agora recebe o UUID vindo da SideBar
    const { tickets, loading } = useSelector((state) => state.tickets)
    const { companies } = useSelector((state) => state.companies)
    const { user } = useSelector((state) => state.auth)

    const context = useOutletContext()
    const { tabValue, setCounts, searchTerm } = context || {}

    const [openDrawer, setOpenDrawer] = useState(false)
    const [selectedTicket, setSelectedTicket] = useState(null)
    const [openClassificationModal, setOpenClassificationModal] = useState(false)
    const [classification, setClassification] = useState('')
    const [indevido, setIndevido] = useState(false)
    const [ticketToClose, setTicketToClose] = useState(null)
    const [copySuccess, setCopySuccess] = useState(false)

    const tags = ["SW. Cardápio não reflete no totem", "SW. Pagamento sem ordem", "SW. Integração iFood", "SW. Erro de pagamento", "SW. Instabilidade", "IN. Falha na internet", "IN. Erro operacional", "IN. Erro integração", "DU. Dúvidas cardápio", "DU. Dúvidas Financeiras", "DU. Dúvidas acesso", "DU. Status do totem", "SOL. Aquisição totem", "SOL. Configurar totem", "SOL. Cancelamento", "SOL. Ativação", "SOL. Alterações contratuais", "SOL. Solicitações financeiras", "SOL. Alteração cardápio", "HW. hardware", "CRI. Incidente", "OU. Outros", "Cri.Encerramento+24h", "SOL. Inadimplência"]

    useEffect(() => {
        dispatch(fetchTickets())
        if (companies.length === 0) dispatch(fetchCompanies())
    }, [dispatch, companies.length])

    // --- ASSOCIAÇÃO DIRETA POR ID ---
    const ticketsDaEmpresa = React.useMemo(() => {
        if (!tickets || tickets.length === 0) return []
        if (!companyId) return tickets

        // Filtra os tickets comparando o company_id do banco com o ID da URL
        return tickets.filter(t => t.company_id === companyId)
    }, [tickets, companyId])

    useEffect(() => {
        if (setCounts) {
            const pending = ticketsDaEmpresa.filter(t => t.status?.toLowerCase().trim() === "em atendimento").length
            const finished = ticketsDaEmpresa.filter(t => t.status?.toLowerCase().trim() === "finalizado").length
            setCounts({ pending, finished })
        }
    }, [ticketsDaEmpresa, setCounts])

    const filteredTickets = React.useMemo(() => {
        const statusAlvo = tabValue === 0 ? "em atendimento" : "finalizado"

        return ticketsDaEmpresa.filter(t => {
            const matchStatus = t.status?.toLowerCase().trim() === statusAlvo
            if (!searchTerm || searchTerm.trim() === "") return matchStatus

            const searchNormalized = normalizeName(searchTerm)
            const totemString = Array.isArray(t.totem) ? t.totem.join(' ') : (t.totem || '').toString()

            return matchStatus && (
                normalizeName(t.ticket?.toString()).includes(searchNormalized) ||
                normalizeName(t.cliente).includes(searchNormalized) ||
                normalizeName(t.cnpj).includes(searchNormalized) ||
                normalizeName(totemString).includes(searchNormalized)
            )
        })
    }, [ticketsDaEmpresa, tabValue, searchTerm])

    const handleViewDetails = (ticket) => {
        setSelectedTicket(ticket)
        setOpenDrawer(true)
        setCopySuccess(false)
    }

    const handleCloseTicket = (idDoTicket) => {
        setTicketToClose(idDoTicket)
        setOpenClassificationModal(true)
    }

    const handleConfirmCloseTicket = async () => {
        if (!classification) return
        try {
            await dispatch(updateTicketStatus({
                id: ticketToClose,
                status: 'Finalizado',
                classificacao: classification,
                indevido: indevido,
                userName: user?.fullName || 'Sistema'
            })).unwrap()
            setOpenClassificationModal(false)
            setOpenDrawer(false)
            setSelectedTicket(null)
            setClassification('')
            setIndevido(false)
            setTicketToClose(null)
        } catch (error) {
            console.error("Erro ao encerrar ticket:", error)
        }
    }

    const handleCopyTicketData = () => {
        if (!selectedTicket) return
        const totemFormatado = Array.isArray(selectedTicket.totem) ? selectedTicket.totem.join(', ') : selectedTicket.totem?.replace(/[\[\]"]/g, '')
        const textToCopy = `*NOME FANTASIA:* ${capitalizeName(selectedTicket.cliente)}\n*CNPJ:* ${selectedTicket.cnpj}\n*TOTEM:* ${totemFormatado}\n*MOTIVO:* ${selectedTicket.mensagem || 'Não informado'}`
        navigator.clipboard.writeText(textToCopy).then(() => {
            setCopySuccess(true)
            setTimeout(() => setCopySuccess(false), 3000)
        })
    }

    return (
        <React.Fragment>
            <TicketTable
                loading={loading}
                tickets={tickets}
                filteredTickets={filteredTickets}
                tabValue={tabValue}
                onViewDetails={handleViewDetails}
                capitalizeName={capitalizeName}
            />

            <TicketDetailsDrawer open={openDrawer} onClose={() => setOpenDrawer(false)} ticket={selectedTicket} tabValue={tabValue} copySuccess={copySuccess} onCopy={handleCopyTicketData} onCloseTicket={handleCloseTicket} capitalizeName={capitalizeName} />

            <ClassificationModal open={openClassificationModal} onClose={() => setOpenClassificationModal(false)} tags={tags} classification={classification} setClassification={setClassification} indevido={indevido} setIndevido={setIndevido} onConfirm={handleConfirmCloseTicket} />
        </React.Fragment>
    )
}