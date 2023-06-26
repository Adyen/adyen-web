import { render, h as h$1, options, createContext, Component, toChildArray, Fragment } from 'preact';
import classNames from 'classnames';

class AmazingModule {
    constructor(){
        // @ts-ignore ddasda  asd
        window.chiquedemais = new Object();
    }
    hello() {
        const a = {
            payButton: 'Pagar',
            'payButton.redirecting': 'Redirecionando...',
            'payButton.with': 'Pague %{value} com %{maskedData}',
            close: 'Fechar',
            storeDetails: 'Salvar para meu próximo pagamento',
            'creditCard.holderName': 'Nome no cartão',
            'creditCard.holderName.placeholder': 'J. Smith',
            'creditCard.holderName.invalid': 'Digite o nome conforme mostrado no cartão',
            'creditCard.numberField.title': 'Número do cartão',
            'creditCard.expiryDateField.title': 'Data de validade',
            'creditCard.expiryDateField.placeholder': 'MM/AA',
            'creditCard.expiryDateField.month': 'Mês',
            'creditCard.expiryDateField.month.placeholder': 'MM',
            'creditCard.expiryDateField.year.placeholder': 'AA',
            'creditCard.expiryDateField.year': 'Ano',
            'creditCard.cvcField.title': 'Código de segurança',
            'creditCard.storeDetailsButton': 'Lembrar para a próxima vez',
            'creditCard.cvcField.placeholder.4digits': '4 dígitos',
            'creditCard.cvcField.placeholder.3digits': '3 dígitos',
            'creditCard.taxNumber.placeholder': 'AAAMMDD / 0123456789',
            installments: 'Opções de Parcelamento',
            installmentOption: '%{times}x %{partialValue}',
            installmentOptionMonths: '%{times} meses',
            'installments.oneTime': 'Pagamento à vista',
            'installments.installments': 'Pagamento parcelado',
            'installments.revolving': 'Pagamento rotativo',
            'sepaDirectDebit.ibanField.invalid': 'Número de conta inválido',
            'sepaDirectDebit.nameField.placeholder': 'J. Silva',
            'sepa.ownerName': 'Nome do titular da conta bancária',
            'sepa.ibanNumber': 'Número de conta (NIB)',
            'error.title': 'Erro',
            'error.subtitle.redirect': 'Falha no redirecionamento',
            'error.subtitle.payment': 'Falha no pagamento',
            'error.subtitle.refused': 'Pagamento recusado',
            'error.message.unknown': 'Ocorreu um erro desconhecido',
            'errorPanel.title': 'Erros existentes',
            'idealIssuer.selectField.title': 'Banco',
            'idealIssuer.selectField.placeholder': 'Selecione seu banco',
            'creditCard.success': 'Pagamento bem-sucedido',
            loading: 'Carregando...',
            continue: 'Continuar',
            continueTo: 'Continuar para',
            'wechatpay.timetopay': 'Você tem %@ para pagar',
            'wechatpay.scanqrcode': 'Escanear código QR',
            personalDetails: 'Informações pessoais',
            companyDetails: 'Dados da empresa',
            'companyDetails.name': 'Nome da empresa',
            'companyDetails.registrationNumber': 'Número de registro',
            socialSecurityNumber: 'CPF',
            firstName: 'Nome',
            'firstName.invalid': 'Digite seu nome',
            infix: 'Prefixo',
            lastName: 'Sobrenome',
            'lastName.invalid': 'Digite seu sobrenome',
            mobileNumber: 'Celular',
            'mobileNumber.invalid': 'Número de celular inválido',
            city: 'Cidade',
            postalCode: 'CEP',
            'postalCode.optional': 'Código postal (opcional)',
            countryCode: 'Código do país',
            telephoneNumber: 'Número de telefone',
            dateOfBirth: 'Data de nascimento',
            shopperEmail: 'Endereço de e-mail',
            gender: 'Gênero',
            'gender.notselected': 'Selecione um gênero',
            male: 'Masculino',
            female: 'Feminino',
            billingAddress: 'Endereço de cobrança',
            street: 'Rua',
            stateOrProvince: 'Estado ou província',
            country: 'País',
            houseNumberOrName: 'Número da casa',
            separateDeliveryAddress: 'Especificar um endereço de entrega separado',
            deliveryAddress: 'Endereço de entrega',
            zipCode: 'Código postal',
            apartmentSuite: 'Apartamento/Conjunto',
            provinceOrTerritory: 'Província ou território',
            cityTown: 'Cidade',
            address: 'Endereço',
            state: 'Estado',
            'field.title.optional': '(opcional)',
            'creditCard.cvcField.title.optional': 'Código de segurança (opcional)',
            'issuerList.wallet.placeholder': 'Selecione uma carteira',
            privacyPolicy: 'Política de Privacidade',
            'afterPay.agreement': 'Eu concordo com as %@ do AfterPay',
            paymentConditions: 'condições de pagamento',
            openApp: 'Abrir o aplicativo',
            'voucher.readInstructions': 'Leia as instruções',
            'voucher.introduction': 'Obrigado pela sua compra, use o cupom a seguir para concluir o seu pagamento.',
            'voucher.expirationDate': 'Data de validade',
            'voucher.alternativeReference': 'Referência alternativa',
            'dragonpay.voucher.non.bank.selectField.placeholder': 'Selecione o seu fornecedor',
            'dragonpay.voucher.bank.selectField.placeholder': 'Selecione seu banco',
            'voucher.paymentReferenceLabel': 'Referência de pagamento',
            'voucher.surcharge': 'Inclui %@ de sobretaxa',
            'voucher.introduction.doku': 'Obrigado pela sua compra, use a informação a seguir para concluir o seu pagamento.',
            'voucher.shopperName': 'Nome do consumidor',
            'voucher.merchantName': 'Comerciante online',
            'voucher.introduction.econtext': 'Obrigado pela sua compra, use a informação a seguir para concluir o seu pagamento.',
            'voucher.telephoneNumber': 'Número de telefone',
            'voucher.shopperReference': 'Referência do consumidor',
            'voucher.collectionInstitutionNumber': 'Número da instituição de cobrança',
            'voucher.econtext.telephoneNumber.invalid': 'O número de telefone deve ter 10 ou 11 dígitos',
            'boletobancario.btnLabel': 'Gerar Boleto',
            'boleto.sendCopyToEmail': 'Enviar uma cópia por e-mail',
            'button.copy': 'Copiar',
            'button.download': 'Baixar',
            'boleto.socialSecurityNumber.invalid': 'O campo não é válido',
            'creditCard.storedCard.description.ariaLabel': 'O cartão armazenado termina em %@',
            'voucher.entity': 'Entidade',
            donateButton: 'Doar',
            notNowButton: 'Agora não',
            thanksForYourSupport: 'Obrigado pelo apoio!',
            preauthorizeWith: 'Pré-autorizar com',
            confirmPreauthorization: 'Confirmar pré-autorização',
            confirmPurchase: 'Confirmar compra',
            applyGiftcard: 'Resgatar',
            giftcardBalance: 'Saldo do vale-presente',
            deductedBalance: 'Saldo debitado',
            'creditCard.pin.title': 'Pin',
            'creditCard.encryptedPassword.label': 'Primeiros dois dígitos da senha do cartão',
            'creditCard.encryptedPassword.invalid': 'Senha inválida',
            'creditCard.taxNumber': 'Data de nascimento do titular do cartão ou número de registro corporativo',
            'creditCard.taxNumber.label': 'Data de nascimento do titular do cartão (AAMMDD) ou número de registro corporativo (10 dígitos)',
            'creditCard.taxNumber.labelAlt': 'Número de registro corporativo (10 dígitos)',
            'creditCard.taxNumber.invalid': 'Data de nascimento do titular do cartão ou número de registro corporativo inválidos',
            'storedPaymentMethod.disable.button': 'Remover',
            'storedPaymentMethod.disable.confirmation': 'Remover método de pagamento armazenado',
            'storedPaymentMethod.disable.confirmButton': 'Sim, remover',
            'storedPaymentMethod.disable.cancelButton': 'Cancelar',
            'ach.bankAccount': 'Conta bancária',
            'ach.accountHolderNameField.title': 'Nome do titular da conta',
            'ach.accountHolderNameField.placeholder': 'J. Smith',
            'ach.accountHolderNameField.invalid': 'Nome do titular da conta inválido',
            'ach.accountNumberField.title': 'Número da conta',
            'ach.accountNumberField.invalid': 'Número de conta inválido',
            'ach.accountLocationField.title': 'Número de roteamento ABA',
            'ach.accountLocationField.invalid': 'Número de roteamento ABA inválido',
            'ach.savedBankAccount': 'Conta bancária cadastrada',
            'select.state': 'Selecionar estado',
            'select.stateOrProvince': 'Selecione estado ou província',
            'select.provinceOrTerritory': 'Selecionar província ou território',
            'select.country': 'Selecione o país',
            'select.noOptionsFound': 'Nenhuma opção encontrada',
            'select.filter.placeholder': 'Pesquisar...',
            'telephoneNumber.invalid': 'Número de telefone inválido',
            qrCodeOrApp: 'ou',
            'paypal.processingPayment': 'Processando pagamento...',
            generateQRCode: 'Gerar código QR',
            'await.waitForConfirmation': 'Aguardando confirmação',
            'mbway.confirmPayment': 'Confirme seu pagamento no aplicativo MB WAY',
            'shopperEmail.invalid': 'Endereço de e-mail inválido',
            'dateOfBirth.format': 'DD/MM/AAAA',
            'dateOfBirth.invalid': 'Você deve ter pelo menos 18 anos',
            'blik.confirmPayment': 'Abra o aplicativo do seu banco para confirmar o pagamento.',
            'blik.invalid': 'Digite 6 números',
            'blik.code': 'Código de 6 dígitos',
            'blik.help': 'Obtenha o código no aplicativo do seu banco.',
            'swish.pendingMessage': 'Depois de escanear o QR, o status pode ficar pendente por até 10 minutos. Não tente refazer o pagamento antes desse período para evitar cobrança duplicada.',
            'field.valid': 'Campo válido',
            'field.invalid': 'Campo inválido',
            'error.va.gen.01': 'Campo incompleto',
            'error.va.gen.02': 'Campo inválido',
            'error.va.sf-cc-num.01': 'Digite um número de cartão válido',
            'error.va.sf-cc-num.02': 'Digite o número do cartão',
            'error.va.sf-cc-num.03': 'Digite uma bandeira de cartão aceita',
            'error.va.sf-cc-num.04': 'Digite o número completo do cartão',
            'error.va.sf-cc-dat.01': 'Digite uma data válida',
            'error.va.sf-cc-dat.02': 'Digite uma data válida',
            'error.va.sf-cc-dat.03': 'Cartão de crédito prestes a vencer',
            'error.va.sf-cc-dat.04': 'Digite a data de validade',
            'error.va.sf-cc-dat.05': 'Digite a data de validade completa',
            'error.va.sf-cc-mth.01': 'Digite o mês de validade',
            'error.va.sf-cc-yr.01': 'Digite o ano de validade',
            'error.va.sf-cc-yr.02': 'Digite o ano de validade completo',
            'error.va.sf-cc-cvc.01': 'Digite o código de segurança',
            'error.va.sf-cc-cvc.02': 'Digite o código de segurança completo',
            'error.va.sf-ach-num.01': 'O campo do número da conta bancária está vazio',
            'error.va.sf-ach-num.02': 'O número da conta bancária tem o comprimento errado',
            'error.va.sf-ach-loc.01': 'O campo do número de identificação do banco está vazio',
            'error.va.sf-ach-loc.02': 'O número de identificação do banco tem o comprimento errado',
            'error.va.sf-kcp-pwd.01': 'O campo da senha está vazio',
            'error.va.sf-kcp-pwd.02': 'A senha tem o comprimento errado',
            'error.giftcard.no-balance': 'Este vale-presente tem saldo zero',
            'error.giftcard.card-error': 'Não existe um vale-presente com esse número em nossos registros',
            'error.giftcard.currency-error': 'Os vales-presente são válidos somente na moeda em que foram emitidos',
            'amazonpay.signout': 'Sair do Amazon',
            'amazonpay.changePaymentDetails': 'Alterar dados de pagamento',
            'partialPayment.warning': 'Selecione outro método de pagamento para pagar o restante',
            'partialPayment.remainingBalance': 'O saldo restante será %{amount}',
            'bankTransfer.beneficiary': 'Beneficiário',
            'bankTransfer.iban': 'IBAN',
            'bankTransfer.bic': 'BIC',
            'bankTransfer.reference': 'Referência',
            'bankTransfer.introduction': 'Continue criando o novo pagamento por transferência bancária. Use as informações na tela a seguir para concluí-lo.',
            'bankTransfer.instructions': 'Obrigado pela sua compra, use a informação a seguir para concluir o seu pagamento.',
            'bacs.accountHolderName': 'Nome do titular da conta bancária',
            'bacs.accountHolderName.invalid': 'Nome do titular da conta bancária inválido',
            'bacs.accountNumber': 'Número da conta bancária',
            'bacs.accountNumber.invalid': 'Número da conta bancária inválido',
            'bacs.bankLocationId': 'Código de classificação',
            'bacs.bankLocationId.invalid': 'Código de classificação inválido',
            'bacs.consent.amount': 'Concordo que o valor acima seja deduzido da minha conta bancária.',
            'bacs.consent.account': 'Confirmo que a conta está em meu nome e que sou o único signatário que deve autorizar o débito direto nessa conta.',
            edit: 'Editar',
            'bacs.confirm': 'Confirmar e pagar',
            'bacs.result.introduction': 'Baixar instrução de débito direto (DDI)',
            'download.pdf': 'Baixar PDF',
            'creditCard.encryptedCardNumber.aria.iframeTitle': 'Iframe para número do cartão',
            'creditCard.encryptedCardNumber.aria.label': 'Número do cartão',
            'creditCard.encryptedExpiryDate.aria.iframeTitle': 'Iframe para data de validade',
            'creditCard.encryptedExpiryDate.aria.label': 'Data de validade',
            'creditCard.encryptedExpiryMonth.aria.iframeTitle': 'Iframe para mês de validade',
            'creditCard.encryptedExpiryMonth.aria.label': 'Mês de vencimento',
            'creditCard.encryptedExpiryYear.aria.iframeTitle': 'Iframe para ano de validade',
            'creditCard.encryptedExpiryYear.aria.label': 'Ano de vencimento',
            'creditCard.encryptedSecurityCode.aria.iframeTitle': 'Iframe para código de segurança',
            'creditCard.encryptedSecurityCode.aria.label': 'Código de segurança',
            'creditCard.encryptedPassword.aria.iframeTitle': 'Iframe para senha',
            'creditCard.encryptedPassword.aria.label': 'Primeiros dois dígitos da senha do cartão',
            'giftcard.encryptedCardNumber.aria.iframeTitle': 'Iframe para número do cartão',
            'giftcard.encryptedCardNumber.aria.label': 'Número do cartão',
            'giftcard.encryptedSecurityCode.aria.iframeTitle': 'Iframe para pin',
            'giftcard.encryptedSecurityCode.aria.label': 'Pin',
            giftcardTransactionLimit: 'Máximo de %{amount} permitido por transação neste cartão-presente',
            'ach.encryptedBankAccountNumber.aria.iframeTitle': 'Iframe para número da conta bancária',
            'ach.encryptedBankAccountNumber.aria.label': 'Número da conta',
            'ach.encryptedBankLocationId.aria.iframeTitle': 'Iframe para número de identificação do banco',
            'ach.encryptedBankLocationId.aria.label': 'Número de roteamento ABA',
            'pix.instructions': 'Abra o app com sua chave PIX cadastrada, escolha Pagar com Pix e escaneie o QR Code ou copie e cole o código',
            'twint.saved': 'salvo',
            orPayWith: 'ou pague com',
            invalidFormatExpects: 'Formato inválido. Formato esperado: %{format}',
            'upi.qrCodeWaitingMessage': 'Escaneie o QR code com o aplicativo UPI de sua preferência para concluir o pagamento',
            'upi.vpaWaitingMessage': 'Abra o aplicativo UPI para confirmar o pagamento',
            'upi.modeSelection': 'Selecione como você gostaria de usar o UPI.',
            'onlineBanking.termsAndConditions': 'Ao continuar, você concorda com os %#termos e condições%#',
            'onlineBankingPL.termsAndConditions': 'Ao continuar, você concorda com as %#condições%# e as %#informações obrigatórias%# da Przelewy24',
            'ctp.loading.poweredByCtp': 'Desenvolvido por Click to Pay',
            'ctp.loading.intro': 'Estamos verificando se você tem algum cartão salvo no Click to Pay...',
            'ctp.login.title': 'Continuar para o Click to Pay',
            'ctp.login.subtitle': 'Digite o endereço de e-mail associado ao Click to Pay para continuar.',
            'ctp.login.inputLabel': 'E-mail',
            'ctp.logout.notYou': 'Não é você?',
            'ctp.logout.notYourCards': 'Não é o seu cartão?',
            'ctp.logout.notYourCard': 'Não é o seu cartão?',
            'ctp.logout.notYourProfile': 'Não é o seu perfil?',
            'ctp.otp.fieldLabel': 'Código de acesso único',
            'ctp.otp.resendCode': 'Reenviar código',
            'ctp.otp.codeResent': 'Código reenviado',
            'ctp.otp.title': 'Acesse seus cartões Click to Pay',
            'ctp.otp.subtitle': 'Digite o código %@ enviado para %@ para confirmar que é você.',
            'ctp.emptyProfile.message': 'Não há nenhum cartão cadastrado neste perfil do Click to Pay',
            'ctp.separatorText': 'ou use',
            'ctp.cards.title': 'Concluir o pagamento com o Click to Pay',
            'ctp.cards.subtitle': 'Selecione um cartão para usar.',
            'ctp.cards.expiredCard': 'Vencido',
            'ctp.manualCardEntry': 'Entrada manual do cartão',
            'ctp.aria.infoModalButton': 'O que é Click to Pay',
            'ctp.infoPopup.title': 'O Click to Pay traz a facilidade do pagamento online sem contato',
            'ctp.infoPopup.subtitle': 'Um método de pagamento rápido e seguro, compatível com Mastercard, Visa e outros cartões.',
            'ctp.infoPopup.benefit1': 'O Click to Pay usa criptografia para manter suas informações seguras e protegidas',
            'ctp.infoPopup.benefit2': 'Use com comerciantes no mundo todo',
            'ctp.infoPopup.benefit3': 'Configure apenas uma vez e simplifique seus pagamentos no futuro',
            'ctp.errors.AUTH_INVALID': 'Autenticação inválida',
            'ctp.errors.NOT_FOUND': 'Nenhuma conta foi encontrada. Informe um e-mail válido ou continue inserindo os dados do cartão manualmente',
            'ctp.errors.ID_FORMAT_UNSUPPORTED': 'Formato não compatível',
            'ctp.errors.FRAUD': 'A conta do usuário foi bloqueada ou desativada',
            'ctp.errors.CONSUMER_ID_MISSING': 'A identidade do consumidor está ausente na solicitação',
            'ctp.errors.ACCT_INACCESSIBLE': 'Esta conta não está disponível no momento. Ela pode estar bloqueada, por exemplo',
            'ctp.errors.CODE_INVALID': 'Código de verificação incorreto',
            'ctp.errors.CODE_EXPIRED': 'Esse código expirou',
            'ctp.errors.RETRIES_EXCEEDED': 'O limite de tentativas para gerar a senha de uso único foi excedido',
            'ctp.errors.OTP_SEND_FAILED': 'Não foi possível enviar a senha de uso único ao destinatário',
            'ctp.errors.REQUEST_TIMEOUT': 'Algo deu errado. Tente de novo ou insira os dados do cartão manualmente',
            'ctp.errors.UNKNOWN_ERROR': 'Algo deu errado. Tente de novo ou insira os dados do cartão manualmente',
            'ctp.errors.SERVICE_ERROR': 'Algo deu errado. Tente de novo ou insira os dados do cartão manualmente',
            'ctp.errors.SERVER_ERROR': 'Algo deu errado. Tente de novo ou insira os dados do cartão manualmente',
            'ctp.errors.INVALID_PARAMETER': 'Algo deu errado. Tente de novo ou insira os dados do cartão manualmente',
            'ctp.errors.AUTH_ERROR': 'Algo deu errado. Tente de novo ou insira os dados do cartão manualmente',
            'paymentMethodsList.aria.label': 'Escolha um método de pagamento',
            'companyDetails.name.invalid': 'Digite o nome da empresa',
            'companyDetails.registrationNumber.invalid': 'Digite o número de registro',
            'consent.checkbox.invalid': 'Você precisa concordar com os termos e condições'
        };
        return a;
    }
}

