const CITIES_COUNTRIES = require('./asset/cities-countries.json'),
    moment = require('moment');

class Belfiore {


    /**
     *
     * @param {Object} param Static json
     * @param {Array<Array<Object>>} param.data
     * @param {Array<Array<Object>>} param.licenses
     * @memberof Belfiore
     */
    constructor ({data, licenses, activeDate, codeMatcher, province}) {

        if (codeMatcher && province) {

            throw new Error('Both codeMatcher and province were provided to Bolfiore, only one is allowed');

        }
        const hiddenValueConf = (value) => ({
            value,
            'enumerable': false,
            'configurable': false,
            'writable': false
        });

        Object.defineProperties(this, {
            '$data': hiddenValueConf(data),
            '$licenses': hiddenValueConf(licenses),
            '$activeDate': hiddenValueConf(activeDate),
            '$codeMatcher': hiddenValueConf(codeMatcher),
            '$province': hiddenValueConf(province)
        });
        return new Proxy(this, this.constructor);

    }

    /**
     * @returns {Array<Object>} List of places
     * @memberof Belfiore
     */
    toArray () {
        const ctr = this.constructor;
        return this.$data.
            map((resource) => Array.from(
                new Array(resource.belfioreCode.length / 3),
                (value, index) => ctr.locationByIndex(resource, index, {
                    'activeDate': this.$activeDate,
                    'codeMatcher': this.$codeMatcher,
                    'province': this.$province,
                    'licenses': this.$licenses
                })
            )).
            reduce((previousValue, currentValue) => previousValue.concat(currentValue)).
            filter((value) => Boolean(value));

    }

    /**
     * Search places matching given name
     * @param {string} place Place name
     * @return {Array<Object>}
     * @memberof Belfiore
     */
    searchByName (name) {

        if (!name || typeof name !== 'string') {

            return null;

        }
        const output = [];
        for (let g = 0; g < this.$data.length; g++) {

            const resourceData = this.$data[g],
                indexer = this.constructor.indexByName(resourceData.name, name);
            for (const index of indexer) {

                if (index >= 0) {

                    const roundItem = ctr.locationByIndex(resourceData, index, {
                        'activeDate': this.$activeDate,
                        'codeMatcher': this.$codeMatcher,
                        'province': this.$province,
                        'licenses': this.$licenses
                    });
                    if (roundItem) {

                        output.push(roundItem);

                    }

                }

            }

        }
        return output;

    }

    /**
     * Find place matching given name, retuns place object if provided name match only 1 result
     * @param {string} name Place name
     * @return {Object|null}
     * @memberof BelfioreGenericList
     * @memberof Belfiore
     */
    findByName (name) {

        if (!name || typeof name !== 'string') {

            throw new Error('[Belfiore.findByName] Provided name is not a string or it\'s empty');

        }
        const matcher = new RegExp(`^${name}$`, 'iu'),
            ctr = this.constructor;
        for (const resourceData of this.$data) {

            const indexer = ctr.indexByName(resourceData.name, matcher);
            for (const index of indexer) {

                const roundItem = ctr.locationByIndex(resourceData, index, {
                    'activeDate': this.$activeDate,
                    'codeMatcher': this.$codeMatcher,
                    'province': this.$province,
                    'licenses': this.$licenses
                });
                if (roundItem) {

                    return roundItem;

                }

            }

        }
        return null;

    }

    /**
     * Returns a Proxied version of Belfiore which filters results by given date
     * @param {string|Date|Moment|Array<number>} [date = moment()] Target date to filter places active only for the given date
     * @returns {Belfiore}
     */
    active (date = moment()) {

        const {$data, $licenses, $codeMatcher, $province} = this;
        return new Belfiore({
            'data': $data,
            'licenses': $licenses,
            'activeDate': moment(date),
            'province': $province,
            'codeMatcher': $codeMatcher
        });

    }

