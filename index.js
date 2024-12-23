import express from "express"
import mongoose from "mongoose"
import multer from "multer"
import cors from 'cors'

import { reqisterValidation, loginValidation, postCreateValidation } from './validations.js'
import { UserControlller, PostController } from './controllers/index.js'
import { checkAuth, handleValidationErrors } from './utils/index.js'


mongoose.connect('mongodb://localhost:27017/blog')
        .then(() => console.log('DB ok'))
        .catch((err) => console.log('DB err: ', err))

const app = express()

const storage = multer.diskStorage({
    destination: (_, cb) => {
        cb(null, 'uploads')
    }, 
    filename: (_, file, cb) => {
        cb(null, file.originalname)
    }
})

const upload = multer({ storage })

app.use(express.json())
app.use(cors())
app.use('/uploads', express.static('uploads'))

app.post('/auth/login', loginValidation, handleValidationErrors, UserControlller.login)
app.post('/auth/reqister', reqisterValidation, handleValidationErrors, UserControlller.reqister)
app.get('/auth/me', checkAuth, UserControlller.getMe)

app.post('/upload', checkAuth, upload.single('image'), (req, res) => {
    res.json({
        url: `/uploads/${req.file.originalname}`
    })
})

app.get('/posts', PostController.getAll)
app.get('/posts/tags', PostController.getLastTags)
app.get('/posts/:id', PostController.getOne)
app.post('/posts', checkAuth, postCreateValidation, handleValidationErrors, PostController.create)
app.delete('/posts/:id', checkAuth, PostController.remove)
app.patch('/posts/:id', checkAuth, postCreateValidation, handleValidationErrors, PostController.update)

app.listen(4444, (err) => {
    if(err){
        console.log(err)
    } 
    console.log("Server has been started!")
})