class CrazyModule {
    hello() {
        const a = {
            payButton: 'Pagar',
            'payButton.redirecting': 'Redirecionando...',
            'payButton.with': 'Pague %{value} com %{maskedData}',
            close: 'Fechar',
            storeDetails: 'Salvar para meu próximo pagamento',
            'creditCard.holderName': 'Nome no cartão',
            'creditCard.holderName.placeholder': 'J. Smith',
            'creditCard.holderName.invalid': 'Digite o nome conforme mostrado no cartão',
            'creditCard.numberField.title': 'Número do cartão',
            'creditCard.expiryDateField.title': 'Data de validade',
            'creditCard.expiryDateField.placeholder': 'MM/AA',
            'creditCard.expiryDateField.month': 'Mês',
            'creditCard.expiryDateField.month.placeholder': 'MM',
            'creditCard.expiryDateField.year.placeholder': 'AA',
            'creditCard.expiryDateField.year': 'Ano',
            'creditCard.cvcField.title': 'Código de segurança',
            'creditCard.storeDetailsButton': 'Lembrar para a próxima vez',
            'creditCard.cvcField.placeholder.4digits': '4 dígitos',
            'creditCard.cvcField.placeholder.3digits': '3 dígitos',
            'creditCard.taxNumber.placeholder': 'AAAMMDD / 0123456789',
            installments: 'Opções de Parcelamento',
            installmentOption: '%{times}x %{partialValue}',
            installmentOptionMonths: '%{times} meses',
            'installments.oneTime': 'Pagamento à vista',
            'installments.installments': 'Pagamento parcelado',
            'installments.revolving': 'Pagamento rotativo',
            'sepaDirectDebit.ibanField.invalid': 'Número de conta inválido',
            'sepaDirectDebit.nameField.placeholder': 'J. Silva',
            'sepa.ownerName': 'Nome do titular da conta bancária',
            'sepa.ibanNumber': 'Número de conta (NIB)',
            'error.title': 'Erro',
            'error.subtitle.redirect': 'Falha no redirecionamento',
            'error.subtitle.payment': 'Falha no pagamento',
            'error.subtitle.refused': 'Pagamento recusado',
            'error.message.unknown': 'Ocorreu um erro desconhecido',
            'errorPanel.title': 'Erros existentes',
            'idealIssuer.selectField.title': 'Banco',
            'idealIssuer.selectField.placeholder': 'Selecione seu banco',
            'creditCard.success': 'Pagamento bem-sucedido',
            loading: 'Carregando...',
            continue: 'Continuar',
            continueTo: 'Continuar para',
            'wechatpay.timetopay': 'Você tem %@ para pagar',
            'wechatpay.scanqrcode': 'Escanear código QR',
            personalDetails: 'Informações pessoais',
            companyDetails: 'Dados da empresa',
            'companyDetails.name': 'Nome da empresa',
            'companyDetails.registrationNumber': 'Número de registro',
            socialSecurityNumber: 'CPF',
            firstName: 'Nome',
            'firstName.invalid': 'Digite seu nome',
            infix: 'Prefixo',
            lastName: 'Sobrenome',
            'lastName.invalid': 'Digite seu sobrenome',
            mobileNumber: 'Celular',
            'mobileNumber.invalid': 'Número de celular inválido',
            city: 'Cidade',
            postalCode: 'CEP',
            'postalCode.optional': 'Código postal (opcional)',
            countryCode: 'Código do país',
            telephoneNumber: 'Número de telefone',
            dateOfBirth: 'Data de nascimento',
            shopperEmail: 'Endereço de e-mail',
            gender: 'Gênero',
            'gender.notselected': 'Selecione um gênero',
            male: 'Masculino',
            female: 'Feminino',
            billingAddress: 'Endereço de cobrança',
            street: 'Rua',
            stateOrProvince: 'Estado ou província',
            country: 'País',
            houseNumberOrName: 'Número da casa',
            separateDeliveryAddress: 'Especificar um endereço de entrega separado',
            deliveryAddress: 'Endereço de entrega',
            zipCode: 'Código postal',
            apartmentSuite: 'Apartamento/Conjunto',
            provinceOrTerritory: 'Província ou território',
            cityTown: 'Cidade',
            address: 'Endereço',
            state: 'Estado',
            'field.title.optional': '(opcional)',
            'creditCard.cvcField.title.optional': 'Código de segurança (opcional)',
            'issuerList.wallet.placeholder': 'Selecione uma carteira',
            privacyPolicy: 'Política de Privacidade',
            'afterPay.agreement': 'Eu concordo com as %@ do AfterPay',
            paymentConditions: 'condições de pagamento',
            openApp: 'Abrir o aplicativo',
            'voucher.readInstructions': 'Leia as instruções',
            'voucher.introduction': 'Obrigado pela sua compra, use o cupom a seguir para concluir o seu pagamento.',
            'voucher.expirationDate': 'Data de validade',
            'voucher.alternativeReference': 'Referência alternativa',
            'dragonpay.voucher.non.bank.selectField.placeholder': 'Selecione o seu fornecedor',
            'dragonpay.voucher.bank.selectField.placeholder': 'Selecione seu banco',
            'voucher.paymentReferenceLabel': 'Referência de pagamento',
            'voucher.surcharge': 'Inclui %@ de sobretaxa',
            'voucher.introduction.doku': 'Obrigado pela sua compra, use a informação a seguir para concluir o seu pagamento.',
            'voucher.shopperName': 'Nome do consumidor',
            'voucher.merchantName': 'Comerciante online',
            'voucher.introduction.econtext': 'Obrigado pela sua compra, use a informação a seguir para concluir o seu pagamento.',
            'voucher.telephoneNumber': 'Número de telefone',
            'voucher.shopperReference': 'Referência do consumidor',
            'voucher.collectionInstitutionNumber': 'Número da instituição de cobrança',
            'voucher.econtext.telephoneNumber.invalid': 'O número de telefone deve ter 10 ou 11 dígitos',
            'boletobancario.btnLabel': 'Gerar Boleto',
            'boleto.sendCopyToEmail': 'Enviar uma cópia por e-mail',
            'button.copy': 'Copiar',
            'button.download': 'Baixar',
            'boleto.socialSecurityNumber.invalid': 'O campo não é válido',
            'creditCard.storedCard.description.ariaLabel': 'O cartão armazenado termina em %@',
            'voucher.entity': 'Entidade',
            donateButton: 'Doar',
            notNowButton: 'Agora não',
            thanksForYourSupport: 'Obrigado pelo apoio!',
            preauthorizeWith: 'Pré-autorizar com',
            confirmPreauthorization: 'Confirmar pré-autorização',
            confirmPurchase: 'Confirmar compra',
            applyGiftcard: 'Resgatar',
            giftcardBalance: 'Saldo do vale-presente',
            deductedBalance: 'Saldo debitado',
            'creditCard.pin.title': 'Pin',
            'creditCard.encryptedPassword.label': 'Primeiros dois dígitos da senha do cartão',
            'creditCard.encryptedPassword.invalid': 'Senha inválida',
            'creditCard.taxNumber': 'Data de nascimento do titular do cartão ou número de registro corporativo',
            'creditCard.taxNumber.label': 'Data de nascimento do titular do cartão (AAMMDD) ou número de registro corporativo (10 dígitos)',
            'creditCard.taxNumber.labelAlt': 'Número de registro corporativo (10 dígitos)',
            'creditCard.taxNumber.invalid': 'Data de nascimento do titular do cartão ou número de registro corporativo inválidos',
            'storedPaymentMethod.disable.button': 'Remover',
            'storedPaymentMethod.disable.confirmation': 'Remover método de pagamento armazenado',
            'storedPaymentMethod.disable.confirmButton': 'Sim, remover',
            'storedPaymentMethod.disable.cancelButton': 'Cancelar',
            'ach.bankAccount': 'Conta bancária',
            'ach.accountHolderNameField.title': 'Nome do titular da conta',
            'ach.accountHolderNameField.placeholder': 'J. Smith',
            'ach.accountHolderNameField.invalid': 'Nome do titular da conta inválido',
            'ach.accountNumberField.title': 'Número da conta',
            'ach.accountNumberField.invalid': 'Número de conta inválido',
            'ach.accountLocationField.title': 'Número de roteamento ABA',
            'ach.accountLocationField.invalid': 'Número de roteamento ABA inválido',
            'ach.savedBankAccount': 'Conta bancária cadastrada',
            'select.state': 'Selecionar estado',
            'select.stateOrProvince': 'Selecione estado ou província',
            'select.provinceOrTerritory': 'Selecionar província ou território',
            'select.country': 'Selecione o país',
            'select.noOptionsFound': 'Nenhuma opção encontrada',
            'select.filter.placeholder': 'Pesquisar...',
            'telephoneNumber.invalid': 'Número de telefone inválido',
            qrCodeOrApp: 'ou',
            'paypal.processingPayment': 'Processando pagamento...',
            generateQRCode: 'Gerar código QR',
            'await.waitForConfirmation': 'Aguardando confirmação',
            'mbway.confirmPayment': 'Confirme seu pagamento no aplicativo MB WAY',
            'shopperEmail.invalid': 'Endereço de e-mail inválido',
            'dateOfBirth.format': 'DD/MM/AAAA',
            'dateOfBirth.invalid': 'Você deve ter pelo menos 18 anos',
            'blik.confirmPayment': 'Abra o aplicativo do seu banco para confirmar o pagamento.',
            'blik.invalid': 'Digite 6 números',
            'blik.code': 'Código de 6 dígitos',
            'blik.help': 'Obtenha o código no aplicativo do seu banco.',
            'swish.pendingMessage': 'Depois de escanear o QR, o status pode ficar pendente por até 10 minutos. Não tente refazer o pagamento antes desse período para evitar cobrança duplicada.',
            'field.valid': 'Campo válido',
            'field.invalid': 'Campo inválido',
            'error.va.gen.01': 'Campo incompleto',
            'error.va.gen.02': 'Campo inválido',
            'error.va.sf-cc-num.01': 'Digite um número de cartão válido',
            'error.va.sf-cc-num.02': 'Digite o número do cartão',
            'error.va.sf-cc-num.03': 'Digite uma bandeira de cartão aceita',
            'error.va.sf-cc-num.04': 'Digite o número completo do cartão',
            'error.va.sf-cc-dat.01': 'Digite uma data válida',
            'error.va.sf-cc-dat.02': 'Digite uma data válida',
            'error.va.sf-cc-dat.03': 'Cartão de crédito prestes a vencer',
            'error.va.sf-cc-dat.04': 'Digite a data de validade',
            'error.va.sf-cc-dat.05': 'Digite a data de validade completa',
            'error.va.sf-cc-mth.01': 'Digite o mês de validade',
            'error.va.sf-cc-yr.01': 'Digite o ano de validade',
            'error.va.sf-cc-yr.02': 'Digite o ano de validade completo',
            'error.va.sf-cc-cvc.01': 'Digite o código de segurança',
            'error.va.sf-cc-cvc.02': 'Digite o código de segurança completo',
            'error.va.sf-ach-num.01': 'O campo do número da conta bancária está vazio',
            'error.va.sf-ach-num.02': 'O número da conta bancária tem o comprimento errado',
            'error.va.sf-ach-loc.01': 'O campo do número de identificação do banco está vazio',
            'error.va.sf-ach-loc.02': 'O número de identificação do banco tem o comprimento errado',
            'error.va.sf-kcp-pwd.01': 'O campo da senha está vazio',
            'error.va.sf-kcp-pwd.02': 'A senha tem o comprimento errado',
            'error.giftcard.no-balance': 'Este vale-presente tem saldo zero',
            'error.giftcard.card-error': 'Não existe um vale-presente com esse número em nossos registros',
            'error.giftcard.currency-error': 'Os vales-presente são válidos somente na moeda em que foram emitidos',
            'amazonpay.signout': 'Sair do Amazon',
            'amazonpay.changePaymentDetails': 'Alterar dados de pagamento',
            'partialPayment.warning': 'Selecione outro método de pagamento para pagar o restante',
            'partialPayment.remainingBalance': 'O saldo restante será %{amount}',
            'bankTransfer.beneficiary': 'Beneficiário',
            'bankTransfer.iban': 'IBAN',
            'bankTransfer.bic': 'BIC',
            'bankTransfer.reference': 'Referência',
            'bankTransfer.introduction': 'Continue criando o novo pagamento por transferência bancária. Use as informações na tela a seguir para concluí-lo.',
            'bankTransfer.instructions': 'Obrigado pela sua compra, use a informação a seguir para concluir o seu pagamento.',
            'bacs.accountHolderName': 'Nome do titular da conta bancária',
            'bacs.accountHolderName.invalid': 'Nome do titular da conta bancária inválido',
            'bacs.accountNumber': 'Número da conta bancária',
            'bacs.accountNumber.invalid': 'Número da conta bancária inválido',
            'bacs.bankLocationId': 'Código de classificação',
            'bacs.bankLocationId.invalid': 'Código de classificação inválido',
            'bacs.consent.amount': 'Concordo que o valor acima seja deduzido da minha conta bancária.',
            'bacs.consent.account': 'Confirmo que a conta está em meu nome e que sou o único signatário que deve autorizar o débito direto nessa conta.',
            edit: 'Editar',
            'bacs.confirm': 'Confirmar e pagar',
            'bacs.result.introduction': 'Baixar instrução de débito direto (DDI)',
            'download.pdf': 'Baixar PDF',
            'creditCard.encryptedCardNumber.aria.iframeTitle': 'Iframe para número do cartão',
            'creditCard.encryptedCardNumber.aria.label': 'Número do cartão',
            'creditCard.encryptedExpiryDate.aria.iframeTitle': 'Iframe para data de validade',
            'creditCard.encryptedExpiryDate.aria.label': 'Data de validade',
            'creditCard.encryptedExpiryMonth.aria.iframeTitle': 'Iframe para mês de validade',
            'creditCard.encryptedExpiryMonth.aria.label': 'Mês de vencimento',
            'creditCard.encryptedExpiryYear.aria.iframeTitle': 'Iframe para ano de validade',
            'creditCard.encryptedExpiryYear.aria.label': 'Ano de vencimento',
            'creditCard.encryptedSecurityCode.aria.iframeTitle': 'Iframe para código de segurança',
            'creditCard.encryptedSecurityCode.aria.label': 'Código de segurança',
            'creditCard.encryptedPassword.aria.iframeTitle': 'Iframe para senha',
            'creditCard.encryptedPassword.aria.label': 'Primeiros dois dígitos da senha do cartão',
            'giftcard.encryptedCardNumber.aria.iframeTitle': 'Iframe para número do cartão',
            'giftcard.encryptedCardNumber.aria.label': 'Número do cartão',
            'giftcard.encryptedSecurityCode.aria.iframeTitle': 'Iframe para pin',
            'giftcard.encryptedSecurityCode.aria.label': 'Pin',
            giftcardTransactionLimit: 'Máximo de %{amount} permitido por transação neste cartão-presente',
            'ach.encryptedBankAccountNumber.aria.iframeTitle': 'Iframe para número da conta bancária',
            'ach.encryptedBankAccountNumber.aria.label': 'Número da conta',
            'ach.encryptedBankLocationId.aria.iframeTitle': 'Iframe para número de identificação do banco',
            'ach.encryptedBankLocationId.aria.label': 'Número de roteamento ABA',
            'pix.instructions': 'Abra o app com sua chave PIX cadastrada, escolha Pagar com Pix e escaneie o QR Code ou copie e cole o código',
            'twint.saved': 'salvo',
            orPayWith: 'ou pague com',
            invalidFormatExpects: 'Formato inválido. Formato esperado: %{format}',
            'upi.qrCodeWaitingMessage': 'Escaneie o QR code com o aplicativo UPI de sua preferência para concluir o pagamento',
            'upi.vpaWaitingMessage': 'Abra o aplicativo UPI para confirmar o pagamento',
            'upi.modeSelection': 'Selecione como você gostaria de usar o UPI.',
            'onlineBanking.termsAndConditions': 'Ao continuar, você concorda com os %#termos e condições%#',
            'onlineBankingPL.termsAndConditions': 'Ao continuar, você concorda com as %#condições%# e as %#informações obrigatórias%# da Przelewy24',
            'ctp.loading.poweredByCtp': 'Desenvolvido por Click to Pay',
            'ctp.loading.intro': 'Estamos verificando se você tem algum cartão salvo no Click to Pay...',
            'ctp.login.title': 'Continuar para o Click to Pay',
            'ctp.login.subtitle': 'Digite o endereço de e-mail associado ao Click to Pay para continuar.',
            'ctp.login.inputLabel': 'E-mail',
            'ctp.logout.notYou': 'Não é você?',
            'ctp.logout.notYourCards': 'Não é o seu cartão?',
            'ctp.logout.notYourCard': 'Não é o seu cartão?',
            'ctp.logout.notYourProfile': 'Não é o seu perfil?',
            'ctp.otp.fieldLabel': 'Código de acesso único',
            'ctp.otp.resendCode': 'Reenviar código',
            'ctp.otp.codeResent': 'Código reenviado',
            'ctp.otp.title': 'Acesse seus cartões Click to Pay',
            'ctp.otp.subtitle': 'Digite o código %@ enviado para %@ para confirmar que é você.',
            'ctp.emptyProfile.message': 'Não há nenhum cartão cadastrado neste perfil do Click to Pay',
            'ctp.separatorText': 'ou use',
            'ctp.cards.title': 'Concluir o pagamento com o Click to Pay',
            'ctp.cards.subtitle': 'Selecione um cartão para usar.',
            'ctp.cards.expiredCard': 'Vencido',
            'ctp.manualCardEntry': 'Entrada manual do cartão',
            'ctp.aria.infoModalButton': 'O que é Click to Pay',
            'ctp.infoPopup.title': 'O Click to Pay traz a facilidade do pagamento online sem contato',
            'ctp.infoPopup.subtitle': 'Um método de pagamento rápido e seguro, compatível com Mastercard, Visa e outros cartões.',
            'ctp.infoPopup.benefit1': 'O Click to Pay usa criptografia para manter suas informações seguras e protegidas',
            'ctp.infoPopup.benefit2': 'Use com comerciantes no mundo todo',
            'ctp.infoPopup.benefit3': 'Configure apenas uma vez e simplifique seus pagamentos no futuro',
            'ctp.errors.AUTH_INVALID': 'Autenticação inválida',
            'ctp.errors.NOT_FOUND': 'Nenhuma conta foi encontrada. Informe um e-mail válido ou continue inserindo os dados do cartão manualmente',
            'ctp.errors.ID_FORMAT_UNSUPPORTED': 'Formato não compatível',
            'ctp.errors.FRAUD': 'A conta do usuário foi bloqueada ou desativada',
            'ctp.errors.CONSUMER_ID_MISSING': 'A identidade do consumidor está ausente na solicitação',
            'ctp.errors.ACCT_INACCESSIBLE': 'Esta conta não está disponível no momento. Ela pode estar bloqueada, por exemplo',
            'ctp.errors.CODE_INVALID': 'Código de verificação incorreto',
            'ctp.errors.CODE_EXPIRED': 'Esse código expirou',
            'ctp.errors.RETRIES_EXCEEDED': 'O limite de tentativas para gerar a senha de uso único foi excedido',
            'ctp.errors.OTP_SEND_FAILED': 'Não foi possível enviar a senha de uso único ao destinatário',
            'ctp.errors.REQUEST_TIMEOUT': 'Algo deu errado. Tente de novo ou insira os dados do cartão manualmente',
            'ctp.errors.UNKNOWN_ERROR': 'Algo deu errado. Tente de novo ou insira os dados do cartão manualmente',
            'ctp.errors.SERVICE_ERROR': 'Algo deu errado. Tente de novo ou insira os dados do cartão manualmente',
            'ctp.errors.SERVER_ERROR': 'Algo deu errado. Tente de novo ou insira os dados do cartão manualmente',
            'ctp.errors.INVALID_PARAMETER': 'Algo deu errado. Tente de novo ou insira os dados do cartão manualmente',
            'ctp.errors.AUTH_ERROR': 'Algo deu errado. Tente de novo ou insira os dados do cartão manualmente',
            'paymentMethodsList.aria.label': 'Escolha um método de pagamento',
            'companyDetails.name.invalid': 'Digite o nome da empresa',
            'companyDetails.registrationNumber.invalid': 'Digite o número de registro',
            'consent.checkbox.invalid': 'Você precisa concordar com os termos e condições'
        };
        return a;
    }
}

