import { mock } from 'jest-mock-extended';
import { Resources } from '../../src/core/Context/Resources';

export function setupResourceMock() {
    const resources = mock<Resources>();
    resources.getImage.mockImplementation(() => () => 'MOCK');
    return resources;
}

global.resources = setupResourceMock();
