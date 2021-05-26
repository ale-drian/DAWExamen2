import express from 'express'
import MongoDB from '../mongo'
import mongoDriver from 'mongodb'
import axios from 'axios'

const { MongoClient, ObjectId } = mongoDriver

const mongo = new MongoDB()

const baseURL = 'http://localhost:3001'

const router = express.Router()

// Listar cuentas
router.get('/api/cuentas_cupo', async(request, response) => {
    const cuentas = await mongo.getAll('cuentas_cupo')
    response.status(200).json({
        data: cuentas,
        message: 'Cuentas Listadas'
    })
})

// Obtener una sola cuenta
router.get('/api/cuentas_cupo/:id', async(request, response) => {
    const id = request.params.id
    const cuenta = await mongo.get('cuentas_cupo', id)
    if (cuenta !== null) {
        response.status(200).json({
            data: cuenta,
            message: 'Cuenta listada'
        })
    } else {
        response.status(404).json({
            id: id,
            message: 'No encontrado'
        })
    }
})

// Listar cuentas de una entidad
router.get('/api/cuentas_cupo/entidad/:idEntidad', async(request, response) => {
    const idEntidad = request.params.idEntidad
    const query = { "id_entidad": ObjectId(idEntidad) }
    const cuentas = await mongo.getAll('cuentas_cupo', query)
    response.status(200).json({
        data: cuentas,
        message: 'Cuentas Listadas por entidad'
    })
})

// Crear cuenta
router.post('/api/cuentas_cupo/:idEntidad', async(request, response) => {
    const idEntidad = request.params.idEntidad
    const entidad = await mongo.get('entidades', idEntidad)
    if (!request.body.nroCuenta) {
        return response.status(400).json({
            error: 'No hay suficiente informacion'
        })
    }
    const cuenta = {
        id_entidad: entidad._id,
        nroCuenta: request.body.nroCuenta,
        saldo: (request.body.saldo ? request.body.saldo : 0.0)
    }
    await mongo.create('cuentas_cupo', cuenta)
    response.status(201).json({
        data: cuenta,
        message: 'Cuenta agregada'
    })
})

// Actualizar cuenta - no deberia estar permitido - Solo transferencia

// Eliminar cuenta - solo puede eliminarse la cuenta de una entidad
router.delete('/api/cuentas_cupo/:idEntidad/:id', async(request, response) => {

    const idEntidad = request.params.idEntidad
    const id = request.params.id
        // http://localhost no deberia estar (no se como usar la api dentro de la api)
    const listaCuentasEntidad = await axios.get(baseURL + '/api/cuentas_cupo/entidad/' + idEntidad).then((result) => {
        return result.data.data
    }).catch((error) => {
        return []
    });

    const habilitar = listaCuentasEntidad.find(cuenta => cuenta._id == id)

    if (habilitar != undefined) {
        const eliminado = await mongo.delete('cuentas_cupo', id)
        response.status(200).json({
            id: eliminado,
            message: 'Entidad eliminada'
        });
    } else {
        response.status(404).json({
            id: id,
            message: 'No habilitado'
        })
    }
})

// Obtener saldo por entidad
router.get('/api/saldo_cuentas_cupo/:idEntidad', async(request, response) => {
    const idEntidad = request.params.idEntidad
    const listaCuentasEntidad = await axios.get(baseURL + '/api/cuentas_cupo/entidad/' + idEntidad).then((result) => {
        return result.data.data
    }).catch((error) => {
        return []
    });
    let total = 0
    const saldoCuentas = listaCuentasEntidad.map(cuenta => {
        let objetoSaldo = {
            _id: cuenta._id,
            nroCuenta: cuenta.nroCuenta,
            saldo: cuenta.saldo
        }
        total = Math.round((total + cuenta.saldo) * 100) / 100
        return objetoSaldo
    })
    response.status(200).json({
        entidad: idEntidad,
        total: total,
        data: saldoCuentas,
        message: 'Cuentas y saldos por entidad'
    })
})

export default router