/**
 * returns the indicated property of an object, if it exists.
 *
 * @param object - The object to query
 * @param path - The property name or path to the property
 * @returns The value at `obj[p]`.

 * @example
 * ```
 *   getProp({x: 100}, 'x'); //=> 100
 *   getProp({}, 'x'); //=> undefined
 * ```
 */ const getProp = (object, path)=>{
    const splitPath = path.split('.');
    const reducer = (xs, x)=>xs && xs[x] ? xs[x] : undefined;
    return splitPath.reduce(reducer, object);
};

class EventEmitter {
    events = {};
    on = (eventName, fn)=>{
        this.events[eventName] = this.events[eventName] || [];
        this.events[eventName].push(fn);
    };
    off = (eventName, fn)=>{
        if (this.events[eventName]) {
            this.events[eventName] = this.events[eventName].reduce((acc, cur)=>{
                if (cur !== fn) acc.push(cur);
                return acc;
            }, []);
        }
    };
    emit = (eventName, data)=>{
        if (this.events[eventName]) {
            this.events[eventName].forEach((fn)=>{
                fn(data);
            });
        }
    };
}

/* eslint-disable */ function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c)=>{
        let r = Math.random() * 16 | 0, v = c == 'x' ? r : r & 0x3 | 0x8;
        return v.toString(16);
    });
} /* eslint-enable */

class BaseElement {
    _id = `${this.constructor['type']}-${uuidv4()}`;
    props;
    state;
    static defaultProps = {};
    _node;
    _component;
    eventEmitter = new EventEmitter();
    _parentInstance;
    resources;
    constructor(props){
        this.props = this.formatProps({
            ...this.constructor['defaultProps'],
            setStatusAutomatically: true,
            ...props
        });
        this._parentInstance = this.props._parentInstance;
        this._node = null;
        this.state = {};
        this.resources = this.props.modules ? this.props.modules.resources : undefined;
    }
    /**
     * Executed during creation of any payment element.
     * Gives a chance to any paymentMethod to format the props we're receiving.
     */ formatProps(props) {
        return props;
    }
    /**
     * Executed on the `data` getter.
     * Returns the component data necessary for the /payments request
     *
     * TODO: Replace 'any' by type PaymentMethodData<T> - this change requires updating all payment methods,
     *       properly adding the type of the formatData function
     */ formatData() {
        return {};
    }
    setState(newState) {
        this.state = {
            ...this.state,
            ...newState
        };
    }
    /**
     * Returns the component payment data ready to submit to the Checkout API
     * Note: this does not ensure validity, check isValid first
     */ get data() {
        const clientData = getProp(this.props, 'modules.risk.data');
        const checkoutAttemptId = getProp(this.props, 'modules.analytics.checkoutAttemptId');
        const order = this.state.order || this.props.order;
        const componentData = this.formatData();
        if (componentData.paymentMethod && checkoutAttemptId) {
            componentData.paymentMethod.checkoutAttemptId = checkoutAttemptId;
        }
        return {
            ...clientData && {
                riskData: {
                    clientData
                }
            },
            ...order && {
                order: {
                    orderData: order.orderData,
                    pspReference: order.pspReference
                }
            },
            ...componentData,
            clientStateDataIndicator: true
        };
    }
    render() {
        // render() not implemented in the element
        throw new Error('Payment method cannot be rendered.');
    }
    /**
     * Mounts an element into the dom
     * @param domNode - Node (or selector) where we will mount the payment element
     * @returns this - the payment element instance we mounted
     */ mount(domNode) {
        const node = typeof domNode === 'string' ? document.querySelector(domNode) : domNode;
        if (!node) {
            throw new Error('Component could not mount. Root node was not found.');
        }
        if (this._node) {
            this.unmount(); // new, if this._node exists then we are "remounting" so we first need to unmount if it's not already been done
        } else {
            // Set up analytics, once
            if (this.props.modules && this.props.modules.analytics && !this.props.isDropin) {
                this.props.modules.analytics.send({
                    containerWidth: this._node && this._node.offsetWidth,
                    component: this.constructor['analyticsType'] ?? this.constructor['type'],
                    flavor: 'components'
                });
            }
        }
        this._node = node;
        this._component = this.render();
        render(this._component, node);
        return this;
    }
    /**
     * Updates props, resets the internal state and remounts the element.
     * @param props - props to update
     * @returns this - the element instance
     */ update(props) {
        this.props = this.formatProps({
            ...this.props,
            ...props
        });
        this.state = {};
        return this.unmount().mount(this._node); // for new mount fny
    }
    /**
     * Unmounts an element and mounts it again on the same node i.e. allows mount w/o having to pass a node.
     * Should be "private" & undocumented (although being a public function is useful for testing).
     * Left in for legacy reasons
     */ remount(component) {
        if (!this._node) {
            throw new Error('Component is not mounted.');
        }
        const newComponent = component || this.render();
        render(newComponent, this._node, null);
        return this;
    }
    /**
     * Unmounts a payment element from the DOM
     */ unmount() {
        if (this._node) {
            render(null, this._node);
        }
        return this;
    }
    /**
     * Unmounts an element and removes it from the parent instance
     * For "destroy" type cleanup - when you don't intend to use the component again
     */ remove() {
        this.unmount();
        if (this._parentInstance) {
            this._parentInstance.remove(this);
        }
    }
}

/**
 * Default Loading Spinner
 * @param props -
 */ const Spinner = ({ inline = false, size = 'large' })=>/*#__PURE__*/ h$1("div", {
        "data-testid": "spinner",
        className: `adyen-checkout__spinner__wrapper ${inline ? 'adyen-checkout__spinner__wrapper--inline' : ''}`
    }, /*#__PURE__*/ h$1("div", {
        className: `adyen-checkout__spinner adyen-checkout__spinner--${size}`
    }));

var t,r,u,i,o=0,f=[],c=[],e=options.__b,a=options.__r,v=options.diffed,l=options.__c,m=options.unmount;function d(t,u){options.__h&&options.__h(r,t,o||u),o=0;var i=r.__H||(r.__H={__:[],__h:[]});return t>=i.__.length&&i.__.push({__V:c}),i.__[t]}function h(n){return o=1,s(B,n)}function s(n,u,i){var o=d(t++,2);if(o.t=n,!o.__c&&(o.__=[i?i(u):B(void 0,u),function(n){var t=o.__N?o.__N[0]:o.__[0],r=o.t(t,n);t!==r&&(o.__N=[r,o.__[1]],o.__c.setState({}));}],o.__c=r,!r.u)){var f=function(n,t,r){if(!o.__c.__H)return !0;var u=o.__c.__H.__.filter(function(n){return n.__c});if(u.every(function(n){return !n.__N}))return !c||c.call(this,n,t,r);var i=!1;return u.forEach(function(n){if(n.__N){var t=n.__[0];n.__=n.__N,n.__N=void 0,t!==n.__[0]&&(i=!0);}}),!(!i&&o.__c.props===n)&&(!c||c.call(this,n,t,r))};r.u=!0;var c=r.shouldComponentUpdate,e=r.componentWillUpdate;r.componentWillUpdate=function(n,t,r){if(this.__e){var u=c;c=void 0,f(n,t,r),c=u;}e&&e.call(this,n,t,r);},r.shouldComponentUpdate=f;}return o.__N||o.__}function q(n){var u=r.context[n.__c],i=d(t++,9);return i.c=n,u?(null==i.__&&(i.__=!0,u.sub(r)),u.props.value):n.__}function b(){for(var t;t=f.shift();)if(t.__P&&t.__H)try{t.__H.__h.forEach(k),t.__H.__h.forEach(w),t.__H.__h=[];}catch(r){t.__H.__h=[],options.__e(r,t.__v);}}options.__b=function(n){r=null,e&&e(n);},options.__r=function(n){a&&a(n),t=0;var i=(r=n.__c).__H;i&&(u===r?(i.__h=[],r.__h=[],i.__.forEach(function(n){n.__N&&(n.__=n.__N),n.__V=c,n.__N=n.i=void 0;})):(i.__h.forEach(k),i.__h.forEach(w),i.__h=[])),u=r;},options.diffed=function(t){v&&v(t);var o=t.__c;o&&o.__H&&(o.__H.__h.length&&(1!==f.push(o)&&i===options.requestAnimationFrame||((i=options.requestAnimationFrame)||j)(b)),o.__H.__.forEach(function(n){n.i&&(n.__H=n.i),n.__V!==c&&(n.__=n.__V),n.i=void 0,n.__V=c;})),u=r=null;},options.__c=function(t,r){r.some(function(t){try{t.__h.forEach(k),t.__h=t.__h.filter(function(n){return !n.__||w(n)});}catch(u){r.some(function(n){n.__h&&(n.__h=[]);}),r=[],options.__e(u,t.__v);}}),l&&l(t,r);},options.unmount=function(t){m&&m(t);var r,u=t.__c;u&&u.__H&&(u.__H.__.forEach(function(n){try{k(n);}catch(n){r=n;}}),u.__H=void 0,r&&options.__e(r,u.__v));};var g="function"==typeof requestAnimationFrame;function j(n){var t,r=function(){clearTimeout(u),g&&cancelAnimationFrame(t),setTimeout(n);},u=setTimeout(r,100);g&&(t=requestAnimationFrame(r));}function k(n){var t=r,u=n.__c;"function"==typeof u&&(n.__c=void 0,u()),r=t;}function w(n){var t=r;n.__c=n.__(),r=t;}function B(n,t){return "function"==typeof t?t(n):t}

