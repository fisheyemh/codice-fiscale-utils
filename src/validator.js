
const Omocode = require('./omocode.enum'),
    Parser = require('./parser'),
    VALIDATOR = require('./validator.const');

/**
 * @class Validator
 * @memberof CodiceFiscaleUtils
 */
class Validator {

    /**
     * Validation regexp for the given surname or generic
     * @param {string} surname Optional surname to generate validation regexp
     * @returns {RegExp} CF Surname matcher
     * @memberof CodiceFiscaleUtils.Validator
     */
    static cfSurname (surname) {

        let matcher = VALIDATOR.NAME_MATCHER;
        if (surname) {

            matcher = Parser.surnameToCf(surname) || matcher;

        }
        return new RegExp(`^${matcher}$`, 'iu');

    }

    /**
     * Validation regexp for the given name or generic
     * @param {string} name Optional name to generate validation regexp
     * @returns {RegExp} CF name matcher
     * @memberof CodiceFiscaleUtils.Validator
     */
    static cfName (name) {

        let matcher = VALIDATOR.NAME_MATCHER;
        if (name) {

            matcher = Parser.nameToCf(name) || matcher;

        }
        return new RegExp(`^${matcher}$`, 'iu');

    }

    /**
     * Validation regexp for the given year or generic
     * @param {number} year Optional year to generate validation regexp
     * @returns {RegExp} CF year matcher
     * @memberof CodiceFiscaleUtils.Validator
     */
    static cfYear (year) {

        let matcher = VALIDATOR.YEAR_MATCHER;
        if (year) {

            const parsedYear = Parser.yearToCf(year);
            if (parsedYear) {

                matcher = parsedYear.replace(
                    /\d/gu,
                    (yearNum) => `[${yearNum}${Omocode[yearNum]}]`
                );

            }

        }
        return new RegExp(`^${matcher}$`, 'iu');

    }

    /**
     * Validation regexp for the given month or generic
     * @param {number} month Optional month to generate validation regexp
     * @returns {RegExp} CF month matcher
     * @memberof CodiceFiscaleUtils.Validator
     */
    static cfMonth (month) {

        let matcher = VALIDATOR.MONTH_MATCHER;
        if (month) {

            matcher = Parser.monthToCf(month) || matcher;

        }
        return new RegExp(`^${matcher}$`, 'iu');

    }

    /**
     * Validation regexp for the given year or generic
     * @param {number} day Optional day to generate validation regexp
     * @returns {RegExp} CF day matcher
     * @memberof CodiceFiscaleUtils.Validator
     */
    static cfDay (day) {

        let matcher = VALIDATOR.DAY_MATCHER;
        if (day) {

            const parsedDayM = Parser.dayGenderToCf(day, 'M');
            if (parsedDayM) {

                const matcherF = Parser.dayGenderToCf(day, 'F').replace(
                        /\d/gu,
                        (dayNum) => `[${dayNum}${Omocode[dayNum]}]`
                    ),
                    matcherM = parsedDayM.replace(
                        /\d/gu,
                        (dayNum) => `[${dayNum}${Omocode[dayNum]}]`
                    );

                matcher = `(?:${matcherM})|(?:${matcherF})`;

            }

        }
        return new RegExp(`^${matcher}$`, 'iu');

    }

}

module.exports = Validator;
