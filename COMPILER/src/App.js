const express = require('express');
const cors = require('cors');
const compileRoutes = require('./routes/compileRoutes');
const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/compiler', compileRoutes);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log('Compiler API running at', PORT));