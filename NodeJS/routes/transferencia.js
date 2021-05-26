import express from 'express'
import MongoDB from '../mongo'
import mongoDriver from 'mongodb'
import axios from 'axios'

const { MongoClient, ObjectId } = mongoDriver

const mongo = new MongoDB()
const baseURL = 'http://localhost:3001'

const router = express.Router()

// transferir entre una cuenta
router.post('/api/transferencia/:idEntidad/:idFrom/:idTo', async(request, response) => {

    const idEntidad = request.params.idEntidad
    const idFrom = request.params.idFrom
    const idTo = request.params.idTo

    const listaCuentasEntidad = await axios.get(baseURL + '/api/cuentas_cupo/entidad/' + idEntidad).then((result) => {
        return result.data.data
    }).catch((error) => {
        return []
    });

    if (listaCuentasEntidad.length >= 2) {
        const cuentaFrom = listaCuentasEntidad.find(cuenta => cuenta._id == idFrom)
        const cuentaTo = listaCuentasEntidad.find(cuenta => cuenta._id == idTo)
        if (cuentaFrom != undefined && cuentaTo != undefined) {
            const cantidad = request.body.cantidad
            if (cuentaFrom.saldo < 0) {
                response.status(400).json({
                    message: 'No tiene saldo en esta cuenta'
                })
            } else if (cuentaFrom.saldo < cantidad) {
                response.status(400).json({
                    message: 'No tiene saldo suficiente'
                })
            } else {
                console.log('data3')
                await axios({
                    method: 'patch',
                    url: baseURL + '/api/cuentas_cupo/desembolsar/' + cuentaFrom._id,
                    data: {
                        "cantidad": cantidad
                    }
                })
                await axios({
                    method: 'patch',
                    url: baseURL + '/api/cuentas_cupo/abonar/' + cuentaTo._id,
                    data: {
                        "cantidad": cantidad
                    }
                })
                const transferencia = {
                    cuentaFrom: ObjectId(cuentaFrom._id),
                    cuentaTo: ObjectId(cuentaTo._id),
                    id_entidad: ObjectId(idEntidad),
                    cantidad: cantidad,
                    fecha: new Date()
                }
                await mongo.create('transferencias', transferencia)
                response.status(201).json({
                    data: transferencia,
                    message: 'Transferencia agregada'
                })
            }
        } else {
            response.status(400).json({
                message: 'No se puede hacer la tranferencia'
            })
        }

    } else {
        response.status(400).json({
            message: 'Debe tener dos o más cuentas'
        })
    }

})

//Listar transferencias
router.get('/api/transferencia/entidad/:idEntidad', async(request, response) => {
    const idEntidad = request.params.idEntidad
    const query = { "id_entidad": ObjectId(idEntidad) }
    const transferencias = await mongo.getAll('transferencias', query)
    response.status(200).json({
        data: transferencias,
        message: 'Transderencias Listadas de ' + idEntidad
    })
})

export default router