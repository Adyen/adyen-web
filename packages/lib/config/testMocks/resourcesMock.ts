import { mock } from 'jest-mock-extended';
import { Resources } from '../../src/core/Context/Resources';
import getImage from '../../src/utils/get-image';

function setupResourceMock() {
    const resources = mock<Resources>();
    resources.getImage.mockImplementation(() => getImage({}));
    return resources;
}

global.resources = setupResourceMock();
