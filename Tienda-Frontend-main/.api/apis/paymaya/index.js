"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var oas_1 = __importDefault(require("oas"));
var core_1 = __importDefault(require("api/dist/core"));
var openapi_json_1 = __importDefault(require("./openapi.json"));
var SDK = /** @class */ (function () {
    function SDK() {
        this.spec = oas_1.default.init(openapi_json_1.default);
        this.core = new core_1.default(this.spec, 'paymaya/1.0.0 (api/6.1.2)');
    }
    /**
     * Optionally configure various options that the SDK allows.
     *
     * @param config Object of supported SDK options and toggles.
     * @param config.timeout Override the default `fetch` request timeout of 30 seconds. This number
     * should be represented in milliseconds.
     */
    SDK.prototype.config = function (config) {
        this.core.setConfig(config);
    };
    /**
     * If the API you're using requires authentication you can supply the required credentials
     * through this method and the library will magically determine how they should be used
     * within your API request.
     *
     * With the exception of OpenID and MutualTLS, it supports all forms of authentication
     * supported by the OpenAPI specification.
     *
     * @example <caption>HTTP Basic auth</caption>
     * sdk.auth('username', 'password');
     *
     * @example <caption>Bearer tokens (HTTP or OAuth 2)</caption>
     * sdk.auth('myBearerToken');
     *
     * @example <caption>API Keys</caption>
     * sdk.auth('myApiKey');
     *
     * @see {@link https://spec.openapis.org/oas/v3.0.3#fixed-fields-22}
     * @see {@link https://spec.openapis.org/oas/v3.1.0#fixed-fields-22}
     * @param values Your auth credentials for the API; can specify up to two strings or numbers.
     */
    SDK.prototype.auth = function () {
        var _a;
        var values = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            values[_i] = arguments[_i];
        }
        (_a = this.core).setAuth.apply(_a, values);
        return this;
    };
    /**
     * If the API you're using offers alternate server URLs, and server variables, you can tell
     * the SDK which one to use with this method. To use it you can supply either one of the
     * server URLs that are contained within the OpenAPI definition (along with any server
     * variables), or you can pass it a fully qualified URL to use (that may or may not exist
     * within the OpenAPI definition).
     *
     * @example <caption>Server URL with server variables</caption>
     * sdk.server('https://{region}.api.example.com/{basePath}', {
     *   name: 'eu',
     *   basePath: 'v14',
     * });
     *
     * @example <caption>Fully qualified server URL</caption>
     * sdk.server('https://eu.api.example.com/v14');
     *
     * @param url Server URL
     * @param variables An object of variables to replace into the server URL.
     */
    SDK.prototype.server = function (url, variables) {
        if (variables === void 0) { variables = {}; }
        this.core.setServer(url, variables);
    };
    /**
     * Creates a checkout transaction.
     *
     * > **For Kount Merchants**:
     * If you require the customer to enter its full details on the checkout page,
     * the buyer information may be **optionally** provided in the request body of the API.
     *
     *
     * @summary Create Checkout
     */
    SDK.prototype.createV1Checkout = function (body) {
        return this.core.fetch('/checkout/v1/checkouts', 'post', body);
    };
    /**
     * Retrieves information about the checkout transaction.
     *
     * > This API is **deprecated**. It is advised to use the APIs under the section [Payments
     * Info](#tag/Payments-Info).
     *
     *
     * @summary Retrieve Checkout Info
     */
    SDK.prototype.getV1Checkout = function (metadata) {
        return this.core.fetch('/checkout/v1/checkouts/{checkoutId}', 'get', metadata);
    };
    /**
     * Voids a checkout transaction.
     *
     * > This API is **deprecated**. It is advised to use the APIs under the section
     * [Voids](#tag/Voids).
     *
     *
     * @summary Void Checkout
     */
    SDK.prototype.voidV1Checkout = function (body, metadata) {
        return this.core.fetch('/checkout/v1/checkouts/{checkoutId}/voids', 'post', body, metadata);
    };
    /**
     * Returns all the void transactions done on a checkout.
     *
     * @summary Retrieve Voids of Checkout
     */
    SDK.prototype.getV1CheckoutVoids = function (metadata) {
        return this.core.fetch('/checkout/v1/checkouts/{checkoutId}/voids', 'get', metadata);
    };
    /**
     * Returns the refund transaction identified by a void ID.
     *
     * > This API is **deprecated**. It is advised to use the APIs under the section
     * [Voids](#tag/Voids).
     *
     *
     * @summary Retrive Void Info
     */
    SDK.prototype.getV1CheckoutVoid = function (metadata) {
        return this.core.fetch('/checkout/v1/checkouts/{checkoutId}/voids/{voidId}', 'get', metadata);
    };
    /**
     * Refunds a payment transaction.
     *
     * > This API is **deprecated**. It is advised to use the APIs under the section
     * [Refunds](#tag/Refunds).
     *
     *
     * @summary Refund Checkout
     */
    SDK.prototype.refundV1Checkout = function (body, metadata) {
        return this.core.fetch('/checkout/v1/checkouts/{checkoutId}/refunds', 'post', body, metadata);
    };
    /**
     * Returns all the refunds done on a checkout transaction.
     *
     * > This API is **deprecated**. It is advised to use the APIs under the section
     * [Refunds](#tag/Refunds).
     *
     *
     * @summary Retrieve Refunds of Checkout
     */
    SDK.prototype.getV1CheckoutRefunds = function (metadata) {
        return this.core.fetch('/checkout/v1/checkouts/{checkoutId}/refunds', 'get', metadata);
    };
    /**
     * Returns the refund transaction identified by a refund ID.
     *
     * > This API is **deprecated**. It is advised to use the APIs under the section
     * [Refunds](#tag/Refunds).
     *
     *
     * @summary Retrieve Refund Info
     */
    SDK.prototype.getV1CheckoutRefund = function (metadata) {
        return this.core.fetch('/checkout/v1/checkouts/{checkoutId}/refunds/{refundId}', 'get', metadata);
    };
    /**
     * Retrieve the transaction information by supplying its payment ID.
     *
     * @summary Retrieve Payment via ID
     */
    SDK.prototype.getPaymentViaPaymentId = function (metadata) {
        return this.core.fetch('/payments/v1/payments/{paymentId}', 'get', metadata);
    };
    /**
     * Void the transaction identified by the payment ID.
     *
     * @summary Void Payment via ID
     */
    SDK.prototype.voidV1PaymentViaIdViaDeleteMethod = function (body, metadata) {
        return this.core.fetch('/payments/v1/payments/{paymentId}', 'delete', body, metadata);
    };
    /**
     * Retrieve the transaction/s information by supplying a merchant's request reference
     * number. The resulting response is an array of payment information.
     *
     *
     * @summary Retrieve Payment via RRN
     */
    SDK.prototype.getPaymentViaRequestReferenceNumber = function (metadata) {
        return this.core.fetch('/payments/v1/payment-rrns/{rrn}', 'get', metadata);
    };
    /**
     * A simplified version of the *Retrieve Payment via ID* API. This only returns the payment
     * status.
     *
     * @summary Retrieve Payment Status
     */
    SDK.prototype.getPaymentStatusViaPaymentId = function (metadata) {
        return this.core.fetch('/payments/v1/payments/{paymentId}/status', 'get', metadata);
    };
    /**
     * Registers a webhook URL for a specific transaction event on which the merchant wants to
     * be notified of.
     *
     * @summary Create Webhook
     */
    SDK.prototype.createV1Webhook = function (body) {
        return this.core.fetch('/payments/v1/webhooks', 'post', body);
    };
    /**
     * Retrieves a list of webhooks that a merchant registered.
     *
     * @summary Get Webhooks
     */
    SDK.prototype.getV1Webhooks = function () {
        return this.core.fetch('/payments/v1/webhooks', 'get');
    };
    /**
     * Retrieves a webhook via a webhook ID.
     *
     * @summary Get Webhook
     */
    SDK.prototype.getV1Webhook = function (metadata) {
        return this.core.fetch('/payments/v1/webhooks/{webhookId}', 'get', metadata);
    };
    /**
     * Change the URL of a registered webhook.
     *
     * @summary Update Webhook
     */
    SDK.prototype.updateV1Webhook = function (body, metadata) {
        return this.core.fetch('/payments/v1/webhooks/{webhookId}', 'put', body, metadata);
    };
    /**
     * Removes a registered webhook from a merchant.
     *
     * > The API returns the last state of the webhook upon successful deletion.
     *
     *
     * @summary Delete Webhook
     */
    SDK.prototype.deleteV1Webhook = function (metadata) {
        return this.core.fetch('/payments/v1/webhooks/{webhookId}', 'delete', metadata);
    };
    /**
     * Void the transaction identified by the payment ID.
     *
     * @summary Void Payment via ID
     */
    SDK.prototype.voidV1PaymentViaIdViaPostMethod = function (body, metadata) {
        return this.core.fetch('/payments/v1/payments/{paymentId}/voids', 'post', body, metadata);
    };
    /**
     * Retrieves a list of void transactions associated to a payment transaction.
     *
     * @summary Retrieve Void Transactions
     */
    SDK.prototype.getV1VoidsOfPayment = function (metadata) {
        return this.core.fetch('/payments/v1/payments/{paymentId}/voids', 'get', metadata);
    };
    /**
     * Voids the transaction identified by the merchant's request reference number.
     *
     * > If the RRN is not a unique identifier by the merchant, the [Void via Payment
     * ID](#operation/voidV1PaymentViaIdViaPostMethod) should be used instead.
     *
     *
     * @summary Void Payment via RRN
     */
    SDK.prototype.voidV1PaymentViaRrn = function (body, metadata) {
        return this.core.fetch('/payments/v1/payment-rrns/{rrn}/voids', 'post', body, metadata);
    };
    /**
     * Retrieves a void transaction identified by the provided payment ID and void ID.
     *
     * @summary Retrieve Void Transaction
     */
    SDK.prototype.getV1VoidOfPayment = function (metadata) {
        return this.core.fetch('/payments/v1/payments/{paymentId}/voids/{voidId}', 'get', metadata);
    };
    /**
     * Refund the transaction identified by the payment ID.
     *
     * @summary Refund Payment via ID
     */
    SDK.prototype.refundV1PaymentViaId = function (body, metadata) {
        return this.core.fetch('/payments/v1/payments/{paymentId}/refunds', 'post', body, metadata);
    };
    /**
     * Retrieves a list of refund transactions associated to a payment transaction.
     *
     * @summary Retrieve Refund Transactions
     */
    SDK.prototype.getV1RefundsOfPayment = function (metadata) {
        return this.core.fetch('/payments/v1/payments/{paymentId}/refunds', 'get', metadata);
    };
    /**
     * Refunds the transaction identified by the merchant's request reference number.
     *
     * > If the RRN is not a unique identifier by the merchant, the [Refund via Payment
     * ID](#operation/refundV1PaymentViaId) should be used instead.
     *
     *
     * @summary Refund Payment via RRN
     */
    SDK.prototype.refundV1PaymentViaRrn = function (body, metadata) {
        return this.core.fetch('/payments/v1/payment-rrns/{rrn}/refunds', 'post', body, metadata);
    };
    /**
     * Retrieves a refund transaction identified by the provided payment ID and refund ID.
     *
     * @summary Retrieve Refund Transaction
     */
    SDK.prototype.getV1RefundOfPayment = function (metadata) {
        return this.core.fetch('/payments/v1/payments/{paymentId}/refunds/{refundId}', 'get', metadata);
    };
    /**
     * Cancel the transaction identified by the payment ID.
     *
     * @summary Cancel Payment via ID
     */
    SDK.prototype.cancelV1PaymentViaIdViaPostMethod = function (metadata) {
        return this.core.fetch('/payments/v1/payments/{paymentId}/cancel', 'post', metadata);
    };
    /**
     * Provides customization settings for the merchant to change some elements on the user
     * interface.
     *
     * @summary Set Customizations
     */
    SDK.prototype.setV1Customizations = function (body) {
        return this.core.fetch('/payments/v1/customizations', 'post', body);
    };
    /**
     * Retrieves the customizations that are set by the merchant.
     *
     * @summary Retrieve Customizations
     */
    SDK.prototype.getV1Customizations = function () {
        return this.core.fetch('/payments/v1/customizations', 'get');
    };
    /**
     * Removes the customizations set and use the default look-and-feel of the payment user
     * interface.
     *
     * @summary Remove Customizations
     */
    SDK.prototype.deleteV1Customizations = function () {
        return this.core.fetch('/payments/v1/customizations', 'delete');
    };
    return SDK;
}());
var createSDK = (function () { return new SDK(); })();
module.exports = createSDK;
