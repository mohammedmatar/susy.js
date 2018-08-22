import * as validate from './validate'
import { needsCalcOutput, sum } from './utilities'
import { calcSpan } from './math'

export function slice({ columns, location = 1, shouldValidate = true, span }) {
    if (shouldValidate) {
        columns = validate.validColumns(columns)
        location = validate.validLocation(location)
    }

    span = validate.validMeasure(span)

    const floor = Math.floor(span.length)
    const subColumns = columns.slice(location - 1, location - 1 + floor)

    if (floor !== span.length) {
        const remainder = span.length - floor
        const columnValue = columns.slice(location - 1 + floor)
        const columnMeasure = validate.validMeasure(columnValue)

        if (columnMeasure.unit) {
            subColumns.push(`${ columnMeasure.value * remainder }${ columnMeasure.unit }`)
        } else {
            subColumns.push(columnMeasure.value * remainder)
        }
    }

    return subColumns
}

export function span({ columns, containerSpread, gutters, location = 1, span, spread }) {
    containerSpread ||= spread

    span = validate.validSpan(span)
    columns = validate.validColumns(columns)
    gutters = validate.validGutters(gutters)
    spread = validate.validSpread(spread)

    if (typeof span === 'string' && /\w+$/.test(span)) {
        return span
    }

    if (typeof span === 'string' || typeof span === 'number') {
        location = validate.validLocation(location)
        span = slice({ columns, location, shouldValidate: false, span })
    }

    if (needsCalcOutput(span, columns, gutters, spread, false)) {
        return calcSpan(span, columns, gutters, spread, containerSpread, false)
    }

    const spanWidth = sum(span, gutters, spread, false)

    if (spanWidth.unit) {
        return `${ spanWidth.length }${ spanWidth.unit }`
    }

    containerSpread = validate.validSpread(containerSpread)
    const container = sum(columns, gutters, containerSpread, false)

    return `${ spanWidth.length / container.length * 100 }%`
}

export function gutter({ columns, containerSpread, gutters }) {
    if ((typeof gutters === 'number' || typeof gutters === 'string') && (gutters === 0 || /\w+$/.test(gutters))) {
        return gutters
    }

    if (needsCalcOutput(gutters, columns, gutters, -1, false)) {
        return calcSpan(gutters, columns, gutters, -1, containerSpread, false)
    }

    const container = sum(columns, gutters, containerSpread)
    gutters = validate.validMeasure(gutters)

    return `${ gutters.length / container.length * 100 }%`
}
