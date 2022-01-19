import { ADDRESS_URL } from '../pages';
import AddressComponent from '../_models/Address.component';
import { mock } from './address.mocks';

let addressComponent = null;

fixture.only`Address (PostalCode)`.page(ADDRESS_URL).requestHooks([mock]);

test('should show error when switching from country that has valid postal code to one that has invalid postal code', async t => {
    addressComponent = new AddressComponent();
    await t.debug();
    await addressComponent.fillStreetInput('Simon Carmiggeltstraat');
});
