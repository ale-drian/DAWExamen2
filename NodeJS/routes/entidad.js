import express from 'express'
import MongoDB from '../mongo'

const mongo = new MongoDB()

const router = express.Router()

// Listar entidades
router.get('/api/entidades', async(request, response) => {
    const entidades = await mongo.getAll('entidades')
    response.status(200).json({
        data: entidades,
        message: 'Entidades Listadas'
    })
})

// Obtener una sola entidad
router.get('/api/entidades/:id', async(request, response) => {
    const id = request.params.id
    const entidad = await mongo.get('entidades', id)
    if (entidad !== null) {
        response.status(200).json({
            data: entidad,
            message: 'Entidad listada'
        })
    } else {
        response.status(404).json({
            id: id,
            message: 'No encontrado'
        })
    }
})

// Insertar elemento
router.post('/api/entidades', async(request, response) => {
    if (!request.body.razon || !request.body.tipoDoc || !request.body.numeroDoc) {
        return response.status(400).json({
            error: 'No hay suficiente informacion'
        })
    }
    const entidad = {
        razon: request.body.razon,
        tipoDoc: request.body.tipoDoc,
        numeroDoc: request.body.numeroDoc
    }
    await mongo.create('entidades', entidad)
    response.status(201).json({
        data: entidad,
        message: 'Entidad agregada'
    })
})

// Actualizas elemento
router.patch('/api/entidades/:id', async(request, response) => {
    const id = request.params.id
    let entidad = await mongo.get('entidades', id)
    if (entidad !== null) {
        //Permite que se agregen los datos proporcionados para que no sea necesario indicar todos los datos
        entidad = {
            ...entidad,
            ...(request.body.razon && { razon: request.body.razon }),
            ...(request.body.tipoDoc && { tipoDoc: request.body.tipoDoc }),
            ...(request.body.numeroDoc && { numeroDoc: request.body.numeroDoc })
        }
        const data = {
            razon: entidad.razon,
            tipoDoc: entidad.tipoDoc,
            numeroDoc: entidad.numeroDoc
        }
        await mongo.update('entidades', id, data)
        response.status(200).json({
            data: entidad,
            message: 'Entidad editada'
        })
    } else {
        response.status(404).json({
            id: id,
            message: 'No encontrado'
        })
    }
})

// Eliminar entidad
router.delete('/api/entidades/:id', async(request, response) => {
    const id = request.params.id
    const eliminado = await mongo.delete('entidades', id)
    if (eliminado != null) {
        response.status(200).json({
            id: eliminado,
            message: 'Entidad eliminada'
        });
    } else {
        response.status(404).json({
            id: id,
            message: 'No encontrado'
        })
    }
});


export default router