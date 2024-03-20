// Carrega as bibliotecas necessárias para o servidor, manipulação e caminhos de ficheiros.
const express = require('express'); 
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Cria e configura a aplicação Express (Framework do NodeJS para criar aplicações web)
const app = express(); 
const port = 3001;

// Definir as pastas para servir ficheiros estáticos e configura o express para entender JSON e dados codificados na URL.
app.use(express.static('build'));
app.use(express.static('uploads'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configurar o armazenamento e gestão de uploads de ficheiros com o Multer (livraria do NodeJS).
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads'),
    filename: (req, file, cb) => cb(null, file.originalname),
});
const upload = multer({ storage });

// Definir as rotas para upload, eliminação, listagem e acesso a ficheiros
app.post('/upload', upload.single('file'), (req, res) => {
    if (req.file) {
        console.log('Uploaded: ', req.file.path);
        res.json({ message: 'Ficheiro adicionado: ', file: req.file.path });
    } else {
        console.log('Ocorreu um erro ao fazer o upload. Nenhum ficheiro recebido.');
        res.status(400).send({ message: 'Ocorreu um erro.' });
    }
});

// Rota para eliminar um ficheiro, com base no nome do ficheiro
app.delete('/file/:name', (req, res) => {
    const fileName = req.params.name;
    const filePath = path.join(__dirname, 'uploads', fileName);
    console.log('Apagar ficheiro: ', filePath);
    console.log("aqui");
    fs.unlink(filePath, (err) => {
        if (err) {
            console.error(err);
            return res.status(404).send({ message: 'Ficheiro não encontardo' });
        }
        res.send({ message: 'Ficheiro apagado com sucesso' });
    });
});

// Rota para listar todos os ficheiros na pasta de uploads
app.get('/files', (req, res) => {
    const uploadsDir = path.join(__dirname, 'uploads');
    fs.readdir(uploadsDir, (err, files) => {
        if (err) {
            console.log(err);
            return res.status(500).send('Não foi possível recuperar os ficheiros.');
        }
        const fileInfo = files.map(file => {
            return { name: file, url: `/uploads/${file}` };
        });
        res.json(fileInfo);
    });
});

// Rota para aceder a um ficheiro específico
app.get('/file/:name', (req, res) => {
    const fileName = req.params.name;
    const filePath = path.join(__dirname, 'uploads', fileName);
    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            console.log(err);
            return res.status(404).send('Ficheiro não encontrado.');
        }
        res.sendFile(filePath);
    });
});

 // Inicia o servidor e fica à escuta na porta 3001 (default)
app.listen(port, () => {
    console.log(`Servidor a correr na porta ${port}`);
});
