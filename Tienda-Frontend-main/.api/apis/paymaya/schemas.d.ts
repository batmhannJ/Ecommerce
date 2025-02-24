declare const CancelV1PaymentViaIdViaPostMethod: {
    readonly metadata: {
        readonly allOf: readonly [{
            readonly type: "object";
            readonly properties: {
                readonly paymentId: {
                    readonly type: "string";
                    readonly format: "uuid";
                    readonly examples: readonly ["e732f996-cb87-4120-b712-166d8183c01d"];
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "The unique identification string of the payment transaction.";
                };
            };
            readonly required: readonly ["paymentId"];
        }];
    };
    readonly response: {
        readonly "200": {
            readonly title: "Generic Payment Response";
            readonly type: "object";
            readonly required: readonly ["id", "isPaid", "status", "amount", "currency", "canVoid", "canRefund", "canCapture", "createdAt", "updatedAt"];
            readonly properties: {
                readonly id: {
                    readonly title: "Payment ID";
                    readonly type: "string";
                    readonly format: "uuid";
                    readonly description: "The unique identification of the payment transaction.";
                };
                readonly isPaid: {
                    readonly type: "boolean";
                    readonly description: "Indicates if the payment is processed successfully or not.";
                };
                readonly status: {
                    readonly title: "Payment States";
                    readonly type: "string";
                    readonly description: "Indicates the current state of the payment transaction.\n\n`PENDING_TOKEN` `PENDING_PAYMENT` `FOR_AUTHENTICATION` `AUTHENTICATING` `AUTH_NOT_ENROLLED` `AUTH_SUCCESS` `AUTH_FAILED` `PAYMENT_SUCCESS` `PAYMENT_FAILED` `PAYMENT_PROCESSING` `AUTHORIZED` `PAYMENT_EXPIRED` `PAYMENT_CANCELLED` `PAYMENT_INVALID` `VOIDED` `REFUNDED` `ACCOUNT_ABUSE` `CAPTURED` `DONE` `CAPTURE_HOLD_EXPIRED`";
                    readonly enum: readonly ["PENDING_TOKEN", "PENDING_PAYMENT", "FOR_AUTHENTICATION", "AUTHENTICATING", "AUTH_NOT_ENROLLED", "AUTH_SUCCESS", "AUTH_FAILED", "PAYMENT_SUCCESS", "PAYMENT_FAILED", "PAYMENT_PROCESSING", "AUTHORIZED", "PAYMENT_EXPIRED", "PAYMENT_CANCELLED", "PAYMENT_INVALID", "VOIDED", "REFUNDED", "ACCOUNT_ABUSE", "CAPTURED", "DONE", "CAPTURE_HOLD_EXPIRED"];
                };
                readonly amount: {
                    readonly type: "number";
                    readonly format: "float";
                    readonly minimum: 0.01;
                    readonly maximum: 9999999;
                    readonly description: "Amount of the transaction.";
                };
                readonly currency: {
                    readonly type: "string";
                    readonly minLength: 3;
                    readonly maxLength: 3;
                    readonly description: "[ISO 4217 Alpha-3](https://www.iso.org/iso-4217-currency-codes.html) currency code\n";
                    readonly examples: readonly ["PHP"];
                };
                readonly canVoid: {
                    readonly type: "boolean";
                    readonly description: "Indicates if the payment can be voided (e.g. same-day reversal for card transactions).";
                };
                readonly canRefund: {
                    readonly type: "boolean";
                    readonly description: "Indicates if the payment can be refunded (e.g. next-day reversal for card transactions).";
                };
                readonly canCapture: {
                    readonly type: "boolean";
                    readonly description: "Indicates if the payment can be captured for settlement to merchant. This is only relevant for authorization payments.";
                };
                readonly createdAt: {
                    readonly type: "string";
                    readonly format: "date-time";
                    readonly description: "The timestamp in UTC when the record is created.";
                };
                readonly updatedAt: {
                    readonly type: "string";
                    readonly format: "date-time";
                    readonly description: "The timestamp in UTC when the record is last updated.";
                };
                readonly requestReferenceNumber: {
                    readonly title: "Merchant Request Reference Number";
                    readonly type: "string";
                    readonly minLength: 1;
                    readonly maxLength: 36;
                    readonly description: "The merchant's reference number for the transaction. It is strongly advised that the merchant provide unique value for this property for each transaction.";
                };
                readonly description: {
                    readonly title: "Customer/Payer Description";
                    readonly type: "string";
                    readonly description: "Contains identifying information regarding the payer of the transaction. It may contain the payer's email address, name, or address line.";
                    readonly examples: readonly ["Charge for maya.juan@mail.com"];
                };
                readonly paymentTokenId: {
                    readonly title: "Payment Token ID";
                    readonly type: "string";
                    readonly description: "The string token representing the card information (only relevant for card-based payments).";
                    readonly examples: readonly ["0zjacza65HEobriYGN9g5XwaWZYVSeErdNnaNCLCo8QvUXuGg49KPJSy1XbhHPL8OisYOiYPJSQ2BxqR2AuC682Yu5G5LzrU0SK6ByWi0TyhkekWf1ssl6cMBWAVAOdArLcY1QXEyHdr8EsRAS2bHeMEpUU6OSmxmky5Fk"];
                };
                readonly verificationUrl: {
                    readonly title: "3DS Verification URL";
                    readonly type: "string";
                    readonly format: "url";
                    readonly description: "The URL that the payer needs to open in the browser to complete payment via 3DS authentication.";
                };
                readonly fundSource: {
                    readonly type: "object";
                    readonly oneOf: readonly [{
                        readonly title: "Card";
                        readonly type: "object";
                        readonly required: readonly ["id", "type", "description"];
                        readonly properties: {
                            readonly id: {
                                readonly title: "Payment Token ID";
                                readonly type: "string";
                                readonly description: "The string token representing the card information (only relevant for card-based payments).";
                                readonly examples: readonly ["0zjacza65HEobriYGN9g5XwaWZYVSeErdNnaNCLCo8QvUXuGg49KPJSy1XbhHPL8OisYOiYPJSQ2BxqR2AuC682Yu5G5LzrU0SK6ByWi0TyhkekWf1ssl6cMBWAVAOdArLcY1QXEyHdr8EsRAS2bHeMEpUU6OSmxmky5Fk"];
                            };
                            readonly type: {
                                readonly type: "string";
                                readonly description: "Indicates the type of the fund source. For card transactions this is always set to `card`.";
                                readonly examples: readonly ["card"];
                            };
                            readonly description: {
                                readonly type: "string";
                                readonly description: "Masked card PAN which *may* show the last 4 digits.";
                                readonly examples: readonly ["**** **** **** 4154"];
                            };
                            readonly details: {
                                readonly description: "Contains the more information specific to the card used.";
                                readonly type: "object";
                                readonly properties: {
                                    readonly scheme: {
                                        readonly type: "string";
                                        readonly enum: readonly ["visa", "jcb", "master-card"];
                                        readonly description: "Card scheme.\n\n`visa` `jcb` `master-card`";
                                    };
                                    readonly last4: {
                                        readonly type: "string";
                                        readonly format: "numeric";
                                        readonly description: "Last 4 digits of the card PAN.";
                                        readonly examples: readonly [4154];
                                    };
                                    readonly first6: {
                                        readonly type: "string";
                                        readonly format: "numeric";
                                        readonly description: "First 6 digits of the card PAN.";
                                        readonly examples: readonly [545301];
                                    };
                                    readonly masked: {
                                        readonly type: "string";
                                        readonly description: "Masked card PAN which *may* show the first 6 and last 4 digits.";
                                        readonly examples: readonly ["545301******4154"];
                                    };
                                    readonly issuer: {
                                        readonly type: "string";
                                        readonly description: "Name of the issuing bank as provided by https://binlist.net.";
                                    };
                                };
                            };
                        };
                    }, {
                        readonly title: "PayMaya Account (Single Payment)";
                        readonly type: "object";
                        readonly required: readonly ["id", "type", "description"];
                        readonly properties: {
                            readonly id: {
                                readonly type: "string";
                                readonly format: "phone";
                                readonly description: "The mobile phone number (MSISDN) associated to the PayMaya account.";
                                readonly examples: readonly ["+639086216587"];
                            };
                            readonly type: {
                                readonly type: "string";
                                readonly description: "Indicates the type of the fund source. For PayMaya transactions, this is always set to `paymaya`.";
                                readonly examples: readonly ["paymaya"];
                            };
                            readonly description: {
                                readonly type: "string";
                                readonly description: "The formatted masked mobile phone number, which *may* show the last 4 digits.";
                                readonly examples: readonly ["***** ***6587"];
                            };
                            readonly details: {
                                readonly description: "Contains the more information specific to the PayMaya account.";
                                readonly type: "object";
                                readonly properties: {
                                    readonly firstName: {
                                        readonly type: "string";
                                        readonly description: "The first name of the PayMaya account holder.";
                                        readonly examples: readonly ["Maya"];
                                    };
                                    readonly lastName: {
                                        readonly type: "string";
                                        readonly description: "The last name of the PayMaya account holder.";
                                        readonly examples: readonly ["Cruz"];
                                    };
                                    readonly msisdn: {
                                        readonly type: "string";
                                        readonly format: "phone";
                                        readonly description: "The mobile phone number (MSISDN) associated to the PayMaya account.";
                                        readonly examples: readonly ["+639086216587"];
                                    };
                                    readonly email: {
                                        readonly type: "string";
                                        readonly format: "email";
                                        readonly description: "The mobile phone number (MSISDN) associated to the PayMaya account.";
                                        readonly examples: readonly ["maya.juan@mail.com"];
                                    };
                                    readonly masked: {
                                        readonly type: "string";
                                        readonly description: "The masked mobile phone number, which *may* show the last 4 digits.";
                                        readonly examples: readonly ["********6587"];
                                    };
                                };
                            };
                        };
                    }, {
                        readonly title: "PayMaya Account (Recurring Payment)";
                        readonly type: "object";
                        readonly required: readonly ["id", "type", "description"];
                        readonly properties: {
                            readonly id: {
                                readonly title: "Payment Token ID";
                                readonly type: "string";
                                readonly description: "The string token representing the card information (only relevant for card-based payments).";
                                readonly examples: readonly ["0zjacza65HEobriYGN9g5XwaWZYVSeErdNnaNCLCo8QvUXuGg49KPJSy1XbhHPL8OisYOiYPJSQ2BxqR2AuC682Yu5G5LzrU0SK6ByWi0TyhkekWf1ssl6cMBWAVAOdArLcY1QXEyHdr8EsRAS2bHeMEpUU6OSmxmky5Fk"];
                            };
                            readonly type: {
                                readonly type: "string";
                                readonly description: "Indicates the type of the fund source. For recurring PayMaya wallet transactions, this is set to `card`.";
                                readonly examples: readonly ["card"];
                            };
                            readonly description: {
                                readonly type: "string";
                                readonly description: "Masked card PAN which *may* show the last 4 digits.";
                                readonly examples: readonly ["**** **** **** 4154"];
                            };
                            readonly details: {
                                readonly description: "Contains the more information specific to the card used.";
                                readonly type: "object";
                                readonly properties: {
                                    readonly scheme: {
                                        readonly type: "string";
                                        readonly enum: readonly ["visa", "jcb", "master-card"];
                                        readonly description: "Card scheme.\n\n`visa` `jcb` `master-card`";
                                    };
                                    readonly last4: {
                                        readonly type: "string";
                                        readonly format: "numeric";
                                        readonly description: "Last 4 digits of the card PAN.";
                                        readonly examples: readonly [4154];
                                    };
                                    readonly first6: {
                                        readonly type: "string";
                                        readonly format: "numeric";
                                        readonly description: "First 6 digits of the card PAN.";
                                        readonly examples: readonly [545301];
                                    };
                                    readonly masked: {
                                        readonly type: "string";
                                        readonly description: "Masked card PAN which *may* show the first 6 and last 4 digits.";
                                        readonly examples: readonly ["545301******4154"];
                                    };
                                    readonly issuer: {
                                        readonly type: "string";
                                        readonly description: "Name of the issuing bank as provided by https://binlist.net.";
                                    };
                                    readonly profileId: {
                                        readonly type: "string";
                                        readonly description: "Identification string of the PayMaya consumer account.";
                                    };
                                };
                            };
                        };
                    }, {
                        readonly title: "P2M";
                        readonly type: "object";
                        readonly required: readonly ["type", "description"];
                        readonly properties: {
                            readonly id: {
                                readonly type: "string";
                                readonly description: "Always set to null.";
                            };
                            readonly type: {
                                readonly type: "string";
                                readonly description: "Indicates the type of the fund source. For PayMaya P2M transactions this is always set to `paymaya`.";
                                readonly examples: readonly ["paymaya"];
                            };
                            readonly description: {
                                readonly type: "string";
                                readonly description: "Always set to `PayMaya Account`.";
                                readonly examples: readonly ["PayMaya Account"];
                            };
                            readonly details: {
                                readonly description: "Contains the card token used associated to the PayMaya account.";
                                readonly type: "object";
                                readonly properties: {
                                    readonly scheme: {
                                        readonly type: "string";
                                        readonly enum: readonly ["visa", "jcb", "master-card"];
                                        readonly description: "Card scheme.\n\n`visa` `jcb` `master-card`";
                                        readonly examples: readonly ["master-card"];
                                    };
                                    readonly last4: {
                                        readonly type: "string";
                                        readonly format: "numeric";
                                        readonly description: "Last 4 digits of the card PAN.";
                                        readonly examples: readonly [4154];
                                    };
                                    readonly first6: {
                                        readonly type: "string";
                                        readonly format: "numeric";
                                        readonly description: "First 6 digits of the card PAN.";
                                        readonly examples: readonly [545301];
                                    };
                                    readonly masked: {
                                        readonly type: "string";
                                        readonly description: "Masked card PAN which *may* show the first 6 and last 4 digits.";
                                        readonly examples: readonly ["545301******4154"];
                                    };
                                    readonly issuer: {
                                        readonly type: "string";
                                        readonly description: "Name of the issuing bank as provided by https://binlist.net.";
                                    };
                                };
                            };
                        };
                    }, {
                        readonly title: "PayPal Account";
                        readonly type: "object";
                        readonly required: readonly ["id", "type", "description"];
                        readonly properties: {
                            readonly id: {
                                readonly type: "string";
                                readonly format: "email";
                                readonly description: "The payer's PayPal account as represented by an email address.";
                                readonly examples: readonly ["maya.juan@mail.com"];
                            };
                            readonly type: {
                                readonly type: "string";
                                readonly description: "Indicates the type of the fund source. For PayPal transactions, this is always set to `paypal`.";
                                readonly examples: readonly ["paypal"];
                            };
                            readonly description: {
                                readonly type: "string";
                                readonly description: "The formatted masked PayPal account (i.e. email address).";
                                readonly examples: readonly ["m*******n@mail.com"];
                            };
                        };
                    }];
                };
                readonly batchNumber: {
                    readonly title: "Terminal Batch Number";
                    readonly type: "string";
                    readonly format: "alphanumeric, dash, space, hyphen, underscore";
                    readonly minLength: 1;
                    readonly maxLength: 36;
                    readonly description: "The batch number of a terminal-based payment.";
                };
                readonly traceNumber: {
                    readonly title: "Terminal Trace Number";
                    readonly type: "string";
                    readonly format: "alphanumeric, dash, space, hyphen, underscore";
                    readonly minLength: 1;
                    readonly maxLength: 36;
                    readonly description: "The batch number of a terminal-based payment.";
                };
                readonly emvIccData: {
                    readonly title: "EMV ICC Data";
                    readonly type: "string";
                    readonly minLength: 1;
                    readonly maxLength: 340;
                    readonly description: "EMV ICC binary data returned by the Issuer. To be used for post-processing (e.g., Issuer Authentication by EMV EXTERNAL AUTHENTICATE or 2nd GENERATE AC).";
                    readonly examples: readonly ["ggIcAIQHoAAAAAMQEJUFgAAAAACaAxcEGZwBAF8qAgYInwIGAAAAAAEAnwMGAAAAAAAAnxASBgEKA6CAAAoCAAAAAABuefOZnxoCBgifHghQWU1ZUE9TMZ8mCA5/WLUnW3KxnycBgJ8zAyAgyJ80Ax4DAJ81ASGfNgIAyp83BKOXolWfQQQAAAAB"];
                };
                readonly receipt: {
                    readonly title: "Processor Receipt";
                    readonly type: "object";
                    readonly description: "Additional transaction reference numbers generated by either the issuing bank or the acquiring host. This is only relevant for card and PayMaya Account payments.";
                    readonly properties: {
                        readonly transactionId: {
                            readonly title: "Transaction ID";
                            readonly type: "string";
                            readonly description: "Unique identifier returned by the issuer for this transaction.";
                            readonly examples: readonly ["OUWZP6"];
                        };
                        readonly approvalCode: {
                            readonly title: "Approval Code";
                            readonly type: "string";
                            readonly description: "Approval Code / Authorization Identification Code generated by the issuer to indicate the approval of a transaction";
                            readonly examples: readonly [873200];
                        };
                        readonly batchNo: {
                            readonly title: "Processor Batch Number";
                            readonly type: "string";
                            readonly format: "alphanumeric";
                            readonly minLength: 1;
                            readonly maxLength: 8;
                            readonly description: "Value supplied by P3 or the value of `transaction.trace.batchNo` during the request (if supplied) which indicates the batch of transactions that the specific transaction has been grouped with. Merchants may keep track of this value for reconnaissance.";
                            readonly examples: readonly [20210506];
                        };
                        readonly traceNo: {
                            readonly title: "Processor Trace Number";
                            readonly type: "string";
                            readonly format: "alphanumeric";
                            readonly minLength: 1;
                            readonly maxLength: 8;
                            readonly description: "Value of `transaction.trace.traceNo` during the request (if supplied)";
                        };
                        readonly receiptNo: {
                            readonly title: "Receipt Number";
                            readonly type: "string";
                            readonly format: "alphanumeric";
                            readonly minLength: 1;
                            readonly maxLength: 12;
                            readonly description: "A receipt / reference number generated by the acquirer. Can be used by all parties (cardholder merchant payment gateway acquirer issuer) when looking up a specific transaction record for reconnaisance.";
                            readonly examples: readonly [112612964976];
                        };
                    };
                };
                readonly approvalCode: {
                    readonly title: "Approval Code";
                    readonly type: "string";
                    readonly description: "Approval Code / Authorization Identification Code generated by the issuer to indicate the approval of a transaction";
                    readonly examples: readonly [873200];
                };
                readonly receiptNumber: {
                    readonly title: "Receipt Number";
                    readonly type: "string";
                    readonly format: "alphanumeric";
                    readonly minLength: 1;
                    readonly maxLength: 12;
                    readonly description: "A receipt / reference number generated by the acquirer. Can be used by all parties (cardholder merchant payment gateway acquirer issuer) when looking up a specific transaction record for reconnaisance.";
                    readonly examples: readonly [112612964976];
                };
                readonly authorizationType: {
                    readonly title: "Authorization Type";
                    readonly type: "string";
                    readonly enum: readonly ["NORMAL", "FINAL", "PREAUTHORIZATION"];
                    readonly description: "For card transactions, it indicates the type of authorization applied. For more information, click this [link](https://cdn.paymaya.com/sandbox/payments_api/paymayap3/paymayap3.html#header-authorization-types).\n\n`NORMAL` `FINAL` `PREAUTHORIZATION`";
                };
                readonly capturedAmount: {
                    readonly type: "number";
                    readonly format: "float";
                    readonly description: "Indicates the total amount already captured for this authorization payment. Only applicable if the transaction has an `authorizationType`.";
                    readonly minimum: -3.402823669209385e+38;
                    readonly maximum: 3.402823669209385e+38;
                };
                readonly authorizationPayment: {
                    readonly title: "Authorization Payment ID";
                    readonly type: "string";
                    readonly format: "uuid";
                    readonly description: "The unique identification of the authorization payment associated to this payment. Only applicable if this is a capture payment.";
                };
                readonly capturedPaymentId: {
                    readonly title: "Capture Payment ID";
                    readonly type: "string";
                    readonly format: "uuid";
                    readonly description: "The unique identification of the capture payment associated to this payment. Only applicable if this is an authorization payments.";
                };
                readonly subscription: {
                    readonly title: "Subscription ID";
                    readonly type: "string";
                    readonly format: "uuid";
                    readonly description: "The unique identification of the subscription associated to this payment.";
                };
                readonly metadata: {
                    readonly title: "Metadata";
                    readonly type: "object";
                    readonly description: "Used to provide additional data to the transaction such a payment faciliator information.";
                    readonly properties: {
                        readonly subMerchantRequestReferenceNumber: {
                            readonly title: "Sub-merchant Request Reference Number";
                            readonly type: "string";
                            readonly format: "alphanumeric, dash, space, hyphen, underscore";
                            readonly minLength: 1;
                            readonly maxLength: 36;
                            readonly description: "Reference number of the sub-merchant for the related transaction";
                        };
                        readonly pf: {
                            readonly title: "Payment Facilitator";
                            readonly type: "object";
                            readonly description: "For a payment facilitator, this provides details regarding the sub-merchant.";
                            readonly required: readonly ["smi", "smn", "mci", "mpc", "mco"];
                            readonly properties: {
                                readonly smi: {
                                    readonly type: "string";
                                    readonly minLength: 1;
                                    readonly maxLength: 30;
                                    readonly description: "Sub-merchant ID.";
                                };
                                readonly smn: {
                                    readonly type: "string";
                                    readonly format: "alphanumeric, hyphen, space, apostrophe, comma, period, hyphen";
                                    readonly minLength: 1;
                                    readonly maxLength: 64;
                                    readonly description: "Sub-merchant name.";
                                };
                                readonly mci: {
                                    readonly type: "string";
                                    readonly minLength: 1;
                                    readonly maxLength: 13;
                                    readonly description: "Sub-merchant city location.";
                                };
                                readonly mpc: {
                                    readonly type: "string";
                                    readonly minLength: 3;
                                    readonly maxLength: 3;
                                    readonly description: "[ISO 4217 Numeric](https://www.iso.org/iso-4217-currency-codes.html) currency code.\n";
                                };
                                readonly mco: {
                                    readonly type: "string";
                                    readonly minLength: 3;
                                    readonly maxLength: 3;
                                    readonly description: "[ISO 3166 Alpha-3](https://www.iso.org/iso-3166-country-codes.html) country code.\n";
                                };
                                readonly mst: {
                                    readonly type: "string";
                                    readonly minLength: 2;
                                    readonly maxLength: 3;
                                    readonly description: "Sub-merchant abbreviated state location (required if country is USA).";
                                };
                                readonly mcc: {
                                    readonly type: "string";
                                    readonly format: "numeric";
                                    readonly minLength: 1;
                                    readonly maxLength: 15;
                                    readonly description: "[ISO 18245](https://www.iso.org/standard/33365.html) merchant category code.\n";
                                };
                                readonly postalCode: {
                                    readonly type: "string";
                                    readonly format: "alphanumeric, dash, space, hyphen, underscore";
                                    readonly maxLength: 20;
                                    readonly description: "Sub-merchant postal code";
                                };
                                readonly contactNo: {
                                    readonly type: "string";
                                    readonly format: "phone";
                                    readonly maxLength: 20;
                                    readonly description: "Contact number without spaces, dashes, or parentheses.";
                                };
                                readonly state: {
                                    readonly type: "string";
                                    readonly minLength: 1;
                                    readonly maxLength: 100;
                                    readonly description: "Sub-merchant state location in full text.";
                                };
                                readonly addressLine1: {
                                    readonly type: "string";
                                    readonly minLength: 1;
                                    readonly maxLength: 100;
                                    readonly description: "Sub-merchant street address.";
                                };
                            };
                        };
                    };
                };
            };
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
    };
};
declare const CreateV1Checkout: {
    readonly body: {
        readonly type: "object";
        readonly required: readonly ["totalAmount", "requestReferenceNumber"];
        readonly properties: {
            readonly totalAmount: {
                readonly type: "object";
                readonly title: "Total Amount";
                readonly required: readonly ["value", "currency"];
                readonly description: "Contains the value and currency of the transaction.";
                readonly properties: {
                    readonly value: {
                        readonly type: "number";
                        readonly format: "float";
                        readonly minimum: 0.01;
                        readonly maximum: 9999999;
                        readonly description: "Amount of the transaction.";
                        readonly examples: readonly ["1000"];
                    };
                    readonly currency: {
                        readonly type: "string";
                        readonly minLength: 3;
                        readonly maxLength: 3;
                        readonly description: "[ISO 4217 Alpha-3](https://www.iso.org/iso-4217-currency-codes.html) currency code\n";
                        readonly examples: readonly ["PHP"];
                    };
                };
            };
            readonly buyer: {
                readonly type: "object";
                readonly title: "Buyer";
                readonly description: "Contains personal information regarding the buyer/payer of the transaction. By default, all information are optional (i.e. use `Basic Buyer` specification).\nHowever, If the merchant is enabled to use Kount fraud protection, they must use `Kount Buyer` specification.\n";
                readonly oneOf: readonly [{
                    readonly type: "object";
                    readonly title: "Basic Buyer";
                    readonly description: "Contains personal information regarding the buyer/payer of the transaction.";
                    readonly properties: {
                        readonly firstName: {
                            readonly type: "string";
                            readonly description: "First name of the payer/buyer.";
                            readonly minLength: 1;
                            readonly maxLength: 1000;
                        };
                        readonly middleName: {
                            readonly type: "string";
                            readonly description: "Middle name of the payer/buyer.";
                            readonly minLength: 1;
                            readonly maxLength: 1000;
                        };
                        readonly lastName: {
                            readonly type: "string";
                            readonly description: "Last name of the payer/buyer.";
                            readonly minLength: 1;
                            readonly maxLength: 1000;
                        };
                        readonly birthday: {
                            readonly type: "string";
                            readonly format: "date";
                            readonly description: "Birthday in [ISO 8601 / RFC 3339 full-date format](https://tools.ietf.org/html/rfc3339#section-5.6).";
                        };
                        readonly customerSince: {
                            readonly type: "string";
                            readonly format: "date";
                            readonly description: "Date in [ISO 8601 / RFC 3339 full-date format](https://tools.ietf.org/html/rfc3339#section-5.6) when payer/buyer registered as a customer as per merchant's records.";
                        };
                        readonly sex: {
                            readonly type: "string";
                            readonly enum: readonly ["M", "F"];
                            readonly description: "Biological sex.";
                        };
                        readonly contact: {
                            readonly type: "object";
                            readonly title: "Contact Details";
                            readonly description: "Contact details like phone and/or email address.";
                            readonly properties: {
                                readonly phone: {
                                    readonly type: "string";
                                    readonly format: "phone";
                                    readonly minLength: 1;
                                    readonly maxLength: 1000;
                                    readonly description: "Contact phone number.";
                                };
                                readonly email: {
                                    readonly type: "string";
                                    readonly format: "email";
                                    readonly minLength: 5;
                                    readonly maxLength: 1000;
                                    readonly description: "Contact e-mail address.";
                                };
                            };
                        };
                        readonly billingAddress: {
                            readonly type: "object";
                            readonly title: "Billing Address";
                            readonly description: "Contains billing information of the payer/buyer. By default, all information are optional (i.e. use `Basic Billing Address` specification).\nHowever, If the merchant is enabled to use Kount fraud protection, they must use `Kount Billing Address` specification.\n";
                            readonly oneOf: readonly [{
                                readonly type: "object";
                                readonly title: "Basic Billing Address";
                                readonly properties: {
                                    readonly line1: {
                                        readonly type: "string";
                                        readonly description: "Address Line 1.";
                                        readonly minLength: 1;
                                        readonly maxLength: 1000;
                                    };
                                    readonly line2: {
                                        readonly type: "string";
                                        readonly description: "Address Line 2.";
                                        readonly minLength: 1;
                                        readonly maxLength: 1000;
                                    };
                                    readonly city: {
                                        readonly type: "string";
                                        readonly description: "City";
                                        readonly minLength: 1;
                                        readonly maxLength: 1000;
                                    };
                                    readonly state: {
                                        readonly type: "string";
                                        readonly description: "State / Province.";
                                        readonly minLength: 1;
                                        readonly maxLength: 1000;
                                    };
                                    readonly zipCode: {
                                        readonly type: "string";
                                        readonly description: "Zip / Postal code.";
                                        readonly minLength: 1;
                                        readonly maxLength: 1000;
                                    };
                                    readonly countryCode: {
                                        readonly type: "string";
                                        readonly minLength: 2;
                                        readonly maxLength: 2;
                                        readonly description: "[ISO 3166 alpha-2](https://www.iso.org/iso-3166-country-codes.html) notation of the country.\n";
                                    };
                                };
                            }, {
                                readonly type: "object";
                                readonly title: "Kount Billing Address";
                                readonly required: readonly ["countryCode"];
                                readonly properties: {
                                    readonly line1: {
                                        readonly type: "string";
                                        readonly description: "Address Line 1.";
                                        readonly minLength: 1;
                                        readonly maxLength: 1000;
                                    };
                                    readonly line2: {
                                        readonly type: "string";
                                        readonly description: "Address Line 2.";
                                        readonly minLength: 1;
                                        readonly maxLength: 1000;
                                    };
                                    readonly city: {
                                        readonly type: "string";
                                        readonly description: "City";
                                        readonly minLength: 1;
                                        readonly maxLength: 1000;
                                    };
                                    readonly state: {
                                        readonly type: "string";
                                        readonly description: "State / Province.";
                                        readonly minLength: 1;
                                        readonly maxLength: 1000;
                                    };
                                    readonly zipCode: {
                                        readonly type: "string";
                                        readonly description: "Zip / Postal code.";
                                        readonly minLength: 1;
                                        readonly maxLength: 1000;
                                    };
                                    readonly countryCode: {
                                        readonly type: "string";
                                        readonly minLength: 2;
                                        readonly maxLength: 2;
                                        readonly description: "[ISO 3166 alpha-2](https://www.iso.org/iso-3166-country-codes.html) notation of the country.\n";
                                    };
                                };
                            }];
                        };
                        readonly shippingAddress: {
                            readonly type: "object";
                            readonly title: "Shipping Address";
                            readonly description: "Contains shipment information including name of the person identified to receive the purchase order. By default, all information are optional (i.e. use `Basic Shipping Address` specification).\nHowever, If the merchant is enabled to use Kount fraud protection, they must use `Kount Shipping Address` specification.\n";
                            readonly oneOf: readonly [{
                                readonly type: "object";
                                readonly title: "Basic Shipping Address";
                                readonly description: "Contains shipment information including name of the person identified to receive the purchase order.";
                                readonly properties: {
                                    readonly line1: {
                                        readonly type: "string";
                                        readonly description: "Address Line 1.";
                                        readonly minLength: 1;
                                        readonly maxLength: 1000;
                                    };
                                    readonly line2: {
                                        readonly type: "string";
                                        readonly description: "Address Line 2.";
                                        readonly minLength: 1;
                                        readonly maxLength: 1000;
                                    };
                                    readonly city: {
                                        readonly type: "string";
                                        readonly description: "City";
                                        readonly minLength: 1;
                                        readonly maxLength: 1000;
                                    };
                                    readonly state: {
                                        readonly type: "string";
                                        readonly description: "State / Province.";
                                        readonly minLength: 1;
                                        readonly maxLength: 1000;
                                    };
                                    readonly zipCode: {
                                        readonly type: "string";
                                        readonly description: "Zip / Postal code.";
                                        readonly minLength: 1;
                                        readonly maxLength: 1000;
                                    };
                                    readonly countryCode: {
                                        readonly type: "string";
                                        readonly minLength: 2;
                                        readonly maxLength: 2;
                                        readonly description: "[ISO 3166 alpha-2](https://www.iso.org/iso-3166-country-codes.html) notation of the country.\n";
                                    };
                                    readonly firstName: {
                                        readonly type: "string";
                                        readonly description: "First name of the recipient.";
                                        readonly minLength: 1;
                                        readonly maxLength: 1000;
                                        readonly examples: readonly ["Maya"];
                                    };
                                    readonly middleName: {
                                        readonly type: "string";
                                        readonly description: "Middle name of the recipient.";
                                        readonly minLength: 1;
                                        readonly maxLength: 1000;
                                        readonly examples: readonly ["Jose"];
                                    };
                                    readonly lastName: {
                                        readonly type: "string";
                                        readonly description: "Last name of the recipient.";
                                        readonly minLength: 1;
                                        readonly maxLength: 1000;
                                        readonly examples: readonly ["Juan"];
                                    };
                                    readonly phone: {
                                        readonly type: "string";
                                        readonly format: "phone";
                                        readonly minLength: 1;
                                        readonly maxLength: 1000;
                                        readonly description: "Contact phone number.";
                                    };
                                    readonly email: {
                                        readonly type: "string";
                                        readonly format: "email";
                                        readonly minLength: 5;
                                        readonly maxLength: 1000;
                                        readonly description: "Contact e-mail address.";
                                    };
                                    readonly shippingType: {
                                        readonly type: "string";
                                        readonly enum: readonly ["ST", "SD"];
                                        readonly description: "* `ST` - Standard shipping\n* `SD` - Same-day shipping\n";
                                    };
                                };
                            }, {
                                readonly type: "object";
                                readonly title: "Kount Shipping Address";
                                readonly description: "Contains shipment information including name of the person identified to receive the purchase order.";
                                readonly required: readonly ["countryCode"];
                                readonly properties: {
                                    readonly line1: {
                                        readonly type: "string";
                                        readonly description: "Address Line 1.";
                                        readonly minLength: 1;
                                        readonly maxLength: 1000;
                                    };
                                    readonly line2: {
                                        readonly type: "string";
                                        readonly description: "Address Line 2.";
                                        readonly minLength: 1;
                                        readonly maxLength: 1000;
                                    };
                                    readonly city: {
                                        readonly type: "string";
                                        readonly description: "City";
                                        readonly minLength: 1;
                                        readonly maxLength: 1000;
                                    };
                                    readonly state: {
                                        readonly type: "string";
                                        readonly description: "State / Province.";
                                        readonly minLength: 1;
                                        readonly maxLength: 1000;
                                    };
                                    readonly zipCode: {
                                        readonly type: "string";
                                        readonly description: "Zip / Postal code.";
                                        readonly minLength: 1;
                                        readonly maxLength: 1000;
                                    };
                                    readonly countryCode: {
                                        readonly type: "string";
                                        readonly minLength: 2;
                                        readonly maxLength: 2;
                                        readonly description: "[ISO 3166 alpha-2](https://www.iso.org/iso-3166-country-codes.html) notation of the country.\n";
                                    };
                                    readonly firstName: {
                                        readonly type: "string";
                                        readonly description: "First name of the recipient.";
                                        readonly minLength: 1;
                                        readonly maxLength: 1000;
                                        readonly examples: readonly ["Maya"];
                                    };
                                    readonly middleName: {
                                        readonly type: "string";
                                        readonly description: "Middle name of the recipient.";
                                        readonly minLength: 1;
                                        readonly maxLength: 1000;
                                        readonly examples: readonly ["Jose"];
                                    };
                                    readonly lastName: {
                                        readonly type: "string";
                                        readonly description: "Last name of the recipient.";
                                        readonly minLength: 1;
                                        readonly maxLength: 1000;
                                        readonly examples: readonly ["Juan"];
                                    };
                                    readonly phone: {
                                        readonly type: "string";
                                        readonly format: "phone";
                                        readonly minLength: 1;
                                        readonly maxLength: 1000;
                                        readonly description: "Contact phone number.";
                                    };
                                    readonly email: {
                                        readonly type: "string";
                                        readonly format: "email";
                                        readonly minLength: 5;
                                        readonly maxLength: 1000;
                                        readonly description: "Contact e-mail address.";
                                    };
                                    readonly shippingType: {
                                        readonly type: "string";
                                        readonly enum: readonly ["ST", "SD"];
                                        readonly description: "* `ST` - Standard shipping\n* `SD` - Same-day shipping\n";
                                    };
                                };
                            }];
                        };
                    };
                }, {
                    readonly type: "object";
                    readonly title: "Kount Buyer";
                    readonly required: readonly ["firstName", "lastName", "contact", "billingAddress", "shippingAddress"];
                    readonly description: "Contains personal information regarding the buyer/payer of the transaction.";
                    readonly properties: {
                        readonly firstName: {
                            readonly type: "string";
                            readonly description: "First name of the payer/buyer.";
                            readonly minLength: 1;
                            readonly maxLength: 1000;
                        };
                        readonly middleName: {
                            readonly type: "string";
                            readonly description: "Middle name of the payer/buyer.";
                            readonly minLength: 1;
                            readonly maxLength: 1000;
                        };
                        readonly lastName: {
                            readonly type: "string";
                            readonly description: "Last name of the payer/buyer.";
                            readonly minLength: 1;
                            readonly maxLength: 1000;
                        };
                        readonly birthday: {
                            readonly type: "string";
                            readonly format: "date";
                            readonly description: "Birthday in [ISO 8601 / RFC 3339 full-date format](https://tools.ietf.org/html/rfc3339#section-5.6).";
                        };
                        readonly customerSince: {
                            readonly type: "string";
                            readonly format: "date";
                            readonly description: "Date in [ISO 8601 / RFC 3339 full-date format](https://tools.ietf.org/html/rfc3339#section-5.6) when payer/buyer registered as a customer as per merchant's records.";
                        };
                        readonly sex: {
                            readonly type: "string";
                            readonly enum: readonly ["M", "F"];
                            readonly description: "Biological sex.";
                        };
                        readonly contact: {
                            readonly type: "object";
                            readonly title: "Contact Details";
                            readonly description: "Contact details like phone and/or email address.";
                            readonly properties: {
                                readonly phone: {
                                    readonly type: "string";
                                    readonly format: "phone";
                                    readonly minLength: 1;
                                    readonly maxLength: 1000;
                                    readonly description: "Contact phone number.";
                                };
                                readonly email: {
                                    readonly type: "string";
                                    readonly format: "email";
                                    readonly minLength: 5;
                                    readonly maxLength: 1000;
                                    readonly description: "Contact e-mail address.";
                                };
                            };
                        };
                        readonly billingAddress: {
                            readonly type: "object";
                            readonly title: "Billing Address";
                            readonly description: "Contains billing information of the payer/buyer. By default, all information are optional (i.e. use `Basic Billing Address` specification).\nHowever, If the merchant is enabled to use Kount fraud protection, they must use `Kount Billing Address` specification.\n";
                            readonly oneOf: readonly [{
                                readonly type: "object";
                                readonly title: "Basic Billing Address";
                                readonly properties: {
                                    readonly line1: {
                                        readonly type: "string";
                                        readonly description: "Address Line 1.";
                                        readonly minLength: 1;
                                        readonly maxLength: 1000;
                                    };
                                    readonly line2: {
                                        readonly type: "string";
                                        readonly description: "Address Line 2.";
                                        readonly minLength: 1;
                                        readonly maxLength: 1000;
                                    };
                                    readonly city: {
                                        readonly type: "string";
                                        readonly description: "City";
                                        readonly minLength: 1;
                                        readonly maxLength: 1000;
                                    };
                                    readonly state: {
                                        readonly type: "string";
                                        readonly description: "State / Province.";
                                        readonly minLength: 1;
                                        readonly maxLength: 1000;
                                    };
                                    readonly zipCode: {
                                        readonly type: "string";
                                        readonly description: "Zip / Postal code.";
                                        readonly minLength: 1;
                                        readonly maxLength: 1000;
                                    };
                                    readonly countryCode: {
                                        readonly type: "string";
                                        readonly minLength: 2;
                                        readonly maxLength: 2;
                                        readonly description: "[ISO 3166 alpha-2](https://www.iso.org/iso-3166-country-codes.html) notation of the country.\n";
                                    };
                                };
                            }, {
                                readonly type: "object";
                                readonly title: "Kount Billing Address";
                                readonly required: readonly ["countryCode"];
                                readonly properties: {
                                    readonly line1: {
                                        readonly type: "string";
                                        readonly description: "Address Line 1.";
                                        readonly minLength: 1;
                                        readonly maxLength: 1000;
                                    };
                                    readonly line2: {
                                        readonly type: "string";
                                        readonly description: "Address Line 2.";
                                        readonly minLength: 1;
                                        readonly maxLength: 1000;
                                    };
                                    readonly city: {
                                        readonly type: "string";
                                        readonly description: "City";
                                        readonly minLength: 1;
                                        readonly maxLength: 1000;
                                    };
                                    readonly state: {
                                        readonly type: "string";
                                        readonly description: "State / Province.";
                                        readonly minLength: 1;
                                        readonly maxLength: 1000;
                                    };
                                    readonly zipCode: {
                                        readonly type: "string";
                                        readonly description: "Zip / Postal code.";
                                        readonly minLength: 1;
                                        readonly maxLength: 1000;
                                    };
                                    readonly countryCode: {
                                        readonly type: "string";
                                        readonly minLength: 2;
                                        readonly maxLength: 2;
                                        readonly description: "[ISO 3166 alpha-2](https://www.iso.org/iso-3166-country-codes.html) notation of the country.\n";
                                    };
                                };
                            }];
                        };
                        readonly shippingAddress: {
                            readonly type: "object";
                            readonly title: "Shipping Address";
                            readonly description: "Contains shipment information including name of the person identified to receive the purchase order. By default, all information are optional (i.e. use `Basic Shipping Address` specification).\nHowever, If the merchant is enabled to use Kount fraud protection, they must use `Kount Shipping Address` specification.\n";
                            readonly oneOf: readonly [{
                                readonly type: "object";
                                readonly title: "Basic Shipping Address";
                                readonly description: "Contains shipment information including name of the person identified to receive the purchase order.";
                                readonly properties: {
                                    readonly line1: {
                                        readonly type: "string";
                                        readonly description: "Address Line 1.";
                                        readonly minLength: 1;
                                        readonly maxLength: 1000;
                                    };
                                    readonly line2: {
                                        readonly type: "string";
                                        readonly description: "Address Line 2.";
                                        readonly minLength: 1;
                                        readonly maxLength: 1000;
                                    };
                                    readonly city: {
                                        readonly type: "string";
                                        readonly description: "City";
                                        readonly minLength: 1;
                                        readonly maxLength: 1000;
                                    };
                                    readonly state: {
                                        readonly type: "string";
                                        readonly description: "State / Province.";
                                        readonly minLength: 1;
                                        readonly maxLength: 1000;
                                    };
                                    readonly zipCode: {
                                        readonly type: "string";
                                        readonly description: "Zip / Postal code.";
                                        readonly minLength: 1;
                                        readonly maxLength: 1000;
                                    };
                                    readonly countryCode: {
                                        readonly type: "string";
                                        readonly minLength: 2;
                                        readonly maxLength: 2;
                                        readonly description: "[ISO 3166 alpha-2](https://www.iso.org/iso-3166-country-codes.html) notation of the country.\n";
                                    };
                                    readonly firstName: {
                                        readonly type: "string";
                                        readonly description: "First name of the recipient.";
                                        readonly minLength: 1;
                                        readonly maxLength: 1000;
                                        readonly examples: readonly ["Maya"];
                                    };
                                    readonly middleName: {
                                        readonly type: "string";
                                        readonly description: "Middle name of the recipient.";
                                        readonly minLength: 1;
                                        readonly maxLength: 1000;
                                        readonly examples: readonly ["Jose"];
                                    };
                                    readonly lastName: {
                                        readonly type: "string";
                                        readonly description: "Last name of the recipient.";
                                        readonly minLength: 1;
                                        readonly maxLength: 1000;
                                        readonly examples: readonly ["Juan"];
                                    };
                                    readonly phone: {
                                        readonly type: "string";
                                        readonly format: "phone";
                                        readonly minLength: 1;
                                        readonly maxLength: 1000;
                                        readonly description: "Contact phone number.";
                                    };
                                    readonly email: {
                                        readonly type: "string";
                                        readonly format: "email";
                                        readonly minLength: 5;
                                        readonly maxLength: 1000;
                                        readonly description: "Contact e-mail address.";
                                    };
                                    readonly shippingType: {
                                        readonly type: "string";
                                        readonly enum: readonly ["ST", "SD"];
                                        readonly description: "* `ST` - Standard shipping\n* `SD` - Same-day shipping\n";
                                    };
                                };
                            }, {
                                readonly type: "object";
                                readonly title: "Kount Shipping Address";
                                readonly description: "Contains shipment information including name of the person identified to receive the purchase order.";
                                readonly required: readonly ["countryCode"];
                                readonly properties: {
                                    readonly line1: {
                                        readonly type: "string";
                                        readonly description: "Address Line 1.";
                                        readonly minLength: 1;
                                        readonly maxLength: 1000;
                                    };
                                    readonly line2: {
                                        readonly type: "string";
                                        readonly description: "Address Line 2.";
                                        readonly minLength: 1;
                                        readonly maxLength: 1000;
                                    };
                                    readonly city: {
                                        readonly type: "string";
                                        readonly description: "City";
                                        readonly minLength: 1;
                                        readonly maxLength: 1000;
                                    };
                                    readonly state: {
                                        readonly type: "string";
                                        readonly description: "State / Province.";
                                        readonly minLength: 1;
                                        readonly maxLength: 1000;
                                    };
                                    readonly zipCode: {
                                        readonly type: "string";
                                        readonly description: "Zip / Postal code.";
                                        readonly minLength: 1;
                                        readonly maxLength: 1000;
                                    };
                                    readonly countryCode: {
                                        readonly type: "string";
                                        readonly minLength: 2;
                                        readonly maxLength: 2;
                                        readonly description: "[ISO 3166 alpha-2](https://www.iso.org/iso-3166-country-codes.html) notation of the country.\n";
                                    };
                                    readonly firstName: {
                                        readonly type: "string";
                                        readonly description: "First name of the recipient.";
                                        readonly minLength: 1;
                                        readonly maxLength: 1000;
                                        readonly examples: readonly ["Maya"];
                                    };
                                    readonly middleName: {
                                        readonly type: "string";
                                        readonly description: "Middle name of the recipient.";
                                        readonly minLength: 1;
                                        readonly maxLength: 1000;
                                        readonly examples: readonly ["Jose"];
                                    };
                                    readonly lastName: {
                                        readonly type: "string";
                                        readonly description: "Last name of the recipient.";
                                        readonly minLength: 1;
                                        readonly maxLength: 1000;
                                        readonly examples: readonly ["Juan"];
                                    };
                                    readonly phone: {
                                        readonly type: "string";
                                        readonly format: "phone";
                                        readonly minLength: 1;
                                        readonly maxLength: 1000;
                                        readonly description: "Contact phone number.";
                                    };
                                    readonly email: {
                                        readonly type: "string";
                                        readonly format: "email";
                                        readonly minLength: 5;
                                        readonly maxLength: 1000;
                                        readonly description: "Contact e-mail address.";
                                    };
                                    readonly shippingType: {
                                        readonly type: "string";
                                        readonly enum: readonly ["ST", "SD"];
                                        readonly description: "* `ST` - Standard shipping\n* `SD` - Same-day shipping\n";
                                    };
                                };
                            }];
                        };
                    };
                }];
            };
            readonly items: {
                readonly type: "array";
                readonly description: "Contains a list of item information.\n";
                readonly items: {
                    readonly title: "Item";
                    readonly type: "object";
                    readonly required: readonly ["name", "totalAmount"];
                    readonly properties: {
                        readonly name: {
                            readonly type: "string";
                            readonly description: "Name of the item.";
                            readonly examples: readonly ["Canvas Slip Ons"];
                        };
                        readonly quantity: {
                            readonly type: "string";
                            readonly format: "numeric";
                            readonly description: "Quantity of the item.";
                            readonly examples: readonly ["1"];
                        };
                        readonly code: {
                            readonly type: "string";
                            readonly description: "Item code (e.g. stock-keepin unit code or SKU) in the merchant's inventory.";
                            readonly examples: readonly ["CVG-096732"];
                        };
                        readonly description: {
                            readonly type: "string";
                            readonly description: "Additional description of the item (e.g. color, variant)";
                            readonly examples: readonly ["Shoes"];
                        };
                        readonly amount: {
                            readonly type: "object";
                            readonly description: "Amount details per 1 item.";
                            readonly required: readonly ["value"];
                            readonly properties: {
                                readonly value: {
                                    readonly description: "Amount of the transaction.";
                                    readonly type: "number";
                                    readonly format: "float";
                                    readonly minimum: 0.01;
                                    readonly maximum: 9999999;
                                    readonly examples: readonly ["1000.00"];
                                };
                                readonly details: {
                                    readonly description: "Amount breakdown of 1 item quantity.";
                                    readonly title: "Amount Details";
                                    readonly type: "object";
                                    readonly properties: {
                                        readonly subtotal: {
                                            readonly type: "string";
                                            readonly format: "numeric";
                                            readonly description: "Subtotal value before applying discounts or additional fees.";
                                        };
                                        readonly discount: {
                                            readonly type: "string";
                                            readonly format: "numeric";
                                            readonly description: "Discount applied on the relevant amount value.";
                                        };
                                        readonly serviceCharge: {
                                            readonly type: "string";
                                            readonly format: "numeric";
                                            readonly description: "Service charge applied on the relevant amount value.";
                                        };
                                        readonly shippingFee: {
                                            readonly type: "string";
                                            readonly format: "numeric";
                                            readonly description: "Shipping fee on the relevant amount value.";
                                        };
                                        readonly tax: {
                                            readonly type: "string";
                                            readonly format: "numeric";
                                            readonly description: "Tax on the relevant amount value.";
                                        };
                                    };
                                };
                            };
                        };
                        readonly totalAmount: {
                            readonly type: "object";
                            readonly description: "Amount details all quantity.";
                            readonly required: readonly ["value"];
                            readonly properties: {
                                readonly value: {
                                    readonly description: "Amount of the transaction.";
                                    readonly type: "number";
                                    readonly format: "float";
                                    readonly minimum: 0.01;
                                    readonly maximum: 9999999;
                                    readonly examples: readonly ["1000"];
                                };
                                readonly details: {
                                    readonly description: "Amount breakdown of all quantity.";
                                    readonly title: "Amount Details";
                                    readonly type: "object";
                                    readonly properties: {
                                        readonly subtotal: {
                                            readonly type: "string";
                                            readonly format: "numeric";
                                            readonly description: "Subtotal value before applying discounts or additional fees.";
                                            readonly examples: readonly ["780.00"];
                                        };
                                        readonly discount: {
                                            readonly type: "string";
                                            readonly format: "numeric";
                                            readonly description: "Discount applied on the relevant amount value.";
                                            readonly examples: readonly ["100.00"];
                                        };
                                        readonly serviceCharge: {
                                            readonly type: "string";
                                            readonly format: "numeric";
                                            readonly description: "Service charge applied on the relevant amount value.";
                                            readonly examples: readonly ["0.00"];
                                        };
                                        readonly shippingFee: {
                                            readonly type: "string";
                                            readonly format: "numeric";
                                            readonly description: "Shipping fee on the relevant amount value.";
                                            readonly examples: readonly ["200.00"];
                                        };
                                        readonly tax: {
                                            readonly type: "string";
                                            readonly format: "numeric";
                                            readonly description: "Tax on the relevant amount value.";
                                            readonly examples: readonly ["120.00"];
                                        };
                                    };
                                };
                            };
                        };
                    };
                };
            };
            readonly redirectUrl: {
                readonly type: "object";
                readonly title: "Redirect URLs";
                readonly description: "Contains a list of redirect URLs of the merchant for specific events.";
                readonly properties: {
                    readonly success: {
                        readonly type: "string";
                        readonly format: "url";
                        readonly description: "URL to redirect to when the payment is successfully completed.";
                        readonly examples: readonly ["https://www.merchantsite.com/success?id=5fc10b93-bdbd-4f31-b31d-4575a3785009"];
                    };
                    readonly failure: {
                        readonly type: "string";
                        readonly format: "url";
                        readonly description: "URL to redirect to when the payment fails.";
                        readonly examples: readonly ["https://www.mechantsite.com/failure?id=5fc10b93-bdbd-4f31-b31d-4575a3785009"];
                    };
                    readonly cancel: {
                        readonly type: "string";
                        readonly format: "url";
                        readonly description: "URL to redirect to when the payment is cancelled by the payer/buyer.";
                        readonly examples: readonly ["https://www.merchantsite.com/cancel?id=5fc10b93-bdbd-4f31-b31d-4575a3785009"];
                    };
                };
            };
            readonly requestReferenceNumber: {
                readonly title: "Merchant Request Reference Number";
                readonly type: "string";
                readonly minLength: 1;
                readonly maxLength: 36;
                readonly description: "The merchant's reference number for the transaction. It is strongly advised that the merchant provide unique value for this property for each transaction.";
                readonly examples: readonly ["5fc10b93-bdbd-4f31-b31d-4575a3785009"];
            };
            readonly metadata: {
                readonly title: "Metadata";
                readonly type: "object";
                readonly description: "Used to provide additional data to the transaction such a payment faciliator information.";
                readonly properties: {
                    readonly subMerchantRequestReferenceNumber: {
                        readonly title: "Sub-merchant Request Reference Number";
                        readonly type: "string";
                        readonly format: "alphanumeric, dash, space, hyphen, underscore";
                        readonly minLength: 1;
                        readonly maxLength: 36;
                        readonly description: "Reference number of the sub-merchant for the related transaction";
                    };
                    readonly pf: {
                        readonly title: "Payment Facilitator";
                        readonly type: "object";
                        readonly description: "For a payment facilitator, this provides details regarding the sub-merchant.";
                        readonly required: readonly ["smi", "smn", "mci", "mpc", "mco"];
                        readonly properties: {
                            readonly smi: {
                                readonly type: "string";
                                readonly minLength: 1;
                                readonly maxLength: 30;
                                readonly description: "Sub-merchant ID.";
                            };
                            readonly smn: {
                                readonly type: "string";
                                readonly format: "alphanumeric, hyphen, space, apostrophe, comma, period, hyphen";
                                readonly minLength: 1;
                                readonly maxLength: 64;
                                readonly description: "Sub-merchant name.";
                            };
                            readonly mci: {
                                readonly type: "string";
                                readonly minLength: 1;
                                readonly maxLength: 13;
                                readonly description: "Sub-merchant city location.";
                            };
                            readonly mpc: {
                                readonly type: "string";
                                readonly minLength: 3;
                                readonly maxLength: 3;
                                readonly description: "[ISO 4217 Numeric](https://www.iso.org/iso-4217-currency-codes.html) currency code.\n";
                            };
                            readonly mco: {
                                readonly type: "string";
                                readonly minLength: 3;
                                readonly maxLength: 3;
                                readonly description: "[ISO 3166 Alpha-3](https://www.iso.org/iso-3166-country-codes.html) country code.\n";
                            };
                            readonly mst: {
                                readonly type: "string";
                                readonly minLength: 2;
                                readonly maxLength: 3;
                                readonly description: "Sub-merchant abbreviated state location (required if country is USA).";
                            };
                            readonly mcc: {
                                readonly type: "string";
                                readonly format: "numeric";
                                readonly minLength: 1;
                                readonly maxLength: 15;
                                readonly description: "[ISO 18245](https://www.iso.org/standard/33365.html) merchant category code.\n";
                            };
                            readonly postalCode: {
                                readonly type: "string";
                                readonly format: "alphanumeric, dash, space, hyphen, underscore";
                                readonly maxLength: 20;
                                readonly description: "Sub-merchant postal code";
                            };
                            readonly contactNo: {
                                readonly type: "string";
                                readonly format: "phone";
                                readonly maxLength: 20;
                                readonly description: "Contact number without spaces, dashes, or parentheses.";
                            };
                            readonly state: {
                                readonly type: "string";
                                readonly minLength: 1;
                                readonly maxLength: 100;
                                readonly description: "Sub-merchant state location in full text.";
                            };
                            readonly addressLine1: {
                                readonly type: "string";
                                readonly minLength: 1;
                                readonly maxLength: 100;
                                readonly description: "Sub-merchant street address.";
                            };
                        };
                    };
                };
            };
        };
        readonly $schema: "http://json-schema.org/draft-04/schema#";
    };
    readonly response: {
        readonly "200": {
            readonly type: "object";
            readonly properties: {
                readonly checkoutId: {
                    readonly type: "string";
                    readonly description: "Unique ID generated by PayMaya that denotes the Checkout payment record";
                    readonly examples: readonly ["e14a62b9-4d28-43f5-bbc5-b2bfa1ff9b63"];
                };
                readonly redirectUrl: {
                    readonly type: "string";
                    readonly description: "PayMaya hosted URL to process the Checkout payment. Merchant is expected to redirect the buyer to this URL when it is ready to accept the payment.";
                    readonly examples: readonly ["https://payments-web-sandbox.paymaya.com/v2/checkout?id=e14a62b9-4d28-43f5-bbc5-b2bfa1ff9b63"];
                };
            };
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
    };
};
declare const CreateV1Webhook: {
    readonly body: {
        readonly title: "Webhook Request";
        readonly type: "object";
        readonly required: readonly ["name", "callbackUrl"];
        readonly properties: {
            readonly name: {
                readonly type: "string";
                readonly minLength: 1;
                readonly maxLength: 256;
                readonly enum: readonly ["AUTHORIZED", "PAYMENT_SUCCESS", "PAYMENT_FAILED", "PAYMENT_EXPIRED", "PAYMENT_CANCELLED", "3DS_PAYMENT_SUCCESS", "3DS_PAYMENT_FAILURE", "3DS_PAYMENT_DROPOUT", "RECURRING_PAYMENT_SUCCESS", "RECURRING_PAYMENT_FAILURE", "CHECKOUT_SUCCESS", "CHECKOUT_FAILURE", "CHECKOUT_DROPOUT", "CHECKOUT_CANCELLED"];
                readonly examples: readonly ["PAYMENT_SUCCESS"];
            };
            readonly callbackUrl: {
                readonly type: "string";
                readonly format: "url";
                readonly minLength: 1;
                readonly maxLength: 2083;
                readonly description: "The merchant server's URL that is called for this this webhook.";
                readonly examples: readonly ["http://www.merchantsite.com/success"];
            };
        };
        readonly $schema: "http://json-schema.org/draft-04/schema#";
    };
    readonly response: {
        readonly "200": {
            readonly type: "object";
            readonly required: readonly ["id", "name", "callbackUrl", "createdAt", "updatedAt"];
            readonly properties: {
                readonly id: {
                    readonly type: "string";
                    readonly format: "uuid";
                    readonly description: "The unique identification of the webhook URL.";
                };
                readonly name: {
                    readonly type: "string";
                    readonly minLength: 1;
                    readonly maxLength: 256;
                    readonly enum: readonly ["AUTHORIZED", "PAYMENT_SUCCESS", "PAYMENT_FAILED", "PAYMENT_EXPIRED", "PAYMENT_CANCELLED", "3DS_PAYMENT_SUCCESS", "3DS_PAYMENT_FAILURE", "3DS_PAYMENT_DROPOUT", "RECURRING_PAYMENT_SUCCESS", "RECURRING_PAYMENT_FAILURE", "CHECKOUT_SUCCESS", "CHECKOUT_FAILURE", "CHECKOUT_DROPOUT", "CHECKOUT_CANCELLED"];
                    readonly description: "`AUTHORIZED` `PAYMENT_SUCCESS` `PAYMENT_FAILED` `PAYMENT_EXPIRED` `PAYMENT_CANCELLED` `3DS_PAYMENT_SUCCESS` `3DS_PAYMENT_FAILURE` `3DS_PAYMENT_DROPOUT` `RECURRING_PAYMENT_SUCCESS` `RECURRING_PAYMENT_FAILURE` `CHECKOUT_SUCCESS` `CHECKOUT_FAILURE` `CHECKOUT_DROPOUT` `CHECKOUT_CANCELLED`";
                };
                readonly callbackUrl: {
                    readonly type: "string";
                    readonly format: "url";
                    readonly minLength: 1;
                    readonly maxLength: 2083;
                    readonly description: "The merchant server's URL that is called for this this webhook.";
                };
                readonly createdAt: {
                    readonly type: "string";
                    readonly format: "date-time";
                    readonly description: "The timestamp in UTC when the record is created.";
                };
                readonly updatedAt: {
                    readonly type: "string";
                    readonly format: "date-time";
                    readonly description: "The timestamp in UTC when the record is last updated.";
                };
            };
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
    };
};
declare const DeleteV1Webhook: {
    readonly metadata: {
        readonly allOf: readonly [{
            readonly type: "object";
            readonly properties: {
                readonly webhookId: {
                    readonly type: "string";
                    readonly format: "uuid";
                    readonly examples: readonly ["954cd5a7-1316-4ea1-a014-8f848bd87726"];
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "The unique identification string of a webhook.";
                };
            };
            readonly required: readonly ["webhookId"];
        }];
    };
    readonly response: {
        readonly "200": {
            readonly type: "object";
            readonly required: readonly ["id", "name", "callbackUrl", "createdAt", "updatedAt"];
            readonly properties: {
                readonly id: {
                    readonly type: "string";
                    readonly format: "uuid";
                    readonly description: "The unique identification of the webhook URL.";
                };
                readonly name: {
                    readonly type: "string";
                    readonly minLength: 1;
                    readonly maxLength: 256;
                    readonly enum: readonly ["AUTHORIZED", "PAYMENT_SUCCESS", "PAYMENT_FAILED", "PAYMENT_EXPIRED", "PAYMENT_CANCELLED", "3DS_PAYMENT_SUCCESS", "3DS_PAYMENT_FAILURE", "3DS_PAYMENT_DROPOUT", "RECURRING_PAYMENT_SUCCESS", "RECURRING_PAYMENT_FAILURE", "CHECKOUT_SUCCESS", "CHECKOUT_FAILURE", "CHECKOUT_DROPOUT", "CHECKOUT_CANCELLED"];
                    readonly description: "`AUTHORIZED` `PAYMENT_SUCCESS` `PAYMENT_FAILED` `PAYMENT_EXPIRED` `PAYMENT_CANCELLED` `3DS_PAYMENT_SUCCESS` `3DS_PAYMENT_FAILURE` `3DS_PAYMENT_DROPOUT` `RECURRING_PAYMENT_SUCCESS` `RECURRING_PAYMENT_FAILURE` `CHECKOUT_SUCCESS` `CHECKOUT_FAILURE` `CHECKOUT_DROPOUT` `CHECKOUT_CANCELLED`";
                };
                readonly callbackUrl: {
                    readonly type: "string";
                    readonly format: "url";
                    readonly minLength: 1;
                    readonly maxLength: 2083;
                    readonly description: "The merchant server's URL that is called for this this webhook.";
                };
                readonly createdAt: {
                    readonly type: "string";
                    readonly format: "date-time";
                    readonly description: "The timestamp in UTC when the record is created.";
                };
                readonly updatedAt: {
                    readonly type: "string";
                    readonly format: "date-time";
                    readonly description: "The timestamp in UTC when the record is last updated.";
                };
            };
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
    };
};
declare const GetPaymentStatusViaPaymentId: {
    readonly metadata: {
        readonly allOf: readonly [{
            readonly type: "object";
            readonly properties: {
                readonly paymentId: {
                    readonly type: "string";
                    readonly format: "uuid";
                    readonly examples: readonly ["e732f996-cb87-4120-b712-166d8183c01d"];
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "The unique identification string of the payment transaction.";
                };
            };
            readonly required: readonly ["paymentId"];
        }];
    };
    readonly response: {
        readonly "200": {
            readonly type: "object";
            readonly required: readonly ["id", "status"];
            readonly properties: {
                readonly id: {
                    readonly title: "Payment ID";
                    readonly type: "string";
                    readonly format: "uuid";
                    readonly description: "The unique identification of the payment transaction.";
                };
                readonly status: {
                    readonly title: "Payment States";
                    readonly type: "string";
                    readonly description: "Indicates the current state of the payment transaction.\n\n`PENDING_TOKEN` `PENDING_PAYMENT` `FOR_AUTHENTICATION` `AUTHENTICATING` `AUTH_NOT_ENROLLED` `AUTH_SUCCESS` `AUTH_FAILED` `PAYMENT_SUCCESS` `PAYMENT_FAILED` `PAYMENT_PROCESSING` `AUTHORIZED` `PAYMENT_EXPIRED` `PAYMENT_CANCELLED` `PAYMENT_INVALID` `VOIDED` `REFUNDED` `ACCOUNT_ABUSE` `CAPTURED` `DONE` `CAPTURE_HOLD_EXPIRED`";
                    readonly enum: readonly ["PENDING_TOKEN", "PENDING_PAYMENT", "FOR_AUTHENTICATION", "AUTHENTICATING", "AUTH_NOT_ENROLLED", "AUTH_SUCCESS", "AUTH_FAILED", "PAYMENT_SUCCESS", "PAYMENT_FAILED", "PAYMENT_PROCESSING", "AUTHORIZED", "PAYMENT_EXPIRED", "PAYMENT_CANCELLED", "PAYMENT_INVALID", "VOIDED", "REFUNDED", "ACCOUNT_ABUSE", "CAPTURED", "DONE", "CAPTURE_HOLD_EXPIRED"];
                };
            };
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
    };
};
declare const GetPaymentViaPaymentId: {
    readonly metadata: {
        readonly allOf: readonly [{
            readonly type: "object";
            readonly properties: {
                readonly paymentId: {
                    readonly type: "string";
                    readonly format: "uuid";
                    readonly examples: readonly ["e732f996-cb87-4120-b712-166d8183c01d"];
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "The unique identification string of the payment transaction.";
                };
            };
            readonly required: readonly ["paymentId"];
        }];
    };
    readonly response: {
        readonly "200": {
            readonly title: "Generic Payment Response";
            readonly type: "object";
            readonly required: readonly ["id", "isPaid", "status", "amount", "currency", "canVoid", "canRefund", "canCapture", "createdAt", "updatedAt"];
            readonly properties: {
                readonly id: {
                    readonly title: "Payment ID";
                    readonly type: "string";
                    readonly format: "uuid";
                    readonly description: "The unique identification of the payment transaction.";
                };
                readonly isPaid: {
                    readonly type: "boolean";
                    readonly description: "Indicates if the payment is processed successfully or not.";
                };
                readonly status: {
                    readonly title: "Payment States";
                    readonly type: "string";
                    readonly description: "Indicates the current state of the payment transaction.\n\n`PENDING_TOKEN` `PENDING_PAYMENT` `FOR_AUTHENTICATION` `AUTHENTICATING` `AUTH_NOT_ENROLLED` `AUTH_SUCCESS` `AUTH_FAILED` `PAYMENT_SUCCESS` `PAYMENT_FAILED` `PAYMENT_PROCESSING` `AUTHORIZED` `PAYMENT_EXPIRED` `PAYMENT_CANCELLED` `PAYMENT_INVALID` `VOIDED` `REFUNDED` `ACCOUNT_ABUSE` `CAPTURED` `DONE` `CAPTURE_HOLD_EXPIRED`";
                    readonly enum: readonly ["PENDING_TOKEN", "PENDING_PAYMENT", "FOR_AUTHENTICATION", "AUTHENTICATING", "AUTH_NOT_ENROLLED", "AUTH_SUCCESS", "AUTH_FAILED", "PAYMENT_SUCCESS", "PAYMENT_FAILED", "PAYMENT_PROCESSING", "AUTHORIZED", "PAYMENT_EXPIRED", "PAYMENT_CANCELLED", "PAYMENT_INVALID", "VOIDED", "REFUNDED", "ACCOUNT_ABUSE", "CAPTURED", "DONE", "CAPTURE_HOLD_EXPIRED"];
                };
                readonly amount: {
                    readonly type: "number";
                    readonly format: "float";
                    readonly minimum: 0.01;
                    readonly maximum: 9999999;
                    readonly description: "Amount of the transaction.";
                };
                readonly currency: {
                    readonly type: "string";
                    readonly minLength: 3;
                    readonly maxLength: 3;
                    readonly description: "[ISO 4217 Alpha-3](https://www.iso.org/iso-4217-currency-codes.html) currency code\n";
                    readonly examples: readonly ["PHP"];
                };
                readonly canVoid: {
                    readonly type: "boolean";
                    readonly description: "Indicates if the payment can be voided (e.g. same-day reversal for card transactions).";
                };
                readonly canRefund: {
                    readonly type: "boolean";
                    readonly description: "Indicates if the payment can be refunded (e.g. next-day reversal for card transactions).";
                };
                readonly canCapture: {
                    readonly type: "boolean";
                    readonly description: "Indicates if the payment can be captured for settlement to merchant. This is only relevant for authorization payments.";
                };
                readonly createdAt: {
                    readonly type: "string";
                    readonly format: "date-time";
                    readonly description: "The timestamp in UTC when the record is created.";
                };
                readonly updatedAt: {
                    readonly type: "string";
                    readonly format: "date-time";
                    readonly description: "The timestamp in UTC when the record is last updated.";
                };
                readonly requestReferenceNumber: {
                    readonly title: "Merchant Request Reference Number";
                    readonly type: "string";
                    readonly minLength: 1;
                    readonly maxLength: 36;
                    readonly description: "The merchant's reference number for the transaction. It is strongly advised that the merchant provide unique value for this property for each transaction.";
                };
                readonly description: {
                    readonly title: "Customer/Payer Description";
                    readonly type: "string";
                    readonly description: "Contains identifying information regarding the payer of the transaction. It may contain the payer's email address, name, or address line.";
                    readonly examples: readonly ["Charge for maya.juan@mail.com"];
                };
                readonly paymentTokenId: {
                    readonly title: "Payment Token ID";
                    readonly type: "string";
                    readonly description: "The string token representing the card information (only relevant for card-based payments).";
                    readonly examples: readonly ["0zjacza65HEobriYGN9g5XwaWZYVSeErdNnaNCLCo8QvUXuGg49KPJSy1XbhHPL8OisYOiYPJSQ2BxqR2AuC682Yu5G5LzrU0SK6ByWi0TyhkekWf1ssl6cMBWAVAOdArLcY1QXEyHdr8EsRAS2bHeMEpUU6OSmxmky5Fk"];
                };
                readonly verificationUrl: {
                    readonly title: "3DS Verification URL";
                    readonly type: "string";
                    readonly format: "url";
                    readonly description: "The URL that the payer needs to open in the browser to complete payment via 3DS authentication.";
                };
                readonly fundSource: {
                    readonly type: "object";
                    readonly oneOf: readonly [{
                        readonly title: "Card";
                        readonly type: "object";
                        readonly required: readonly ["id", "type", "description"];
                        readonly properties: {
                            readonly id: {
                                readonly title: "Payment Token ID";
                                readonly type: "string";
                                readonly description: "The string token representing the card information (only relevant for card-based payments).";
                                readonly examples: readonly ["0zjacza65HEobriYGN9g5XwaWZYVSeErdNnaNCLCo8QvUXuGg49KPJSy1XbhHPL8OisYOiYPJSQ2BxqR2AuC682Yu5G5LzrU0SK6ByWi0TyhkekWf1ssl6cMBWAVAOdArLcY1QXEyHdr8EsRAS2bHeMEpUU6OSmxmky5Fk"];
                            };
                            readonly type: {
                                readonly type: "string";
                                readonly description: "Indicates the type of the fund source. For card transactions this is always set to `card`.";
                                readonly examples: readonly ["card"];
                            };
                            readonly description: {
                                readonly type: "string";
                                readonly description: "Masked card PAN which *may* show the last 4 digits.";
                                readonly examples: readonly ["**** **** **** 4154"];
                            };
                            readonly details: {
                                readonly description: "Contains the more information specific to the card used.";
                                readonly type: "object";
                                readonly properties: {
                                    readonly scheme: {
                                        readonly type: "string";
                                        readonly enum: readonly ["visa", "jcb", "master-card"];
                                        readonly description: "Card scheme.\n\n`visa` `jcb` `master-card`";
                                    };
                                    readonly last4: {
                                        readonly type: "string";
                                        readonly format: "numeric";
                                        readonly description: "Last 4 digits of the card PAN.";
                                        readonly examples: readonly [4154];
                                    };
                                    readonly first6: {
                                        readonly type: "string";
                                        readonly format: "numeric";
                                        readonly description: "First 6 digits of the card PAN.";
                                        readonly examples: readonly [545301];
                                    };
                                    readonly masked: {
                                        readonly type: "string";
                                        readonly description: "Masked card PAN which *may* show the first 6 and last 4 digits.";
                                        readonly examples: readonly ["545301******4154"];
                                    };
                                    readonly issuer: {
                                        readonly type: "string";
                                        readonly description: "Name of the issuing bank as provided by https://binlist.net.";
                                    };
                                };
                            };
                        };
                    }, {
                        readonly title: "PayMaya Account (Single Payment)";
                        readonly type: "object";
                        readonly required: readonly ["id", "type", "description"];
                        readonly properties: {
                            readonly id: {
                                readonly type: "string";
                                readonly format: "phone";
                                readonly description: "The mobile phone number (MSISDN) associated to the PayMaya account.";
                                readonly examples: readonly ["+639086216587"];
                            };
                            readonly type: {
                                readonly type: "string";
                                readonly description: "Indicates the type of the fund source. For PayMaya transactions, this is always set to `paymaya`.";
                                readonly examples: readonly ["paymaya"];
                            };
                            readonly description: {
                                readonly type: "string";
                                readonly description: "The formatted masked mobile phone number, which *may* show the last 4 digits.";
                                readonly examples: readonly ["***** ***6587"];
                            };
                            readonly details: {
                                readonly description: "Contains the more information specific to the PayMaya account.";
                                readonly type: "object";
                                readonly properties: {
                                    readonly firstName: {
                                        readonly type: "string";
                                        readonly description: "The first name of the PayMaya account holder.";
                                        readonly examples: readonly ["Maya"];
                                    };
                                    readonly lastName: {
                                        readonly type: "string";
                                        readonly description: "The last name of the PayMaya account holder.";
                                        readonly examples: readonly ["Cruz"];
                                    };
                                    readonly msisdn: {
                                        readonly type: "string";
                                        readonly format: "phone";
                                        readonly description: "The mobile phone number (MSISDN) associated to the PayMaya account.";
                                        readonly examples: readonly ["+639086216587"];
                                    };
                                    readonly email: {
                                        readonly type: "string";
                                        readonly format: "email";
                                        readonly description: "The mobile phone number (MSISDN) associated to the PayMaya account.";
                                        readonly examples: readonly ["maya.juan@mail.com"];
                                    };
                                    readonly masked: {
                                        readonly type: "string";
                                        readonly description: "The masked mobile phone number, which *may* show the last 4 digits.";
                                        readonly examples: readonly ["********6587"];
                                    };
                                };
                            };
                        };
                    }, {
                        readonly title: "PayMaya Account (Recurring Payment)";
                        readonly type: "object";
                        readonly required: readonly ["id", "type", "description"];
                        readonly properties: {
                            readonly id: {
                                readonly title: "Payment Token ID";
                                readonly type: "string";
                                readonly description: "The string token representing the card information (only relevant for card-based payments).";
                                readonly examples: readonly ["0zjacza65HEobriYGN9g5XwaWZYVSeErdNnaNCLCo8QvUXuGg49KPJSy1XbhHPL8OisYOiYPJSQ2BxqR2AuC682Yu5G5LzrU0SK6ByWi0TyhkekWf1ssl6cMBWAVAOdArLcY1QXEyHdr8EsRAS2bHeMEpUU6OSmxmky5Fk"];
                            };
                            readonly type: {
                                readonly type: "string";
                                readonly description: "Indicates the type of the fund source. For recurring PayMaya wallet transactions, this is set to `card`.";
                                readonly examples: readonly ["card"];
                            };
                            readonly description: {
                                readonly type: "string";
                                readonly description: "Masked card PAN which *may* show the last 4 digits.";
                                readonly examples: readonly ["**** **** **** 4154"];
                            };
                            readonly details: {
                                readonly description: "Contains the more information specific to the card used.";
                                readonly type: "object";
                                readonly properties: {
                                    readonly scheme: {
                                        readonly type: "string";
                                        readonly enum: readonly ["visa", "jcb", "master-card"];
                                        readonly description: "Card scheme.\n\n`visa` `jcb` `master-card`";
                                    };
                                    readonly last4: {
                                        readonly type: "string";
                                        readonly format: "numeric";
                                        readonly description: "Last 4 digits of the card PAN.";
                                        readonly examples: readonly [4154];
                                    };
                                    readonly first6: {
                                        readonly type: "string";
                                        readonly format: "numeric";
                                        readonly description: "First 6 digits of the card PAN.";
                                        readonly examples: readonly [545301];
                                    };
                                    readonly masked: {
                                        readonly type: "string";
                                        readonly description: "Masked card PAN which *may* show the first 6 and last 4 digits.";
                                        readonly examples: readonly ["545301******4154"];
                                    };
                                    readonly issuer: {
                                        readonly type: "string";
                                        readonly description: "Name of the issuing bank as provided by https://binlist.net.";
                                    };
                                    readonly profileId: {
                                        readonly type: "string";
                                        readonly description: "Identification string of the PayMaya consumer account.";
                                    };
                                };
                            };
                        };
                    }, {
                        readonly title: "P2M";
                        readonly type: "object";
                        readonly required: readonly ["type", "description"];
                        readonly properties: {
                            readonly id: {
                                readonly type: "string";
                                readonly description: "Always set to null.";
                            };
                            readonly type: {
                                readonly type: "string";
                                readonly description: "Indicates the type of the fund source. For PayMaya P2M transactions this is always set to `paymaya`.";
                                readonly examples: readonly ["paymaya"];
                            };
                            readonly description: {
                                readonly type: "string";
                                readonly description: "Always set to `PayMaya Account`.";
                                readonly examples: readonly ["PayMaya Account"];
                            };
                            readonly details: {
                                readonly description: "Contains the card token used associated to the PayMaya account.";
                                readonly type: "object";
                                readonly properties: {
                                    readonly scheme: {
                                        readonly type: "string";
                                        readonly enum: readonly ["visa", "jcb", "master-card"];
                                        readonly description: "Card scheme.\n\n`visa` `jcb` `master-card`";
                                        readonly examples: readonly ["master-card"];
                                    };
                                    readonly last4: {
                                        readonly type: "string";
                                        readonly format: "numeric";
                                        readonly description: "Last 4 digits of the card PAN.";
                                        readonly examples: readonly [4154];
                                    };
                                    readonly first6: {
                                        readonly type: "string";
                                        readonly format: "numeric";
                                        readonly description: "First 6 digits of the card PAN.";
                                        readonly examples: readonly [545301];
                                    };
                                    readonly masked: {
                                        readonly type: "string";
                                        readonly description: "Masked card PAN which *may* show the first 6 and last 4 digits.";
                                        readonly examples: readonly ["545301******4154"];
                                    };
                                    readonly issuer: {
                                        readonly type: "string";
                                        readonly description: "Name of the issuing bank as provided by https://binlist.net.";
                                    };
                                };
                            };
                        };
                    }, {
                        readonly title: "PayPal Account";
                        readonly type: "object";
                        readonly required: readonly ["id", "type", "description"];
                        readonly properties: {
                            readonly id: {
                                readonly type: "string";
                                readonly format: "email";
                                readonly description: "The payer's PayPal account as represented by an email address.";
                                readonly examples: readonly ["maya.juan@mail.com"];
                            };
                            readonly type: {
                                readonly type: "string";
                                readonly description: "Indicates the type of the fund source. For PayPal transactions, this is always set to `paypal`.";
                                readonly examples: readonly ["paypal"];
                            };
                            readonly description: {
                                readonly type: "string";
                                readonly description: "The formatted masked PayPal account (i.e. email address).";
                                readonly examples: readonly ["m*******n@mail.com"];
                            };
                        };
                    }];
                };
                readonly batchNumber: {
                    readonly title: "Terminal Batch Number";
                    readonly type: "string";
                    readonly format: "alphanumeric, dash, space, hyphen, underscore";
                    readonly minLength: 1;
                    readonly maxLength: 36;
                    readonly description: "The batch number of a terminal-based payment.";
                };
                readonly traceNumber: {
                    readonly title: "Terminal Trace Number";
                    readonly type: "string";
                    readonly format: "alphanumeric, dash, space, hyphen, underscore";
                    readonly minLength: 1;
                    readonly maxLength: 36;
                    readonly description: "The batch number of a terminal-based payment.";
                };
                readonly emvIccData: {
                    readonly title: "EMV ICC Data";
                    readonly type: "string";
                    readonly minLength: 1;
                    readonly maxLength: 340;
                    readonly description: "EMV ICC binary data returned by the Issuer. To be used for post-processing (e.g., Issuer Authentication by EMV EXTERNAL AUTHENTICATE or 2nd GENERATE AC).";
                    readonly examples: readonly ["ggIcAIQHoAAAAAMQEJUFgAAAAACaAxcEGZwBAF8qAgYInwIGAAAAAAEAnwMGAAAAAAAAnxASBgEKA6CAAAoCAAAAAABuefOZnxoCBgifHghQWU1ZUE9TMZ8mCA5/WLUnW3KxnycBgJ8zAyAgyJ80Ax4DAJ81ASGfNgIAyp83BKOXolWfQQQAAAAB"];
                };
                readonly receipt: {
                    readonly title: "Processor Receipt";
                    readonly type: "object";
                    readonly description: "Additional transaction reference numbers generated by either the issuing bank or the acquiring host. This is only relevant for card and PayMaya Account payments.";
                    readonly properties: {
                        readonly transactionId: {
                            readonly title: "Transaction ID";
                            readonly type: "string";
                            readonly description: "Unique identifier returned by the issuer for this transaction.";
                            readonly examples: readonly ["OUWZP6"];
                        };
                        readonly approvalCode: {
                            readonly title: "Approval Code";
                            readonly type: "string";
                            readonly description: "Approval Code / Authorization Identification Code generated by the issuer to indicate the approval of a transaction";
                            readonly examples: readonly [873200];
                        };
                        readonly batchNo: {
                            readonly title: "Processor Batch Number";
                            readonly type: "string";
                            readonly format: "alphanumeric";
                            readonly minLength: 1;
                            readonly maxLength: 8;
                            readonly description: "Value supplied by P3 or the value of `transaction.trace.batchNo` during the request (if supplied) which indicates the batch of transactions that the specific transaction has been grouped with. Merchants may keep track of this value for reconnaissance.";
                            readonly examples: readonly [20210506];
                        };
                        readonly traceNo: {
                            readonly title: "Processor Trace Number";
                            readonly type: "string";
                            readonly format: "alphanumeric";
                            readonly minLength: 1;
                            readonly maxLength: 8;
                            readonly description: "Value of `transaction.trace.traceNo` during the request (if supplied)";
                        };
                        readonly receiptNo: {
                            readonly title: "Receipt Number";
                            readonly type: "string";
                            readonly format: "alphanumeric";
                            readonly minLength: 1;
                            readonly maxLength: 12;
                            readonly description: "A receipt / reference number generated by the acquirer. Can be used by all parties (cardholder merchant payment gateway acquirer issuer) when looking up a specific transaction record for reconnaisance.";
                            readonly examples: readonly [112612964976];
                        };
                    };
                };
                readonly approvalCode: {
                    readonly title: "Approval Code";
                    readonly type: "string";
                    readonly description: "Approval Code / Authorization Identification Code generated by the issuer to indicate the approval of a transaction";
                    readonly examples: readonly [873200];
                };
                readonly receiptNumber: {
                    readonly title: "Receipt Number";
                    readonly type: "string";
                    readonly format: "alphanumeric";
                    readonly minLength: 1;
                    readonly maxLength: 12;
                    readonly description: "A receipt / reference number generated by the acquirer. Can be used by all parties (cardholder merchant payment gateway acquirer issuer) when looking up a specific transaction record for reconnaisance.";
                    readonly examples: readonly [112612964976];
                };
                readonly authorizationType: {
                    readonly title: "Authorization Type";
                    readonly type: "string";
                    readonly enum: readonly ["NORMAL", "FINAL", "PREAUTHORIZATION"];
                    readonly description: "For card transactions, it indicates the type of authorization applied. For more information, click this [link](https://cdn.paymaya.com/sandbox/payments_api/paymayap3/paymayap3.html#header-authorization-types).\n\n`NORMAL` `FINAL` `PREAUTHORIZATION`";
                };
                readonly capturedAmount: {
                    readonly type: "number";
                    readonly format: "float";
                    readonly description: "Indicates the total amount already captured for this authorization payment. Only applicable if the transaction has an `authorizationType`.";
                    readonly minimum: -3.402823669209385e+38;
                    readonly maximum: 3.402823669209385e+38;
                };
                readonly authorizationPayment: {
                    readonly title: "Authorization Payment ID";
                    readonly type: "string";
                    readonly format: "uuid";
                    readonly description: "The unique identification of the authorization payment associated to this payment. Only applicable if this is a capture payment.";
                };
                readonly capturedPaymentId: {
                    readonly title: "Capture Payment ID";
                    readonly type: "string";
                    readonly format: "uuid";
                    readonly description: "The unique identification of the capture payment associated to this payment. Only applicable if this is an authorization payments.";
                };
                readonly subscription: {
                    readonly title: "Subscription ID";
                    readonly type: "string";
                    readonly format: "uuid";
                    readonly description: "The unique identification of the subscription associated to this payment.";
                };
                readonly metadata: {
                    readonly title: "Metadata";
                    readonly type: "object";
                    readonly description: "Used to provide additional data to the transaction such a payment faciliator information.";
                    readonly properties: {
                        readonly subMerchantRequestReferenceNumber: {
                            readonly title: "Sub-merchant Request Reference Number";
                            readonly type: "string";
                            readonly format: "alphanumeric, dash, space, hyphen, underscore";
                            readonly minLength: 1;
                            readonly maxLength: 36;
                            readonly description: "Reference number of the sub-merchant for the related transaction";
                        };
                        readonly pf: {
                            readonly title: "Payment Facilitator";
                            readonly type: "object";
                            readonly description: "For a payment facilitator, this provides details regarding the sub-merchant.";
                            readonly required: readonly ["smi", "smn", "mci", "mpc", "mco"];
                            readonly properties: {
                                readonly smi: {
                                    readonly type: "string";
                                    readonly minLength: 1;
                                    readonly maxLength: 30;
                                    readonly description: "Sub-merchant ID.";
                                };
                                readonly smn: {
                                    readonly type: "string";
                                    readonly format: "alphanumeric, hyphen, space, apostrophe, comma, period, hyphen";
                                    readonly minLength: 1;
                                    readonly maxLength: 64;
                                    readonly description: "Sub-merchant name.";
                                };
                                readonly mci: {
                                    readonly type: "string";
                                    readonly minLength: 1;
                                    readonly maxLength: 13;
                                    readonly description: "Sub-merchant city location.";
                                };
                                readonly mpc: {
                                    readonly type: "string";
                                    readonly minLength: 3;
                                    readonly maxLength: 3;
                                    readonly description: "[ISO 4217 Numeric](https://www.iso.org/iso-4217-currency-codes.html) currency code.\n";
                                };
                                readonly mco: {
                                    readonly type: "string";
                                    readonly minLength: 3;
                                    readonly maxLength: 3;
                                    readonly description: "[ISO 3166 Alpha-3](https://www.iso.org/iso-3166-country-codes.html) country code.\n";
                                };
                                readonly mst: {
                                    readonly type: "string";
                                    readonly minLength: 2;
                                    readonly maxLength: 3;
                                    readonly description: "Sub-merchant abbreviated state location (required if country is USA).";
                                };
                                readonly mcc: {
                                    readonly type: "string";
                                    readonly format: "numeric";
                                    readonly minLength: 1;
                                    readonly maxLength: 15;
                                    readonly description: "[ISO 18245](https://www.iso.org/standard/33365.html) merchant category code.\n";
                                };
                                readonly postalCode: {
                                    readonly type: "string";
                                    readonly format: "alphanumeric, dash, space, hyphen, underscore";
                                    readonly maxLength: 20;
                                    readonly description: "Sub-merchant postal code";
                                };
                                readonly contactNo: {
                                    readonly type: "string";
                                    readonly format: "phone";
                                    readonly maxLength: 20;
                                    readonly description: "Contact number without spaces, dashes, or parentheses.";
                                };
                                readonly state: {
                                    readonly type: "string";
                                    readonly minLength: 1;
                                    readonly maxLength: 100;
                                    readonly description: "Sub-merchant state location in full text.";
                                };
                                readonly addressLine1: {
                                    readonly type: "string";
                                    readonly minLength: 1;
                                    readonly maxLength: 100;
                                    readonly description: "Sub-merchant street address.";
                                };
                            };
                        };
                    };
                };
            };
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
    };
};
declare const GetPaymentViaRequestReferenceNumber: {
    readonly metadata: {
        readonly allOf: readonly [{
            readonly type: "object";
            readonly properties: {
                readonly rrn: {
                    readonly title: "Merchant Request Reference Number";
                    readonly type: "string";
                    readonly minLength: 1;
                    readonly maxLength: 36;
                    readonly description: "A merchant's request reference number for a given transaction.";
                    readonly examples: readonly [1625127550];
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                };
            };
            readonly required: readonly ["rrn"];
        }];
    };
    readonly response: {
        readonly "200": {
            readonly type: "array";
            readonly items: {
                readonly title: "Generic Payment Response";
                readonly type: "object";
                readonly required: readonly ["id", "isPaid", "status", "amount", "currency", "canVoid", "canRefund", "canCapture", "createdAt", "updatedAt"];
                readonly properties: {
                    readonly id: {
                        readonly title: "Payment ID";
                        readonly type: "string";
                        readonly format: "uuid";
                        readonly description: "The unique identification of the payment transaction.";
                    };
                    readonly isPaid: {
                        readonly type: "boolean";
                        readonly description: "Indicates if the payment is processed successfully or not.";
                    };
                    readonly status: {
                        readonly title: "Payment States";
                        readonly type: "string";
                        readonly description: "Indicates the current state of the payment transaction.\n\n`PENDING_TOKEN` `PENDING_PAYMENT` `FOR_AUTHENTICATION` `AUTHENTICATING` `AUTH_NOT_ENROLLED` `AUTH_SUCCESS` `AUTH_FAILED` `PAYMENT_SUCCESS` `PAYMENT_FAILED` `PAYMENT_PROCESSING` `AUTHORIZED` `PAYMENT_EXPIRED` `PAYMENT_CANCELLED` `PAYMENT_INVALID` `VOIDED` `REFUNDED` `ACCOUNT_ABUSE` `CAPTURED` `DONE` `CAPTURE_HOLD_EXPIRED`";
                        readonly enum: readonly ["PENDING_TOKEN", "PENDING_PAYMENT", "FOR_AUTHENTICATION", "AUTHENTICATING", "AUTH_NOT_ENROLLED", "AUTH_SUCCESS", "AUTH_FAILED", "PAYMENT_SUCCESS", "PAYMENT_FAILED", "PAYMENT_PROCESSING", "AUTHORIZED", "PAYMENT_EXPIRED", "PAYMENT_CANCELLED", "PAYMENT_INVALID", "VOIDED", "REFUNDED", "ACCOUNT_ABUSE", "CAPTURED", "DONE", "CAPTURE_HOLD_EXPIRED"];
                    };
                    readonly amount: {
                        readonly type: "number";
                        readonly format: "float";
                        readonly minimum: 0.01;
                        readonly maximum: 9999999;
                        readonly description: "Amount of the transaction.";
                    };
                    readonly currency: {
                        readonly type: "string";
                        readonly minLength: 3;
                        readonly maxLength: 3;
                        readonly description: "[ISO 4217 Alpha-3](https://www.iso.org/iso-4217-currency-codes.html) currency code\n";
                        readonly examples: readonly ["PHP"];
                    };
                    readonly canVoid: {
                        readonly type: "boolean";
                        readonly description: "Indicates if the payment can be voided (e.g. same-day reversal for card transactions).";
                    };
                    readonly canRefund: {
                        readonly type: "boolean";
                        readonly description: "Indicates if the payment can be refunded (e.g. next-day reversal for card transactions).";
                    };
                    readonly canCapture: {
                        readonly type: "boolean";
                        readonly description: "Indicates if the payment can be captured for settlement to merchant. This is only relevant for authorization payments.";
                    };
                    readonly createdAt: {
                        readonly type: "string";
                        readonly format: "date-time";
                        readonly description: "The timestamp in UTC when the record is created.";
                    };
                    readonly updatedAt: {
                        readonly type: "string";
                        readonly format: "date-time";
                        readonly description: "The timestamp in UTC when the record is last updated.";
                    };
                    readonly requestReferenceNumber: {
                        readonly title: "Merchant Request Reference Number";
                        readonly type: "string";
                        readonly minLength: 1;
                        readonly maxLength: 36;
                        readonly description: "The merchant's reference number for the transaction. It is strongly advised that the merchant provide unique value for this property for each transaction.";
                    };
                    readonly description: {
                        readonly title: "Customer/Payer Description";
                        readonly type: "string";
                        readonly description: "Contains identifying information regarding the payer of the transaction. It may contain the payer's email address, name, or address line.";
                        readonly examples: readonly ["Charge for maya.juan@mail.com"];
                    };
                    readonly paymentTokenId: {
                        readonly title: "Payment Token ID";
                        readonly type: "string";
                        readonly description: "The string token representing the card information (only relevant for card-based payments).";
                        readonly examples: readonly ["0zjacza65HEobriYGN9g5XwaWZYVSeErdNnaNCLCo8QvUXuGg49KPJSy1XbhHPL8OisYOiYPJSQ2BxqR2AuC682Yu5G5LzrU0SK6ByWi0TyhkekWf1ssl6cMBWAVAOdArLcY1QXEyHdr8EsRAS2bHeMEpUU6OSmxmky5Fk"];
                    };
                    readonly verificationUrl: {
                        readonly title: "3DS Verification URL";
                        readonly type: "string";
                        readonly format: "url";
                        readonly description: "The URL that the payer needs to open in the browser to complete payment via 3DS authentication.";
                    };
                    readonly fundSource: {
                        readonly type: "object";
                        readonly oneOf: readonly [{
                            readonly title: "Card";
                            readonly type: "object";
                            readonly required: readonly ["id", "type", "description"];
                            readonly properties: {
                                readonly id: {
                                    readonly title: "Payment Token ID";
                                    readonly type: "string";
                                    readonly description: "The string token representing the card information (only relevant for card-based payments).";
                                    readonly examples: readonly ["0zjacza65HEobriYGN9g5XwaWZYVSeErdNnaNCLCo8QvUXuGg49KPJSy1XbhHPL8OisYOiYPJSQ2BxqR2AuC682Yu5G5LzrU0SK6ByWi0TyhkekWf1ssl6cMBWAVAOdArLcY1QXEyHdr8EsRAS2bHeMEpUU6OSmxmky5Fk"];
                                };
                                readonly type: {
                                    readonly type: "string";
                                    readonly description: "Indicates the type of the fund source. For card transactions this is always set to `card`.";
                                    readonly examples: readonly ["card"];
                                };
                                readonly description: {
                                    readonly type: "string";
                                    readonly description: "Masked card PAN which *may* show the last 4 digits.";
                                    readonly examples: readonly ["**** **** **** 4154"];
                                };
                                readonly details: {
                                    readonly description: "Contains the more information specific to the card used.";
                                    readonly type: "object";
                                    readonly properties: {
                                        readonly scheme: {
                                            readonly type: "string";
                                            readonly enum: readonly ["visa", "jcb", "master-card"];
                                            readonly description: "Card scheme.\n\n`visa` `jcb` `master-card`";
                                        };
                                        readonly last4: {
                                            readonly type: "string";
                                            readonly format: "numeric";
                                            readonly description: "Last 4 digits of the card PAN.";
                                            readonly examples: readonly [4154];
                                        };
                                        readonly first6: {
                                            readonly type: "string";
                                            readonly format: "numeric";
                                            readonly description: "First 6 digits of the card PAN.";
                                            readonly examples: readonly [545301];
                                        };
                                        readonly masked: {
                                            readonly type: "string";
                                            readonly description: "Masked card PAN which *may* show the first 6 and last 4 digits.";
                                            readonly examples: readonly ["545301******4154"];
                                        };
                                        readonly issuer: {
                                            readonly type: "string";
                                            readonly description: "Name of the issuing bank as provided by https://binlist.net.";
                                        };
                                    };
                                };
                            };
                        }, {
                            readonly title: "PayMaya Account (Single Payment)";
                            readonly type: "object";
                            readonly required: readonly ["id", "type", "description"];
                            readonly properties: {
                                readonly id: {
                                    readonly type: "string";
                                    readonly format: "phone";
                                    readonly description: "The mobile phone number (MSISDN) associated to the PayMaya account.";
                                    readonly examples: readonly ["+639086216587"];
                                };
                                readonly type: {
                                    readonly type: "string";
                                    readonly description: "Indicates the type of the fund source. For PayMaya transactions, this is always set to `paymaya`.";
                                    readonly examples: readonly ["paymaya"];
                                };
                                readonly description: {
                                    readonly type: "string";
                                    readonly description: "The formatted masked mobile phone number, which *may* show the last 4 digits.";
                                    readonly examples: readonly ["***** ***6587"];
                                };
                                readonly details: {
                                    readonly description: "Contains the more information specific to the PayMaya account.";
                                    readonly type: "object";
                                    readonly properties: {
                                        readonly firstName: {
                                            readonly type: "string";
                                            readonly description: "The first name of the PayMaya account holder.";
                                            readonly examples: readonly ["Maya"];
                                        };
                                        readonly lastName: {
                                            readonly type: "string";
                                            readonly description: "The last name of the PayMaya account holder.";
                                            readonly examples: readonly ["Cruz"];
                                        };
                                        readonly msisdn: {
                                            readonly type: "string";
                                            readonly format: "phone";
                                            readonly description: "The mobile phone number (MSISDN) associated to the PayMaya account.";
                                            readonly examples: readonly ["+639086216587"];
                                        };
                                        readonly email: {
                                            readonly type: "string";
                                            readonly format: "email";
                                            readonly description: "The mobile phone number (MSISDN) associated to the PayMaya account.";
                                            readonly examples: readonly ["maya.juan@mail.com"];
                                        };
                                        readonly masked: {
                                            readonly type: "string";
                                            readonly description: "The masked mobile phone number, which *may* show the last 4 digits.";
                                            readonly examples: readonly ["********6587"];
                                        };
                                    };
                                };
                            };
                        }, {
                            readonly title: "PayMaya Account (Recurring Payment)";
                            readonly type: "object";
                            readonly required: readonly ["id", "type", "description"];
                            readonly properties: {
                                readonly id: {
                                    readonly title: "Payment Token ID";
                                    readonly type: "string";
                                    readonly description: "The string token representing the card information (only relevant for card-based payments).";
                                    readonly examples: readonly ["0zjacza65HEobriYGN9g5XwaWZYVSeErdNnaNCLCo8QvUXuGg49KPJSy1XbhHPL8OisYOiYPJSQ2BxqR2AuC682Yu5G5LzrU0SK6ByWi0TyhkekWf1ssl6cMBWAVAOdArLcY1QXEyHdr8EsRAS2bHeMEpUU6OSmxmky5Fk"];
                                };
                                readonly type: {
                                    readonly type: "string";
                                    readonly description: "Indicates the type of the fund source. For recurring PayMaya wallet transactions, this is set to `card`.";
                                    readonly examples: readonly ["card"];
                                };
                                readonly description: {
                                    readonly type: "string";
                                    readonly description: "Masked card PAN which *may* show the last 4 digits.";
                                    readonly examples: readonly ["**** **** **** 4154"];
                                };
                                readonly details: {
                                    readonly description: "Contains the more information specific to the card used.";
                                    readonly type: "object";
                                    readonly properties: {
                                        readonly scheme: {
                                            readonly type: "string";
                                            readonly enum: readonly ["visa", "jcb", "master-card"];
                                            readonly description: "Card scheme.\n\n`visa` `jcb` `master-card`";
                                        };
                                        readonly last4: {
                                            readonly type: "string";
                                            readonly format: "numeric";
                                            readonly description: "Last 4 digits of the card PAN.";
                                            readonly examples: readonly [4154];
                                        };
                                        readonly first6: {
                                            readonly type: "string";
                                            readonly format: "numeric";
                                            readonly description: "First 6 digits of the card PAN.";
                                            readonly examples: readonly [545301];
                                        };
                                        readonly masked: {
                                            readonly type: "string";
                                            readonly description: "Masked card PAN which *may* show the first 6 and last 4 digits.";
                                            readonly examples: readonly ["545301******4154"];
                                        };
                                        readonly issuer: {
                                            readonly type: "string";
                                            readonly description: "Name of the issuing bank as provided by https://binlist.net.";
                                        };
                                        readonly profileId: {
                                            readonly type: "string";
                                            readonly description: "Identification string of the PayMaya consumer account.";
                                        };
                                    };
                                };
                            };
                        }, {
                            readonly title: "P2M";
                            readonly type: "object";
                            readonly required: readonly ["type", "description"];
                            readonly properties: {
                                readonly id: {
                                    readonly type: "string";
                                    readonly description: "Always set to null.";
                                };
                                readonly type: {
                                    readonly type: "string";
                                    readonly description: "Indicates the type of the fund source. For PayMaya P2M transactions this is always set to `paymaya`.";
                                    readonly examples: readonly ["paymaya"];
                                };
                                readonly description: {
                                    readonly type: "string";
                                    readonly description: "Always set to `PayMaya Account`.";
                                    readonly examples: readonly ["PayMaya Account"];
                                };
                                readonly details: {
                                    readonly description: "Contains the card token used associated to the PayMaya account.";
                                    readonly type: "object";
                                    readonly properties: {
                                        readonly scheme: {
                                            readonly type: "string";
                                            readonly enum: readonly ["visa", "jcb", "master-card"];
                                            readonly description: "Card scheme.\n\n`visa` `jcb` `master-card`";
                                            readonly examples: readonly ["master-card"];
                                        };
                                        readonly last4: {
                                            readonly type: "string";
                                            readonly format: "numeric";
                                            readonly description: "Last 4 digits of the card PAN.";
                                            readonly examples: readonly [4154];
                                        };
                                        readonly first6: {
                                            readonly type: "string";
                                            readonly format: "numeric";
                                            readonly description: "First 6 digits of the card PAN.";
                                            readonly examples: readonly [545301];
                                        };
                                        readonly masked: {
                                            readonly type: "string";
                                            readonly description: "Masked card PAN which *may* show the first 6 and last 4 digits.";
                                            readonly examples: readonly ["545301******4154"];
                                        };
                                        readonly issuer: {
                                            readonly type: "string";
                                            readonly description: "Name of the issuing bank as provided by https://binlist.net.";
                                        };
                                    };
                                };
                            };
                        }, {
                            readonly title: "PayPal Account";
                            readonly type: "object";
                            readonly required: readonly ["id", "type", "description"];
                            readonly properties: {
                                readonly id: {
                                    readonly type: "string";
                                    readonly format: "email";
                                    readonly description: "The payer's PayPal account as represented by an email address.";
                                    readonly examples: readonly ["maya.juan@mail.com"];
                                };
                                readonly type: {
                                    readonly type: "string";
                                    readonly description: "Indicates the type of the fund source. For PayPal transactions, this is always set to `paypal`.";
                                    readonly examples: readonly ["paypal"];
                                };
                                readonly description: {
                                    readonly type: "string";
                                    readonly description: "The formatted masked PayPal account (i.e. email address).";
                                    readonly examples: readonly ["m*******n@mail.com"];
                                };
                            };
                        }];
                    };
                    readonly batchNumber: {
                        readonly title: "Terminal Batch Number";
                        readonly type: "string";
                        readonly format: "alphanumeric, dash, space, hyphen, underscore";
                        readonly minLength: 1;
                        readonly maxLength: 36;
                        readonly description: "The batch number of a terminal-based payment.";
                    };
                    readonly traceNumber: {
                        readonly title: "Terminal Trace Number";
                        readonly type: "string";
                        readonly format: "alphanumeric, dash, space, hyphen, underscore";
                        readonly minLength: 1;
                        readonly maxLength: 36;
                        readonly description: "The batch number of a terminal-based payment.";
                    };
                    readonly emvIccData: {
                        readonly title: "EMV ICC Data";
                        readonly type: "string";
                        readonly minLength: 1;
                        readonly maxLength: 340;
                        readonly description: "EMV ICC binary data returned by the Issuer. To be used for post-processing (e.g., Issuer Authentication by EMV EXTERNAL AUTHENTICATE or 2nd GENERATE AC).";
                        readonly examples: readonly ["ggIcAIQHoAAAAAMQEJUFgAAAAACaAxcEGZwBAF8qAgYInwIGAAAAAAEAnwMGAAAAAAAAnxASBgEKA6CAAAoCAAAAAABuefOZnxoCBgifHghQWU1ZUE9TMZ8mCA5/WLUnW3KxnycBgJ8zAyAgyJ80Ax4DAJ81ASGfNgIAyp83BKOXolWfQQQAAAAB"];
                    };
                    readonly receipt: {
                        readonly title: "Processor Receipt";
                        readonly type: "object";
                        readonly description: "Additional transaction reference numbers generated by either the issuing bank or the acquiring host. This is only relevant for card and PayMaya Account payments.";
                        readonly properties: {
                            readonly transactionId: {
                                readonly title: "Transaction ID";
                                readonly type: "string";
                                readonly description: "Unique identifier returned by the issuer for this transaction.";
                                readonly examples: readonly ["OUWZP6"];
                            };
                            readonly approvalCode: {
                                readonly title: "Approval Code";
                                readonly type: "string";
                                readonly description: "Approval Code / Authorization Identification Code generated by the issuer to indicate the approval of a transaction";
                                readonly examples: readonly [873200];
                            };
                            readonly batchNo: {
                                readonly title: "Processor Batch Number";
                                readonly type: "string";
                                readonly format: "alphanumeric";
                                readonly minLength: 1;
                                readonly maxLength: 8;
                                readonly description: "Value supplied by P3 or the value of `transaction.trace.batchNo` during the request (if supplied) which indicates the batch of transactions that the specific transaction has been grouped with. Merchants may keep track of this value for reconnaissance.";
                                readonly examples: readonly [20210506];
                            };
                            readonly traceNo: {
                                readonly title: "Processor Trace Number";
                                readonly type: "string";
                                readonly format: "alphanumeric";
                                readonly minLength: 1;
                                readonly maxLength: 8;
                                readonly description: "Value of `transaction.trace.traceNo` during the request (if supplied)";
                            };
                            readonly receiptNo: {
                                readonly title: "Receipt Number";
                                readonly type: "string";
                                readonly format: "alphanumeric";
                                readonly minLength: 1;
                                readonly maxLength: 12;
                                readonly description: "A receipt / reference number generated by the acquirer. Can be used by all parties (cardholder merchant payment gateway acquirer issuer) when looking up a specific transaction record for reconnaisance.";
                                readonly examples: readonly [112612964976];
                            };
                        };
                    };
                    readonly approvalCode: {
                        readonly title: "Approval Code";
                        readonly type: "string";
                        readonly description: "Approval Code / Authorization Identification Code generated by the issuer to indicate the approval of a transaction";
                        readonly examples: readonly [873200];
                    };
                    readonly receiptNumber: {
                        readonly title: "Receipt Number";
                        readonly type: "string";
                        readonly format: "alphanumeric";
                        readonly minLength: 1;
                        readonly maxLength: 12;
                        readonly description: "A receipt / reference number generated by the acquirer. Can be used by all parties (cardholder merchant payment gateway acquirer issuer) when looking up a specific transaction record for reconnaisance.";
                        readonly examples: readonly [112612964976];
                    };
                    readonly authorizationType: {
                        readonly title: "Authorization Type";
                        readonly type: "string";
                        readonly enum: readonly ["NORMAL", "FINAL", "PREAUTHORIZATION"];
                        readonly description: "For card transactions, it indicates the type of authorization applied. For more information, click this [link](https://cdn.paymaya.com/sandbox/payments_api/paymayap3/paymayap3.html#header-authorization-types).\n\n`NORMAL` `FINAL` `PREAUTHORIZATION`";
                    };
                    readonly capturedAmount: {
                        readonly type: "number";
                        readonly format: "float";
                        readonly description: "Indicates the total amount already captured for this authorization payment. Only applicable if the transaction has an `authorizationType`.";
                        readonly minimum: -3.402823669209385e+38;
                        readonly maximum: 3.402823669209385e+38;
                    };
                    readonly authorizationPayment: {
                        readonly title: "Authorization Payment ID";
                        readonly type: "string";
                        readonly format: "uuid";
                        readonly description: "The unique identification of the authorization payment associated to this payment. Only applicable if this is a capture payment.";
                    };
                    readonly capturedPaymentId: {
                        readonly title: "Capture Payment ID";
                        readonly type: "string";
                        readonly format: "uuid";
                        readonly description: "The unique identification of the capture payment associated to this payment. Only applicable if this is an authorization payments.";
                    };
                    readonly subscription: {
                        readonly title: "Subscription ID";
                        readonly type: "string";
                        readonly format: "uuid";
                        readonly description: "The unique identification of the subscription associated to this payment.";
                    };
                    readonly metadata: {
                        readonly title: "Metadata";
                        readonly type: "object";
                        readonly description: "Used to provide additional data to the transaction such a payment faciliator information.";
                        readonly properties: {
                            readonly subMerchantRequestReferenceNumber: {
                                readonly title: "Sub-merchant Request Reference Number";
                                readonly type: "string";
                                readonly format: "alphanumeric, dash, space, hyphen, underscore";
                                readonly minLength: 1;
                                readonly maxLength: 36;
                                readonly description: "Reference number of the sub-merchant for the related transaction";
                            };
                            readonly pf: {
                                readonly title: "Payment Facilitator";
                                readonly type: "object";
                                readonly description: "For a payment facilitator, this provides details regarding the sub-merchant.";
                                readonly required: readonly ["smi", "smn", "mci", "mpc", "mco"];
                                readonly properties: {
                                    readonly smi: {
                                        readonly type: "string";
                                        readonly minLength: 1;
                                        readonly maxLength: 30;
                                        readonly description: "Sub-merchant ID.";
                                    };
                                    readonly smn: {
                                        readonly type: "string";
                                        readonly format: "alphanumeric, hyphen, space, apostrophe, comma, period, hyphen";
                                        readonly minLength: 1;
                                        readonly maxLength: 64;
                                        readonly description: "Sub-merchant name.";
                                    };
                                    readonly mci: {
                                        readonly type: "string";
                                        readonly minLength: 1;
                                        readonly maxLength: 13;
                                        readonly description: "Sub-merchant city location.";
                                    };
                                    readonly mpc: {
                                        readonly type: "string";
                                        readonly minLength: 3;
                                        readonly maxLength: 3;
                                        readonly description: "[ISO 4217 Numeric](https://www.iso.org/iso-4217-currency-codes.html) currency code.\n";
                                    };
                                    readonly mco: {
                                        readonly type: "string";
                                        readonly minLength: 3;
                                        readonly maxLength: 3;
                                        readonly description: "[ISO 3166 Alpha-3](https://www.iso.org/iso-3166-country-codes.html) country code.\n";
                                    };
                                    readonly mst: {
                                        readonly type: "string";
                                        readonly minLength: 2;
                                        readonly maxLength: 3;
                                        readonly description: "Sub-merchant abbreviated state location (required if country is USA).";
                                    };
                                    readonly mcc: {
                                        readonly type: "string";
                                        readonly format: "numeric";
                                        readonly minLength: 1;
                                        readonly maxLength: 15;
                                        readonly description: "[ISO 18245](https://www.iso.org/standard/33365.html) merchant category code.\n";
                                    };
                                    readonly postalCode: {
                                        readonly type: "string";
                                        readonly format: "alphanumeric, dash, space, hyphen, underscore";
                                        readonly maxLength: 20;
                                        readonly description: "Sub-merchant postal code";
                                    };
                                    readonly contactNo: {
                                        readonly type: "string";
                                        readonly format: "phone";
                                        readonly maxLength: 20;
                                        readonly description: "Contact number without spaces, dashes, or parentheses.";
                                    };
                                    readonly state: {
                                        readonly type: "string";
                                        readonly minLength: 1;
                                        readonly maxLength: 100;
                                        readonly description: "Sub-merchant state location in full text.";
                                    };
                                    readonly addressLine1: {
                                        readonly type: "string";
                                        readonly minLength: 1;
                                        readonly maxLength: 100;
                                        readonly description: "Sub-merchant street address.";
                                    };
                                };
                            };
                        };
                    };
                };
            };
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
    };
};
declare const GetV1Checkout: {
    readonly metadata: {
        readonly allOf: readonly [{
            readonly type: "object";
            readonly properties: {
                readonly checkoutId: {
                    readonly type: "string";
                    readonly format: "uuid";
                    readonly examples: readonly ["fa4da2ff-dcda-4367-a97d-0c9445147b73"];
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "The unique identification string of the checkout transaction.";
                };
            };
            readonly required: readonly ["checkoutId"];
        }];
    };
    readonly response: {
        readonly "200": {
            readonly type: "object";
            readonly properties: {
                readonly id: {
                    readonly title: "Checkout ID";
                    readonly type: "string";
                    readonly format: "uuid";
                    readonly description: "The unique identification of the checkout payment transaction.";
                };
                readonly items: {
                    readonly type: "array";
                    readonly description: "Contains a list of item information.\n";
                    readonly items: {
                        readonly title: "Item";
                        readonly type: "object";
                        readonly required: readonly ["name", "totalAmount"];
                        readonly properties: {
                            readonly name: {
                                readonly type: "string";
                                readonly description: "Name of the item.";
                            };
                            readonly quantity: {
                                readonly type: "string";
                                readonly format: "numeric";
                                readonly description: "Quantity of the item.";
                            };
                            readonly code: {
                                readonly type: "string";
                                readonly description: "Item code (e.g. stock-keepin unit code or SKU) in the merchant's inventory.";
                            };
                            readonly description: {
                                readonly type: "string";
                                readonly description: "Additional description of the item (e.g. color, variant)";
                            };
                            readonly amount: {
                                readonly type: "object";
                                readonly description: "Amount details per 1 item.";
                                readonly required: readonly ["value"];
                                readonly properties: {
                                    readonly value: {
                                        readonly description: "Amount of the transaction.";
                                        readonly type: "number";
                                        readonly format: "float";
                                        readonly minimum: 0.01;
                                        readonly maximum: 9999999;
                                    };
                                    readonly details: {
                                        readonly description: "Amount breakdown of 1 item quantity.";
                                        readonly title: "Amount Details";
                                        readonly type: "object";
                                        readonly properties: {
                                            readonly subtotal: {
                                                readonly type: "string";
                                                readonly format: "numeric";
                                                readonly description: "Subtotal value before applying discounts or additional fees.";
                                            };
                                            readonly discount: {
                                                readonly type: "string";
                                                readonly format: "numeric";
                                                readonly description: "Discount applied on the relevant amount value.";
                                            };
                                            readonly serviceCharge: {
                                                readonly type: "string";
                                                readonly format: "numeric";
                                                readonly description: "Service charge applied on the relevant amount value.";
                                            };
                                            readonly shippingFee: {
                                                readonly type: "string";
                                                readonly format: "numeric";
                                                readonly description: "Shipping fee on the relevant amount value.";
                                            };
                                            readonly tax: {
                                                readonly type: "string";
                                                readonly format: "numeric";
                                                readonly description: "Tax on the relevant amount value.";
                                            };
                                        };
                                    };
                                };
                            };
                            readonly totalAmount: {
                                readonly type: "object";
                                readonly description: "Amount details all quantity.";
                                readonly required: readonly ["value"];
                                readonly properties: {
                                    readonly value: {
                                        readonly description: "Amount of the transaction.";
                                        readonly type: "number";
                                        readonly format: "float";
                                        readonly minimum: 0.01;
                                        readonly maximum: 9999999;
                                    };
                                    readonly details: {
                                        readonly description: "Amount breakdown of all quantity.";
                                        readonly title: "Amount Details";
                                        readonly type: "object";
                                        readonly properties: {
                                            readonly subtotal: {
                                                readonly type: "string";
                                                readonly format: "numeric";
                                                readonly description: "Subtotal value before applying discounts or additional fees.";
                                            };
                                            readonly discount: {
                                                readonly type: "string";
                                                readonly format: "numeric";
                                                readonly description: "Discount applied on the relevant amount value.";
                                            };
                                            readonly serviceCharge: {
                                                readonly type: "string";
                                                readonly format: "numeric";
                                                readonly description: "Service charge applied on the relevant amount value.";
                                            };
                                            readonly shippingFee: {
                                                readonly type: "string";
                                                readonly format: "numeric";
                                                readonly description: "Shipping fee on the relevant amount value.";
                                            };
                                            readonly tax: {
                                                readonly type: "string";
                                                readonly format: "numeric";
                                                readonly description: "Tax on the relevant amount value.";
                                            };
                                        };
                                    };
                                };
                            };
                        };
                    };
                };
                readonly requestReferenceNumber: {
                    readonly title: "Merchant Request Reference Number";
                    readonly type: "string";
                    readonly minLength: 1;
                    readonly maxLength: 36;
                    readonly description: "The merchant's reference number for the transaction. It is strongly advised that the merchant provide unique value for this property for each transaction.";
                };
                readonly createdAt: {
                    readonly type: "string";
                    readonly format: "date-time";
                    readonly description: "The timestamp in UTC when the record is created.";
                };
                readonly updatedAt: {
                    readonly type: "string";
                    readonly format: "date-time";
                    readonly description: "The timestamp in UTC when the record is last updated.";
                };
                readonly expiredAt: {
                    readonly type: "string";
                    readonly format: "date-time";
                    readonly description: "The timestamp in UTC when the record expired.";
                };
                readonly paymentScheme: {
                    readonly type: "string";
                    readonly enum: readonly ["master-card", "visa", "jcb", "paypal", "bancnet", "wechat"];
                    readonly description: "Payment scheme. Only applicable for checkout transactions.\n\n`master-card` `visa` `jcb` `paypal` `bancnet` `wechat`";
                };
                readonly expressCheckout: {
                    readonly type: "boolean";
                    readonly description: "Identifies if this record is an Express Checkout record.";
                };
                readonly refundedAmount: {
                    readonly type: "number";
                    readonly format: "float";
                    readonly description: "Identifies the total amount already refunded for this record if `paymentStatus` == `REFUNDED`";
                    readonly minimum: -3.402823669209385e+38;
                    readonly maximum: 3.402823669209385e+38;
                };
                readonly canPayPal: {
                    readonly type: "boolean";
                    readonly description: "Identifies if PayPal is enabled as an acceptance method for this Checkout record";
                };
                readonly status: {
                    readonly type: "string";
                    readonly enum: readonly ["CREATED", "PROCESSING", "EXPIRED", "COMPLETED"];
                    readonly examples: readonly ["COMPLETED"];
                    readonly description: "`CREATED` `PROCESSING` `EXPIRED` `COMPLETED`";
                };
                readonly paymentStatus: {
                    readonly title: "Payment States";
                    readonly type: "string";
                    readonly description: "Indicates the current state of the payment transaction.\n\n`PENDING_TOKEN` `PENDING_PAYMENT` `FOR_AUTHENTICATION` `AUTHENTICATING` `AUTH_NOT_ENROLLED` `AUTH_SUCCESS` `AUTH_FAILED` `PAYMENT_SUCCESS` `PAYMENT_FAILED` `PAYMENT_PROCESSING` `AUTHORIZED` `PAYMENT_EXPIRED` `PAYMENT_CANCELLED` `PAYMENT_INVALID` `VOIDED` `REFUNDED` `ACCOUNT_ABUSE` `CAPTURED` `DONE` `CAPTURE_HOLD_EXPIRED`";
                    readonly enum: readonly ["PENDING_TOKEN", "PENDING_PAYMENT", "FOR_AUTHENTICATION", "AUTHENTICATING", "AUTH_NOT_ENROLLED", "AUTH_SUCCESS", "AUTH_FAILED", "PAYMENT_SUCCESS", "PAYMENT_FAILED", "PAYMENT_PROCESSING", "AUTHORIZED", "PAYMENT_EXPIRED", "PAYMENT_CANCELLED", "PAYMENT_INVALID", "VOIDED", "REFUNDED", "ACCOUNT_ABUSE", "CAPTURED", "DONE", "CAPTURE_HOLD_EXPIRED"];
                };
                readonly paymentDetails: {
                    readonly description: "Transactions details from the payment processor.";
                };
                readonly buyer: {
                    readonly type: "object";
                    readonly title: "Buyer";
                    readonly description: "Contains personal information regarding the buyer/payer of the transaction. By default, all information are optional (i.e. use `Basic Buyer` specification).\nHowever, If the merchant is enabled to use Kount fraud protection, they must use `Kount Buyer` specification.\n";
                    readonly oneOf: readonly [{
                        readonly type: "object";
                        readonly title: "Basic Buyer";
                        readonly description: "Contains personal information regarding the buyer/payer of the transaction.";
                        readonly properties: {
                            readonly firstName: {
                                readonly type: "string";
                                readonly description: "First name of the payer/buyer.";
                                readonly minLength: 1;
                                readonly maxLength: 1000;
                            };
                            readonly middleName: {
                                readonly type: "string";
                                readonly description: "Middle name of the payer/buyer.";
                                readonly minLength: 1;
                                readonly maxLength: 1000;
                            };
                            readonly lastName: {
                                readonly type: "string";
                                readonly description: "Last name of the payer/buyer.";
                                readonly minLength: 1;
                                readonly maxLength: 1000;
                            };
                            readonly birthday: {
                                readonly type: "string";
                                readonly format: "date";
                                readonly description: "Birthday in [ISO 8601 / RFC 3339 full-date format](https://tools.ietf.org/html/rfc3339#section-5.6).";
                            };
                            readonly customerSince: {
                                readonly type: "string";
                                readonly format: "date";
                                readonly description: "Date in [ISO 8601 / RFC 3339 full-date format](https://tools.ietf.org/html/rfc3339#section-5.6) when payer/buyer registered as a customer as per merchant's records.";
                            };
                            readonly sex: {
                                readonly type: "string";
                                readonly enum: readonly ["M", "F"];
                                readonly description: "Biological sex.\n\n`M` `F`";
                            };
                            readonly contact: {
                                readonly type: "object";
                                readonly title: "Contact Details";
                                readonly description: "Contact details like phone and/or email address.";
                                readonly properties: {
                                    readonly phone: {
                                        readonly type: "string";
                                        readonly format: "phone";
                                        readonly minLength: 1;
                                        readonly maxLength: 1000;
                                        readonly description: "Contact phone number.";
                                    };
                                    readonly email: {
                                        readonly type: "string";
                                        readonly format: "email";
                                        readonly minLength: 5;
                                        readonly maxLength: 1000;
                                        readonly description: "Contact e-mail address.";
                                    };
                                };
                            };
                            readonly billingAddress: {
                                readonly type: "object";
                                readonly title: "Billing Address";
                                readonly description: "Contains billing information of the payer/buyer. By default, all information are optional (i.e. use `Basic Billing Address` specification).\nHowever, If the merchant is enabled to use Kount fraud protection, they must use `Kount Billing Address` specification.\n";
                                readonly oneOf: readonly [{
                                    readonly type: "object";
                                    readonly title: "Basic Billing Address";
                                    readonly properties: {
                                        readonly line1: {
                                            readonly type: "string";
                                            readonly description: "Address Line 1.";
                                            readonly minLength: 1;
                                            readonly maxLength: 1000;
                                        };
                                        readonly line2: {
                                            readonly type: "string";
                                            readonly description: "Address Line 2.";
                                            readonly minLength: 1;
                                            readonly maxLength: 1000;
                                        };
                                        readonly city: {
                                            readonly type: "string";
                                            readonly description: "City";
                                            readonly minLength: 1;
                                            readonly maxLength: 1000;
                                        };
                                        readonly state: {
                                            readonly type: "string";
                                            readonly description: "State / Province.";
                                            readonly minLength: 1;
                                            readonly maxLength: 1000;
                                        };
                                        readonly zipCode: {
                                            readonly type: "string";
                                            readonly description: "Zip / Postal code.";
                                            readonly minLength: 1;
                                            readonly maxLength: 1000;
                                        };
                                        readonly countryCode: {
                                            readonly type: "string";
                                            readonly minLength: 2;
                                            readonly maxLength: 2;
                                            readonly description: "[ISO 3166 alpha-2](https://www.iso.org/iso-3166-country-codes.html) notation of the country.\n";
                                        };
                                    };
                                }, {
                                    readonly type: "object";
                                    readonly title: "Kount Billing Address";
                                    readonly required: readonly ["countryCode"];
                                    readonly properties: {
                                        readonly line1: {
                                            readonly type: "string";
                                            readonly description: "Address Line 1.";
                                            readonly minLength: 1;
                                            readonly maxLength: 1000;
                                        };
                                        readonly line2: {
                                            readonly type: "string";
                                            readonly description: "Address Line 2.";
                                            readonly minLength: 1;
                                            readonly maxLength: 1000;
                                        };
                                        readonly city: {
                                            readonly type: "string";
                                            readonly description: "City";
                                            readonly minLength: 1;
                                            readonly maxLength: 1000;
                                        };
                                        readonly state: {
                                            readonly type: "string";
                                            readonly description: "State / Province.";
                                            readonly minLength: 1;
                                            readonly maxLength: 1000;
                                        };
                                        readonly zipCode: {
                                            readonly type: "string";
                                            readonly description: "Zip / Postal code.";
                                            readonly minLength: 1;
                                            readonly maxLength: 1000;
                                        };
                                        readonly countryCode: {
                                            readonly type: "string";
                                            readonly minLength: 2;
                                            readonly maxLength: 2;
                                            readonly description: "[ISO 3166 alpha-2](https://www.iso.org/iso-3166-country-codes.html) notation of the country.\n";
                                        };
                                    };
                                }];
                            };
                            readonly shippingAddress: {
                                readonly type: "object";
                                readonly title: "Shipping Address";
                                readonly description: "Contains shipment information including name of the person identified to receive the purchase order. By default, all information are optional (i.e. use `Basic Shipping Address` specification).\nHowever, If the merchant is enabled to use Kount fraud protection, they must use `Kount Shipping Address` specification.\n";
                                readonly oneOf: readonly [{
                                    readonly type: "object";
                                    readonly title: "Basic Shipping Address";
                                    readonly description: "Contains shipment information including name of the person identified to receive the purchase order.";
                                    readonly properties: {
                                        readonly line1: {
                                            readonly type: "string";
                                            readonly description: "Address Line 1.";
                                            readonly minLength: 1;
                                            readonly maxLength: 1000;
                                        };
                                        readonly line2: {
                                            readonly type: "string";
                                            readonly description: "Address Line 2.";
                                            readonly minLength: 1;
                                            readonly maxLength: 1000;
                                        };
                                        readonly city: {
                                            readonly type: "string";
                                            readonly description: "City";
                                            readonly minLength: 1;
                                            readonly maxLength: 1000;
                                        };
                                        readonly state: {
                                            readonly type: "string";
                                            readonly description: "State / Province.";
                                            readonly minLength: 1;
                                            readonly maxLength: 1000;
                                        };
                                        readonly zipCode: {
                                            readonly type: "string";
                                            readonly description: "Zip / Postal code.";
                                            readonly minLength: 1;
                                            readonly maxLength: 1000;
                                        };
                                        readonly countryCode: {
                                            readonly type: "string";
                                            readonly minLength: 2;
                                            readonly maxLength: 2;
                                            readonly description: "[ISO 3166 alpha-2](https://www.iso.org/iso-3166-country-codes.html) notation of the country.\n";
                                        };
                                        readonly firstName: {
                                            readonly type: "string";
                                            readonly description: "First name of the recipient.";
                                            readonly minLength: 1;
                                            readonly maxLength: 1000;
                                            readonly examples: readonly ["Maya"];
                                        };
                                        readonly middleName: {
                                            readonly type: "string";
                                            readonly description: "Middle name of the recipient.";
                                            readonly minLength: 1;
                                            readonly maxLength: 1000;
                                            readonly examples: readonly ["Jose"];
                                        };
                                        readonly lastName: {
                                            readonly type: "string";
                                            readonly description: "Last name of the recipient.";
                                            readonly minLength: 1;
                                            readonly maxLength: 1000;
                                            readonly examples: readonly ["Juan"];
                                        };
                                        readonly phone: {
                                            readonly type: "string";
                                            readonly format: "phone";
                                            readonly minLength: 1;
                                            readonly maxLength: 1000;
                                            readonly description: "Contact phone number.";
                                        };
                                        readonly email: {
                                            readonly type: "string";
                                            readonly format: "email";
                                            readonly minLength: 5;
                                            readonly maxLength: 1000;
                                            readonly description: "Contact e-mail address.";
                                        };
                                        readonly shippingType: {
                                            readonly type: "string";
                                            readonly enum: readonly ["ST", "SD"];
                                            readonly description: "* `ST` - Standard shipping\n* `SD` - Same-day shipping\n\n\n`ST` `SD`";
                                        };
                                    };
                                }, {
                                    readonly type: "object";
                                    readonly title: "Kount Shipping Address";
                                    readonly description: "Contains shipment information including name of the person identified to receive the purchase order.";
                                    readonly required: readonly ["countryCode"];
                                    readonly properties: {
                                        readonly line1: {
                                            readonly type: "string";
                                            readonly description: "Address Line 1.";
                                            readonly minLength: 1;
                                            readonly maxLength: 1000;
                                        };
                                        readonly line2: {
                                            readonly type: "string";
                                            readonly description: "Address Line 2.";
                                            readonly minLength: 1;
                                            readonly maxLength: 1000;
                                        };
                                        readonly city: {
                                            readonly type: "string";
                                            readonly description: "City";
                                            readonly minLength: 1;
                                            readonly maxLength: 1000;
                                        };
                                        readonly state: {
                                            readonly type: "string";
                                            readonly description: "State / Province.";
                                            readonly minLength: 1;
                                            readonly maxLength: 1000;
                                        };
                                        readonly zipCode: {
                                            readonly type: "string";
                                            readonly description: "Zip / Postal code.";
                                            readonly minLength: 1;
                                            readonly maxLength: 1000;
                                        };
                                        readonly countryCode: {
                                            readonly type: "string";
                                            readonly minLength: 2;
                                            readonly maxLength: 2;
                                            readonly description: "[ISO 3166 alpha-2](https://www.iso.org/iso-3166-country-codes.html) notation of the country.\n";
                                        };
                                        readonly firstName: {
                                            readonly type: "string";
                                            readonly description: "First name of the recipient.";
                                            readonly minLength: 1;
                                            readonly maxLength: 1000;
                                            readonly examples: readonly ["Maya"];
                                        };
                                        readonly middleName: {
                                            readonly type: "string";
                                            readonly description: "Middle name of the recipient.";
                                            readonly minLength: 1;
                                            readonly maxLength: 1000;
                                            readonly examples: readonly ["Jose"];
                                        };
                                        readonly lastName: {
                                            readonly type: "string";
                                            readonly description: "Last name of the recipient.";
                                            readonly minLength: 1;
                                            readonly maxLength: 1000;
                                            readonly examples: readonly ["Juan"];
                                        };
                                        readonly phone: {
                                            readonly type: "string";
                                            readonly format: "phone";
                                            readonly minLength: 1;
                                            readonly maxLength: 1000;
                                            readonly description: "Contact phone number.";
                                        };
                                        readonly email: {
                                            readonly type: "string";
                                            readonly format: "email";
                                            readonly minLength: 5;
                                            readonly maxLength: 1000;
                                            readonly description: "Contact e-mail address.";
                                        };
                                        readonly shippingType: {
                                            readonly type: "string";
                                            readonly enum: readonly ["ST", "SD"];
                                            readonly description: "* `ST` - Standard shipping\n* `SD` - Same-day shipping\n\n\n`ST` `SD`";
                                        };
                                    };
                                }];
                            };
                        };
                    }, {
                        readonly type: "object";
                        readonly title: "Kount Buyer";
                        readonly required: readonly ["firstName", "lastName", "contact", "billingAddress", "shippingAddress"];
                        readonly description: "Contains personal information regarding the buyer/payer of the transaction.";
                        readonly properties: {
                            readonly firstName: {
                                readonly type: "string";
                                readonly description: "First name of the payer/buyer.";
                                readonly minLength: 1;
                                readonly maxLength: 1000;
                            };
                            readonly middleName: {
                                readonly type: "string";
                                readonly description: "Middle name of the payer/buyer.";
                                readonly minLength: 1;
                                readonly maxLength: 1000;
                            };
                            readonly lastName: {
                                readonly type: "string";
                                readonly description: "Last name of the payer/buyer.";
                                readonly minLength: 1;
                                readonly maxLength: 1000;
                            };
                            readonly birthday: {
                                readonly type: "string";
                                readonly format: "date";
                                readonly description: "Birthday in [ISO 8601 / RFC 3339 full-date format](https://tools.ietf.org/html/rfc3339#section-5.6).";
                            };
                            readonly customerSince: {
                                readonly type: "string";
                                readonly format: "date";
                                readonly description: "Date in [ISO 8601 / RFC 3339 full-date format](https://tools.ietf.org/html/rfc3339#section-5.6) when payer/buyer registered as a customer as per merchant's records.";
                            };
                            readonly sex: {
                                readonly type: "string";
                                readonly enum: readonly ["M", "F"];
                                readonly description: "Biological sex.\n\n`M` `F`";
                            };
                            readonly contact: {
                                readonly type: "object";
                                readonly title: "Contact Details";
                                readonly description: "Contact details like phone and/or email address.";
                                readonly properties: {
                                    readonly phone: {
                                        readonly type: "string";
                                        readonly format: "phone";
                                        readonly minLength: 1;
                                        readonly maxLength: 1000;
                                        readonly description: "Contact phone number.";
                                    };
                                    readonly email: {
                                        readonly type: "string";
                                        readonly format: "email";
                                        readonly minLength: 5;
                                        readonly maxLength: 1000;
                                        readonly description: "Contact e-mail address.";
                                    };
                                };
                            };
                            readonly billingAddress: {
                                readonly type: "object";
                                readonly title: "Billing Address";
                                readonly description: "Contains billing information of the payer/buyer. By default, all information are optional (i.e. use `Basic Billing Address` specification).\nHowever, If the merchant is enabled to use Kount fraud protection, they must use `Kount Billing Address` specification.\n";
                                readonly oneOf: readonly [{
                                    readonly type: "object";
                                    readonly title: "Basic Billing Address";
                                    readonly properties: {
                                        readonly line1: {
                                            readonly type: "string";
                                            readonly description: "Address Line 1.";
                                            readonly minLength: 1;
                                            readonly maxLength: 1000;
                                        };
                                        readonly line2: {
                                            readonly type: "string";
                                            readonly description: "Address Line 2.";
                                            readonly minLength: 1;
                                            readonly maxLength: 1000;
                                        };
                                        readonly city: {
                                            readonly type: "string";
                                            readonly description: "City";
                                            readonly minLength: 1;
                                            readonly maxLength: 1000;
                                        };
                                        readonly state: {
                                            readonly type: "string";
                                            readonly description: "State / Province.";
                                            readonly minLength: 1;
                                            readonly maxLength: 1000;
                                        };
                                        readonly zipCode: {
                                            readonly type: "string";
                                            readonly description: "Zip / Postal code.";
                                            readonly minLength: 1;
                                            readonly maxLength: 1000;
                                        };
                                        readonly countryCode: {
                                            readonly type: "string";
                                            readonly minLength: 2;
                                            readonly maxLength: 2;
                                            readonly description: "[ISO 3166 alpha-2](https://www.iso.org/iso-3166-country-codes.html) notation of the country.\n";
                                        };
                                    };
                                }, {
                                    readonly type: "object";
                                    readonly title: "Kount Billing Address";
                                    readonly required: readonly ["countryCode"];
                                    readonly properties: {
                                        readonly line1: {
                                            readonly type: "string";
                                            readonly description: "Address Line 1.";
                                            readonly minLength: 1;
                                            readonly maxLength: 1000;
                                        };
                                        readonly line2: {
                                            readonly type: "string";
                                            readonly description: "Address Line 2.";
                                            readonly minLength: 1;
                                            readonly maxLength: 1000;
                                        };
                                        readonly city: {
                                            readonly type: "string";
                                            readonly description: "City";
                                            readonly minLength: 1;
                                            readonly maxLength: 1000;
                                        };
                                        readonly state: {
                                            readonly type: "string";
                                            readonly description: "State / Province.";
                                            readonly minLength: 1;
                                            readonly maxLength: 1000;
                                        };
                                        readonly zipCode: {
                                            readonly type: "string";
                                            readonly description: "Zip / Postal code.";
                                            readonly minLength: 1;
                                            readonly maxLength: 1000;
                                        };
                                        readonly countryCode: {
                                            readonly type: "string";
                                            readonly minLength: 2;
                                            readonly maxLength: 2;
                                            readonly description: "[ISO 3166 alpha-2](https://www.iso.org/iso-3166-country-codes.html) notation of the country.\n";
                                        };
                                    };
                                }];
                            };
                            readonly shippingAddress: {
                                readonly type: "object";
                                readonly title: "Shipping Address";
                                readonly description: "Contains shipment information including name of the person identified to receive the purchase order. By default, all information are optional (i.e. use `Basic Shipping Address` specification).\nHowever, If the merchant is enabled to use Kount fraud protection, they must use `Kount Shipping Address` specification.\n";
                                readonly oneOf: readonly [{
                                    readonly type: "object";
                                    readonly title: "Basic Shipping Address";
                                    readonly description: "Contains shipment information including name of the person identified to receive the purchase order.";
                                    readonly properties: {
                                        readonly line1: {
                                            readonly type: "string";
                                            readonly description: "Address Line 1.";
                                            readonly minLength: 1;
                                            readonly maxLength: 1000;
                                        };
                                        readonly line2: {
                                            readonly type: "string";
                                            readonly description: "Address Line 2.";
                                            readonly minLength: 1;
                                            readonly maxLength: 1000;
                                        };
                                        readonly city: {
                                            readonly type: "string";
                                            readonly description: "City";
                                            readonly minLength: 1;
                                            readonly maxLength: 1000;
                                        };
                                        readonly state: {
                                            readonly type: "string";
                                            readonly description: "State / Province.";
                                            readonly minLength: 1;
                                            readonly maxLength: 1000;
                                        };
                                        readonly zipCode: {
                                            readonly type: "string";
                                            readonly description: "Zip / Postal code.";
                                            readonly minLength: 1;
                                            readonly maxLength: 1000;
                                        };
                                        readonly countryCode: {
                                            readonly type: "string";
                                            readonly minLength: 2;
                                            readonly maxLength: 2;
                                            readonly description: "[ISO 3166 alpha-2](https://www.iso.org/iso-3166-country-codes.html) notation of the country.\n";
                                        };
                                        readonly firstName: {
                                            readonly type: "string";
                                            readonly description: "First name of the recipient.";
                                            readonly minLength: 1;
                                            readonly maxLength: 1000;
                                            readonly examples: readonly ["Maya"];
                                        };
                                        readonly middleName: {
                                            readonly type: "string";
                                            readonly description: "Middle name of the recipient.";
                                            readonly minLength: 1;
                                            readonly maxLength: 1000;
                                            readonly examples: readonly ["Jose"];
                                        };
                                        readonly lastName: {
                                            readonly type: "string";
                                            readonly description: "Last name of the recipient.";
                                            readonly minLength: 1;
                                            readonly maxLength: 1000;
                                            readonly examples: readonly ["Juan"];
                                        };
                                        readonly phone: {
                                            readonly type: "string";
                                            readonly format: "phone";
                                            readonly minLength: 1;
                                            readonly maxLength: 1000;
                                            readonly description: "Contact phone number.";
                                        };
                                        readonly email: {
                                            readonly type: "string";
                                            readonly format: "email";
                                            readonly minLength: 5;
                                            readonly maxLength: 1000;
                                            readonly description: "Contact e-mail address.";
                                        };
                                        readonly shippingType: {
                                            readonly type: "string";
                                            readonly enum: readonly ["ST", "SD"];
                                            readonly description: "* `ST` - Standard shipping\n* `SD` - Same-day shipping\n\n\n`ST` `SD`";
                                        };
                                    };
                                }, {
                                    readonly type: "object";
                                    readonly title: "Kount Shipping Address";
                                    readonly description: "Contains shipment information including name of the person identified to receive the purchase order.";
                                    readonly required: readonly ["countryCode"];
                                    readonly properties: {
                                        readonly line1: {
                                            readonly type: "string";
                                            readonly description: "Address Line 1.";
                                            readonly minLength: 1;
                                            readonly maxLength: 1000;
                                        };
                                        readonly line2: {
                                            readonly type: "string";
                                            readonly description: "Address Line 2.";
                                            readonly minLength: 1;
                                            readonly maxLength: 1000;
                                        };
                                        readonly city: {
                                            readonly type: "string";
                                            readonly description: "City";
                                            readonly minLength: 1;
                                            readonly maxLength: 1000;
                                        };
                                        readonly state: {
                                            readonly type: "string";
                                            readonly description: "State / Province.";
                                            readonly minLength: 1;
                                            readonly maxLength: 1000;
                                        };
                                        readonly zipCode: {
                                            readonly type: "string";
                                            readonly description: "Zip / Postal code.";
                                            readonly minLength: 1;
                                            readonly maxLength: 1000;
                                        };
                                        readonly countryCode: {
                                            readonly type: "string";
                                            readonly minLength: 2;
                                            readonly maxLength: 2;
                                            readonly description: "[ISO 3166 alpha-2](https://www.iso.org/iso-3166-country-codes.html) notation of the country.\n";
                                        };
                                        readonly firstName: {
                                            readonly type: "string";
                                            readonly description: "First name of the recipient.";
                                            readonly minLength: 1;
                                            readonly maxLength: 1000;
                                            readonly examples: readonly ["Maya"];
                                        };
                                        readonly middleName: {
                                            readonly type: "string";
                                            readonly description: "Middle name of the recipient.";
                                            readonly minLength: 1;
                                            readonly maxLength: 1000;
                                            readonly examples: readonly ["Jose"];
                                        };
                                        readonly lastName: {
                                            readonly type: "string";
                                            readonly description: "Last name of the recipient.";
                                            readonly minLength: 1;
                                            readonly maxLength: 1000;
                                            readonly examples: readonly ["Juan"];
                                        };
                                        readonly phone: {
                                            readonly type: "string";
                                            readonly format: "phone";
                                            readonly minLength: 1;
                                            readonly maxLength: 1000;
                                            readonly description: "Contact phone number.";
                                        };
                                        readonly email: {
                                            readonly type: "string";
                                            readonly format: "email";
                                            readonly minLength: 5;
                                            readonly maxLength: 1000;
                                            readonly description: "Contact e-mail address.";
                                        };
                                        readonly shippingType: {
                                            readonly type: "string";
                                            readonly enum: readonly ["ST", "SD"];
                                            readonly description: "* `ST` - Standard shipping\n* `SD` - Same-day shipping\n\n\n`ST` `SD`";
                                        };
                                    };
                                }];
                            };
                        };
                    }];
                };
                readonly merchant: {
                    readonly description: "Merchant information.";
                };
                readonly totalAmount: {
                    readonly type: "object";
                    readonly title: "Total Amount";
                    readonly required: readonly ["value", "currency"];
                    readonly description: "Contains the value and currency of the transaction.";
                    readonly properties: {
                        readonly value: {
                            readonly type: "number";
                            readonly format: "float";
                            readonly minimum: 0.01;
                            readonly maximum: 9999999;
                            readonly description: "Amount of the transaction.";
                        };
                        readonly currency: {
                            readonly type: "string";
                            readonly minLength: 3;
                            readonly maxLength: 3;
                            readonly description: "[ISO 4217 Alpha-3](https://www.iso.org/iso-4217-currency-codes.html) currency code\n";
                            readonly examples: readonly ["PHP"];
                        };
                    };
                };
                readonly redirectUrl: {
                    readonly type: "object";
                    readonly title: "Redirect URLs";
                    readonly description: "Contains a list of redirect URLs of the merchant for specific events.";
                    readonly properties: {
                        readonly success: {
                            readonly type: "string";
                            readonly format: "url";
                            readonly description: "URL to redirect to when the payment is successfully completed.";
                        };
                        readonly failure: {
                            readonly type: "string";
                            readonly format: "url";
                            readonly description: "URL to redirect to when the payment fails.";
                        };
                        readonly cancel: {
                            readonly type: "string";
                            readonly format: "url";
                            readonly description: "URL to redirect to when the payment is cancelled by the payer/buyer.";
                        };
                    };
                };
                readonly transactionReferenceNumber: {
                    readonly type: "string";
                    readonly format: "uuid";
                    readonly description: "Unique ID referencing payment attached to this Checkout record";
                };
                readonly metadata: {
                    readonly title: "Metadata";
                    readonly type: "object";
                    readonly description: "Used to provide additional data to the transaction such a payment faciliator information.";
                    readonly properties: {
                        readonly subMerchantRequestReferenceNumber: {
                            readonly title: "Sub-merchant Request Reference Number";
                            readonly type: "string";
                            readonly format: "alphanumeric, dash, space, hyphen, underscore";
                            readonly minLength: 1;
                            readonly maxLength: 36;
                            readonly description: "Reference number of the sub-merchant for the related transaction";
                        };
                        readonly pf: {
                            readonly title: "Payment Facilitator";
                            readonly type: "object";
                            readonly description: "For a payment facilitator, this provides details regarding the sub-merchant.";
                            readonly required: readonly ["smi", "smn", "mci", "mpc", "mco"];
                            readonly properties: {
                                readonly smi: {
                                    readonly type: "string";
                                    readonly minLength: 1;
                                    readonly maxLength: 30;
                                    readonly description: "Sub-merchant ID.";
                                };
                                readonly smn: {
                                    readonly type: "string";
                                    readonly format: "alphanumeric, hyphen, space, apostrophe, comma, period, hyphen";
                                    readonly minLength: 1;
                                    readonly maxLength: 64;
                                    readonly description: "Sub-merchant name.";
                                };
                                readonly mci: {
                                    readonly type: "string";
                                    readonly minLength: 1;
                                    readonly maxLength: 13;
                                    readonly description: "Sub-merchant city location.";
                                };
                                readonly mpc: {
                                    readonly type: "string";
                                    readonly minLength: 3;
                                    readonly maxLength: 3;
                                    readonly description: "[ISO 4217 Numeric](https://www.iso.org/iso-4217-currency-codes.html) currency code.\n";
                                };
                                readonly mco: {
                                    readonly type: "string";
                                    readonly minLength: 3;
                                    readonly maxLength: 3;
                                    readonly description: "[ISO 3166 Alpha-3](https://www.iso.org/iso-3166-country-codes.html) country code.\n";
                                };
                                readonly mst: {
                                    readonly type: "string";
                                    readonly minLength: 2;
                                    readonly maxLength: 3;
                                    readonly description: "Sub-merchant abbreviated state location (required if country is USA).";
                                };
                                readonly mcc: {
                                    readonly type: "string";
                                    readonly format: "numeric";
                                    readonly minLength: 1;
                                    readonly maxLength: 15;
                                    readonly description: "[ISO 18245](https://www.iso.org/standard/33365.html) merchant category code.\n";
                                };
                                readonly postalCode: {
                                    readonly type: "string";
                                    readonly format: "alphanumeric, dash, space, hyphen, underscore";
                                    readonly maxLength: 20;
                                    readonly description: "Sub-merchant postal code";
                                };
                                readonly contactNo: {
                                    readonly type: "string";
                                    readonly format: "phone";
                                    readonly maxLength: 20;
                                    readonly description: "Contact number without spaces, dashes, or parentheses.";
                                };
                                readonly state: {
                                    readonly type: "string";
                                    readonly minLength: 1;
                                    readonly maxLength: 100;
                                    readonly description: "Sub-merchant state location in full text.";
                                };
                                readonly addressLine1: {
                                    readonly type: "string";
                                    readonly minLength: 1;
                                    readonly maxLength: 100;
                                    readonly description: "Sub-merchant street address.";
                                };
                            };
                        };
                    };
                };
            };
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
    };
};
declare const GetV1CheckoutRefund: {
    readonly metadata: {
        readonly allOf: readonly [{
            readonly type: "object";
            readonly properties: {
                readonly checkoutId: {
                    readonly type: "string";
                    readonly format: "uuid";
                    readonly examples: readonly ["fa4da2ff-dcda-4367-a97d-0c9445147b73"];
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "The unique identification string of the checkout transaction.";
                };
                readonly refundId: {
                    readonly type: "string";
                    readonly format: "uuid";
                    readonly examples: readonly ["8969d8a7-7287-4aee-bf43-7516b9385290"];
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "The unique identification string of the refund transaction.";
                };
            };
            readonly required: readonly ["checkoutId", "refundId"];
        }];
    };
    readonly response: {
        readonly "200": {
            readonly type: "object";
            readonly properties: {
                readonly id: {
                    readonly type: "string";
                    readonly format: "uuid";
                    readonly description: "The unique identification of the refund transaction.";
                    readonly examples: readonly ["fbc7d874-4f05-45e8-b205-14e2d07657f5"];
                };
                readonly checkout: {
                    readonly title: "Checkout ID";
                    readonly type: "string";
                    readonly format: "uuid";
                    readonly description: "The unique identification of the checkout payment transaction.";
                };
                readonly status: {
                    readonly title: "Void/Refund States";
                    readonly type: "string";
                    readonly description: "Indicates the status of a void/refund transaction.\n\n`PENDING` `SUCCESS` `FAILED`";
                    readonly enum: readonly ["PENDING", "SUCCESS", "FAILED"];
                };
                readonly reason: {
                    readonly type: "string";
                    readonly minLength: 1;
                    readonly maxLength: 512;
                    readonly description: "A description of why the operation (e.g. void, refund) needs to be executed.";
                };
                readonly amount: {
                    readonly type: "object";
                    readonly title: "Total Amount";
                    readonly required: readonly ["value", "currency"];
                    readonly description: "Contains the value and currency of the transaction.";
                    readonly properties: {
                        readonly value: {
                            readonly type: "number";
                            readonly format: "float";
                            readonly minimum: 0.01;
                            readonly maximum: 9999999;
                            readonly description: "Amount of the transaction.";
                        };
                        readonly currency: {
                            readonly type: "string";
                            readonly minLength: 3;
                            readonly maxLength: 3;
                            readonly description: "[ISO 4217 Alpha-3](https://www.iso.org/iso-4217-currency-codes.html) currency code\n";
                            readonly examples: readonly ["PHP"];
                        };
                    };
                };
                readonly createdAt: {
                    readonly type: "string";
                    readonly format: "date-time";
                    readonly description: "The timestamp in UTC when the record is created.";
                };
            };
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
    };
};
declare const GetV1CheckoutRefunds: {
    readonly metadata: {
        readonly allOf: readonly [{
            readonly type: "object";
            readonly properties: {
                readonly checkoutId: {
                    readonly type: "string";
                    readonly format: "uuid";
                    readonly examples: readonly ["fa4da2ff-dcda-4367-a97d-0c9445147b73"];
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "The unique identification string of the checkout transaction.";
                };
            };
            readonly required: readonly ["checkoutId"];
        }];
    };
    readonly response: {
        readonly "200": {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly properties: {
                    readonly id: {
                        readonly type: "string";
                        readonly format: "uuid";
                        readonly description: "The unique identification of the refund transaction.";
                        readonly examples: readonly ["fbc7d874-4f05-45e8-b205-14e2d07657f5"];
                    };
                    readonly checkout: {
                        readonly title: "Checkout ID";
                        readonly type: "string";
                        readonly format: "uuid";
                        readonly description: "The unique identification of the checkout payment transaction.";
                    };
                    readonly status: {
                        readonly title: "Void/Refund States";
                        readonly type: "string";
                        readonly description: "Indicates the status of a void/refund transaction.\n\n`PENDING` `SUCCESS` `FAILED`";
                        readonly enum: readonly ["PENDING", "SUCCESS", "FAILED"];
                    };
                    readonly reason: {
                        readonly type: "string";
                        readonly minLength: 1;
                        readonly maxLength: 512;
                        readonly description: "A description of why the operation (e.g. void, refund) needs to be executed.";
                    };
                    readonly amount: {
                        readonly type: "object";
                        readonly title: "Total Amount";
                        readonly required: readonly ["value", "currency"];
                        readonly description: "Contains the value and currency of the transaction.";
                        readonly properties: {
                            readonly value: {
                                readonly type: "number";
                                readonly format: "float";
                                readonly minimum: 0.01;
                                readonly maximum: 9999999;
                                readonly description: "Amount of the transaction.";
                            };
                            readonly currency: {
                                readonly type: "string";
                                readonly minLength: 3;
                                readonly maxLength: 3;
                                readonly description: "[ISO 4217 Alpha-3](https://www.iso.org/iso-4217-currency-codes.html) currency code\n";
                                readonly examples: readonly ["PHP"];
                            };
                        };
                    };
                    readonly createdAt: {
                        readonly type: "string";
                        readonly format: "date-time";
                        readonly description: "The timestamp in UTC when the record is created.";
                    };
                };
            };
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
    };
};
declare const GetV1CheckoutVoid: {
    readonly metadata: {
        readonly allOf: readonly [{
            readonly type: "object";
            readonly properties: {
                readonly checkoutId: {
                    readonly type: "string";
                    readonly format: "uuid";
                    readonly examples: readonly ["fa4da2ff-dcda-4367-a97d-0c9445147b73"];
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "The unique identification string of the checkout transaction.";
                };
                readonly voidId: {
                    readonly type: "string";
                    readonly format: "uuid";
                    readonly examples: readonly ["0a306b5c-4eff-4d5b-80d4-277d442d5258"];
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "The unique identification string of the void transaction.";
                };
            };
            readonly required: readonly ["checkoutId", "voidId"];
        }];
    };
    readonly response: {
        readonly "200": {
            readonly type: "object";
            readonly properties: {
                readonly id: {
                    readonly title: "Void ID";
                    readonly type: "string";
                    readonly format: "uuid";
                    readonly description: "The unique identification of the void transaction.";
                    readonly examples: readonly ["0a306b5c-4eff-4d5b-80d4-277d442d5258"];
                };
                readonly checkout: {
                    readonly title: "Checkout ID";
                    readonly type: "string";
                    readonly format: "uuid";
                    readonly description: "The unique identification of the checkout payment transaction.";
                };
                readonly status: {
                    readonly title: "Void/Refund States";
                    readonly type: "string";
                    readonly description: "Indicates the status of a void/refund transaction.\n\n`PENDING` `SUCCESS` `FAILED`";
                    readonly enum: readonly ["PENDING", "SUCCESS", "FAILED"];
                };
                readonly reason: {
                    readonly type: "string";
                    readonly minLength: 1;
                    readonly maxLength: 512;
                    readonly description: "A description of why the operation (e.g. void, refund) needs to be executed.";
                };
                readonly createdAt: {
                    readonly type: "string";
                    readonly format: "date-time";
                    readonly description: "The timestamp in UTC when the record is created.";
                };
                readonly updatedAt: {
                    readonly type: "string";
                    readonly format: "date-time";
                    readonly description: "The timestamp in UTC when the record is last updated.";
                };
            };
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
    };
};
declare const GetV1CheckoutVoids: {
    readonly metadata: {
        readonly allOf: readonly [{
            readonly type: "object";
            readonly properties: {
                readonly checkoutId: {
                    readonly type: "string";
                    readonly format: "uuid";
                    readonly examples: readonly ["fa4da2ff-dcda-4367-a97d-0c9445147b73"];
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "The unique identification string of the checkout transaction.";
                };
            };
            readonly required: readonly ["checkoutId"];
        }];
    };
    readonly response: {
        readonly "200": {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly properties: {
                    readonly id: {
                        readonly title: "Void ID";
                        readonly type: "string";
                        readonly format: "uuid";
                        readonly description: "The unique identification of the void transaction.";
                        readonly examples: readonly ["0a306b5c-4eff-4d5b-80d4-277d442d5258"];
                    };
                    readonly checkout: {
                        readonly title: "Checkout ID";
                        readonly type: "string";
                        readonly format: "uuid";
                        readonly description: "The unique identification of the checkout payment transaction.";
                    };
                    readonly status: {
                        readonly title: "Void/Refund States";
                        readonly type: "string";
                        readonly description: "Indicates the status of a void/refund transaction.\n\n`PENDING` `SUCCESS` `FAILED`";
                        readonly enum: readonly ["PENDING", "SUCCESS", "FAILED"];
                    };
                    readonly reason: {
                        readonly type: "string";
                        readonly minLength: 1;
                        readonly maxLength: 512;
                        readonly description: "A description of why the operation (e.g. void, refund) needs to be executed.";
                    };
                    readonly createdAt: {
                        readonly type: "string";
                        readonly format: "date-time";
                        readonly description: "The timestamp in UTC when the record is created.";
                    };
                    readonly updatedAt: {
                        readonly type: "string";
                        readonly format: "date-time";
                        readonly description: "The timestamp in UTC when the record is last updated.";
                    };
                };
            };
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
    };
};
declare const GetV1Customizations: {
    readonly response: {
        readonly "200": {
            readonly type: "array";
            readonly items: {
                readonly title: "Customizations";
                readonly type: "object";
                readonly required: readonly ["logoUrl", "iconUrl", "appleTouchIconUrl", "customTitle", "colorScheme"];
                readonly properties: {
                    readonly logoUrl: {
                        readonly type: "string";
                        readonly format: "url,";
                        readonly minLength: 5;
                        readonly maxLength: 2082;
                        readonly description: "URL that points to the merchant's logo image.";
                    };
                    readonly iconUrl: {
                        readonly type: "string";
                        readonly format: "url,";
                        readonly minLength: 5;
                        readonly maxLength: 2082;
                        readonly description: "URL that points to the merchant's icon image.";
                    };
                    readonly appleTouchIconUrl: {
                        readonly type: "string";
                        readonly format: "url,";
                        readonly minLength: 5;
                        readonly maxLength: 2082;
                        readonly description: "URL that points to the merchant's Apple icon image.";
                    };
                    readonly customTitle: {
                        readonly type: "string";
                        readonly minLength: 1;
                        readonly maxLength: 64;
                        readonly description: "Customized title used in the web browser.";
                    };
                    readonly colorScheme: {
                        readonly type: "string";
                        readonly format: "hexcolor";
                        readonly description: "The HEX color code that is used for the payment button.";
                    };
                    readonly hideReceiptInput: {
                        readonly type: "boolean";
                        readonly description: "Indicates if the merchant does not allow its payers to freely send transaction receipts (i.e. set to `true`).\n";
                        readonly default: false;
                    };
                    readonly skipResultPage: {
                        readonly type: "boolean";
                        readonly description: "Indicates if the merchant does not want to show the payment result page.\nWhen skipped (i.e. set to `true`), the payment page redirects immediately to the merchant's redirect URL.\n";
                        readonly default: false;
                    };
                    readonly showMerchantName: {
                        readonly type: "boolean";
                        readonly description: "Indicates if the merchant name on the result page is displayed.\nFor merchants that have their name in their logo, they may opt to hide a textual display of their name to remove duplicity.\n";
                        readonly default: true;
                    };
                    readonly redirectTimer: {
                        readonly type: "number";
                        readonly format: "integer";
                        readonly minimum: 3;
                        readonly maximum: 30;
                        readonly description: "The number of seconds the payment result page is shown before it redirects to the merchant's redirect URL.\n\nThe following are the **default** time used depending on the resulting payment:\n- `15 seconds`: for successful payments\n- `5 seconds`: for failed payments\n";
                    };
                };
            };
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
    };
};
declare const GetV1RefundOfPayment: {
    readonly metadata: {
        readonly allOf: readonly [{
            readonly type: "object";
            readonly properties: {
                readonly paymentId: {
                    readonly type: "string";
                    readonly format: "uuid";
                    readonly examples: readonly ["e732f996-cb87-4120-b712-166d8183c01d"];
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "The unique identification string of the payment transaction.";
                };
                readonly refundId: {
                    readonly type: "string";
                    readonly format: "uuid";
                    readonly examples: readonly ["8969d8a7-7287-4aee-bf43-7516b9385290"];
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "The unique identification string of the refund transaction.";
                };
            };
            readonly required: readonly ["paymentId", "refundId"];
        }];
    };
    readonly response: {
        readonly "200": {
            readonly type: "object";
            readonly required: readonly ["id", "payment", "amount", "currency", "status", "reason", "createdAt", "updatedAt"];
            readonly properties: {
                readonly id: {
                    readonly type: "string";
                    readonly format: "uuid";
                    readonly description: "The unique identification of the refund transaction.";
                    readonly examples: readonly ["fbc7d874-4f05-45e8-b205-14e2d07657f5"];
                };
                readonly reason: {
                    readonly type: "string";
                    readonly minLength: 1;
                    readonly maxLength: 512;
                    readonly description: "A description of why the operation (e.g. void, refund) needs to be executed.";
                };
                readonly amount: {
                    readonly type: "number";
                    readonly format: "float";
                    readonly minimum: 0.01;
                    readonly maximum: 9999999;
                    readonly description: "Amount of the transaction.";
                };
                readonly currency: {
                    readonly type: "string";
                    readonly minLength: 3;
                    readonly maxLength: 3;
                    readonly description: "[ISO 4217 Alpha-3](https://www.iso.org/iso-4217-currency-codes.html) currency code\n";
                    readonly examples: readonly ["PHP"];
                };
                readonly status: {
                    readonly title: "Void/Refund States";
                    readonly type: "string";
                    readonly description: "Indicates the status of a void/refund transaction.\n\n`PENDING` `SUCCESS` `FAILED`";
                    readonly enum: readonly ["PENDING", "SUCCESS", "FAILED"];
                };
                readonly payment: {
                    readonly title: "Payment ID";
                    readonly type: "string";
                    readonly format: "uuid";
                    readonly description: "The unique identification of the payment transaction.";
                };
                readonly requestReferenceNumber: {
                    readonly title: "Merchant Request Reference Number";
                    readonly type: "string";
                    readonly minLength: 1;
                    readonly maxLength: 36;
                    readonly description: "The merchant's reference number for the transaction. It is strongly advised that the merchant provide unique value for this property for each transaction.";
                };
                readonly refundAt: {
                    readonly type: "string";
                    readonly format: "date-time";
                    readonly description: "The timestamp in UTC when the transaction is refunded.";
                };
                readonly createdAt: {
                    readonly type: "string";
                    readonly format: "date-time";
                    readonly description: "The timestamp in UTC when the record is created.";
                };
                readonly updatedAt: {
                    readonly type: "string";
                    readonly format: "date-time";
                    readonly description: "The timestamp in UTC when the record is last updated.";
                };
            };
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
    };
};
declare const GetV1RefundsOfPayment: {
    readonly metadata: {
        readonly allOf: readonly [{
            readonly type: "object";
            readonly properties: {
                readonly paymentId: {
                    readonly type: "string";
                    readonly format: "uuid";
                    readonly examples: readonly ["e732f996-cb87-4120-b712-166d8183c01d"];
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "The unique identification string of the payment transaction.";
                };
            };
            readonly required: readonly ["paymentId"];
        }];
    };
    readonly response: {
        readonly "200": {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly required: readonly ["id", "payment", "amount", "currency", "status", "reason", "createdAt", "updatedAt"];
                readonly properties: {
                    readonly id: {
                        readonly type: "string";
                        readonly format: "uuid";
                        readonly description: "The unique identification of the refund transaction.";
                        readonly examples: readonly ["fbc7d874-4f05-45e8-b205-14e2d07657f5"];
                    };
                    readonly reason: {
                        readonly type: "string";
                        readonly minLength: 1;
                        readonly maxLength: 512;
                        readonly description: "A description of why the operation (e.g. void, refund) needs to be executed.";
                    };
                    readonly amount: {
                        readonly type: "number";
                        readonly format: "float";
                        readonly minimum: 0.01;
                        readonly maximum: 9999999;
                        readonly description: "Amount of the transaction.";
                    };
                    readonly currency: {
                        readonly type: "string";
                        readonly minLength: 3;
                        readonly maxLength: 3;
                        readonly description: "[ISO 4217 Alpha-3](https://www.iso.org/iso-4217-currency-codes.html) currency code\n";
                        readonly examples: readonly ["PHP"];
                    };
                    readonly status: {
                        readonly title: "Void/Refund States";
                        readonly type: "string";
                        readonly description: "Indicates the status of a void/refund transaction.\n\n`PENDING` `SUCCESS` `FAILED`";
                        readonly enum: readonly ["PENDING", "SUCCESS", "FAILED"];
                    };
                    readonly payment: {
                        readonly title: "Payment ID";
                        readonly type: "string";
                        readonly format: "uuid";
                        readonly description: "The unique identification of the payment transaction.";
                    };
                    readonly requestReferenceNumber: {
                        readonly title: "Merchant Request Reference Number";
                        readonly type: "string";
                        readonly minLength: 1;
                        readonly maxLength: 36;
                        readonly description: "The merchant's reference number for the transaction. It is strongly advised that the merchant provide unique value for this property for each transaction.";
                    };
                    readonly refundAt: {
                        readonly type: "string";
                        readonly format: "date-time";
                        readonly description: "The timestamp in UTC when the transaction is refunded.";
                    };
                    readonly createdAt: {
                        readonly type: "string";
                        readonly format: "date-time";
                        readonly description: "The timestamp in UTC when the record is created.";
                    };
                    readonly updatedAt: {
                        readonly type: "string";
                        readonly format: "date-time";
                        readonly description: "The timestamp in UTC when the record is last updated.";
                    };
                };
            };
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
    };
};
declare const GetV1VoidOfPayment: {
    readonly metadata: {
        readonly allOf: readonly [{
            readonly type: "object";
            readonly properties: {
                readonly paymentId: {
                    readonly type: "string";
                    readonly format: "uuid";
                    readonly examples: readonly ["e732f996-cb87-4120-b712-166d8183c01d"];
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "The unique identification string of the payment transaction.";
                };
                readonly voidId: {
                    readonly type: "string";
                    readonly format: "uuid";
                    readonly examples: readonly ["0a306b5c-4eff-4d5b-80d4-277d442d5258"];
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "The unique identification string of the void transaction.";
                };
            };
            readonly required: readonly ["paymentId", "voidId"];
        }];
    };
    readonly response: {
        readonly "200": {
            readonly type: "object";
            readonly required: readonly ["id", "payment", "status", "reason", "createdAt", "updatedAt"];
            readonly properties: {
                readonly id: {
                    readonly title: "Void ID";
                    readonly type: "string";
                    readonly format: "uuid";
                    readonly description: "The unique identification of the void transaction.";
                    readonly examples: readonly ["0a306b5c-4eff-4d5b-80d4-277d442d5258"];
                };
                readonly payment: {
                    readonly title: "Payment ID";
                    readonly type: "string";
                    readonly format: "uuid";
                    readonly description: "The unique identification of the payment transaction.";
                };
                readonly status: {
                    readonly title: "Void/Refund States";
                    readonly type: "string";
                    readonly description: "Indicates the status of a void/refund transaction.\n\n`PENDING` `SUCCESS` `FAILED`";
                    readonly enum: readonly ["PENDING", "SUCCESS", "FAILED"];
                };
                readonly reason: {
                    readonly type: "string";
                    readonly minLength: 1;
                    readonly maxLength: 512;
                    readonly description: "A description of why the operation (e.g. void, refund) needs to be executed.";
                };
                readonly requestReferenceNumber: {
                    readonly title: "Merchant Request Reference Number";
                    readonly type: "string";
                    readonly minLength: 1;
                    readonly maxLength: 36;
                    readonly description: "The merchant's reference number for the transaction. It is strongly advised that the merchant provide unique value for this property for each transaction.";
                };
                readonly createdAt: {
                    readonly type: "string";
                    readonly format: "date-time";
                    readonly description: "The timestamp in UTC when the record is created.";
                };
                readonly updatedAt: {
                    readonly type: "string";
                    readonly format: "date-time";
                    readonly description: "The timestamp in UTC when the record is last updated.";
                };
            };
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
    };
};
declare const GetV1VoidsOfPayment: {
    readonly metadata: {
        readonly allOf: readonly [{
            readonly type: "object";
            readonly properties: {
                readonly paymentId: {
                    readonly type: "string";
                    readonly format: "uuid";
                    readonly examples: readonly ["e732f996-cb87-4120-b712-166d8183c01d"];
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "The unique identification string of the payment transaction.";
                };
            };
            readonly required: readonly ["paymentId"];
        }];
    };
    readonly response: {
        readonly "200": {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly required: readonly ["id", "payment", "status", "reason", "createdAt", "updatedAt"];
                readonly properties: {
                    readonly id: {
                        readonly title: "Void ID";
                        readonly type: "string";
                        readonly format: "uuid";
                        readonly description: "The unique identification of the void transaction.";
                        readonly examples: readonly ["0a306b5c-4eff-4d5b-80d4-277d442d5258"];
                    };
                    readonly payment: {
                        readonly title: "Payment ID";
                        readonly type: "string";
                        readonly format: "uuid";
                        readonly description: "The unique identification of the payment transaction.";
                    };
                    readonly status: {
                        readonly title: "Void/Refund States";
                        readonly type: "string";
                        readonly description: "Indicates the status of a void/refund transaction.\n\n`PENDING` `SUCCESS` `FAILED`";
                        readonly enum: readonly ["PENDING", "SUCCESS", "FAILED"];
                    };
                    readonly reason: {
                        readonly type: "string";
                        readonly minLength: 1;
                        readonly maxLength: 512;
                        readonly description: "A description of why the operation (e.g. void, refund) needs to be executed.";
                    };
                    readonly requestReferenceNumber: {
                        readonly title: "Merchant Request Reference Number";
                        readonly type: "string";
                        readonly minLength: 1;
                        readonly maxLength: 36;
                        readonly description: "The merchant's reference number for the transaction. It is strongly advised that the merchant provide unique value for this property for each transaction.";
                    };
                    readonly createdAt: {
                        readonly type: "string";
                        readonly format: "date-time";
                        readonly description: "The timestamp in UTC when the record is created.";
                    };
                    readonly updatedAt: {
                        readonly type: "string";
                        readonly format: "date-time";
                        readonly description: "The timestamp in UTC when the record is last updated.";
                    };
                };
            };
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
    };
};
declare const GetV1Webhook: {
    readonly metadata: {
        readonly allOf: readonly [{
            readonly type: "object";
            readonly properties: {
                readonly webhookId: {
                    readonly type: "string";
                    readonly format: "uuid";
                    readonly examples: readonly ["954cd5a7-1316-4ea1-a014-8f848bd87726"];
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "The unique identification string of a webhook.";
                };
            };
            readonly required: readonly ["webhookId"];
        }];
    };
    readonly response: {
        readonly "200": {
            readonly type: "object";
            readonly required: readonly ["id", "name", "callbackUrl", "createdAt", "updatedAt"];
            readonly properties: {
                readonly id: {
                    readonly type: "string";
                    readonly format: "uuid";
                    readonly description: "The unique identification of the webhook URL.";
                };
                readonly name: {
                    readonly type: "string";
                    readonly minLength: 1;
                    readonly maxLength: 256;
                    readonly enum: readonly ["AUTHORIZED", "PAYMENT_SUCCESS", "PAYMENT_FAILED", "PAYMENT_EXPIRED", "PAYMENT_CANCELLED", "3DS_PAYMENT_SUCCESS", "3DS_PAYMENT_FAILURE", "3DS_PAYMENT_DROPOUT", "RECURRING_PAYMENT_SUCCESS", "RECURRING_PAYMENT_FAILURE", "CHECKOUT_SUCCESS", "CHECKOUT_FAILURE", "CHECKOUT_DROPOUT", "CHECKOUT_CANCELLED"];
                    readonly description: "`AUTHORIZED` `PAYMENT_SUCCESS` `PAYMENT_FAILED` `PAYMENT_EXPIRED` `PAYMENT_CANCELLED` `3DS_PAYMENT_SUCCESS` `3DS_PAYMENT_FAILURE` `3DS_PAYMENT_DROPOUT` `RECURRING_PAYMENT_SUCCESS` `RECURRING_PAYMENT_FAILURE` `CHECKOUT_SUCCESS` `CHECKOUT_FAILURE` `CHECKOUT_DROPOUT` `CHECKOUT_CANCELLED`";
                };
                readonly callbackUrl: {
                    readonly type: "string";
                    readonly format: "url";
                    readonly minLength: 1;
                    readonly maxLength: 2083;
                    readonly description: "The merchant server's URL that is called for this this webhook.";
                };
                readonly createdAt: {
                    readonly type: "string";
                    readonly format: "date-time";
                    readonly description: "The timestamp in UTC when the record is created.";
                };
                readonly updatedAt: {
                    readonly type: "string";
                    readonly format: "date-time";
                    readonly description: "The timestamp in UTC when the record is last updated.";
                };
            };
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
    };
};
declare const GetV1Webhooks: {
    readonly response: {
        readonly "200": {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly required: readonly ["id", "name", "callbackUrl", "createdAt", "updatedAt"];
                readonly properties: {
                    readonly id: {
                        readonly type: "string";
                        readonly format: "uuid";
                        readonly description: "The unique identification of the webhook URL.";
                    };
                    readonly name: {
                        readonly type: "string";
                        readonly minLength: 1;
                        readonly maxLength: 256;
                        readonly enum: readonly ["AUTHORIZED", "PAYMENT_SUCCESS", "PAYMENT_FAILED", "PAYMENT_EXPIRED", "PAYMENT_CANCELLED", "3DS_PAYMENT_SUCCESS", "3DS_PAYMENT_FAILURE", "3DS_PAYMENT_DROPOUT", "RECURRING_PAYMENT_SUCCESS", "RECURRING_PAYMENT_FAILURE", "CHECKOUT_SUCCESS", "CHECKOUT_FAILURE", "CHECKOUT_DROPOUT", "CHECKOUT_CANCELLED"];
                        readonly description: "`AUTHORIZED` `PAYMENT_SUCCESS` `PAYMENT_FAILED` `PAYMENT_EXPIRED` `PAYMENT_CANCELLED` `3DS_PAYMENT_SUCCESS` `3DS_PAYMENT_FAILURE` `3DS_PAYMENT_DROPOUT` `RECURRING_PAYMENT_SUCCESS` `RECURRING_PAYMENT_FAILURE` `CHECKOUT_SUCCESS` `CHECKOUT_FAILURE` `CHECKOUT_DROPOUT` `CHECKOUT_CANCELLED`";
                    };
                    readonly callbackUrl: {
                        readonly type: "string";
                        readonly format: "url";
                        readonly minLength: 1;
                        readonly maxLength: 2083;
                        readonly description: "The merchant server's URL that is called for this this webhook.";
                    };
                    readonly createdAt: {
                        readonly type: "string";
                        readonly format: "date-time";
                        readonly description: "The timestamp in UTC when the record is created.";
                    };
                    readonly updatedAt: {
                        readonly type: "string";
                        readonly format: "date-time";
                        readonly description: "The timestamp in UTC when the record is last updated.";
                    };
                };
            };
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
    };
};
declare const RefundV1Checkout: {
    readonly body: {
        readonly type: "object";
        readonly required: readonly ["amount", "reason"];
        readonly properties: {
            readonly amount: {
                readonly type: "object";
                readonly title: "Total Amount";
                readonly required: readonly ["value", "currency"];
                readonly description: "Contains the value and currency of the transaction.";
                readonly properties: {
                    readonly value: {
                        readonly type: "number";
                        readonly format: "float";
                        readonly minimum: 0.01;
                        readonly maximum: 9999999;
                        readonly description: "Amount of the transaction.";
                        readonly examples: readonly [200];
                    };
                    readonly currency: {
                        readonly type: "string";
                        readonly minLength: 3;
                        readonly maxLength: 3;
                        readonly description: "[ISO 4217 Alpha-3](https://www.iso.org/iso-4217-currency-codes.html) currency code\n";
                        readonly examples: readonly ["PHP"];
                    };
                };
            };
            readonly reason: {
                readonly type: "string";
                readonly minLength: 1;
                readonly maxLength: 512;
                readonly description: "A description of why the operation (e.g. void, refund) needs to be executed.";
                readonly examples: readonly ["Discount on damage in handling"];
            };
        };
        readonly $schema: "http://json-schema.org/draft-04/schema#";
    };
    readonly metadata: {
        readonly allOf: readonly [{
            readonly type: "object";
            readonly properties: {
                readonly checkoutId: {
                    readonly type: "string";
                    readonly format: "uuid";
                    readonly examples: readonly ["fa4da2ff-dcda-4367-a97d-0c9445147b73"];
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "The unique identification string of the checkout transaction.";
                };
            };
            readonly required: readonly ["checkoutId"];
        }];
    };
    readonly response: {
        readonly "200": {
            readonly type: "object";
            readonly properties: {
                readonly id: {
                    readonly type: "string";
                    readonly format: "uuid";
                    readonly description: "The unique identification of the refund transaction.";
                    readonly examples: readonly ["fbc7d874-4f05-45e8-b205-14e2d07657f5"];
                };
                readonly checkout: {
                    readonly title: "Checkout ID";
                    readonly type: "string";
                    readonly format: "uuid";
                    readonly description: "The unique identification of the checkout payment transaction.";
                };
                readonly status: {
                    readonly title: "Void/Refund States";
                    readonly type: "string";
                    readonly description: "Indicates the status of a void/refund transaction.\n\n`PENDING` `SUCCESS` `FAILED`";
                    readonly enum: readonly ["PENDING", "SUCCESS", "FAILED"];
                };
                readonly reason: {
                    readonly type: "string";
                    readonly minLength: 1;
                    readonly maxLength: 512;
                    readonly description: "A description of why the operation (e.g. void, refund) needs to be executed.";
                };
                readonly amount: {
                    readonly type: "object";
                    readonly title: "Total Amount";
                    readonly required: readonly ["value", "currency"];
                    readonly description: "Contains the value and currency of the transaction.";
                    readonly properties: {
                        readonly value: {
                            readonly type: "number";
                            readonly format: "float";
                            readonly minimum: 0.01;
                            readonly maximum: 9999999;
                            readonly description: "Amount of the transaction.";
                        };
                        readonly currency: {
                            readonly type: "string";
                            readonly minLength: 3;
                            readonly maxLength: 3;
                            readonly description: "[ISO 4217 Alpha-3](https://www.iso.org/iso-4217-currency-codes.html) currency code\n";
                            readonly examples: readonly ["PHP"];
                        };
                    };
                };
                readonly createdAt: {
                    readonly type: "string";
                    readonly format: "date-time";
                    readonly description: "The timestamp in UTC when the record is created.";
                };
            };
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
    };
};
declare const RefundV1PaymentViaId: {
    readonly body: {
        readonly type: "object";
        readonly required: readonly ["totalAmount", "reason"];
        readonly properties: {
            readonly totalAmount: {
                readonly type: "object";
                readonly title: "Total Amount";
                readonly required: readonly ["amount", "currency"];
                readonly description: "Contains the value and currency of the transaction.";
                readonly properties: {
                    readonly amount: {
                        readonly type: "number";
                        readonly format: "float";
                        readonly minimum: 0.01;
                        readonly maximum: 9999999;
                        readonly description: "Amount of the transaction.";
                        readonly examples: readonly [1];
                    };
                    readonly currency: {
                        readonly type: "string";
                        readonly minLength: 3;
                        readonly maxLength: 3;
                        readonly description: "[ISO 4217 Alpha-3](https://www.iso.org/iso-4217-currency-codes.html) currency code\n";
                        readonly examples: readonly ["PHP"];
                    };
                };
            };
            readonly reason: {
                readonly type: "string";
                readonly minLength: 1;
                readonly maxLength: 512;
                readonly description: "A description of why the operation (e.g. void, refund) needs to be executed.";
                readonly examples: readonly ["Item out of stock"];
            };
            readonly requestReferenceNumber: {
                readonly title: "Merchant Request Reference Number";
                readonly type: "string";
                readonly minLength: 1;
                readonly maxLength: 36;
                readonly description: "The merchant's reference number for the transaction. It is strongly advised that the merchant provide unique value for this property for each transaction.";
                readonly examples: readonly ["466d97e5-ea38-4ee2-bbcb-d2301dfcac5f"];
            };
        };
        readonly $schema: "http://json-schema.org/draft-04/schema#";
    };
    readonly metadata: {
        readonly allOf: readonly [{
            readonly type: "object";
            readonly properties: {
                readonly paymentId: {
                    readonly type: "string";
                    readonly format: "uuid";
                    readonly examples: readonly ["e732f996-cb87-4120-b712-166d8183c01d"];
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "The unique identification string of the payment transaction.";
                };
            };
            readonly required: readonly ["paymentId"];
        }];
    };
    readonly response: {
        readonly "200": {
            readonly type: "object";
            readonly required: readonly ["id", "payment", "amount", "currency", "status", "reason", "createdAt", "updatedAt"];
            readonly properties: {
                readonly id: {
                    readonly type: "string";
                    readonly format: "uuid";
                    readonly description: "The unique identification of the refund transaction.";
                    readonly examples: readonly ["fbc7d874-4f05-45e8-b205-14e2d07657f5"];
                };
                readonly reason: {
                    readonly type: "string";
                    readonly minLength: 1;
                    readonly maxLength: 512;
                    readonly description: "A description of why the operation (e.g. void, refund) needs to be executed.";
                };
                readonly amount: {
                    readonly type: "number";
                    readonly format: "float";
                    readonly minimum: 0.01;
                    readonly maximum: 9999999;
                    readonly description: "Amount of the transaction.";
                };
                readonly currency: {
                    readonly type: "string";
                    readonly minLength: 3;
                    readonly maxLength: 3;
                    readonly description: "[ISO 4217 Alpha-3](https://www.iso.org/iso-4217-currency-codes.html) currency code\n";
                    readonly examples: readonly ["PHP"];
                };
                readonly status: {
                    readonly title: "Void/Refund States";
                    readonly type: "string";
                    readonly description: "Indicates the status of a void/refund transaction.\n\n`PENDING` `SUCCESS` `FAILED`";
                    readonly enum: readonly ["PENDING", "SUCCESS", "FAILED"];
                };
                readonly payment: {
                    readonly title: "Payment ID";
                    readonly type: "string";
                    readonly format: "uuid";
                    readonly description: "The unique identification of the payment transaction.";
                };
                readonly requestReferenceNumber: {
                    readonly title: "Merchant Request Reference Number";
                    readonly type: "string";
                    readonly minLength: 1;
                    readonly maxLength: 36;
                    readonly description: "The merchant's reference number for the transaction. It is strongly advised that the merchant provide unique value for this property for each transaction.";
                };
                readonly refundAt: {
                    readonly type: "string";
                    readonly format: "date-time";
                    readonly description: "The timestamp in UTC when the transaction is refunded.";
                };
                readonly createdAt: {
                    readonly type: "string";
                    readonly format: "date-time";
                    readonly description: "The timestamp in UTC when the record is created.";
                };
                readonly updatedAt: {
                    readonly type: "string";
                    readonly format: "date-time";
                    readonly description: "The timestamp in UTC when the record is last updated.";
                };
            };
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
    };
};
declare const RefundV1PaymentViaRrn: {
    readonly body: {
        readonly type: "object";
        readonly required: readonly ["totalAmount", "reason"];
        readonly properties: {
            readonly totalAmount: {
                readonly type: "object";
                readonly title: "Total Amount";
                readonly required: readonly ["amount", "currency"];
                readonly description: "Contains the value and currency of the transaction.";
                readonly properties: {
                    readonly amount: {
                        readonly type: "number";
                        readonly format: "float";
                        readonly minimum: 0.01;
                        readonly maximum: 9999999;
                        readonly description: "Amount of the transaction.";
                        readonly examples: readonly [1];
                    };
                    readonly currency: {
                        readonly type: "string";
                        readonly minLength: 3;
                        readonly maxLength: 3;
                        readonly description: "[ISO 4217 Alpha-3](https://www.iso.org/iso-4217-currency-codes.html) currency code\n";
                        readonly examples: readonly ["PHP"];
                    };
                };
            };
            readonly reason: {
                readonly type: "string";
                readonly minLength: 1;
                readonly maxLength: 512;
                readonly description: "A description of why the operation (e.g. void, refund) needs to be executed.";
                readonly examples: readonly ["Item out of stock"];
            };
            readonly requestReferenceNumber: {
                readonly title: "Merchant Request Reference Number";
                readonly type: "string";
                readonly minLength: 1;
                readonly maxLength: 36;
                readonly description: "The merchant's reference number for the transaction. It is strongly advised that the merchant provide unique value for this property for each transaction.";
                readonly examples: readonly ["466d97e5-ea38-4ee2-bbcb-d2301dfcac5f"];
            };
        };
        readonly $schema: "http://json-schema.org/draft-04/schema#";
    };
    readonly metadata: {
        readonly allOf: readonly [{
            readonly type: "object";
            readonly properties: {
                readonly rrn: {
                    readonly title: "Merchant Request Reference Number";
                    readonly type: "string";
                    readonly minLength: 1;
                    readonly maxLength: 36;
                    readonly description: "A merchant's request reference number for a given transaction.";
                    readonly examples: readonly [1625127550];
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                };
            };
            readonly required: readonly ["rrn"];
        }];
    };
    readonly response: {
        readonly "200": {
            readonly type: "object";
            readonly required: readonly ["id", "payment", "amount", "currency", "status", "reason", "createdAt", "updatedAt"];
            readonly properties: {
                readonly id: {
                    readonly type: "string";
                    readonly format: "uuid";
                    readonly description: "The unique identification of the refund transaction.";
                    readonly examples: readonly ["fbc7d874-4f05-45e8-b205-14e2d07657f5"];
                };
                readonly reason: {
                    readonly type: "string";
                    readonly minLength: 1;
                    readonly maxLength: 512;
                    readonly description: "A description of why the operation (e.g. void, refund) needs to be executed.";
                };
                readonly amount: {
                    readonly type: "number";
                    readonly format: "float";
                    readonly minimum: 0.01;
                    readonly maximum: 9999999;
                    readonly description: "Amount of the transaction.";
                };
                readonly currency: {
                    readonly type: "string";
                    readonly minLength: 3;
                    readonly maxLength: 3;
                    readonly description: "[ISO 4217 Alpha-3](https://www.iso.org/iso-4217-currency-codes.html) currency code\n";
                    readonly examples: readonly ["PHP"];
                };
                readonly status: {
                    readonly title: "Void/Refund States";
                    readonly type: "string";
                    readonly description: "Indicates the status of a void/refund transaction.\n\n`PENDING` `SUCCESS` `FAILED`";
                    readonly enum: readonly ["PENDING", "SUCCESS", "FAILED"];
                };
                readonly payment: {
                    readonly title: "Payment ID";
                    readonly type: "string";
                    readonly format: "uuid";
                    readonly description: "The unique identification of the payment transaction.";
                };
                readonly requestReferenceNumber: {
                    readonly title: "Merchant Request Reference Number";
                    readonly type: "string";
                    readonly minLength: 1;
                    readonly maxLength: 36;
                    readonly description: "The merchant's reference number for the transaction. It is strongly advised that the merchant provide unique value for this property for each transaction.";
                };
                readonly refundAt: {
                    readonly type: "string";
                    readonly format: "date-time";
                    readonly description: "The timestamp in UTC when the transaction is refunded.";
                };
                readonly createdAt: {
                    readonly type: "string";
                    readonly format: "date-time";
                    readonly description: "The timestamp in UTC when the record is created.";
                };
                readonly updatedAt: {
                    readonly type: "string";
                    readonly format: "date-time";
                    readonly description: "The timestamp in UTC when the record is last updated.";
                };
            };
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
    };
};
declare const SetV1Customizations: {
    readonly body: {
        readonly title: "Customizations";
        readonly type: "object";
        readonly required: readonly ["logoUrl", "iconUrl", "appleTouchIconUrl", "customTitle", "colorScheme"];
        readonly properties: {
            readonly logoUrl: {
                readonly type: "string";
                readonly format: "url,";
                readonly minLength: 5;
                readonly maxLength: 2082;
                readonly description: "URL that points to the merchant's logo image.";
                readonly examples: readonly ["https://www.merchantsite.com/icon-store.b575c975.svg"];
            };
            readonly iconUrl: {
                readonly type: "string";
                readonly format: "url,";
                readonly minLength: 5;
                readonly maxLength: 2082;
                readonly description: "URL that points to the merchant's icon image.";
                readonly examples: readonly ["https://www.merchantsite.com/favicon.ico"];
            };
            readonly appleTouchIconUrl: {
                readonly type: "string";
                readonly format: "url,";
                readonly minLength: 5;
                readonly maxLength: 2082;
                readonly description: "URL that points to the merchant's Apple icon image.";
                readonly examples: readonly ["https://www.merchantsite.com/touch-icon-ipad-retina.png"];
            };
            readonly customTitle: {
                readonly type: "string";
                readonly minLength: 1;
                readonly maxLength: 64;
                readonly description: "Customized title used in the web browser.";
                readonly examples: readonly ["Merchant Store"];
            };
            readonly colorScheme: {
                readonly type: "string";
                readonly format: "hexcolor";
                readonly description: "The HEX color code that is used for the payment button.";
                readonly examples: readonly ["#85c133"];
            };
            readonly hideReceiptInput: {
                readonly type: "boolean";
                readonly description: "Indicates if the merchant does not allow its payers to freely send transaction receipts (i.e. set to `true`).\n";
                readonly default: false;
                readonly examples: readonly [true];
            };
            readonly skipResultPage: {
                readonly type: "boolean";
                readonly description: "Indicates if the merchant does not want to show the payment result page.\nWhen skipped (i.e. set to `true`), the payment page redirects immediately to the merchant's redirect URL.\n";
                readonly default: false;
            };
            readonly showMerchantName: {
                readonly type: "boolean";
                readonly description: "Indicates if the merchant name on the result page is displayed.\nFor merchants that have their name in their logo, they may opt to hide a textual display of their name to remove duplicity.\n";
                readonly default: true;
            };
            readonly redirectTimer: {
                readonly type: "number";
                readonly format: "integer";
                readonly minimum: 3;
                readonly maximum: 30;
                readonly description: "The number of seconds the payment result page is shown before it redirects to the merchant's redirect URL.\n\nThe following are the **default** time used depending on the resulting payment:\n- `15 seconds`: for successful payments\n- `5 seconds`: for failed payments\n";
                readonly examples: readonly [5];
            };
        };
        readonly $schema: "http://json-schema.org/draft-04/schema#";
    };
    readonly response: {
        readonly "200": {
            readonly title: "Customizations";
            readonly type: "object";
            readonly required: readonly ["logoUrl", "iconUrl", "appleTouchIconUrl", "customTitle", "colorScheme"];
            readonly properties: {
                readonly logoUrl: {
                    readonly type: "string";
                    readonly format: "url,";
                    readonly minLength: 5;
                    readonly maxLength: 2082;
                    readonly description: "URL that points to the merchant's logo image.";
                };
                readonly iconUrl: {
                    readonly type: "string";
                    readonly format: "url,";
                    readonly minLength: 5;
                    readonly maxLength: 2082;
                    readonly description: "URL that points to the merchant's icon image.";
                };
                readonly appleTouchIconUrl: {
                    readonly type: "string";
                    readonly format: "url,";
                    readonly minLength: 5;
                    readonly maxLength: 2082;
                    readonly description: "URL that points to the merchant's Apple icon image.";
                };
                readonly customTitle: {
                    readonly type: "string";
                    readonly minLength: 1;
                    readonly maxLength: 64;
                    readonly description: "Customized title used in the web browser.";
                };
                readonly colorScheme: {
                    readonly type: "string";
                    readonly format: "hexcolor";
                    readonly description: "The HEX color code that is used for the payment button.";
                };
                readonly hideReceiptInput: {
                    readonly type: "boolean";
                    readonly description: "Indicates if the merchant does not allow its payers to freely send transaction receipts (i.e. set to `true`).\n";
                    readonly default: false;
                };
                readonly skipResultPage: {
                    readonly type: "boolean";
                    readonly description: "Indicates if the merchant does not want to show the payment result page.\nWhen skipped (i.e. set to `true`), the payment page redirects immediately to the merchant's redirect URL.\n";
                    readonly default: false;
                };
                readonly showMerchantName: {
                    readonly type: "boolean";
                    readonly description: "Indicates if the merchant name on the result page is displayed.\nFor merchants that have their name in their logo, they may opt to hide a textual display of their name to remove duplicity.\n";
                    readonly default: true;
                };
                readonly redirectTimer: {
                    readonly type: "number";
                    readonly format: "integer";
                    readonly minimum: 3;
                    readonly maximum: 30;
                    readonly description: "The number of seconds the payment result page is shown before it redirects to the merchant's redirect URL.\n\nThe following are the **default** time used depending on the resulting payment:\n- `15 seconds`: for successful payments\n- `5 seconds`: for failed payments\n";
                };
            };
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
    };
};
declare const UpdateV1Webhook: {
    readonly body: {
        readonly type: "object";
        readonly required: readonly ["callbackUrl"];
        readonly properties: {
            readonly callbackUrl: {
                readonly type: "string";
                readonly format: "url";
                readonly minLength: 1;
                readonly maxLength: 2083;
                readonly description: "The merchant server's URL that is called for this this webhook.";
                readonly examples: readonly ["http://www.merchantsite.com/success"];
            };
        };
        readonly $schema: "http://json-schema.org/draft-04/schema#";
    };
    readonly metadata: {
        readonly allOf: readonly [{
            readonly type: "object";
            readonly properties: {
                readonly webhookId: {
                    readonly type: "string";
                    readonly format: "uuid";
                    readonly examples: readonly ["954cd5a7-1316-4ea1-a014-8f848bd87726"];
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "The unique identification string of a webhook.";
                };
            };
            readonly required: readonly ["webhookId"];
        }];
    };
    readonly response: {
        readonly "200": {
            readonly type: "object";
            readonly required: readonly ["id", "name", "callbackUrl", "createdAt", "updatedAt"];
            readonly properties: {
                readonly id: {
                    readonly type: "string";
                    readonly format: "uuid";
                    readonly description: "The unique identification of the webhook URL.";
                };
                readonly name: {
                    readonly type: "string";
                    readonly minLength: 1;
                    readonly maxLength: 256;
                    readonly enum: readonly ["AUTHORIZED", "PAYMENT_SUCCESS", "PAYMENT_FAILED", "PAYMENT_EXPIRED", "PAYMENT_CANCELLED", "3DS_PAYMENT_SUCCESS", "3DS_PAYMENT_FAILURE", "3DS_PAYMENT_DROPOUT", "RECURRING_PAYMENT_SUCCESS", "RECURRING_PAYMENT_FAILURE", "CHECKOUT_SUCCESS", "CHECKOUT_FAILURE", "CHECKOUT_DROPOUT", "CHECKOUT_CANCELLED"];
                    readonly description: "`AUTHORIZED` `PAYMENT_SUCCESS` `PAYMENT_FAILED` `PAYMENT_EXPIRED` `PAYMENT_CANCELLED` `3DS_PAYMENT_SUCCESS` `3DS_PAYMENT_FAILURE` `3DS_PAYMENT_DROPOUT` `RECURRING_PAYMENT_SUCCESS` `RECURRING_PAYMENT_FAILURE` `CHECKOUT_SUCCESS` `CHECKOUT_FAILURE` `CHECKOUT_DROPOUT` `CHECKOUT_CANCELLED`";
                };
                readonly callbackUrl: {
                    readonly type: "string";
                    readonly format: "url";
                    readonly minLength: 1;
                    readonly maxLength: 2083;
                    readonly description: "The merchant server's URL that is called for this this webhook.";
                };
                readonly createdAt: {
                    readonly type: "string";
                    readonly format: "date-time";
                    readonly description: "The timestamp in UTC when the record is created.";
                };
                readonly updatedAt: {
                    readonly type: "string";
                    readonly format: "date-time";
                    readonly description: "The timestamp in UTC when the record is last updated.";
                };
            };
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
    };
};
declare const VoidV1Checkout: {
    readonly body: {
        readonly type: "object";
        readonly required: readonly ["reason"];
        readonly properties: {
            readonly reason: {
                readonly type: "string";
                readonly minLength: 1;
                readonly maxLength: 512;
                readonly description: "Reason for performing the Void";
                readonly examples: readonly ["Returned item."];
            };
        };
        readonly $schema: "http://json-schema.org/draft-04/schema#";
    };
    readonly metadata: {
        readonly allOf: readonly [{
            readonly type: "object";
            readonly properties: {
                readonly checkoutId: {
                    readonly type: "string";
                    readonly format: "uuid";
                    readonly examples: readonly ["fa4da2ff-dcda-4367-a97d-0c9445147b73"];
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "The unique identification string of the checkout transaction.";
                };
            };
            readonly required: readonly ["checkoutId"];
        }];
    };
    readonly response: {
        readonly "200": {
            readonly type: "object";
            readonly properties: {
                readonly voidId: {
                    readonly title: "Void ID";
                    readonly type: "string";
                    readonly format: "uuid";
                    readonly description: "The unique identification of the void transaction.";
                    readonly examples: readonly ["0a306b5c-4eff-4d5b-80d4-277d442d5258"];
                };
                readonly checkoutId: {
                    readonly title: "Checkout ID";
                    readonly type: "string";
                    readonly format: "uuid";
                    readonly description: "The unique identification of the checkout payment transaction.";
                };
                readonly reason: {
                    readonly type: "string";
                    readonly minLength: 1;
                    readonly maxLength: 512;
                    readonly description: "A description of why the operation (e.g. void, refund) needs to be executed.";
                };
            };
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
    };
};
declare const VoidV1PaymentViaIdViaDeleteMethod: {
    readonly body: {
        readonly type: "object";
        readonly required: readonly ["reason"];
        readonly properties: {
            readonly reason: {
                readonly type: "string";
                readonly minLength: 1;
                readonly maxLength: 512;
                readonly description: "A description of why the operation (e.g. void, refund) needs to be executed.";
                readonly examples: readonly ["Return item"];
            };
            readonly requestReferenceNumber: {
                readonly title: "Merchant Request Reference Number";
                readonly type: "string";
                readonly minLength: 1;
                readonly maxLength: 36;
                readonly description: "The merchant's reference number for the transaction. It is strongly advised that the merchant provide unique value for this property for each transaction.";
                readonly examples: readonly ["90d3336a-ead5-420b-b924-1df9628676ae"];
            };
        };
        readonly $schema: "http://json-schema.org/draft-04/schema#";
    };
    readonly metadata: {
        readonly allOf: readonly [{
            readonly type: "object";
            readonly properties: {
                readonly paymentId: {
                    readonly type: "string";
                    readonly format: "uuid";
                    readonly examples: readonly ["e732f996-cb87-4120-b712-166d8183c01d"];
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "The unique identification string of the payment transaction.";
                };
            };
            readonly required: readonly ["paymentId"];
        }];
    };
    readonly response: {
        readonly "200": {
            readonly type: "object";
            readonly required: readonly ["id", "payment", "status", "reason", "createdAt", "updatedAt"];
            readonly properties: {
                readonly id: {
                    readonly title: "Void ID";
                    readonly type: "string";
                    readonly format: "uuid";
                    readonly description: "The unique identification of the void transaction.";
                    readonly examples: readonly ["0a306b5c-4eff-4d5b-80d4-277d442d5258"];
                };
                readonly payment: {
                    readonly title: "Payment ID";
                    readonly type: "string";
                    readonly format: "uuid";
                    readonly description: "The unique identification of the payment transaction.";
                };
                readonly status: {
                    readonly title: "Void/Refund States";
                    readonly type: "string";
                    readonly description: "Indicates the status of a void/refund transaction.\n\n`PENDING` `SUCCESS` `FAILED`";
                    readonly enum: readonly ["PENDING", "SUCCESS", "FAILED"];
                };
                readonly reason: {
                    readonly type: "string";
                    readonly minLength: 1;
                    readonly maxLength: 512;
                    readonly description: "A description of why the operation (e.g. void, refund) needs to be executed.";
                };
                readonly requestReferenceNumber: {
                    readonly title: "Merchant Request Reference Number";
                    readonly type: "string";
                    readonly minLength: 1;
                    readonly maxLength: 36;
                    readonly description: "The merchant's reference number for the transaction. It is strongly advised that the merchant provide unique value for this property for each transaction.";
                };
                readonly createdAt: {
                    readonly type: "string";
                    readonly format: "date-time";
                    readonly description: "The timestamp in UTC when the record is created.";
                };
                readonly updatedAt: {
                    readonly type: "string";
                    readonly format: "date-time";
                    readonly description: "The timestamp in UTC when the record is last updated.";
                };
            };
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
    };
};
declare const VoidV1PaymentViaIdViaPostMethod: {
    readonly body: {
        readonly type: "object";
        readonly required: readonly ["reason"];
        readonly properties: {
            readonly reason: {
                readonly type: "string";
                readonly minLength: 1;
                readonly maxLength: 512;
                readonly description: "A description of why the operation (e.g. void, refund) needs to be executed.";
                readonly examples: readonly ["Return item"];
            };
            readonly requestReferenceNumber: {
                readonly title: "Merchant Request Reference Number";
                readonly type: "string";
                readonly minLength: 1;
                readonly maxLength: 36;
                readonly description: "The merchant's reference number for the transaction. It is strongly advised that the merchant provide unique value for this property for each transaction.";
                readonly examples: readonly ["90d3336a-ead5-420b-b924-1df9628676ae"];
            };
        };
        readonly $schema: "http://json-schema.org/draft-04/schema#";
    };
    readonly metadata: {
        readonly allOf: readonly [{
            readonly type: "object";
            readonly properties: {
                readonly paymentId: {
                    readonly type: "string";
                    readonly format: "uuid";
                    readonly examples: readonly ["e732f996-cb87-4120-b712-166d8183c01d"];
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "The unique identification string of the payment transaction.";
                };
            };
            readonly required: readonly ["paymentId"];
        }];
    };
    readonly response: {
        readonly "200": {
            readonly type: "object";
            readonly required: readonly ["id", "payment", "status", "reason", "createdAt", "updatedAt"];
            readonly properties: {
                readonly id: {
                    readonly title: "Void ID";
                    readonly type: "string";
                    readonly format: "uuid";
                    readonly description: "The unique identification of the void transaction.";
                    readonly examples: readonly ["0a306b5c-4eff-4d5b-80d4-277d442d5258"];
                };
                readonly payment: {
                    readonly title: "Payment ID";
                    readonly type: "string";
                    readonly format: "uuid";
                    readonly description: "The unique identification of the payment transaction.";
                };
                readonly status: {
                    readonly title: "Void/Refund States";
                    readonly type: "string";
                    readonly description: "Indicates the status of a void/refund transaction.\n\n`PENDING` `SUCCESS` `FAILED`";
                    readonly enum: readonly ["PENDING", "SUCCESS", "FAILED"];
                };
                readonly reason: {
                    readonly type: "string";
                    readonly minLength: 1;
                    readonly maxLength: 512;
                    readonly description: "A description of why the operation (e.g. void, refund) needs to be executed.";
                };
                readonly requestReferenceNumber: {
                    readonly title: "Merchant Request Reference Number";
                    readonly type: "string";
                    readonly minLength: 1;
                    readonly maxLength: 36;
                    readonly description: "The merchant's reference number for the transaction. It is strongly advised that the merchant provide unique value for this property for each transaction.";
                };
                readonly createdAt: {
                    readonly type: "string";
                    readonly format: "date-time";
                    readonly description: "The timestamp in UTC when the record is created.";
                };
                readonly updatedAt: {
                    readonly type: "string";
                    readonly format: "date-time";
                    readonly description: "The timestamp in UTC when the record is last updated.";
                };
            };
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
    };
};
declare const VoidV1PaymentViaRrn: {
    readonly body: {
        readonly type: "object";
        readonly required: readonly ["reason"];
        readonly properties: {
            readonly reason: {
                readonly type: "string";
                readonly minLength: 1;
                readonly maxLength: 512;
                readonly description: "A description of why the operation (e.g. void, refund) needs to be executed.";
                readonly examples: readonly ["Return item"];
            };
            readonly requestReferenceNumber: {
                readonly title: "Merchant Request Reference Number";
                readonly type: "string";
                readonly minLength: 1;
                readonly maxLength: 36;
                readonly description: "The merchant's reference number for the transaction. It is strongly advised that the merchant provide unique value for this property for each transaction.";
                readonly examples: readonly ["90d3336a-ead5-420b-b924-1df9628676ae"];
            };
        };
        readonly $schema: "http://json-schema.org/draft-04/schema#";
    };
    readonly metadata: {
        readonly allOf: readonly [{
            readonly type: "object";
            readonly properties: {
                readonly rrn: {
                    readonly title: "Merchant Request Reference Number";
                    readonly type: "string";
                    readonly minLength: 1;
                    readonly maxLength: 36;
                    readonly description: "A merchant's request reference number for a given transaction.";
                    readonly examples: readonly [1625127550];
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                };
            };
            readonly required: readonly ["rrn"];
        }];
    };
    readonly response: {
        readonly "200": {
            readonly type: "object";
            readonly required: readonly ["id", "payment", "status", "reason", "createdAt", "updatedAt"];
            readonly properties: {
                readonly id: {
                    readonly title: "Void ID";
                    readonly type: "string";
                    readonly format: "uuid";
                    readonly description: "The unique identification of the void transaction.";
                    readonly examples: readonly ["0a306b5c-4eff-4d5b-80d4-277d442d5258"];
                };
                readonly payment: {
                    readonly title: "Payment ID";
                    readonly type: "string";
                    readonly format: "uuid";
                    readonly description: "The unique identification of the payment transaction.";
                };
                readonly status: {
                    readonly title: "Void/Refund States";
                    readonly type: "string";
                    readonly description: "Indicates the status of a void/refund transaction.\n\n`PENDING` `SUCCESS` `FAILED`";
                    readonly enum: readonly ["PENDING", "SUCCESS", "FAILED"];
                };
                readonly reason: {
                    readonly type: "string";
                    readonly minLength: 1;
                    readonly maxLength: 512;
                    readonly description: "A description of why the operation (e.g. void, refund) needs to be executed.";
                };
                readonly requestReferenceNumber: {
                    readonly title: "Merchant Request Reference Number";
                    readonly type: "string";
                    readonly minLength: 1;
                    readonly maxLength: 36;
                    readonly description: "The merchant's reference number for the transaction. It is strongly advised that the merchant provide unique value for this property for each transaction.";
                };
                readonly createdAt: {
                    readonly type: "string";
                    readonly format: "date-time";
                    readonly description: "The timestamp in UTC when the record is created.";
                };
                readonly updatedAt: {
                    readonly type: "string";
                    readonly format: "date-time";
                    readonly description: "The timestamp in UTC when the record is last updated.";
                };
            };
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
    };
};
export { CancelV1PaymentViaIdViaPostMethod, CreateV1Checkout, CreateV1Webhook, DeleteV1Webhook, GetPaymentStatusViaPaymentId, GetPaymentViaPaymentId, GetPaymentViaRequestReferenceNumber, GetV1Checkout, GetV1CheckoutRefund, GetV1CheckoutRefunds, GetV1CheckoutVoid, GetV1CheckoutVoids, GetV1Customizations, GetV1RefundOfPayment, GetV1RefundsOfPayment, GetV1VoidOfPayment, GetV1VoidsOfPayment, GetV1Webhook, GetV1Webhooks, RefundV1Checkout, RefundV1PaymentViaId, RefundV1PaymentViaRrn, SetV1Customizations, UpdateV1Webhook, VoidV1Checkout, VoidV1PaymentViaIdViaDeleteMethod, VoidV1PaymentViaIdViaPostMethod, VoidV1PaymentViaRrn };