    /**
     * Returns a Belfiore instance filtered by the given province
     * @param {string} code
     * @returns {Belfiore}
     */
    byProvince (code) {

        if (!(typeof code === 'string' && (/^[A-Z]{2}$/u).test(code))) {

            return;

        }
        const {$data, $licenses, $activeDate} = this;
        return new Belfiore({
            'data': $data,
            'licenses': $licenses,
            'activeDate': $activeDate,
            'province': code
        });

    }

    /**
     * Returns a Proxied version of Belfiore which filters results by place type
     * @readonly
     * @returns {Belfiore}
     */
    get cities () {

        const {$data, $licenses, $activeDate} = this;
        return new Belfiore({
            'data': $data,
            'licenses': $licenses,
            'activeDate': $activeDate,
            'codeMatcher': /^[A-Y]/
        });

    }

    /**
     * Returns a Proxied version of Belfiore which filters results by place type
     * @readonly
     * @returns {Belfiore}
     */
    get countries () {

        const {$data, $licenses, $activeDate} = this;
        return new Belfiore({
            'data': $data,
            'licenses': $licenses,
            'activeDate': $activeDate,
            'codeMatcher': /^Z/
        });

    }

    /**
     * Get Proxy
     * @param {Object} resource target resource
     * @param {string|number|Symbol} name property name to proxy
     * @return {*}
     * @memberof Belfiore
     */
    static get (resource, paramName) {

        if (typeof paramName === 'string' && (/^[A-Z]\d{3}$/).test(paramName)) {

            const base32name = this.belfioreToInt(paramName).toString(32).
                padStart(3, '0');
            for (let g = 0; g < resource.$data.length; g++) {

                const resourceData = resource.$data[g],
                    index = this.binaryfindIndex(resourceData.belfioreCode, base32name);
                if (index >= 0) {

                    return this.locationByIndex(resourceData, index, {
                        'activeDate': resource.$activeDate,
                        'codeMatcher': resource.$codeMatcher,
                        'province': resource.$province,
                        'licenses': resource.$licenses
                    });

                }

            }

        }

        if (

            (resource.$codeMatcher || resource.$province) &&
                [
                    'cities',
                    'countries'
                ].includes(paramName) ||

                paramName === 'byProvince' &&
                (resource.$codeMatcher.test('Z000') || resource.$province)

        ) {

            return;

        }

        return resource[paramName];

    }

    /**
     * Binary find Index (works ONLY in sorted arrays)
     * @param {string} text
     * @param {string} value
     * @param {number} start
     * @param {number} end
     * @param {number} step
     * @returns {number} Found value Index, -1 if not found
     * @memberof Belfiore
     */
    static binaryfindIndex (text, value, start = 0, end = (text || '').length - 1) {

        const currentLength = end - start + 1;
        if (start > end || currentLength % value.length) {

            return -1;

        }
        const targetIndex = start + Math.floor(currentLength / (2 * value.length)) * value.length,
            targetValure = text.substr(targetIndex, value.length);
        if (targetValure === value) {

            return Math.ceil((targetIndex + 1) / value.length) - 1;

        }
        const goAhead = value > targetValure;
        return this.binaryfindIndex(text, value, goAhead ? targetIndex + value.length : start, goAhead ? end : targetIndex - 1);

    }

    /**
     * Converts belfiore code into an int
     * @param {string} code Belfiore Code
     * @return {number} Int version of belfiore code
     * @memberof Belfiore
     */
    static belfioreToInt (code) {

        return (code.charCodeAt() - 65) * 10 ** 3 + parseInt(code.substr(1));

    }

    /**
     * Converts int to belfiore code
     * @param {number} code Belfiore int code
     * @return {string} Standard belfiore code
     * @memberof Belfiore
     */
    static belfioreFromInt (code) {

        return `${String.fromCharCode(Math.floor(code / 10 ** 3) + 65)}${code.toString().substr(-3).
            padStart(3, '0')}`;

    }

