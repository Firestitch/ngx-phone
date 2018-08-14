const wait = require('../tools/node_modules/fs-base/Waiter')
const Phone = require('./Phone')


class BaseScenarioDataSet {
    constructor(controlID) {
        this.controlID = controlID;
    }
    toString() {
        return this.controlID;
    }
}


const all = require('../tools/testing/jasmine-ddt').all

describe('Phone input', function () {
    beforeAll(() => {
        browser.url('/')
    })

    all('Alphabetical symbols are not allowed', function* () {
        yield { controlID: 'form mat-form-field.mat-primary' };
    }, controlID => {
        const cut = new Phone(controlID)
        cut.value = 'aaaaaaaaaaa'
        expect(
            wait(cut.isValid.bind(cut))
                .toBe(false)
                .forTime(3)
                .start()
        ).toBeFalsy()
    })
    all('Partially filled input passes validation', function* () {
        yield { controlID: 'form mat-form-field.mat-primary' };
    }, controlID => {
        const cut = new Phone(controlID)
        cut.value = '123'
        expect(
            wait(cut.isValid.bind(cut))
                .toBe(true)
                .forTime(3)
                .start()
        ).toBeTruthy()
    })

    it('Is a fake tests that demonstrates multiple test failures', function () {
        expect(true).toBeFalsy()
        expect('abs').toBe('z')
    })
})