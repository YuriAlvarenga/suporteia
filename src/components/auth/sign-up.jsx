import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Box, TextField, Button, Typography, Paper,
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, MenuItem, Select,
  FormControl, InputLabel, Alert, IconButton,
  Dialog, DialogContent, DialogContentText, DialogActions,
  Skeleton
} from '@mui/material'
import { Edit as EditIcon, Delete as DeleteIcon, Check as CheckIcon, Close as CloseIcon } from '@mui/icons-material'

// Importando as ações do Redux
import { fetchProfiles, createNewUser, updateProfile, deleteProfile, resetStatus } from '../../redux/slice/auth/user-slice'

export default function SignUp() {
  const dispatch = useDispatch()

  // Pegando dados do estado global
  const {
    list: users,
    loading,
    initialFetchLoading,
    error,
    success
  } = useSelector((state) => state.users)

  const [editingId, setEditingId] = useState(null)
  const [editFormData, setEditFormData] = useState({})
  const [openDeleteModal, setOpenDeleteModal] = useState(false)
  const [userToDelete, setUserToDelete] = useState(null)

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user'
  })

  const passwordsDoNotMatch =
    formData.confirmPassword &&
    formData.password !== formData.confirmPassword

  const isFormIncomplete =
    !formData.fullName ||
    !formData.email ||
    !formData.password ||
    !formData.confirmPassword ||
    !formData.role ||
    passwordsDoNotMatch

  useEffect(() => {
    if (users.length === 0) {
      dispatch(fetchProfiles())
    }
  }, [dispatch, users.length])


  // Limpar mensagens de erro/sucesso após 4 segundos
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => dispatch(resetStatus()), 4000)
      return () => clearTimeout(timer)
    }
  }, [success, error, dispatch])

  const handleCreateUser = async (e) => {
    e.preventDefault()
    const result = await dispatch(createNewUser(formData))

    if (result.meta.requestStatus === 'fulfilled') {
      setFormData({ fullName: '', email: '', password: '', confirmPassword: '', role: 'user' })
    }
  }

  const startEdit = (user) => {
    setEditingId(user.id)
    setEditFormData({ full_name: user.full_name, role: user.role })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditFormData({})
  }

  const handleSaveEdit = (id) => {
    dispatch(updateProfile({ id, ...editFormData }))
    setEditingId(null)
  }

  const handleDeleteClick = (user) => {
    setUserToDelete(user)
    setOpenDeleteModal(true)
  }

  const confirmDelete = () => {
    if (userToDelete) {
      dispatch(deleteProfile(userToDelete.id))
      setOpenDeleteModal(false)
      setUserToDelete(null)
    }
  }

  const capitalizeName = (name) => {
    if (!name) return ''
    return name
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  return (
    <Box>
      <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
        Gestão de Contas
      </Typography>

      <Paper sx={{ p: 3, mb: 5, borderRadius: 2 }}>
        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
          Criar Novo Usuário
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>Usuário criado com sucesso!</Alert>
        )}

        <Box component="form" onSubmit={handleCreateUser} sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>

          <Box sx={{ display: 'flex', gap: 2, width: '100%', alignItems: 'flex-start' }}>
            <TextField
              label="Nome"
              size="small"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              sx={{ flex: 3 }}
              required
            />
            <TextField
              label="E-mail"
              size="small"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              sx={{ flex: 3 }}
              required
            />
            <TextField
              fullWidth
              size="small"
              label="Senha"
              type="password"
              sx={{ flex: 3 }}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
            <TextField
              fullWidth
              size="small"
              label="Confirmar Senha"
              type="password"
              sx={{ flex: 3 }}
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              error={passwordsDoNotMatch}
              helperText={passwordsDoNotMatch ? "As senhas não coincidem" : ""}
              required
            />
          </Box>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl size="small" sx={{ flex: 2, minWidth: '120px' }}>
              <InputLabel>Nível de Acesso</InputLabel>
              <Select
                value={formData.role}
                label="Nível de acesso"
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                <MenuItem value="user">Analista</MenuItem>
                <MenuItem value="admin">Administrador</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
            <Button
              variant="contained"
              type="submit"
              disabled={loading || isFormIncomplete}
              sx={{
                px: 4,
                height: '40px',
                bgcolor: 'var(--color-highlight)',
                textTransform: 'none',
                fontWeight: 'bold',
                borderRadius: '6px',
                '&:hover': { bgcolor: 'var(--color-dark)' },
                '&:disabled': { bgcolor: '#e0e0e0', color: '#9e9e9e' }
              }}
            >
              {loading ? 'Salvando...' : 'Adicionar Usuário'}
            </Button>
          </Box>
        </Box>
      </Paper>

      <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>Usuários Ativos</Typography>

      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table size="small">
          <TableHead sx={{ bgcolor: '#f9f9f9' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', fontSize: 12, textAlign: 'center', color: '#000000', padding: '8px' }}>Nome</TableCell>
              <TableCell sx={{ fontWeight: 'bold', fontSize: 12, textAlign: 'center', color: '#000000', padding: '8px' }}>E-mail</TableCell>
              <TableCell sx={{ fontWeight: 'bold', fontSize: 12, textAlign: 'center', color: '#000000', padding: '8px' }}>Nível</TableCell>
              <TableCell sx={{ fontWeight: 'bold', fontSize: 12, textAlign: 'center', color: '#000000', padding: '8px' }}>Criado em</TableCell>
              <TableCell sx={{ fontWeight: 'bold', fontSize: 12, textAlign: 'center', color: '#000000', padding: '8px' }}>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {initialFetchLoading ? (
              [1, 2, 3, 4, 5].map((item) => (
                <TableRow key={item}>
                  <TableCell sx={{ border: '1px solid #ccc', padding: '8px' }}><Skeleton variant="text" /></TableCell>
                  <TableCell sx={{ border: '1px solid #ccc', padding: '8px' }}><Skeleton variant="text" /></TableCell>
                  <TableCell sx={{ border: '1px solid #ccc', padding: '8px', textAlign: 'center' }}><Skeleton variant="rectangular" height={20} width={60} sx={{ margin: 'auto' }} /></TableCell>
                  <TableCell sx={{ border: '1px solid #ccc', padding: '8px' }}><Skeleton variant="text" /></TableCell>
                  <TableCell sx={{ border: '1px solid #ccc', padding: '8px' }}><Skeleton variant="circular" width={25} height={25} sx={{ margin: 'auto' }} /></TableCell>
                </TableRow>
              ))
            ) : (
              users.map((row) => (
                <TableRow key={row.id} sx={{ bgcolor: '#ffffff' }}>
                  <TableCell sx={{ fontSize: 12, border: '1px solid #ccc', padding: '8px', textAlign: 'center' }}>
                    {editingId === row.id ? (
                      <TextField
                        size="small"
                        fullWidth
                        value={editFormData.full_name}
                        onChange={(e) => setEditFormData({ ...editFormData, full_name: e.target.value })}
                      />
                    ) : (
                      capitalizeName(row.full_name)
                    )}
                  </TableCell>
                  <TableCell sx={{ fontSize: 12, border: '1px solid #ccc', padding: '8px', textAlign: 'center' }}>{row.email}</TableCell>
                  <TableCell sx={{ fontSize: 12, border: '1px solid #ccc', padding: '8px', textAlign: 'center' }}>
                    {editingId === row.id ? (
                      <Select size="small" value={editFormData.role} onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}>
                        <MenuItem value="user">ANALISTA</MenuItem>
                        <MenuItem value="admin">ADMIN</MenuItem>
                      </Select>
                    ) : (
                      <Box sx={{ display: 'inline-block', px: 1, py: 0.3, borderRadius: 1, fontSize: '0.65rem', fontWeight: 'bold', color: 'white', bgcolor: row.role === 'admin' ? '#d32f2f' : '#1976d2' }}>
                        {row.role?.toUpperCase()}
                      </Box>
                    )}
                  </TableCell>
                  <TableCell sx={{ fontSize: 12, border: '1px solid #ccc', padding: '8px', textAlign: 'center' }}>
                    {row.updated_at ? new Date(row.updated_at).toLocaleDateString('pt-BR') : '---'}
                  </TableCell>
                  <TableCell sx={{ fontSize: 12, border: '1px solid #ccc', padding: '8px', textAlign: 'center' }}>
                    {editingId === row.id ? (
                      <Box>
                        <IconButton onClick={() => handleSaveEdit(row.id)} color="success" size="small"><CheckIcon fontSize="small" /></IconButton>
                        <IconButton onClick={cancelEdit} color="error" size="small"><CloseIcon fontSize="small" /></IconButton>
                      </Box>
                    ) : (
                      <Box sx={{ opacity: 0.6, '&:hover': { opacity: 1 }, transition: '0.2s' }}>
                        <IconButton onClick={() => startEdit(row)} sx={{ color: '#1976d2' }} size="small"><EditIcon fontSize="inherit" /></IconButton>
                        <IconButton onClick={() => handleDeleteClick(row)} sx={{ color: '#d32f2f' }} size="small"><DeleteIcon fontSize="inherit" /></IconButton>
                      </Box>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDeleteModal} onClose={() => setOpenDeleteModal(false)} PaperProps={{ sx: { borderRadius: 3, p: 1 } }}>
        <DialogContent>
          <DialogContentText>
            Deseja excluir <strong>{userToDelete?.full_name}</strong>?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenDeleteModal(false)} sx={{ color: '#666', textTransform: 'none' }}>Cancelar</Button>
          <Button onClick={confirmDelete} variant="contained" color="error" sx={{ borderRadius: '6px', textTransform: 'none', px: 3 }}>Excluir</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}