var defaultTrans = {payButton:"Pay","payButton.redirecting":"Redirecting...","payButton.with":"Pay %{value} with %{maskedData}",close:"Close",storeDetails:"Save for my next payment","creditCard.holderName":"Name on card","creditCard.holderName.placeholder":"J. Smith","creditCard.holderName.invalid":"Enter name as shown on card","creditCard.numberField.title":"Card number","creditCard.numberField.placeholder":"1234 5678 9012 3456","creditCard.expiryDateField.title":"Expiry date","creditCard.expiryDateField.placeholder":"MM/YY","creditCard.expiryDateField.month":"Month","creditCard.expiryDateField.month.placeholder":"MM","creditCard.expiryDateField.year.placeholder":"YY","creditCard.expiryDateField.year":"Year","creditCard.cvcField.title":"Security code","creditCard.cvcField.placeholder":"123","creditCard.storeDetailsButton":"Remember for next time","creditCard.cvcField.placeholder.4digits":"4 digits","creditCard.cvcField.placeholder.3digits":"3 digits","creditCard.taxNumber.placeholder":"YYMMDD / 0123456789",installments:"Number of installments",installmentOption:"%{times}x %{partialValue}",installmentOptionMonths:"%{times} months","installments.oneTime":"One time payment","installments.installments":"Installments payment","installments.revolving":"Revolving payment","sepaDirectDebit.ibanField.invalid":"Invalid account number","sepaDirectDebit.nameField.placeholder":"J. Smith","sepa.ownerName":"Holder Name","sepa.ibanNumber":"Account Number (IBAN)","error.title":"Error","error.subtitle.redirect":"Redirect failed","error.subtitle.payment":"Payment failed","error.subtitle.refused":"Payment refused","error.message.unknown":"An unknown error occurred","errorPanel.title":"Existing errors","idealIssuer.selectField.title":"Bank","idealIssuer.selectField.placeholder":"Select your bank","creditCard.success":"Payment Successful",loading:"Loading…","continue":"Continue",continueTo:"Continue to","wechatpay.timetopay":"You have %@ to pay","sr.wechatpay.timetopay":"You have %#minutes%# %#seconds%# to pay","wechatpay.scanqrcode":"Scan QR code",personalDetails:"Personal details",companyDetails:"Company details","companyDetails.name":"Company name","companyDetails.name.invalid":"Enter the company name","companyDetails.registrationNumber":"Registration number","companyDetails.registrationNumber.invalid":"Enter the registration number","consent.checkbox.invalid":"You must agree with the terms & conditions",socialSecurityNumber:"Social security number",firstName:"First name","firstName.invalid":"Enter your first name",infix:"Prefix",lastName:"Last name","lastName.invalid":"Enter your last name",mobileNumber:"Mobile number","mobileNumber.invalid":"Invalid mobile number",city:"City",postalCode:"Postal code","postalCode.optional":"Postal code (optional)",countryCode:"Country Code",telephoneNumber:"Telephone number",dateOfBirth:"Date of birth",shopperEmail:"Email address",gender:"Gender","gender.notselected":"Select a gender",male:"Male",female:"Female",billingAddress:"Billing address",street:"Street",stateOrProvince:"State or province",country:"Country",houseNumberOrName:"House number",separateDeliveryAddress:"Specify a separate delivery address",deliveryAddress:"Delivery Address",zipCode:"Zip code",apartmentSuite:"Apartment / Suite",provinceOrTerritory:"Province or Territory",cityTown:"City / Town",address:"Address","address.placeholder":"Find your address","address.errors.incomplete":"Enter an address to continue","address.enterManually":"+ Enter address manually",state:"State","field.title.optional":"(optional)","creditCard.cvcField.title.optional":"Security code (optional)","issuerList.wallet.placeholder":"Select your wallet",privacyPolicy:"Privacy policy","afterPay.agreement":"I agree with the %@ of AfterPay",paymentConditions:"payment conditions",openApp:"Open the app","voucher.readInstructions":"Read instructions","voucher.introduction":"Thank you for your purchase, please use the following coupon to complete your payment.","voucher.expirationDate":"Expiration Date","voucher.alternativeReference":"Alternative Reference","dragonpay.voucher.non.bank.selectField.placeholder":"Select your provider","dragonpay.voucher.bank.selectField.placeholder":"Select your bank","voucher.paymentReferenceLabel":"Payment Reference","voucher.surcharge":"Incl. %@ surcharge","voucher.introduction.doku":"Thank you for your purchase, please use the following information to complete your payment.","voucher.shopperName":"Shopper Name","voucher.merchantName":"Merchant","voucher.introduction.econtext":"Thank you for your purchase, please use the following information to complete your payment.","voucher.telephoneNumber":"Phone Number","voucher.shopperReference":"Shopper Reference","voucher.collectionInstitutionNumber":"Collection Institution Number","voucher.econtext.telephoneNumber.invalid":"Telephone number must be 10 or 11 digits long","boletobancario.btnLabel":"Generate Boleto","boleto.sendCopyToEmail":"Send a copy to my email","button.copy":"Copy","button.download":"Download","boleto.socialSecurityNumber":"CPF/CNPJ","boleto.socialSecurityNumber.invalid":"Field is not valid","creditCard.storedCard.description.ariaLabel":"Stored card ends in %@","voucher.entity":"Entity",donateButton:"Donate",notNowButton:"Not now",thanksForYourSupport:"Thanks for your support!",preauthorizeWith:"Preauthorize with",confirmPreauthorization:"Confirm preauthorization",confirmPurchase:"Confirm purchase",applyGiftcard:"Redeem",giftcardBalance:"Gift card balance",deductedBalance:"Deducted balance","creditCard.pin.title":"Pin","creditCard.encryptedPassword.label":"First 2 digits of card password","creditCard.encryptedPassword.placeholder":"12","creditCard.encryptedPassword.invalid":"Invalid password","creditCard.taxNumber":"Cardholder birthdate or Corporate registration number","creditCard.taxNumber.label":"Cardholder birthdate (YYMMDD) or Corporate registration number (10 digits)","creditCard.taxNumber.labelAlt":"Corporate registration number (10 digits)","creditCard.taxNumber.invalid":"Invalid Cardholder birthdate or Corporate registration number","storedPaymentMethod.disable.button":"Remove","storedPaymentMethod.disable.confirmation":"Remove stored payment method","storedPaymentMethod.disable.confirmButton":"Yes, remove","storedPaymentMethod.disable.cancelButton":"Cancel","ach.bankAccount":"Bank account","ach.accountHolderNameField.title":"Account holder name","ach.accountHolderNameField.placeholder":"J. Smith","ach.accountHolderNameField.invalid":"Invalid account holder name","ach.accountNumberField.title":"Account number","ach.accountNumberField.invalid":"Invalid account number","ach.accountLocationField.title":"ABA routing number","ach.accountLocationField.invalid":"Invalid ABA routing number","ach.savedBankAccount":"Saved bank account","select.state":"Select state","select.stateOrProvince":"Select state or province","select.provinceOrTerritory":"Select province or territory","select.country":"Select country","select.noOptionsFound":"No options found","select.filter.placeholder":"Search...","telephoneNumber.invalid":"Invalid telephone number",qrCodeOrApp:"or","paypal.processingPayment":"Processing payment...",generateQRCode:"Generate QR code","await.waitForConfirmation":"Waiting for confirmation","mbway.confirmPayment":"Confirm your payment on the MB WAY app","shopperEmail.invalid":"Invalid email address","dateOfBirth.format":"DD/MM/YYYY","dateOfBirth.invalid":"You must be at least 18 years old","blik.confirmPayment":"Open your banking app to confirm the payment.","blik.invalid":"Enter 6 numbers","blik.code":"6-digit code","blik.help":"Get the code from your banking app.","swish.pendingMessage":"After you scan, the status can be pending for up to 10 minutes. Attempting to pay again within this time may result in multiple charges.","field.valid":"Field valid","field.invalid":"Field not valid","error.va.gen.01":"Incomplete field","error.va.gen.02":"Field not valid","error.va.sf-cc-num.01":"Enter a valid card number","error.va.sf-cc-num.02":"Enter the card number","error.va.sf-cc-num.03":"Enter a supported card brand","error.va.sf-cc-num.04":"Enter the complete card number","error.va.sf-cc-dat.01":"Enter a valid expiry date","error.va.sf-cc-dat.02":"Enter a valid expiry date","error.va.sf-cc-dat.03":"Credit card about to expire","error.va.sf-cc-dat.04":"Enter the expiry date","error.va.sf-cc-dat.05":"Enter the complete expiry date","error.va.sf-cc-mth.01":"Enter the expiry month","error.va.sf-cc-yr.01":"Enter the expiry year","error.va.sf-cc-yr.02":"Enter the complete expiry year","error.va.sf-cc-cvc.01":"Enter the security code","error.va.sf-cc-cvc.02":"Enter the complete security code","error.va.sf-ach-num.01":"Bank account number field is empty","error.va.sf-ach-num.02":"Bank account number is the wrong length","error.va.sf-ach-loc.01":"Bank routing number field is empty","error.va.sf-ach-loc.02":"Bank routing number is the wrong length","error.va.sf-kcp-pwd.01":"Password field is empty","error.va.sf-kcp-pwd.02":"Password is the wrong length","error.giftcard.no-balance":"This gift card has zero balance","error.giftcard.card-error":"In our records we have no gift card with this number","error.giftcard.currency-error":"Gift cards are only valid in the currency they were issued in","amazonpay.signout":"Sign out from Amazon","amazonpay.changePaymentDetails":"Change payment details","partialPayment.warning":"Select another payment method to pay the remaining","partialPayment.remainingBalance":"Remaining balance will be %{amount}","bankTransfer.beneficiary":"Beneficiary","bankTransfer.iban":"IBAN","bankTransfer.bic":"BIC","bankTransfer.reference":"Reference","bankTransfer.introduction":"Continue to create a new bank transfer payment. You can use the details in the following screen to finalize this payment.","bankTransfer.instructions":"Thank you for your purchase, please use the following information to complete your payment.","bacs.accountHolderName":"Bank account holder name","bacs.accountHolderName.invalid":"Invalid bank account holder name","bacs.accountNumber":"Bank account number","bacs.accountNumber.invalid":"Invalid bank account number","bacs.bankLocationId":"Sort code","bacs.bankLocationId.invalid":"Invalid sort code","bacs.consent.amount":"I agree that the above amount will be deducted from my bank account.","bacs.consent.account":"I confirm the account is in my name and I am the only signatory required to authorise the Direct Debit on this account.",edit:"Edit","bacs.confirm":"Confirm and pay","bacs.result.introduction":"Download your Direct Debit Instruction (DDI / Mandate)","download.pdf":"Download PDF","creditCard.encryptedCardNumber.aria.iframeTitle":"Iframe for card number","creditCard.encryptedCardNumber.aria.label":"Card number","creditCard.encryptedExpiryDate.aria.iframeTitle":"Iframe for expiry date","creditCard.encryptedExpiryDate.aria.label":"Expiry date","creditCard.encryptedExpiryMonth.aria.iframeTitle":"Iframe for expiry month","creditCard.encryptedExpiryMonth.aria.label":"Expiry month","creditCard.encryptedExpiryYear.aria.iframeTitle":"Iframe for expiry year","creditCard.encryptedExpiryYear.aria.label":"Expiry year","creditCard.encryptedSecurityCode.aria.iframeTitle":"Iframe for security code","creditCard.encryptedSecurityCode.aria.label":"Security code","creditCard.encryptedPassword.aria.iframeTitle":"Iframe for password","creditCard.encryptedPassword.aria.label":"First 2 digits of card password","giftcard.encryptedCardNumber.aria.iframeTitle":"Iframe for card number","giftcard.encryptedCardNumber.aria.label":"Card number","giftcard.encryptedSecurityCode.aria.iframeTitle":"Iframe for pin","giftcard.encryptedSecurityCode.aria.label":"Pin",giftcardTransactionLimit:"Max. %{amount} allowed per transaction on this gift card","ach.encryptedBankAccountNumber.aria.iframeTitle":"Iframe for bank account number","ach.encryptedBankAccountNumber.aria.label":"Account number","ach.encryptedBankLocationId.aria.iframeTitle":"Iframe for bank routing number","ach.encryptedBankLocationId.aria.label":"ABA routing number","pix.instructions":"Open the app with the PIX registered key, choose Pay with PIX and scan the QR Code or copy and paste the code","twint.saved":"saved",orPayWith:"or pay with",invalidFormatExpects:"Invalid format. Expected format: %{format}","upi.qrCodeWaitingMessage":"Scan the QR code using your preferred UPI app to complete the payment","upi.vpaWaitingMessage":"Open your UPI app to confirm the payment","upi.modeSelection":"Make a selection on how you would like to use UPI.","onlineBanking.termsAndConditions":"By continuing you agree with the %#terms and conditions%#","onlineBankingPL.termsAndConditions":"By continuing you agree with the %#regulations%# and %#information obligation%# of Przelewy24","ctp.loading.poweredByCtp":"Powered by Click to Pay","ctp.loading.intro":"We are checking to see if you have any saved cards with Click to Pay...","ctp.login.title":"Continue to Click to Pay","ctp.login.subtitle":"Enter the email address that is connected to Click to Pay to continue.","ctp.login.inputLabel":"Email","ctp.logout.notYou":"Not you?","ctp.logout.notYourCards":"Not your cards?","ctp.logout.notYourCard":"Not your card?","ctp.logout.notYourProfile":"Not your profile?","ctp.otp.fieldLabel":"One time code","ctp.otp.resendCode":"Resend code","ctp.otp.codeResent":"Code resent","ctp.otp.title":"Access your Click to Pay cards","ctp.otp.subtitle":"Enter the code %@ sent to %@ to verify it‘s you.","ctp.emptyProfile.message":"No cards registered in this Click to Pay profile","ctp.separatorText":"or use","ctp.cards.title":"Complete payment with Click to Pay","ctp.cards.subtitle":"Select a card to use.","ctp.cards.expiredCard":"Expired","ctp.manualCardEntry":"Manual card entry","ctp.aria.infoModalButton":"What is Click to Pay","ctp.infoPopup.title":"Click to Pay brings the ease of contactless, online","ctp.infoPopup.subtitle":"A fast, secure payment method supported by Mastercard, Visa and other payment cards.","ctp.infoPopup.benefit1":"Click to Pay uses encryption to keep your information safe and secure","ctp.infoPopup.benefit2":"Use it with merchants worldwide","ctp.infoPopup.benefit3":"Set up once for hassle-free payments in the future","ctp.errors.AUTH_INVALID":"Authentication Invalid","ctp.errors.NOT_FOUND":"No account found, enter a valid email or continue using manual card entry","ctp.errors.ID_FORMAT_UNSUPPORTED":"Format not supported","ctp.errors.FRAUD":"The user account was locked or disabled","ctp.errors.CONSUMER_ID_MISSING":"Consumer identity is missing in the request","ctp.errors.ACCT_INACCESSIBLE":"This account is currently not available, e.g it is locked","ctp.errors.CODE_INVALID":"Incorrect verification code","ctp.errors.CODE_EXPIRED":"This code has expired","ctp.errors.RETRIES_EXCEEDED":"The limit for the number of retries for OTP generation was exceeded","ctp.errors.OTP_SEND_FAILED":"The OTP could not be sent to the recipient","ctp.errors.REQUEST_TIMEOUT":"Something went wrong, try again or use the manual card entry","ctp.errors.UNKNOWN_ERROR":"Something went wrong, try again or use the manual card entry","ctp.errors.SERVICE_ERROR":"Something went wrong, try again or use the manual card entry","ctp.errors.SERVER_ERROR":"Something went wrong, try again or use the manual card entry","ctp.errors.INVALID_PARAMETER":"Something went wrong, try again or use the manual card entry","ctp.errors.AUTH_ERROR":"Something went wrong, try again or use the manual card entry","paymentMethodsList.aria.label":"Choose a payment method"};

/**
 * FALLBACK_LOCALE - **MUST** match the locale string in the above import
 */ const FALLBACK_LOCALE = 'en-US';
const defaultTranslation = defaultTrans;

/**
 * Convert to ISO 639-1
 */ const toTwoLetterCode = (locale)=>locale.toLowerCase().substring(0, 2);
/**
 * Matches a string with one of the locales
 * @param locale -
 * @param supportedLocales -

 * @example
 * matchLocale('en-GB');
 * // 'en-US'
 */ function matchLocale(locale, supportedLocales) {
    if (!locale || typeof locale !== 'string') return null;
    return supportedLocales.find((supLoc)=>toTwoLetterCode(supLoc) === toTwoLetterCode(locale)) || null;
}
/**
 * Returns a locale with the proper format
 * @param localeParam -
 *
 * @example
 * formatLocale('En_us');
 * // 'en-US'
 */ function formatLocale(localeParam) {
    const locale = localeParam.replace('_', '-');
    const format = new RegExp('([a-z]{2})([-])([A-Z]{2})');
    // If it's already formatted, return the locale
    if (format.test(locale)) return locale;
    // Split the string in two
    const [languageCode, countryCode] = locale.split('-');
    // If the locale or the country codes are missing, return null
    if (!languageCode || !countryCode) return null;
    // Ensure correct format and join the strings back together
    const fullLocale = [
        languageCode.toLowerCase(),
        countryCode.toUpperCase()
    ].join('-');
    return fullLocale.length === 5 ? fullLocale : null;
}
/**
 * Checks the locale format.
 * Also checks if it's on the locales array.
 * If it is not, tries to match it with one.
 * @param locale -
 * @param supportedLocales -
 */ function parseLocale(locale, supportedLocales = []) {
    if (!locale || locale.length < 1 || locale.length > 5) return FALLBACK_LOCALE;
    const formattedLocale = formatLocale(locale);
    const hasMatch = supportedLocales.indexOf(formattedLocale) > -1;
    if (hasMatch) return formattedLocale;
    return matchLocale(formattedLocale || locale, supportedLocales);
}
/**
 * Formats the locales inside the customTranslations object against the supportedLocales
 * @param customTranslations -
 * @param supportedLocales -
 */ function formatCustomTranslations(customTranslations = {}, supportedLocales) {
    return Object.keys(customTranslations).reduce((acc, cur)=>{
        const formattedLocale = formatLocale(cur) || parseLocale(cur, supportedLocales);
        if (formattedLocale) {
            acc[formattedLocale] = customTranslations[cur];
        }
        return acc;
    }, {});
}
const replaceTranslationValues = (translation, values)=>{
    return translation.replace(/%{(\w+)}/g, (_, k)=>values[k] || '');
};
/**
 * Returns a translation string by key
 * @param translations -
 * @param key -
 * @param options -
 *
 * @internal
 */ const getTranslation = (translations, key, options = {
    values: {},
    count: 0
})=>{
    const keyPlural = `${key}__plural`;
    const keyForCount = (count)=>`${key}__${count}`;
    if (Object.prototype.hasOwnProperty.call(translations, keyForCount(options.count))) {
        // Find key__count translation key
        return replaceTranslationValues(translations[keyForCount(options.count)], options.values);
    } else if (Object.prototype.hasOwnProperty.call(translations, keyPlural) && options.count > 1) {
        // Find key__plural translation key, if count greater than 1 (e.g. myTranslation__plural)
        return replaceTranslationValues(translations[keyPlural], options.values);
    } else if (Object.prototype.hasOwnProperty.call(translations, key)) {
        // Find key translation key (e.g. myTranslation)
        return replaceTranslationValues(translations[key], options.values);
    }
    return null;
};
/**
 * Returns an Object which contains all the key/values of the translation labels
 *
 * @param locale - The locale the user wants to use
 * @param customTranslations - Custom translations provided by the merchant
 */ const loadTranslations = async (locale, customTranslations = {})=>{
    // Match locale to one of our available locales (e.g. es-AR => es-ES)
    // const localeToLoad = parseLocale(locale, Object.keys(locales)) || FALLBACK_LOCALE;
    // const loadedLocale = await locales[localeToLoad]();
    const loadedLocale = {
        default: {}
    };
    return {
        ...defaultTranslation,
        ...loadedLocale.default,
        ...!!customTranslations[locale] && customTranslations[locale] // Merge with their custom locales if available
    };
};

const CURRENCY_DECIMALS = {
    // ZERO_DECIMAL_CURRENCIES
    IDR: 1,
    JPY: 1,
    KRW: 1,
    VND: 1,
    BYR: 1,
    CVE: 1,
    DJF: 1,
    GHC: 1,
    GNF: 1,
    KMF: 1,
    PYG: 1,
    RWF: 1,
    UGX: 1,
    VUV: 1,
    XAF: 1,
    XOF: 1,
    XPF: 1,
    // ONE_DECIMAL_CURRENCIES
    MRO: 10,
    // THREE_DECIMAL_CURRENCIES
    BHD: 1000,
    IQD: 1000,
    JOD: 1000,
    KWD: 1000,
    OMR: 1000,
    LYD: 1000,
    TND: 1000
};

/** Work around solution until chromium bug is fixed https://bugs.chromium.org/p/chromium/issues/detail?id=1381996
 * We need to hardcode minimumFractionDigits for the following currencies
 */ const currencyMinorUnitsConfig = {
    RSD: {
        minimumFractionDigits: 2
    },
    AFN: {
        minimumFractionDigits: 2
    },
    ALL: {
        minimumFractionDigits: 2
    },
    IRR: {
        minimumFractionDigits: 2
    },
    LAK: {
        minimumFractionDigits: 2
    },
    LBP: {
        minimumFractionDigits: 2
    },
    MMK: {
        minimumFractionDigits: 2
    },
    SOS: {
        minimumFractionDigits: 2
    },
    SYP: {
        minimumFractionDigits: 2
    },
    YER: {
        minimumFractionDigits: 2
    },
    IQD: {
        minimumFractionDigits: 3
    }
};

/**
 * @internal
 * @param currencyCode -
 * Get divider amount
 */ const getDivider = (currencyCode)=>CURRENCY_DECIMALS[currencyCode] || 100;
