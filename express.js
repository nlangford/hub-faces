require('dotenv').config()
const express = require('express')
const fileUpload  = require('express-fileupload')
const app = express()
const port = 4000

const PIXLAB_KEY = process.env.PIXLAB_KEY

app.use(express.json())
app.use(fileUpload ())

app.get('/api/', function (req, res) {
  res.send("Hello World!")
})

app.post('/api/upload', async (req, res) => {
  const img = new Blob(req.files.img.data)

  const body = new FormData()

  body.set('file', img, req.files.img.name)
  body.set('key', PIXLAB_KEY)

  try {
    //ToDo: Cannot get this post to  work ever
    const response = await fetch('http://api.pixlab.io/store', {
      method: 'POST',
      body,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    const fetchResponse = await response.json()

    return res.send(fetchResponse)
  } catch(e) {
    console.log('SERVER ERROR', e)
  }
})

app.get('/api/facedetect', async (req, res) => {
  try {
    const response = await fetch('http://api.pixlab.io/facedetect?' + new URLSearchParams({
      img: req.query.img,
      key: PIXLAB_KEY,
  }))

    const fetchResponse = await response.json()

    return res.send(fetchResponse)
  } catch(e) {
    console.log('SERVER ERROR', e)
  }
})

app.post('/api/mogrify', async (req, res) => {
  try {
    const response = await fetch('http://api.pixlab.io/mogrify',
    {
      method: 'POST',
      body: JSON.stringify({
        img: req.body.img,
        cord: req.body.coords,
        key: PIXLAB_KEY,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const fetchResponse = await response.json()

    return res.send(fetchResponse)
  } catch(e) {
    console.log('SERVER ERROR', e)
  }
})

app.listen(port, function () {
  console.log(`Example app listening on port ${port}!`)
})