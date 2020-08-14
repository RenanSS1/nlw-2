const Database = require('./database/db')

const { subjects, weekdays, getSubject, convertHoursToMinutes } = require('./utils/format')


function pageLanding(req, res) {
    return res.render("index.html")
}

async function pageStudy(req, res) {
    const filters = req.query

    if (!filters.subject || !filters.weekdays || !filters.time) {
        return res.render("study.html", { filters, subjects, weekdays })
    }

    //converter horas em minutos
    const timeToMinutes = convertHoursToMinutes(filters.time)

    const query = `
        SELECT classes.*, proffys.*
        FROM proffys
        JOIN classes ON (classes.proffy_id = proffys.id)
        WHERE EXISTS (
            SELECT class_schedule.*
            FROM class_schedule
            WHERE class_schedule.class_id = classes.id
            AND class_schedule.weekday = ${filters.weekdays}
            AND class_schedule.time_from <= ${timeToMinutes}
            AND class_schedule.time_to > ${timeToMinutes}
        )
        AND classes.subject = '${filters.subject}'
    `

    // caso haja erro na hora da consulta do banco de dados.
    try {
        const db = await Database
        const proffys = await db.all(query)

        return res.render('study.html', { proffys, subjects, filters, weekdays })

    } catch (error) {
        console.log(erro)
    }
}

function pageGiveClasses(req, res) {
    const data = req.query

    // se tiver dados (data)
    const isNotEmpty = Object.keys(data).length > 0
    if (isNotEmpty) {

        data.subject = getSubject(data.subject)

        //adicionar dados a lista de proffys
        proffys.push(data)

        return res.redirect("/study")
    }
    //se não, mostrar a pagina
    return res.render("give-classes.html", { subjects, weekdays })
}

module.exports = {
    pageLanding,
    pageStudy,
    pageGiveClasses
}