/**
 * @internal
 */ const getDecimalAmount = (amount, currencyCode)=>{
    const divider = getDivider(currencyCode);
    return parseInt(String(amount), 10) / divider;
};
/**
 * @internal
 */ const getLocalisedAmount = (amount, locale, currencyCode, options = {})=>{
    const stringAmount = amount.toString(); // Changing amount to string to avoid 0-value from returning false
    const decimalAmount = getDecimalAmount(stringAmount, currencyCode);
    const formattedLocale = locale.replace('_', '-');
    const modifiedOptions = currencyMinorUnitsConfig[currencyCode] ? {
        ...options,
        ...currencyMinorUnitsConfig[currencyCode]
    } : options;
    const localeOptions = {
        style: 'currency',
        currency: currencyCode,
        currencyDisplay: 'symbol',
        ...modifiedOptions
    };
    try {
        return decimalAmount.toLocaleString(formattedLocale, localeOptions);
    } catch (e) {
        return stringAmount;
    }
};

class Language {
    supportedLocales;
    locale;
    languageCode;
    translations = defaultTranslation;
    customTranslations;
    loaded;
    constructor(locale = FALLBACK_LOCALE, customTranslations = {}){
        // const defaultLocales = Object.keys(locales);
        const defaultLocales = [
            'en-US'
        ];
        this.customTranslations = formatCustomTranslations(customTranslations, defaultLocales);
        const localesFromCustomTranslations = Object.keys(this.customTranslations);
        this.supportedLocales = [
            ...defaultLocales,
            ...localesFromCustomTranslations
        ].filter((v, i, a)=>a.indexOf(v) === i); // our locales + validated custom locales
        this.locale = formatLocale(locale) || parseLocale(locale, this.supportedLocales) || FALLBACK_LOCALE;
        const [languageCode] = this.locale.split('-');
        this.languageCode = languageCode;
        this.loaded = loadTranslations(this.locale, this.customTranslations).then((translations)=>{
            this.translations = translations;
        });
    }
    /**
     * Returns a translated string from a key in the current {@link Language.locale}
     * @param key - Translation key
     * @param options - Translation options
     * @returns Translated string
     */ get(key, options) {
        const translation = getTranslation(this.translations, key, options);
        if (translation !== null) {
            return translation;
        }
        return key;
    }
    /**
     * Returns a localized string for an amount
     * @param amount - Amount to be converted
     * @param currencyCode - Currency code of the amount
     * @param options - Options for String.prototype.toLocaleString
     */ amount(amount, currencyCode, options) {
        return getLocalisedAmount(amount, this.locale, currencyCode, options);
    }
    /**
     * Returns a localized string for a date
     * @param date - Date to be localized
     * @param options - Options for {@link Date.toLocaleDateString}
     */ date(date, options = {}) {
        const dateOptions = {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            ...options
        };
        return new Date(date).toLocaleDateString(this.locale, dateOptions);
    }
}

/**
 * FALLBACK_CONTEXT
 */ const FALLBACK_CONTEXT$1 = 'https://checkoutshopper-live.adyen.com/checkoutshopper/';
const GENERIC_OPTIONS = [
    'amount',
    'secondaryAmount',
    'countryCode',
    'environment',
    'loadingContext',
    'i18n',
    'modules',
    'order',
    'session',
    'clientKey',
    'showPayButton',
    'installmentOptions',
    // Events
    'onPaymentCompleted',
    'beforeRedirect',
    'beforeSubmit',
    'onSubmit',
    'onActionHandled',
    'onAdditionalDetails',
    'onCancel',
    'onChange',
    'onError',
    'onBalanceCheck',
    'onOrderRequest',
    'onOrderCreated',
    'setStatusAutomatically'
];

const returnImage = ({ name, loadingContext, imageFolder = '', parentFolder = '', extension, size = '', subFolder = '' })=>`${loadingContext}images/${imageFolder}${subFolder}${parentFolder}${name}${size}.${extension}`;
const getImageUrl = ({ loadingContext = FALLBACK_CONTEXT$1, extension = 'svg', ...options })=>(name)=>{
        const imageOptions = {
            extension,
            loadingContext,
            imageFolder: 'logos/',
            parentFolder: '',
            name,
            ...options
        };
        return returnImage(imageOptions);
    };

const FALLBACK_CONTEXT = 'https://checkoutshopper-live.adyen.com/checkoutshopper/';
const resolveEnvironment = (env = FALLBACK_CONTEXT)=>{
    const environments = {
        test: 'https://checkoutshopper-test.adyen.com/checkoutshopper/',
        live: 'https://checkoutshopper-live.adyen.com/checkoutshopper/',
        'live-us': 'https://checkoutshopper-live-us.adyen.com/checkoutshopper/',
        'live-au': 'https://checkoutshopper-live-au.adyen.com/checkoutshopper/',
        'live-apse': 'https://checkoutshopper-live-apse.adyen.com/checkoutshopper/',
        'live-in': 'https://checkoutshopper-live-in.adyen.com/checkoutshopper/'
    };
    return environments[env] || environments[env.toLowerCase()] || env;
};
const FALLBACK_CDN_CONTEXT = 'https://checkoutshopper-live.adyen.com/checkoutshopper/';
const resolveCDNEnvironment = (env = FALLBACK_CDN_CONTEXT)=>{
    const environments = {
        beta: 'https://cdf6519016.cdn.adyen.com/checkoutshopper/',
        test: 'https://checkoutshopper-test.adyen.com/checkoutshopper/',
        live: 'https://checkoutshopper-live.adyen.com/checkoutshopper/',
        'live-us': 'https://checkoutshopper-live-us.adyen.com/checkoutshopper/',
        'live-au': 'https://checkoutshopper-live-au.adyen.com/checkoutshopper/',
        'live-apse': 'https://checkoutshopper-live-apse.adyen.com/checkoutshopper/',
        'live-in': 'https://checkoutshopper-live-in.adyen.com/checkoutshopper/'
    };
    return environments[env] || environments[env.toLowerCase()] || env;
};

class Resources {
    resourceContext;
    constructor(cdnContext = FALLBACK_CDN_CONTEXT){
        this.resourceContext = cdnContext;
    }
    getImage(props) {
        return getImageUrl({
            ...props,
            loadingContext: this.resourceContext
        });
    }
}

const CoreContext = createContext({
    i18n: new Language(),
    loadingContext: '',
    commonProps: {},
    resources: new Resources()
});

function useCoreContext() {
    return q(CoreContext);
}

class Button extends Component {
    static defaultProps = {
        status: 'default',
        variant: 'primary',
        disabled: false,
        label: '',
        inline: false,
        target: '_self',
        onClick: ()=>{}
    };
    onClick = (e)=>{
        e.preventDefault();
        if (!this.props.disabled) {
            this.props.onClick(e, {
                complete: this.complete
            });
        }
    };
    complete = (delay = 1000)=>{
        this.setState({
            completed: true
        });
        setTimeout(()=>{
            this.setState({
                completed: false
            });
        }, delay);
    };
    render({ classNameModifiers = [], disabled, href, icon, inline, label, status, variant }, { completed }) {
        const { i18n } = useCoreContext();
        const buttonIcon = icon ? /*#__PURE__*/ h$1("img", {
            className: "adyen-checkout__button__icon",
            src: icon,
            alt: "",
            "aria-hidden": "true"
        }) : '';
        const modifiers = [
            ...classNameModifiers,
            ...variant !== 'primary' ? [
                variant
            ] : [],
            ...inline ? [
                'inline'
            ] : [],
            ...completed ? [
                'completed'
            ] : [],
            ...status === 'loading' || status === 'redirect' ? [
                'loading'
            ] : []
        ];
        const buttonClasses = classNames([
            'adyen-checkout__button',
            ...modifiers.map((m)=>`adyen-checkout__button--${m}`)
        ]);
        const buttonStates = {
            loading: /*#__PURE__*/ h$1(Spinner, {
                size: "medium"
            }),
            redirect: /*#__PURE__*/ h$1("span", {
                className: "adyen-checkout__button__content"
            }, /*#__PURE__*/ h$1(Spinner, {
                size: "medium",
                inline: true
            }), i18n.get('payButton.redirecting')),
            default: /*#__PURE__*/ h$1("span", {
                className: "adyen-checkout__button__content"
            }, buttonIcon, /*#__PURE__*/ h$1("span", {
                className: "adyen-checkout__button__text"
            }, label))
        };
        const buttonText = buttonStates[status] || buttonStates.default;
        if (href) {
            return /*#__PURE__*/ h$1("a", {
                className: buttonClasses,
                href: href,
                disabled: disabled,
                target: this.props.target,
                rel: this.props.rel
            }, buttonText);
        }
        return /*#__PURE__*/ h$1("button", {
            className: buttonClasses,
            type: "button",
            disabled: disabled,
            onClick: this.onClick
        }, buttonText, status !== 'loading' && status !== 'redirect' && this.props.children);
    }
}

const PAY_BTN_DIVIDER = '/ ';
const amountLabel = (i18n, amount)=>!!amount?.value && !!amount?.currency ? i18n.amount(amount.value, amount.currency, {
        currencyDisplay: amount.currencyDisplay || 'symbol'
    }) : '';
const payAmountLabel = (i18n, amount)=>`${i18n.get('payButton')} ${amountLabel(i18n, amount)}`;
const secondaryAmountLabel = (i18n, secondaryAmount)=>{
    const convertedSecondaryAmount = secondaryAmount && !!secondaryAmount?.value && !!secondaryAmount?.currency ? i18n.amount(secondaryAmount.value, secondaryAmount.currency, {
        currencyDisplay: secondaryAmount.currencyDisplay || 'symbol'
    }) : '';
    const divider = convertedSecondaryAmount.length ? PAY_BTN_DIVIDER : '';
    return `${divider}${convertedSecondaryAmount}`;
};

const SecondaryButtonLabel = ({ label })=>{
    return /*#__PURE__*/ h$1("span", {
        className: 'checkout-secondary-button__text'
    }, label);
};

const PayButton = ({ amount, secondaryAmount, classNameModifiers = [], label, ...props })=>{
    const { i18n } = useCoreContext();
    const isZeroAuth = amount && ({}).hasOwnProperty.call(amount, 'value') && amount.value === 0;
    const defaultLabel = isZeroAuth ? i18n.get('confirmPreauthorization') : payAmountLabel(i18n, amount);
    /**
     * Show the secondaryLabel if:
     *  - it's not zero auth, and
     *  - we don't have a predefined label (i.e. redirect, qrcode, await based comps...), and
     *  - we do have an amount object (merchant might not be passing this in order to not show the amount on the button), and
     *  - we have a secondaryAmount object with some properties
     */ const secondaryLabel = !isZeroAuth && !label && amount && secondaryAmount && Object.keys(secondaryAmount).length ? secondaryAmountLabel(i18n, secondaryAmount) : null;
    return /*#__PURE__*/ h$1(Button, {
        ...props,
        disabled: props.disabled || props.status === 'loading',
        classNameModifiers: [
            ...classNameModifiers,
            'pay'
        ],
        label: label || defaultLabel
    }, secondaryLabel && /*#__PURE__*/ h$1(SecondaryButtonLabel, {
        label: secondaryLabel
    }));
};

const ALLOWED_PROPERTIES = [
    'action',
    'resultCode',
    'sessionData',
    'order',
    'sessionResult'
];
function getSanitizedResponse(response) {
    const removedProperties = [];
    const sanitizedObject = Object.keys(response).reduce((acc, cur)=>{
        if (!ALLOWED_PROPERTIES.includes(cur)) {
            removedProperties.push(cur);
        } else {
            acc[cur] = response[cur];
        }
        return acc;
    }, {});
    if (removedProperties.length) console.warn(`The following properties should not be passed to the client: ${removedProperties.join(', ')}`);
    return sanitizedObject;
}
function resolveFinalResult(result) {
    switch(result.resultCode){
        case 'Authorised':
        case 'Received':
            return [
                'success'
            ];
        case 'Pending':
            return [
                'success'
            ];
        case 'Cancelled':
        case 'Error':
        case 'Refused':
            return [
                'error'
            ];
    }
}

class AdyenCheckoutError extends Error {
    static errorTypes = {
        /** Network error. */ NETWORK_ERROR: 'NETWORK_ERROR',
        /** Shopper canceled the current transaction. */ CANCEL: 'CANCEL',
        /** Implementation error. The method or parameter are incorrect or are not supported. */ IMPLEMENTATION_ERROR: 'IMPLEMENTATION_ERROR',
        /** Generic error. */ ERROR: 'ERROR'
    };
    cause;
    constructor(type, message, options){
        super(message);
        this.name = AdyenCheckoutError.errorTypes[type];
        this.cause = options?.cause;
    }
}

function hasOwnProperty(obj = {}, prop) {
    return Object.prototype.hasOwnProperty.call(obj, prop);
}

class UIElement extends BaseElement {
    componentRef;
    elementRef;
    static type = undefined;
    static txVariants = [];
    constructor(props){
        super(props);
        this.submit = this.submit.bind(this);
        this.setState = this.setState.bind(this);
        this.onValid = this.onValid.bind(this);
        this.onComplete = this.onComplete.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this.handleAction = this.handleAction.bind(this);
        this.handleOrder = this.handleOrder.bind(this);
        this.handleResponse = this.handleResponse.bind(this);
        this.setElementStatus = this.setElementStatus.bind(this);
        this.elementRef = props && props.elementRef || this;
    }
    setState(newState) {
        this.state = {
            ...this.state,
            ...newState
        };
        this.onChange();
    }
    onChange() {
        const isValid = this.isValid;
        const state = {
            data: this.data,
            errors: this.state.errors,
            valid: this.state.valid,
            isValid
        };
        if (this.props.onChange) this.props.onChange(state, this.elementRef);
        if (isValid) this.onValid();
        return state;
    }
    onSubmit() {
        //TODO: refactor this, instant payment methods are part of Dropin logic not UIElement
        if (this.props.isInstantPayment) {
            const dropinElementRef = this.elementRef;
            dropinElementRef.closeActivePaymentMethod();
        }
        if (this.props.setStatusAutomatically) {
            this.setElementStatus('loading');
        }
        if (this.props.onSubmit) {
            // Classic flow
            this.props.onSubmit({
                data: this.data,
                isValid: this.isValid
            }, this.elementRef);
        } else if (this._parentInstance.session) {
            // Session flow
            // wrap beforeSubmit callback in a promise
            const beforeSubmitEvent = this.props.beforeSubmit ? new Promise((resolve, reject)=>this.props.beforeSubmit(this.data, this.elementRef, {
                    resolve,
                    reject
                })) : Promise.resolve(this.data);
            beforeSubmitEvent.then((data)=>this.submitPayment(data)).catch(()=>{
                // set state as ready to submit if the merchant cancels the action
                this.elementRef.setStatus('ready');
            });
        } else {
            this.handleError(new AdyenCheckoutError('IMPLEMENTATION_ERROR', 'Could not submit the payment'));
        }
    }
    onValid() {
        const state = {
            data: this.data
        };
        if (this.props.onValid) this.props.onValid(state, this.elementRef);
        return state;
    }
    onComplete(state) {
        if (this.props.onComplete) this.props.onComplete(state, this.elementRef);
    }
    /**
     * Submit payment method data. If the form is not valid, it will trigger validation.
     */ submit() {
        if (!this.isValid) {
            this.showValidation();
            return;
        }
        this.onSubmit();
    }
    showValidation() {
        if (this.componentRef && this.componentRef.showValidation) this.componentRef.showValidation();
        return this;
    }
    setElementStatus(status, props) {
        this.elementRef?.setStatus(status, props);
        return this;
    }
    setStatus(status, props) {
        if (this.componentRef?.setStatus) {
            this.componentRef.setStatus(status, props);
        }
        return this;
    }
    submitPayment(data) {
        return this._parentInstance.session.submitPayment(data).then(this.handleResponse).catch((error)=>this.handleError(error));
    }
    submitAdditionalDetails(data) {
        return this._parentInstance.session.submitDetails(data).then(this.handleResponse).catch(this.handleError);
    }
    handleError = (error)=>{
        /**
         * Set status using elementRef, which:
         * - If Drop-in, will set status for Dropin component, and then it will propagate the new status for the active payment method component
         * - If Component, it will set its own status
         */ this.setElementStatus('ready');
        if (this.props.onError) {
            this.props.onError(error, this.elementRef);
        }
    };
    handleAdditionalDetails = (state)=>{
        if (this.props.onAdditionalDetails) {
            this.props.onAdditionalDetails(state, this.elementRef);
        } else if (this.props.session) {
            this.submitAdditionalDetails(state.data);
        }
        return state;
    };
    handleAction(action, props = {}) {
        if (!action || !action.type) {
            if (hasOwnProperty(action, 'action') && hasOwnProperty(action, 'resultCode')) {
                throw new Error('handleAction::Invalid Action - the passed action object itself has an "action" property and ' + 'a "resultCode": have you passed in the whole response object by mistake?');
            }
            throw new Error('handleAction::Invalid Action - the passed action object does not have a "type" property');
        }
        const paymentAction = this._parentInstance.createFromAction(action, {
            ...this.elementRef.props,
            ...props,
            onAdditionalDetails: this.handleAdditionalDetails
        });
        if (paymentAction) {
            this.unmount();
            return paymentAction.mount(this._node);
        }
        return null;
    }
    handleOrder = (response)=>{
        this.updateParent({
            order: response.order
        });
        // in case we receive an order in any other component then a GiftCard trigger handleFinalResult
        if (this.props.onPaymentCompleted) this.props.onPaymentCompleted(response, this.elementRef);
    };
    handleFinalResult = (result)=>{
        if (this.props.setStatusAutomatically) {
            const [status, statusProps] = resolveFinalResult(result);
            if (status) this.setElementStatus(status, statusProps);
        }
        if (this.props.onPaymentCompleted) this.props.onPaymentCompleted(result, this.elementRef);
        return result;
    };
    /**
     * Handles a session /payments or /payments/details response.
     * The component will handle automatically actions, orders, and final results.
     * @param rawResponse -
     */ handleResponse(rawResponse) {
        const response = getSanitizedResponse(rawResponse);
        if (response.action) {
            this.elementRef.handleAction(response.action);
        } else if (response.order?.remainingAmount?.value > 0) {
            // we don't want to call elementRef here, use the component handler
            // we do this way so the logic on handlingOrder is associated with payment method
            this.handleOrder(response);
        } else {
            this.elementRef.handleFinalResult(response);
        }
    }
    /**
     * Call update on parent instance
     * This function exist to make safe access to the protect _parentInstance
     * @param options - CoreOptions
     */ updateParent(options = {}) {
        return this.elementRef._parentInstance.update(options);
    }
    setComponentRef = (ref)=>{
        this.componentRef = ref;
    };
    /**
     * Get the current validation status of the element
     */ get isValid() {
        return false;
    }
    /**
     * Get the element icon URL for the current environment
     */ get icon() {
        return this.props.icon ?? this.resources.getImage({
            loadingContext: this.props.loadingContext
        })(this.constructor['type']);
    }
    /**
     * Get the element's displayable name
     */ get displayName() {
        return this.props.name || this.constructor['type'];
    }
    /**
     * Get the element accessible name, used in the aria-label of the button that controls selected payment method
     */ get accessibleName() {
        return this.displayName;
    }
    /**
     * Return the type of an element
     */ get type() {
        return this.props.type || this.constructor['type'];
    }
    /**
     * Get the payButton component for the current element
     */ payButton = (props)=>{
        return /*#__PURE__*/ h$1(PayButton, {
            ...props,
            amount: this.props.amount,
            secondaryAmount: this.props.secondaryAmount,
            onClick: this.submit
        });
    };
}

