
import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useNavigate, useParams } from 'react-router-dom'
import { Container, TextField, Button, Box, Typography, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material'

const activity = []

function keepTrack(what, info) {
  activity.push({ when: new Date().toLocaleString(), what, info })
}

function makeCode() {
  return Math.random().toString(36).substring(2, 8)
}

function HomePage() {
  const [inputs, setInputs] = useState([{ link: '', nick: '', minutes: '' }])
  const [savedLinks, setSavedLinks] = useState(() => JSON.parse(localStorage.getItem('saved')) || [])

  function updateInput(index, field, value) {
    const copy = [...inputs]
    copy[index][field] = value
    setInputs(copy)
  }

  function addOneMore() {
    if (inputs.length < 5) {
      setInputs([...inputs, { link: '', nick: '', minutes: '' }])
    }
  }

  function saveLinks() {
    const all = [...savedLinks]
    inputs.forEach(item => {
      if (!item.link) return
      const repeated = all.find(one => one.nick === item.nick)
      if (item.nick && repeated) return
      const nick = item.nick || makeCode()
      const validFor = parseInt(item.minutes) || 30
      const endsAt = Date.now() + validFor * 60000
      all.push({ ...item, nick, endsAt })
      keepTrack('saved', { link: item.link, nick })
    })
    setSavedLinks(all)
    localStorage.setItem('saved', JSON.stringify(all))
  }

  return (
    <Container>
      <Typography variant="h4">Link Shortener</Typography>
      {inputs.map((set, index) => (
        <Box key={index} display="flex" gap={1} mb={1}>
          <TextField label="Long Link" fullWidth onChange={e => updateInput(index, 'link', e.target.value)} />
          <TextField label="Short Name" onChange={e => updateInput(index, 'nick', e.target.value)} />
          <TextField label="Time (mins)" type="number" onChange={e => updateInput(index, 'minutes', e.target.value)} />
        </Box>
      ))}
      <Button onClick={addOneMore}>Add Another</Button>
      <Button onClick={saveLinks}>Shorten Links</Button>
      <Box mt={2}>
        {savedLinks.map((entry, i) => (
          <Typography key={i}>{entry.nick} → {entry.link} (ends at {new Date(entry.endsAt).toLocaleTimeString()})</Typography>
        ))}
      </Box>
    </Container>
  )
}

function GoPage() {
  const { code } = useParams()
  const all = JSON.parse(localStorage.getItem('saved')) || []
  const match = all.find(one => one.nick === code)
  const move = useNavigate()

  useEffect(() => {
    if (match && Date.now() < match.endsAt) {
      keepTrack('go', { code })
      window.location.href = match.link
    } else {
      move('/')
    }
  }, [])

  return <Box p={4}><Typography>Taking you to the link...</Typography></Box>
}

function InfoPage() {
  const all = JSON.parse(localStorage.getItem('saved')) || []

  return (
    <Container>
      <Typography variant="h4">Link List</Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Link</TableCell>
            <TableCell>Expires</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {all.map((row, i) => (
            <TableRow key={i}>
              <TableCell>{row.nick}</TableCell>
              <TableCell>{row.link}</TableCell>
              <TableCell>{new Date(row.endsAt).toLocaleString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Container>
  )
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/stats" element={<InfoPage />} />
        <Route path=":code" element={<GoPage />} />
      </Routes>
    </Router>
  )
}
