import createClickToPayService from './create-clicktopay-service';
import { CtpState } from './ClickToPayService';
import { IClickToPayService } from './types';
import { CardBackendConfiguration } from '../../../Card/types';

const ENVIRONMENT = 'test';

test('should not create the service if card `configuration` property is not provided', () => {
    let service: IClickToPayService,
        configuration = {};
    service = createClickToPayService(configuration, null, ENVIRONMENT);
    expect(service).toBeNull();

    configuration = null;
    service = createClickToPayService(configuration, null, ENVIRONMENT);
    expect(service).toBeNull();
});

test('should not create the service if Visa config properties are missing', () => {
    let service: IClickToPayService = null,
        configuration: CardBackendConfiguration = {
            visaSrciDpaId: 'xxxx'
        };
    service = createClickToPayService(configuration, null, ENVIRONMENT);
    expect(createClickToPayService(configuration, null, ENVIRONMENT)).toBeNull();

    configuration = {
        visaSrcInitiatorId: 'yyyy'
    };
    service = createClickToPayService(configuration, null, ENVIRONMENT);
    expect(service).toBeNull();
});

test('should not create the service if MC config properties are missing', () => {
    let service: IClickToPayService = null,
        configuration: CardBackendConfiguration = {
            mcDpaId: 'xxxx'
        };
    service = createClickToPayService(configuration, null, ENVIRONMENT);
    expect(createClickToPayService(configuration, null, ENVIRONMENT)).toBeNull();

    configuration = {
        mcSrcClientId: 'yyyy'
    };
    service = createClickToPayService(configuration, null, ENVIRONMENT);
    expect(service).toBeNull();
});

test('should create service if Visa config is set properly', () => {
    const configuration: CardBackendConfiguration = {
        visaSrciDpaId: 'xxx',
        visaSrcInitiatorId: 'yyyy'
    };
    const service = createClickToPayService(configuration, null, ENVIRONMENT);
    expect(service).toBeDefined();
});

test('should create service if MC config is set properly', () => {
    const configuration: CardBackendConfiguration = {
        mcSrcClientId: 'xxx',
        mcDpaId: 'yyyy'
    };
    const service = createClickToPayService(configuration, null, ENVIRONMENT);
    expect(service).toBeDefined();
});

test('should create service if MC config is set properly', () => {
    const configuration: CardBackendConfiguration = {
        mcSrcClientId: 'xxx',
        mcDpaId: 'yyyy',
        visaSrciDpaId: 'xxx',
        visaSrcInitiatorId: 'yyyy'
    };
    const service = createClickToPayService(configuration, null, ENVIRONMENT);
    expect(service).toBeDefined();
    expect(service.state).toBe(CtpState.Idle);
});