/**
 * CoreProvider Component
 * Wraps a component delaying the render until after the i18n module is fully loaded
 */ class CoreProvider extends Component {
    state = {
        loaded: false
    };
    componentDidMount() {
        if (this.props.i18n) {
            this.props.i18n.loaded.then(()=>{
                this.setState({
                    loaded: true
                });
            });
        } else {
            this.setState({
                loaded: true
            });
        }
        if (!this.props.i18n || !this.props.loadingContext || !this.props.resources) {
            console.error('CoreProvider - WARNING core provider is missing one of the following: i18n, loadingContext or resources');
        }
    }
    render({ children }) {
        if (this.state.loaded) {
            return /*#__PURE__*/ h$1(CoreContext.Provider, {
                value: {
                    i18n: this.props.i18n,
                    loadingContext: this.props.loadingContext,
                    commonProps: this.props.commonProps || {},
                    resources: this.props.resources
                }
            }, toChildArray(children));
        }
        return null;
    }
}

class RedirectShopper extends Component {
    postForm;
    static defaultProps = {
        beforeRedirect: (resolve)=>resolve(),
        method: 'GET'
    };
    componentDidMount() {
        const doRedirect = ()=>{
            if (this.postForm) {
                this.postForm.submit();
            } else {
                window.location.assign(this.props.url);
            }
        };
        const dispatchEvent = new Promise((resolve, reject)=>this.props.beforeRedirect(resolve, reject, {
                url: this.props.url,
                method: this.props.method,
                ...this.props.data ? {
                    data: this.props.data
                } : {}
            }));
        dispatchEvent.then(doRedirect).catch(()=>{});
    }
    render({ url, method, data = {} }) {
        if (method === 'POST') {
            return /*#__PURE__*/ h$1("form", {
                method: "post",
                action: url,
                style: {
                    display: 'none'
                },
                ref: (ref)=>{
                    this.postForm = ref;
                }
            }, Object.keys(data).map((key)=>/*#__PURE__*/ h$1("input", {
                    type: "hidden",
                    name: key,
                    key: key,
                    value: data[key]
                })));
        }
        return null;
    }
}

function RedirectButton({ label = null, icon = null, payButton, onSubmit, amount = null, name, ...props }) {
    const { i18n } = useCoreContext();
    const [status, setStatus] = h('ready');
    this.setStatus = (newStatus)=>{
        setStatus(newStatus);
    };
    const payButtonLabel = ()=>{
        const isZeroAuth = amount && ({}).hasOwnProperty.call(amount, 'value') && amount.value === 0;
        if (isZeroAuth) return `${i18n.get('preauthorizeWith')} ${name}`;
        return `${i18n.get('continueTo')} ${name}`;
    };
    return /*#__PURE__*/ h$1(Fragment, null, payButton({
        ...props,
        status,
        icon,
        classNameModifiers: [
            'standalone'
        ],
        label: label || payButtonLabel(),
        onClick: onSubmit
    }));
}

/**
 * RedirectElement
 */ class RedirectElement extends UIElement {
    static type = 'redirect';
    static defaultProps = {
        type: RedirectElement.type,
        showPayButton: true
    };
    formatProps(props) {
        return {
            ...props,
            showButton: !!props.showPayButton
        };
    }
    /**
     * Formats the component data output
     */ formatData() {
        return {
            paymentMethod: {
                type: this.props.type
            }
        };
    }
    /**
     * Returns whether the component state is valid or not
     */ get isValid() {
        return true;
    }
    get icon() {
        return this.resources.getImage({
            loadingContext: this.props.loadingContext
        })(this.props.type);
    }
    render() {
        if (this.props.url && this.props.method) {
            return /*#__PURE__*/ h$1(RedirectShopper, this.props);
        }
        if (this.props.showButton) {
            return /*#__PURE__*/ h$1(CoreProvider, {
                i18n: this.props.i18n,
                loadingContext: this.props.loadingContext,
                resources: this.resources
            }, /*#__PURE__*/ h$1(RedirectButton, {
                ...this.props,
                onSubmit: this.submit,
                payButton: this.payButton,
                ref: (ref)=>{
                    this.componentRef = ref;
                }
            }));
        }
        return null;
    }
}

// import { AfterPay, AfterPayB2B } from './AfterPay';
// import SecuredFields from './SecuredFields';
// import Sepa from './Sepa';
// import { ThreeDS2DeviceFingerprint, ThreeDS2Challenge } from './ThreeDS2';
// import WeChat from './WeChat';
// import PayNow from './PayNow';
// import BcmcMobile from './BcmcMobile';
// import { MolPayEBankingMY, MolPayEBankingTH, MolPayEBankingVN } from './MolPayEBanking';
// import Dragonpay from './Dragonpay';
// import Doku from './Doku';
// import Boleto from './Boleto';
// import Oxxo from './Oxxo';
// import Multibanco from './Multibanco';
// import Dotpay from './Dotpay';
// import Eps from './EPS';
// import Giftcard from './Giftcard';
// import Vipps from './Vipps';
// import { PayuCashcard, PayuNetBanking } from './PayU';
// import RatePay from './RatePay';
// import Swish from './Swish';
// import Dropin from './Dropin';
// import Ach from './Ach';
// import MBWay from './MBWay';
// import Blik from './Blik';
// import BankTransfer from './BankTransfer';
// import Affirm from './Affirm';
// import Pix from './Pix';
// import uuid from '../utils/uuid';
// import BacsDD from './BacsDD';
// import Address from './Address';
// import PersonalDetails from './PersonalDetails';
// import Klarna from './Klarna';
// import Twint from './Twint';
// import MealVoucherFR from './MealVoucherFR';
// import OnlineBankingINElement from './OnlineBankingIN';
// import OnlinebankingPL from './OnlinebankingPL';
// import RatePayDirectDebit from './RatePay/RatePayDirectDebit';
// import UPI from './UPI';
// import WalletINElement from './WalletIN';
// import OnlineBankingCZElement from './OnlineBankingCZ';
// import OnlineBankingSKElement from './OnlineBankingSK';
// import PayByBank from './PayByBank';
// import PromptPay from './PromptPay';
// import Duitnow from './DuitNow';
/**
 * Maps each component with a Component element.
 */ // const componentsMap = {
//     /** internal */
//     address: Address,
//     bankTransfer_IBAN: BankTransfer,
//     donation: Donation,
//     dropin: Dropin,
//     personal_details: PersonalDetails,
//     /** internal */
//
//     /** Card */
//     amex: Card,
//     bcmc: Bancontact,
//     card: Card,
//     diners: Card,
//     discover: Card,
//     jcb: Card,
//     kcp: Card,
//     maestro: Card,
//     mc: Card,
//     scheme: Card,
//     storedCard: Card,
//     securedfields: SecuredFields,
//     threeDS2Challenge: ThreeDS2Challenge,
//     threeDS2DeviceFingerprint: ThreeDS2DeviceFingerprint,
//     visa: Card,
//     /** Card */
//
//     /** Direct debit */
//     ach: Ach,
//     directdebit_GB: BacsDD,
//     sepadirectdebit: Sepa,
//     /** Direct debit */
//
//     /** Open Invoice */
//     affirm: Affirm,
//     afterpay: AfterPay,
//     afterpay_default: AfterPay,
//     afterpay_b2b: AfterPayB2B,
//     atome: Atome,
//     facilypay_3x: FacilyPay3x,
//     facilypay_4x: FacilyPay4x,
//     facilypay_6x: FacilyPay6x,
//     facilypay_10x: FacilyPay10x,
//     facilypay_12x: FacilyPay12x,
//     ratepay: RatePay,
//     ratepay_directdebit: RatePayDirectDebit,
//     /** Open Invoice */
//
//     /** Wallets */
//     amazonpay: AmazonPay,
//     applepay: ApplePay,
//     cashapp: CashAppPay,
//     clicktopay: ClickToPay,
//     googlepay: GooglePay,
//     paypal: PayPal,
//     paywithgoogle: GooglePay,
//     qiwiwallet: QiwiWallet,
//     /** Wallets */
//
//     /** Voucher */
//     boletobancario: Boleto,
//     boletobancario_bancodobrasil: Boleto,
//     boletobancario_bradesco: Boleto,
//     boletobancario_hsbc: Boleto,
//     boletobancario_itau: Boleto,
//     boletobancario_santander: Boleto,
//     doku: Doku,
//     doku_alfamart: Doku,
//     doku_permata_lite_atm: Doku,
//     doku_indomaret: Doku,
//     doku_atm_mandiri_va: Doku,
//     doku_sinarmas_va: Doku,
//     doku_mandiri_va: Doku,
//     doku_cimb_va: Doku,
//     doku_danamon_va: Doku,
//     doku_bri_va: Doku,
//     doku_bni_va: Doku,
//     doku_bca_va: Doku,
//     doku_wallet: Doku,
//     oxxo: Oxxo,
//     primeiropay_boleto: Boleto,
//     /** Voucher */
//
//     /** issuerList */
//     billdesk_online: BillDeskOnline,
//     billdesk_wallet: BillDeskWallet,
//     dotpay: Dotpay,
//     entercash: Entercash,
//     eps: Eps,
//     ideal: Ideal,
//     molpay_ebanking_fpx_MY: MolPayEBankingMY,
//     molpay_ebanking_TH: MolPayEBankingTH,
//     molpay_ebanking_VN: MolPayEBankingVN,
//     onlineBanking: Dotpay,
//     onlineBanking_CZ: OnlineBankingCZElement,
//     onlinebanking_IN: OnlineBankingINElement, // NOTE : the txVariant does have a lowercase "b"
//     onlineBanking_PL: OnlinebankingPL,
//     onlineBanking_SK: OnlineBankingSKElement,
//     paybybank: PayByBank,
//     payu_IN_cashcard: PayuCashcard,
//     payu_IN_nb: PayuNetBanking,
//     wallet_IN: WalletINElement,
//     /** issuerList */
//
//     /** Dragonpay */
//     dragonpay_ebanking: Dragonpay,
//     dragonpay_otc_banking: Dragonpay,
//     dragonpay_otc_non_banking: Dragonpay,
//     dragonpay_otc_philippines: Dragonpay,
//     /** Dragonpay */
//
//     /** Econtext */
//     econtext_atm: Econtext,
//     econtext_online: Econtext,
//     econtext_seven_eleven: Econtext,
//     econtext_stores: Econtext,
//     /** Econtext */
//
//     /** Redirect */
//     giropay: Giropay,
//     multibanco: Multibanco,
//     redirect: Redirect,
//     twint: Twint,
//     vipps: Vipps,
//     /** Redirect */
//
//     /** Klarna */
//     klarna: Klarna,
//     klarna_account: Klarna,
//     klarna_paynow: Klarna,
//     /** Klarna */
//
//     /** QRLoader */
//     bcmc_mobile: BcmcMobile,
//     bcmc_mobile_QR: BcmcMobile,
//     pix: Pix,
//     swish: Swish,
//     wechatpay: WeChat,
//     wechatpayQR: WeChat,
//     promptpay: PromptPay,
//     paynow: PayNow,
//     duitnow: Duitnow,
//     /** QRLoader */
//
//     /** Await */
//     blik: Blik,
//     mbway: MBWay,
//     upi: UPI, // also QR
//     upi_qr: UPI, // also QR
//     upi_collect: UPI, // also QR
//     /** Await */
//
//     /** Giftcard */
//     giftcard: Giftcard,
//     mealVoucher_FR_natixis: MealVoucherFR,
//     mealVoucher_FR_sodexo: MealVoucherFR,
//     mealVoucher_FR_groupeup: MealVoucherFR,
//     /** Giftcard */
//
//     default: null
// };
// /**
//  * Instantiates a new Component element either by class reference or by name
//  * It also assigns a new uuid to each instance, so we can recognize it during the current session
//  * @param componentType - class or componentsMap's key
//  * @param props - for the new Component element
//  * @returns new PaymentMethod or null
//  */
// export const getComponent = (componentType, props) => {
//     const Component = componentsMap[componentType] || componentsMap.default;
//     return Component ? new Component({ ...props, id: `${componentType}-${uuid()}` }) : null;
// };
//
// /**
//  * Gets the configuration for type from componentsConfig
//  * @param type - component type
//  * @param componentsConfig - global paymentMethodsConfiguration
//  * @returns component configuration
//  */
const getComponentConfiguration = (type, componentsConfig = {}, isStoredCard = false)=>{
    let pmType = type;
    if (type === 'scheme') {
        pmType = isStoredCard ? 'storedCard' : 'card';
    }
    return componentsConfig[pmType] || {};
};

function filterAllowedPaymentMethods(pm) {
    return !this.length || this.indexOf(pm.type) > -1;
}
function filterRemovedPaymentMethods(pm) {
    return !this.length || this.indexOf(pm.type) < 0;
}
function filterEcomStoredPaymentMethods(pm) {
    return !!pm && !!pm.supportedShopperInteractions && pm.supportedShopperInteractions.includes('Ecommerce');
}
const supportedStoredPaymentMethods = [
    'scheme',
    'blik',
    'twint',
    'ach',
    'cashapp'
];
function filterSupportedStoredPaymentMethods(pm) {
    return !!pm && !!pm.type && supportedStoredPaymentMethods.includes(pm.type);
}

const processStoredPaymentMethod = (pm)=>({
        ...pm,
        storedPaymentMethodId: pm.id
    });
const processPaymentMethods = (paymentMethods, { allowPaymentMethods = [], removePaymentMethods = [] })=>{
    if (!paymentMethods) return [];
    return paymentMethods.filter(filterAllowedPaymentMethods, allowPaymentMethods).filter(filterRemovedPaymentMethods, removePaymentMethods);
};
const processStoredPaymentMethods = (storedPaymentMethods, { allowPaymentMethods = [], removePaymentMethods = [] })=>{
    if (!storedPaymentMethods) return [];
    return storedPaymentMethods.filter(filterSupportedStoredPaymentMethods) // only display supported stored payment methods
    .filter(filterAllowedPaymentMethods, allowPaymentMethods).filter(filterRemovedPaymentMethods, removePaymentMethods).filter(filterEcomStoredPaymentMethods) // Only accept Ecommerce shopper interactions
    .map(processStoredPaymentMethod);
};
const checkPaymentMethodsResponse = (paymentMethodsResponse)=>{
    if (typeof paymentMethodsResponse === 'string') {
        throw new Error('paymentMethodsResponse was provided but of an incorrect type (should be an object but a string was provided).' + 'Try JSON.parse("{...}") your paymentMethodsResponse.');
    }
    if (paymentMethodsResponse instanceof Array) {
        throw new Error('paymentMethodsResponse was provided but of an incorrect type (should be an object but an array was provided).' + 'Please check you are passing the whole response.');
    }
    if (paymentMethodsResponse && !paymentMethodsResponse?.paymentMethods?.length && !paymentMethodsResponse?.storedPaymentMethods?.length) {
        console.warn('paymentMethodsResponse was provided but no payment methods were found.');
    }
};

class PaymentMethodsResponse {
    paymentMethods = [];
    storedPaymentMethods = [];
    constructor(response, options = {}){
        checkPaymentMethodsResponse(response);
        this.paymentMethods = response ? processPaymentMethods(response.paymentMethods, options) : [];
        this.storedPaymentMethods = response ? processStoredPaymentMethods(response.storedPaymentMethods, options) : [];
    }
    mapCreatedComponentType(pmType) {
        // Components created as 'card' need to be matched with paymentMethod response objects with type 'scheme'
        return pmType === 'card' ? 'scheme' : pmType;
    }
    has(paymentMethod) {
        return Boolean(this.paymentMethods.find((pm)=>pm.type === this.mapCreatedComponentType(paymentMethod)));
    }
    find(paymentMethod) {
        return this.paymentMethods.find((pm)=>pm.type === this.mapCreatedComponentType(paymentMethod));
    }
}

/**
 * Filter properties in a global configuration object from an allow list (GENERIC_OPTIONS)
 * @param globalOptions -
 * @returns any
 */ function processGlobalOptions(globalOptions) {
    return Object.keys(globalOptions).reduce((r, e)=>{
        if (GENERIC_OPTIONS.includes(e)) r[e] = globalOptions[e];
        return r;
    }, {});
}

var global =
  (typeof globalThis !== 'undefined' && globalThis) ||
  (typeof self !== 'undefined' && self) ||
  (typeof global !== 'undefined' && global);

var support = {
  searchParams: 'URLSearchParams' in global,
  iterable: 'Symbol' in global && 'iterator' in Symbol,
  blob:
    'FileReader' in global &&
    'Blob' in global &&
    (function() {
      try {
        new Blob();
        return true
      } catch (e) {
        return false
      }
    })(),
  formData: 'FormData' in global,
  arrayBuffer: 'ArrayBuffer' in global
};

