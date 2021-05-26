import express from 'express'
import routesEntidad from './routes/entidad'
import routesCuentasCupo from './routes/cuentasCupo'
import routesAbonarDesembolsar from './routes/abonarDesembolsar'


const app = express()

app.use(express.json())

const PORT = process.env.PORT;


app.use('/', routesEntidad)
app.use('/', routesCuentasCupo)
app.use('/', routesAbonarDesembolsar)


/*
// midleware
app.use((request, response, next) => {
  console.log('Pagina de error');
  response.status(404).send('<h2>Pagina de errores</h2>');
});
*/

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});