    /**
     * Converst Base 32 number of days since 01/01/1861 to Moment instance
     * @param {string} base32daysFrom1861 Base 32 number of days from 1861-01-01
     * @returns {Moment} Moment instance date
     * @memberof Belfiore
     */
    static decodeDate (base32daysFrom1861) {

        return moment('1861-01-01').add(parseInt(base32daysFrom1861, 32), 'days');

    }

    /**
     * Retrieve string at index posizion
     * @param {string} list concatenation of names
     * @param {number} index target name index
     * @returns {string} index-th string
     * @memberof Belfiore
     */
    static nameByIndex (list, index, startIndex = 0) {

        const endIndex = list.indexOf('|', startIndex);
        if (index > 0) {

            return this.nameByIndex(list, index - 1, endIndex + 1);

        }
        return list.substring(startIndex, endIndex);

    }

    /**
     * Retrieve string at index posizion
     * @generator
     * @param {string} list concatenation of names
     * @param {string|RegExp} matcher target name index
     * @yields {number} index
     * @memberof Belfiore
     */
    static *indexByName (list, matcher) {

        if (typeof matcher === 'string') {

            matcher = new RegExp(matcher, 'iu');

        }
        const seekEntryEndIndex = (index) => list.indexOf('|', index + 1) + 1 || list.length;

        for (let entryIndex = 0, startIndex = 0; startIndex < list.length; entryIndex++) {

            const endIndex = seekEntryEndIndex(startIndex),
                targetName = list.substring(startIndex, endIndex - 1);
            if (matcher.test(targetName)) {

                yield entryIndex;

            }
            // Moving to next entry to chgeck
            startIndex = endIndex;

        }
        return -1;

    }

    /**
     * Retrieve location for the given index in the given subset
     * @param {string} resourceData concatenation of names
     * @param {number} index target name index
     * @returns {Object} location
     * @memberof Belfiore
     */
    static locationByIndex (resourceData, index, {activeDate, codeMatcher, province, licenses} = {}) {
        const belfioreIndex = index * 3;
        if (resourceData.belfioreCode.length - belfioreIndex < 3) {
            return null;
        }
        const belFioreInt = parseInt(resourceData.belfioreCode.substr(belfioreIndex, 3), '32'),
            belfioreCode = this.belfioreFromInt(belFioreInt);
        if (codeMatcher && !codeMatcher.test(belfioreCode)) {
            return null;
        }
        const code = resourceData.provinceOrCountry.substr(index * 2, 2);
        if (province && province !== code) {
            return null;
        }

        const dateIndex = index * 4,
            creationDate = this.decodeDate((resourceData.creationDate || '').substr(dateIndex, 4) || '0').startOf('day'),
            expirationDate = this.decodeDate((resourceData.expirationDate || '').substr(dateIndex, 4) || '2qn13').endOf('day');
        if (
            activeDate &&
            (
                resourceData.creationDate && activeDate.isBefore(creationDate, 'day') ||
                resourceData.expirationDate && activeDate.isAfter(expirationDate, 'day')
            )
        ) {
            return null;
        }
        const name = this.nameByIndex(resourceData.name, index),
            isCountry = belfioreCode[0] === 'Z',

            dataSource = licenses[parseInt(parseInt(resourceData.dataSource, 32).toString(2).
                padStart(resourceData.belfioreCode.length * 2 / 3, 0).
                substr(index * 2, 2), 2)];

        return {belfioreCode,
            name,
            'creationDate': creationDate.toDate(),
            'expirationDate': expirationDate.toDate(),
            dataSource,
            ...isCountry ? {
                'iso3166': code
            } : {
                'province': code
            }};
    }

}

/**
 * @name Belfiore
 * @returns {Object} Belfiore
 * @memberof CodiceFiscaleUtils
 */
module.exports = new Belfiore(CITIES_COUNTRIES);