function isDataView(obj) {
  return obj && DataView.prototype.isPrototypeOf(obj)
}

if (support.arrayBuffer) {
  var viewClasses = [
    '[object Int8Array]',
    '[object Uint8Array]',
    '[object Uint8ClampedArray]',
    '[object Int16Array]',
    '[object Uint16Array]',
    '[object Int32Array]',
    '[object Uint32Array]',
    '[object Float32Array]',
    '[object Float64Array]'
  ];

  var isArrayBufferView =
    ArrayBuffer.isView ||
    function(obj) {
      return obj && viewClasses.indexOf(Object.prototype.toString.call(obj)) > -1
    };
}

function normalizeName(name) {
  if (typeof name !== 'string') {
    name = String(name);
  }
  if (/[^a-z0-9\-#$%&'*+.^_`|~!]/i.test(name) || name === '') {
    throw new TypeError('Invalid character in header field name: "' + name + '"')
  }
  return name.toLowerCase()
}

function normalizeValue(value) {
  if (typeof value !== 'string') {
    value = String(value);
  }
  return value
}

// Build a destructive iterator for the value list
function iteratorFor(items) {
  var iterator = {
    next: function() {
      var value = items.shift();
      return {done: value === undefined, value: value}
    }
  };

  if (support.iterable) {
    iterator[Symbol.iterator] = function() {
      return iterator
    };
  }

  return iterator
}

function Headers(headers) {
  this.map = {};

  if (headers instanceof Headers) {
    headers.forEach(function(value, name) {
      this.append(name, value);
    }, this);
  } else if (Array.isArray(headers)) {
    headers.forEach(function(header) {
      this.append(header[0], header[1]);
    }, this);
  } else if (headers) {
    Object.getOwnPropertyNames(headers).forEach(function(name) {
      this.append(name, headers[name]);
    }, this);
  }
}

Headers.prototype.append = function(name, value) {
  name = normalizeName(name);
  value = normalizeValue(value);
  var oldValue = this.map[name];
  this.map[name] = oldValue ? oldValue + ', ' + value : value;
};

Headers.prototype['delete'] = function(name) {
  delete this.map[normalizeName(name)];
};

Headers.prototype.get = function(name) {
  name = normalizeName(name);
  return this.has(name) ? this.map[name] : null
};

Headers.prototype.has = function(name) {
  return this.map.hasOwnProperty(normalizeName(name))
};

Headers.prototype.set = function(name, value) {
  this.map[normalizeName(name)] = normalizeValue(value);
};

Headers.prototype.forEach = function(callback, thisArg) {
  for (var name in this.map) {
    if (this.map.hasOwnProperty(name)) {
      callback.call(thisArg, this.map[name], name, this);
    }
  }
};

Headers.prototype.keys = function() {
  var items = [];
  this.forEach(function(value, name) {
    items.push(name);
  });
  return iteratorFor(items)
};

Headers.prototype.values = function() {
  var items = [];
  this.forEach(function(value) {
    items.push(value);
  });
  return iteratorFor(items)
};

Headers.prototype.entries = function() {
  var items = [];
  this.forEach(function(value, name) {
    items.push([name, value]);
  });
  return iteratorFor(items)
};

if (support.iterable) {
  Headers.prototype[Symbol.iterator] = Headers.prototype.entries;
}

function consumed(body) {
  if (body.bodyUsed) {
    return Promise.reject(new TypeError('Already read'))
  }
  body.bodyUsed = true;
}

function fileReaderReady(reader) {
  return new Promise(function(resolve, reject) {
    reader.onload = function() {
      resolve(reader.result);
    };
    reader.onerror = function() {
      reject(reader.error);
    };
  })
}

function readBlobAsArrayBuffer(blob) {
  var reader = new FileReader();
  var promise = fileReaderReady(reader);
  reader.readAsArrayBuffer(blob);
  return promise
}

function readBlobAsText(blob) {
  var reader = new FileReader();
  var promise = fileReaderReady(reader);
  reader.readAsText(blob);
  return promise
}

function readArrayBufferAsText(buf) {
  var view = new Uint8Array(buf);
  var chars = new Array(view.length);

  for (var i = 0; i < view.length; i++) {
    chars[i] = String.fromCharCode(view[i]);
  }
  return chars.join('')
}

function bufferClone(buf) {
  if (buf.slice) {
    return buf.slice(0)
  } else {
    var view = new Uint8Array(buf.byteLength);
    view.set(new Uint8Array(buf));
    return view.buffer
  }
}

function Body() {
  this.bodyUsed = false;

  this._initBody = function(body) {
    /*
      fetch-mock wraps the Response object in an ES6 Proxy to
      provide useful test harness features such as flush. However, on
      ES5 browsers without fetch or Proxy support pollyfills must be used;
      the proxy-pollyfill is unable to proxy an attribute unless it exists
      on the object before the Proxy is created. This change ensures
      Response.bodyUsed exists on the instance, while maintaining the
      semantic of setting Request.bodyUsed in the constructor before
      _initBody is called.
    */
    this.bodyUsed = this.bodyUsed;
    this._bodyInit = body;
    if (!body) {
      this._bodyText = '';
    } else if (typeof body === 'string') {
      this._bodyText = body;
    } else if (support.blob && Blob.prototype.isPrototypeOf(body)) {
      this._bodyBlob = body;
    } else if (support.formData && FormData.prototype.isPrototypeOf(body)) {
      this._bodyFormData = body;
    } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
      this._bodyText = body.toString();
    } else if (support.arrayBuffer && support.blob && isDataView(body)) {
      this._bodyArrayBuffer = bufferClone(body.buffer);
      // IE 10-11 can't handle a DataView body.
      this._bodyInit = new Blob([this._bodyArrayBuffer]);
    } else if (support.arrayBuffer && (ArrayBuffer.prototype.isPrototypeOf(body) || isArrayBufferView(body))) {
      this._bodyArrayBuffer = bufferClone(body);
    } else {
      this._bodyText = body = Object.prototype.toString.call(body);
    }

    if (!this.headers.get('content-type')) {
      if (typeof body === 'string') {
        this.headers.set('content-type', 'text/plain;charset=UTF-8');
      } else if (this._bodyBlob && this._bodyBlob.type) {
        this.headers.set('content-type', this._bodyBlob.type);
      } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
        this.headers.set('content-type', 'application/x-www-form-urlencoded;charset=UTF-8');
      }
    }
  };

  if (support.blob) {
    this.blob = function() {
      var rejected = consumed(this);
      if (rejected) {
        return rejected
      }

      if (this._bodyBlob) {
        return Promise.resolve(this._bodyBlob)
      } else if (this._bodyArrayBuffer) {
        return Promise.resolve(new Blob([this._bodyArrayBuffer]))
      } else if (this._bodyFormData) {
        throw new Error('could not read FormData body as blob')
      } else {
        return Promise.resolve(new Blob([this._bodyText]))
      }
    };

    this.arrayBuffer = function() {
      if (this._bodyArrayBuffer) {
        var isConsumed = consumed(this);
        if (isConsumed) {
          return isConsumed
        }
        if (ArrayBuffer.isView(this._bodyArrayBuffer)) {
          return Promise.resolve(
            this._bodyArrayBuffer.buffer.slice(
              this._bodyArrayBuffer.byteOffset,
              this._bodyArrayBuffer.byteOffset + this._bodyArrayBuffer.byteLength
            )
          )
        } else {
          return Promise.resolve(this._bodyArrayBuffer)
        }
      } else {
        return this.blob().then(readBlobAsArrayBuffer)
      }
    };
  }

  this.text = function() {
    var rejected = consumed(this);
    if (rejected) {
      return rejected
    }

    if (this._bodyBlob) {
      return readBlobAsText(this._bodyBlob)
    } else if (this._bodyArrayBuffer) {
      return Promise.resolve(readArrayBufferAsText(this._bodyArrayBuffer))
    } else if (this._bodyFormData) {
      throw new Error('could not read FormData body as text')
    } else {
      return Promise.resolve(this._bodyText)
    }
  };

  if (support.formData) {
    this.formData = function() {
      return this.text().then(decode)
    };
  }

  this.json = function() {
    return this.text().then(JSON.parse)
  };

  return this
}

// HTTP methods whose capitalization should be normalized
var methods = ['DELETE', 'GET', 'HEAD', 'OPTIONS', 'POST', 'PUT'];

function normalizeMethod(method) {
  var upcased = method.toUpperCase();
  return methods.indexOf(upcased) > -1 ? upcased : method
}

function Request(input, options) {
  if (!(this instanceof Request)) {
    throw new TypeError('Please use the "new" operator, this DOM object constructor cannot be called as a function.')
  }

  options = options || {};
  var body = options.body;

  if (input instanceof Request) {
    if (input.bodyUsed) {
      throw new TypeError('Already read')
    }
    this.url = input.url;
    this.credentials = input.credentials;
    if (!options.headers) {
      this.headers = new Headers(input.headers);
    }
    this.method = input.method;
    this.mode = input.mode;
    this.signal = input.signal;
    if (!body && input._bodyInit != null) {
      body = input._bodyInit;
      input.bodyUsed = true;
    }
  } else {
    this.url = String(input);
  }

  this.credentials = options.credentials || this.credentials || 'same-origin';
  if (options.headers || !this.headers) {
    this.headers = new Headers(options.headers);
  }
  this.method = normalizeMethod(options.method || this.method || 'GET');
  this.mode = options.mode || this.mode || null;
  this.signal = options.signal || this.signal;
  this.referrer = null;

  if ((this.method === 'GET' || this.method === 'HEAD') && body) {
    throw new TypeError('Body not allowed for GET or HEAD requests')
  }
  this._initBody(body);

  if (this.method === 'GET' || this.method === 'HEAD') {
    if (options.cache === 'no-store' || options.cache === 'no-cache') {
      // Search for a '_' parameter in the query string
      var reParamSearch = /([?&])_=[^&]*/;
      if (reParamSearch.test(this.url)) {
        // If it already exists then set the value with the current time
        this.url = this.url.replace(reParamSearch, '$1_=' + new Date().getTime());
      } else {
        // Otherwise add a new '_' parameter to the end with the current time
        var reQueryString = /\?/;
        this.url += (reQueryString.test(this.url) ? '&' : '?') + '_=' + new Date().getTime();
      }
    }
  }
}

Request.prototype.clone = function() {
  return new Request(this, {body: this._bodyInit})
};

function decode(body) {
  var form = new FormData();
  body
    .trim()
    .split('&')
    .forEach(function(bytes) {
      if (bytes) {
        var split = bytes.split('=');
        var name = split.shift().replace(/\+/g, ' ');
        var value = split.join('=').replace(/\+/g, ' ');
        form.append(decodeURIComponent(name), decodeURIComponent(value));
      }
    });
  return form
}

function parseHeaders(rawHeaders) {
  var headers = new Headers();
  // Replace instances of \r\n and \n followed by at least one space or horizontal tab with a space
  // https://tools.ietf.org/html/rfc7230#section-3.2
  var preProcessedHeaders = rawHeaders.replace(/\r?\n[\t ]+/g, ' ');
  // Avoiding split via regex to work around a common IE11 bug with the core-js 3.6.0 regex polyfill
  // https://github.com/github/fetch/issues/748
  // https://github.com/zloirock/core-js/issues/751
  preProcessedHeaders
    .split('\r')
    .map(function(header) {
      return header.indexOf('\n') === 0 ? header.substr(1, header.length) : header
    })
    .forEach(function(line) {
      var parts = line.split(':');
      var key = parts.shift().trim();
      if (key) {
        var value = parts.join(':').trim();
        headers.append(key, value);
      }
    });
  return headers
}

Body.call(Request.prototype);

function Response(bodyInit, options) {
  if (!(this instanceof Response)) {
    throw new TypeError('Please use the "new" operator, this DOM object constructor cannot be called as a function.')
  }
  if (!options) {
    options = {};
  }

  this.type = 'default';
  this.status = options.status === undefined ? 200 : options.status;
  this.ok = this.status >= 200 && this.status < 300;
  this.statusText = options.statusText === undefined ? '' : '' + options.statusText;
  this.headers = new Headers(options.headers);
  this.url = options.url || '';
  this._initBody(bodyInit);
}

Body.call(Response.prototype);

Response.prototype.clone = function() {
  return new Response(this._bodyInit, {
    status: this.status,
    statusText: this.statusText,
    headers: new Headers(this.headers),
    url: this.url
  })
};

Response.error = function() {
  var response = new Response(null, {status: 0, statusText: ''});
  response.type = 'error';
  return response
};

var redirectStatuses = [301, 302, 303, 307, 308];

Response.redirect = function(url, status) {
  if (redirectStatuses.indexOf(status) === -1) {
    throw new RangeError('Invalid status code')
  }

  return new Response(null, {status: status, headers: {location: url}})
};

var DOMException = global.DOMException;
try {
  new DOMException();
} catch (err) {
  DOMException = function(message, name) {
    this.message = message;
    this.name = name;
    var error = Error(message);
    this.stack = error.stack;
  };
  DOMException.prototype = Object.create(Error.prototype);
  DOMException.prototype.constructor = DOMException;
}

function fetch$1(input, init) {
  return new Promise(function(resolve, reject) {
    var request = new Request(input, init);

    if (request.signal && request.signal.aborted) {
      return reject(new DOMException('Aborted', 'AbortError'))
    }

    var xhr = new XMLHttpRequest();

    function abortXhr() {
      xhr.abort();
    }

    xhr.onload = function() {
      var options = {
        status: xhr.status,
        statusText: xhr.statusText,
        headers: parseHeaders(xhr.getAllResponseHeaders() || '')
      };
      options.url = 'responseURL' in xhr ? xhr.responseURL : options.headers.get('X-Request-URL');
      var body = 'response' in xhr ? xhr.response : xhr.responseText;
      setTimeout(function() {
        resolve(new Response(body, options));
      }, 0);
    };

    xhr.onerror = function() {
      setTimeout(function() {
        reject(new TypeError('Network request failed'));
      }, 0);
    };

    xhr.ontimeout = function() {
      setTimeout(function() {
        reject(new TypeError('Network request failed'));
      }, 0);
    };

    xhr.onabort = function() {
      setTimeout(function() {
        reject(new DOMException('Aborted', 'AbortError'));
      }, 0);
    };

    function fixUrl(url) {
      try {
        return url === '' && global.location.href ? global.location.href : url
      } catch (e) {
        return url
      }
    }

    xhr.open(request.method, fixUrl(request.url), true);

    if (request.credentials === 'include') {
      xhr.withCredentials = true;
    } else if (request.credentials === 'omit') {
      xhr.withCredentials = false;
    }

    if ('responseType' in xhr) {
      if (support.blob) {
        xhr.responseType = 'blob';
      } else if (
        support.arrayBuffer &&
        request.headers.get('Content-Type') &&
        request.headers.get('Content-Type').indexOf('application/octet-stream') !== -1
      ) {
        xhr.responseType = 'arraybuffer';
      }
    }

    if (init && typeof init.headers === 'object' && !(init.headers instanceof Headers)) {
      Object.getOwnPropertyNames(init.headers).forEach(function(name) {
        xhr.setRequestHeader(name, normalizeValue(init.headers[name]));
      });
    } else {
      request.headers.forEach(function(value, name) {
        xhr.setRequestHeader(name, value);
      });
    }

    if (request.signal) {
      request.signal.addEventListener('abort', abortXhr);

      xhr.onreadystatechange = function() {
        // DONE (success or failure)
        if (xhr.readyState === 4) {
          request.signal.removeEventListener('abort', abortXhr);
        }
      };
    }

    xhr.send(typeof request._bodyInit === 'undefined' ? null : request._bodyInit);
  })
}

fetch$1.polyfill = true;

if (!global.fetch) {
  global.fetch = fetch$1;
  global.Headers = Headers;
  global.Request = Request;
  global.Response = Response;
}

const fetch = typeof window !== 'undefined' && 'fetch' in window ? window.fetch : fetch$1;

function isAdyenErrorResponse(data) {
    return data && data.errorCode && data.errorType && data.message && data.status;
}
function http(options, data) {
    const { headers = [], errorLevel = 'warn', loadingContext = FALLBACK_CONTEXT$1, method = 'GET', path } = options;
    const request = {
        method,
        mode: 'cors',
        cache: 'default',
        credentials: 'same-origin',
        headers: {
            Accept: 'application/json, text/plain, */*',
            'Content-Type': method === 'POST' ? 'application/json' : 'text/plain',
            ...headers
        },
        redirect: 'follow',
        referrerPolicy: 'no-referrer-when-downgrade',
        ...data && {
            body: JSON.stringify(data)
        }
    };
    const url = `${loadingContext}${path}`;
    return fetch(url, request).then(async (response)=>{
        const data = await response.json();
        if (response.ok) {
            return data;
        }
        if (isAdyenErrorResponse(data)) {
            handleFetchError(data.message, errorLevel);
            return;
        }
        const errorMessage = options.errorMessage || `Service at ${url} is not available`;
        handleFetchError(errorMessage, errorLevel);
        return;
    })/**
             * Catch block handles Network error, CORS error, or exception throw by the `handleFetchError`
             * inside the `then` block
             */ .catch((error)=>{
        /**
                 * If error is instance of AdyenCheckoutError, which means that it was already
                 * handled by the `handleFetchError` on the `then` block, then we just throw it.
                 * There is no need to create it again
                 */ if (error instanceof AdyenCheckoutError) {
            throw error;
        }
        const errorMessage = options.errorMessage || `Call to ${url} failed. Error= ${error}`;
        handleFetchError(errorMessage, errorLevel);
    });
}
function handleFetchError(message, level) {
    switch(level){
        case 'silent':
            {
                break;
            }
        case 'info':
        case 'warn':
        case 'error':
            {
                console[level](message);
                break;
            }
        default:
            throw new AdyenCheckoutError('NETWORK_ERROR', message);
    }
}
function httpPost(options, data) {
    return http({
        ...options,
        method: 'POST'
    }, data);
}

const API_VERSION = 'v1';

/**
 */ function makePayment(paymentRequest, session) {
    const path = `${API_VERSION}/sessions/${session.id}/payments?clientKey=${session.clientKey}`;
    const data = {
        sessionData: session.data,
        ...paymentRequest
    };
    return httpPost({
        loadingContext: session.loadingContext,
        path,
        errorLevel: 'fatal'
    }, data);
}

