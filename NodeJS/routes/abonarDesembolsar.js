import express from 'express'
import MongoDB from '../mongo'
import mongoDriver from 'mongodb'
import axios from 'axios'

const { MongoClient, ObjectId } = mongoDriver

const mongo = new MongoDB()

const router = express.Router()

// abonar en una cuenta
router.patch('/api/cuentas_cupo/abonar/:id', async(request, response) => {
    if (!request.body.cantidad) {
        return response.status(400).json({
            error: 'No hay suficiente informacion'
        })
    }

    const id = request.params.id
    const cuenta = await mongo.get('cuentas_cupo', id)
    const cantidad = request.body.cantidad

    if (cuenta !== null) {
        cuenta.saldo = Math.round((cuenta.saldo + cantidad) * 100) / 100
        const data = {
            id_entidad: cuenta.id_entidad,
            nroCuenta: cuenta.nroCuenta,
            saldo: cuenta.saldo
        }
        await mongo.update('cuentas_cupo', id, data)
        response.status(200).json({
            data: cuenta,
            message: 'Cuenta editada'
        })
    } else {
        response.status(404).json({
            id: id,
            message: 'No encontrado'
        })
    }
})

// desembolsar en una cuenta
router.patch('/api/cuentas_cupo/desembolsar/:id', async(request, response) => {
    if (!request.body.cantidad) {

        return response.status(400).json({
            error: 'No hay suficiente informacion'
        })
    }

    const id = request.params.id
    const cuenta = await mongo.get('cuentas_cupo', id)
    const cantidad = request.body.cantidad

    if (cuenta !== null) {
        cuenta.saldo = Math.round((cuenta.saldo - cantidad) * 100) / 100
        if (cuenta.saldo < 0) {
            response.status(400).json({
                id: id,
                message: 'Saldo insuficiente'
            })

        } else {
            const data = {
                id_entidad: cuenta.id_entidad,
                nroCuenta: cuenta.nroCuenta,
                saldo: cuenta.saldo
            }
            await mongo.update('cuentas_cupo', id, data)
            response.status(200).json({
                data: cuenta,
                message: 'Cuenta editada'
            })
        }
    } else {
        response.status(404).json({
            id: id,
            message: 'No encontrado'
        })
    }
})

export default router