/**
 */ function submitDetails(details, session) {
    const path = `${API_VERSION}/sessions/${session.id}/paymentDetails?clientKey=${session.clientKey}`;
    const data = {
        sessionData: session.data,
        ...details
    };
    return httpPost({
        loadingContext: session.loadingContext,
        path,
        errorLevel: 'fatal'
    }, data);
}

/**
 */ function setupSession(session, options) {
    const path = `${API_VERSION}/sessions/${session.id}/setup?clientKey=${session.clientKey}`;
    const data = {
        sessionData: session.data,
        ...options.order ? {
            order: {
                orderData: options.order.orderData,
                pspReference: options.order.pspReference
            }
        } : {}
    };
    return httpPost({
        loadingContext: session.loadingContext,
        path,
        errorLevel: 'fatal',
        errorMessage: 'ERROR: Invalid ClientKey'
    }, data);
}

/**
 */ function checkBalance(paymentRequest, session) {
    const path = `${API_VERSION}/sessions/${session.id}/paymentMethodBalance?clientKey=${session.clientKey}`;
    const data = {
        sessionData: session.data,
        ...paymentRequest
    };
    return httpPost({
        loadingContext: session.loadingContext,
        path,
        errorLevel: 'fatal'
    }, data);
}

class NonPersistentStorage {
    storage;
    constructor(){
        this.storage = {};
    }
    get length() {
        return Object.keys(this.storage).length;
    }
    key(keyName) {
        return Object.keys(this.storage).indexOf(keyName);
    }
    getItem(keyName) {
        return this.storage[keyName] || null;
    }
    setItem(keyName, keyValue) {
        return this.storage[keyName] = keyValue;
    }
    removeItem(keyName) {
        delete this.storage[keyName];
    }
    clear() {
        this.storage = {};
    }
}
class Storage {
    prefix = 'adyen-checkout__';
    key;
    storage;
    constructor(key, storageType){
        try {
            this.storage = storageType ? window[storageType] : window.localStorage;
        } catch (e) {
            this.storage = new NonPersistentStorage();
        }
        this.key = this.prefix + key;
    }
    get() {
        try {
            return JSON.parse(this.storage.getItem(this.key));
        } catch (err) {
            return null;
        }
    }
    set(value) {
        this.storage.setItem(this.key, JSON.stringify(value));
    }
    remove() {
        this.storage.removeItem(this.key);
    }
}

/**
 */ function createOrder(session) {
    const path = `${API_VERSION}/sessions/${session.id}/orders?clientKey=${session.clientKey}`;
    const data = {
        sessionData: session.data
    };
    return httpPost({
        loadingContext: session.loadingContext,
        path,
        errorLevel: 'fatal'
    }, data);
}

function sanitizeSession(session) {
    if (!session || !session.id) throw new Error('Invalid session');
    return {
        id: session.id,
        ...session.sessionData ? {
            sessionData: session.sessionData
        } : {}
    };
}

/**
 */ function cancelOrder(order, session) {
    const path = `${API_VERSION}/sessions/${session.id}/orders/cancel?clientKey=${session.clientKey}`;
    const data = {
        sessionData: session.data,
        order: order
    };
    return httpPost({
        loadingContext: session.loadingContext,
        path,
        errorLevel: 'fatal'
    }, data);
}

class Session {
    session;
    storage;
    clientKey;
    loadingContext;
    configuration;
    constructor(rawSession, clientKey, loadingContext){
        const session = sanitizeSession(rawSession);
        if (!clientKey) throw new Error('No clientKey available');
        if (!loadingContext) throw new Error('No loadingContext available');
        this.storage = new Storage('session', 'localStorage');
        this.clientKey = clientKey;
        this.loadingContext = loadingContext;
        this.session = session;
        if (!this.session.sessionData) {
            this.session = this.getStoredSession();
        } else {
            this.storeSession();
        }
    }
    get id() {
        return this.session.id;
    }
    get data() {
        return this.session.sessionData;
    }
    /**
     * Updates the session.data with the latest data blob
     */ updateSessionData(latestData) {
        this.session.sessionData = latestData;
        this.storeSession();
    }
    /**
     * Fetches data from a session
     */ setupSession(options) {
        return setupSession(this, options).then((response)=>{
            if (response.configuration) {
                this.configuration = {
                    ...response.configuration
                };
            }
            return response;
        });
    }
    /**
     * Submits a session payment
     */ submitPayment(data) {
        return makePayment(data, this).then((response)=>{
            if (response.sessionData) {
                this.updateSessionData(response.sessionData);
            }
            return response;
        });
    }
    /**
     * Submits session payment additional details
     */ submitDetails(data) {
        return submitDetails(data, this).then((response)=>{
            if (response.sessionData) {
                this.updateSessionData(response.sessionData);
            }
            return response;
        });
    }
    /**
     * Checks the balance for a payment method
     */ checkBalance(data) {
        return checkBalance(data, this).then((response)=>{
            if (response.sessionData) {
                this.updateSessionData(response.sessionData);
            }
            return response;
        });
    }
    /**
     * Creates an order for the current session
     */ createOrder() {
        return createOrder(this).then((response)=>{
            if (response.sessionData) {
                this.updateSessionData(response.sessionData);
            }
            return response;
        });
    }
    /**
     * Cancels an order for the current session
     */ cancelOrder(data) {
        return cancelOrder(data.order, this).then((response)=>{
            if (response.sessionData) {
                this.updateSessionData(response.sessionData);
            }
            return response;
        });
    }
    /**
     * Gets the stored session but only if the current id and the stored id match
     */ getStoredSession() {
        const storedSession = this.storage.get();
        return this.id === storedSession?.id ? storedSession : this.session;
    }
    /**
     * Stores the session
     */ storeSession() {
        this.storage.set({
            id: this.session.id,
            sessionData: this.session.sessionData
        });
    }
    /**
     * Clears the stored session
     */ removeStoredSession() {
        this.storage.remove();
    }
}

// import Language from '../language';
class Core {
    session;
    paymentMethodsResponse;
    modules;
    options;
    components = [];
    loadingContext;
    cdnContext;
    componentsMap;
    static version = {
        version: "5.46.0",
        revision: "393543c9",
        branch: "poc/component-tree-shaking",
        buildId: "@adyen/adyen-web-2f680257-6383-4d65-945d-e3031b01a6b7"
    };
    constructor(props){
        this.registerComponents(props.components);
        this.create = this.create.bind(this);
        this.createFromAction = this.createFromAction.bind(this);
        this.setOptions(props);
        this.createPaymentMethodsList();
        this.loadingContext = resolveEnvironment(this.options.environment);
        this.cdnContext = resolveCDNEnvironment(this.options.resourceEnvironment || this.options.environment);
        const clientKeyType = this.options.clientKey?.substr(0, 4);
        if ((clientKeyType === 'test' || clientKeyType === 'live') && !this.loadingContext.includes(clientKeyType)) {
            throw new Error(`Error: you are using a ${clientKeyType} clientKey against the ${this.options.environment} environment`);
        }
        // Expose version number for npm builds
        window['adyenWebVersion'] = Core.version.version;
    }
    registerComponents(components) {
        this.componentsMap = components.reduce((memo, component)=>{
            const supportedTxVariants = [
                component.type,
                ...component.txVariants
            ].filter((txVariant)=>txVariant);
            supportedTxVariants.forEach((txVariant)=>{
                memo = {
                    ...memo,
                    [txVariant]: component
                };
            });
            return memo;
        }, {});
        console.log(this.componentsMap);
    }
    initialize() {
        if (this.options.session) {
            this.session = new Session(this.options.session, this.options.clientKey, this.loadingContext);
            return this.session.setupSession(this.options).then((sessionResponse)=>{
                const { amount, shopperLocale, paymentMethods, ...rest } = sessionResponse;
                this.setOptions({
                    ...rest,
                    amount: this.options.order ? this.options.order.remainingAmount : amount,
                    locale: this.options.locale || shopperLocale
                });
                this.createPaymentMethodsList(paymentMethods);
                this.createCoreModules();
                return this;
            }).catch((error)=>{
                if (this.options.onError) this.options.onError(error);
                return this;
            });
        }
        this.createCoreModules();
        return Promise.resolve(this);
    }
    /**
     * Submits details using onAdditionalDetails or the session flow if available
     * @param details -
     */ submitDetails(details) {
        if (this.options.onAdditionalDetails) {
            return this.options.onAdditionalDetails(details);
        }
        if (this.session) {
            this.session.submitDetails(details).then((response)=>{
                this.options.onPaymentCompleted?.(response);
            }).catch((error)=>{
                this.options.onError?.(error);
            });
        }
    }
    create(paymentMethod, options) {
        const props = this.getPropsForComponent(options);
        return paymentMethod ? this.handleCreate(paymentMethod, props) : this.handleCreateError();
    }
    /**
     * Instantiates a new element component ready to be mounted from an action object
     * @param action - action defining the component with the component data
     * @param options - options that will be merged to the global Checkout props
     * @returns new UIElement
     */ createFromAction(action, options = {}) {
        if (!action || !action.type) {
            if (hasOwnProperty(action, 'action') && hasOwnProperty(action, 'resultCode')) {
                throw new Error('createFromAction::Invalid Action - the passed action object itself has an "action" property and ' + 'a "resultCode": have you passed in the whole response object by mistake?');
            }
            throw new Error('createFromAction::Invalid Action - the passed action object does not have a "type" property');
        }
        // if (action.type) {
        //     const actionTypeConfiguration = getComponentConfiguration(action.type, this.options.paymentMethodsConfiguration);
        //
        //     const props = {
        //         ...processGlobalOptions(this.options),
        //         ...actionTypeConfiguration,
        //         ...this.getPropsForComponent(options)
        //     };
        //
        //     return getComponentForAction(action, props);
        // }
        return this.handleCreateError();
    }
    /**
     * Updates global configurations, resets the internal state and remounts each element.
     * @param options - props to update
     * @returns this - the element instance
     */ update = (options = {})=>{
        this.setOptions(options);
        return this.initialize().then(()=>{
            // Update each component under this instance
            this.components.forEach((c)=>c.update(this.getPropsForComponent(this.options)));
            return this;
        });
    };
    /**
     * Remove the reference of a component
     * @param component - reference to the component to be removed
     * @returns this - the element instance
     */ remove = (component)=>{
        this.components = this.components.filter((c)=>c._id !== component._id);
        component.unmount();
        return this;
    };
    /**
     * @internal
     * Create or update the config object passed when AdyenCheckout is initialised (environment, clientKey, etc...)
     */ setOptions = (options)=>{
        if (hasOwnProperty(options?.paymentMethodsConfiguration, 'scheme')) {
            console.warn('WARNING: You cannot define a property "scheme" on the paymentMethodsConfiguration object - it should be defined as "card" otherwise it will be ignored');
        }
        if (hasOwnProperty(options, 'installmentOptions')) {
            console.warn("WARNING: you are setting installmentOptions directly in the top level configuration object. They should be set via the 'paymentMethodsConfiguration' object or directly on the 'card' component.");
        }
        this.options = {
            ...this.options,
            ...options
        };
    };
    /**
     * @internal
     * @param options - options that will be merged to the global Checkout props
     * @returns props for a new UIElement
     */ getPropsForComponent(options) {
        return {
            paymentMethods: this.paymentMethodsResponse.paymentMethods,
            storedPaymentMethods: this.paymentMethodsResponse.storedPaymentMethods,
            ...options,
            i18n: this.modules.i18n,
            modules: this.modules,
            session: this.session,
            loadingContext: this.loadingContext,
            cdnContext: this.cdnContext,
            createFromAction: this.createFromAction,
            _parentInstance: this
        };
    }
    /**
     * @internal
     * A recursive creation function that finalises by calling itself with a reference to a valid component class which it then initialises
     *
     * @param PaymentMethod - type varies:
     *  - usually a string
     *  - but for Dropin, when it starts creating payment methods, will be a fully formed object from the paymentMethods response .paymentMethods or .storedPaymentMethods
     *  - always finishes up as a reference to a valid component class
     *
     * @param options - an object whose form varies, it is *always* enhanced with props from this.getPropsForComponent(), and can also be:
     *  - the config object passed when a Component is created via checkout.create('card'|'dropin'|'ideal'|etc..) (scenario: usual first point of entry to this function)
     *  - the internally created props object from Dropin/components/utils.getCommonProps() (scenario: Dropin creating components for its PM list)
     *  - an object extracted from the paymentMethods response .paymentMethods or .storedPaymentMethods (scenarios: Dropin creating components for its PM list *or* standalone storedCard comp)
     *  - a combination of the previous 2 + the relevant object from the paymentMethodsConfiguration (scenario: Dropin creating components for its PM list)
     *
     *
     * @returns new UIElement
     */ handleCreate(PaymentMethod, options = {}) {
        const isValidClass = PaymentMethod.prototype instanceof UIElement;
        /**
         * Final entry point (PaymentMethod is a Class):
         * Once we receive a valid class for a Component - create a new instance of it
         */ if (isValidClass) {
            /**
             * Find which creation scenario we are in - we need to know when we're creating a Dropin, a PM within the Dropin, or a standalone stored card.
             */ const needsConfigData = options.type !== 'dropin' && !options.isDropin;
            const needsPMData = needsConfigData && !options.supportedShopperInteractions;
            /**
             * We only need to populate the objects under certain circumstances.
             * (If we're creating a Dropin or a PM within the Dropin - then the relevant paymentMethods response & paymentMethodsConfiguration props
             * are already merged into the passed options object; whilst a standalone stored card just needs the paymentMethodsConfiguration props)
             */ const paymentMethodsDetails = needsPMData ? this.paymentMethodsResponse.find(options.type) : {};
            const paymentMethodsConfiguration = needsConfigData ? getComponentConfiguration(options.type, this.options.paymentMethodsConfiguration, !!options.storedPaymentMethodId) : {};
            // Filtered global options
            const globalOptions = processGlobalOptions(this.options);
            /**
             * Merge:
             * 1. global options (a subset of the original config object sent when AdyenCheckout is initialised)
             * 2. props defined on the relevant object in the paymentMethods response (will not have a value for the 'dropin' component)
             * 3. a paymentMethodsConfiguration object, if defined at top level (will not have a value for the 'dropin' component)
             * 4. the options that have been passed to the final call of this function (see comment on \@param, above)
             */ const component = new PaymentMethod({
                ...globalOptions,
                ...paymentMethodsDetails,
                ...paymentMethodsConfiguration,
                ...options
            });
            if (!options.isDropin) {
                this.components.push(component);
            }
            return component;
        }
        /**
         * Usual initial point of entry to this function (PaymentMethod is a String).
         * When PaymentMethod is defined as a string - retrieve a component from the componentsMap and recall this function passing in a valid class
         */ if (typeof PaymentMethod === 'string' && this.componentsMap[PaymentMethod]) {
            if (PaymentMethod === 'dropin' && hasOwnProperty(options, 'paymentMethodsConfiguration')) {
                console.warn("WARNING: You are setting a 'paymentMethodsConfiguration' object in the Dropin configuration options. This object will be ignored.");
            }
            return this.handleCreate(this.componentsMap[PaymentMethod], {
                type: PaymentMethod,
                ...options
            });
        }
        /**
         * Entry point for Redirect PMs (PaymentMethod is a String).
         * If we are trying to create a payment method that is in the paymentMethods response & does not explicitly
         * implement a component (i.e no matching entry in the 'paymentMethods' components map), it will default to a Redirect component
         */ if (typeof PaymentMethod === 'string' && this.paymentMethodsResponse.has(PaymentMethod)) {
            /**
             * NOTE: Only need the type prop for standalone redirect comps created by checkout.create('\{redirect-pm-txVariant\}'); (a likely scenario?)
             * - in all other scenarios it is already present.
             * (Further details: from the paymentMethods response and paymentMethodsConfiguration are added in the next step,
             *  or, in the Dropin case, are already present)
             */ return this.handleCreate(RedirectElement, {
                type: PaymentMethod,
                ...options
            });
        // return this.handleCreate(paymentMethods.redirect, { type: PaymentMethod, ...options });
        }
        /**
         * Entry point for Dropin (PaymentMethod is an Object)
         * Happens internally on Drop-in when relevant object from paymentMethods response (.paymentMethods or .storedPaymentMethods) has been isolated
         * and is then use to create an element in the paymentMethods list
         */ if (typeof PaymentMethod === 'object' && typeof PaymentMethod.type === 'string') {
            // paymentMethodsConfiguration object will take precedence here
            const paymentMethodsConfiguration = getComponentConfiguration(PaymentMethod.type, this.options.paymentMethodsConfiguration, !!PaymentMethod.storedPaymentMethodId);
            // Restart the flow in the "usual" way (PaymentMethod is a String)
            return this.handleCreate(PaymentMethod.type, {
                ...PaymentMethod,
                ...options,
                ...paymentMethodsConfiguration
            });
        }
        return this.handleCreateError(PaymentMethod);
    }
    /**
     * @internal
     */ handleCreateError(paymentMethod) {
        const paymentMethodName = paymentMethod && paymentMethod.name ? paymentMethod.name : 'The passed payment method';
        const errorMessage = paymentMethod ? `${paymentMethodName} is not a valid Checkout Component. What was passed as a txVariant was: ${JSON.stringify(paymentMethod)}. Check if this payment method is configured in the Backoffice or if the txVariant is a valid one` : 'No Payment Method component was passed';
        throw new Error(errorMessage);
    }
    createPaymentMethodsList(paymentMethodsResponse) {
        this.paymentMethodsResponse = new PaymentMethodsResponse(this.options.paymentMethodsResponse || paymentMethodsResponse, this.options);
    }
    createCoreModules() {
        if (this.modules) {
            console.warn('Core: Core modules are already created.');
            return;
        }
        this.modules = Object.freeze({
        });
    }
}

// if (undefined === 'development') {
async function AdyenCheckout(props) {
    const checkout = new Core(props);
    return await checkout.initialize();
}

export { AdyenCheckout, AmazingModule, CrazyModule };
//# sourceMappingURL=index.js.map
