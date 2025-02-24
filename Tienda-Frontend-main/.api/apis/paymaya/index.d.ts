import type * as types from './types';
import type { ConfigOptions, FetchResponse } from 'api/dist/core';
import Oas from 'oas';
import APICore from 'api/dist/core';
declare class SDK {
    spec: Oas;
    core: APICore;
    constructor();
    /**
     * Optionally configure various options that the SDK allows.
     *
     * @param config Object of supported SDK options and toggles.
     * @param config.timeout Override the default `fetch` request timeout of 30 seconds. This number
     * should be represented in milliseconds.
     */
    config(config: ConfigOptions): void;
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
    auth(...values: string[] | number[]): this;
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
    server(url: string, variables?: {}): void;
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
    createV1Checkout(body: types.CreateV1CheckoutBodyParam): Promise<FetchResponse<200, types.CreateV1CheckoutResponse200>>;
    /**
     * Retrieves information about the checkout transaction.
     *
     * > This API is **deprecated**. It is advised to use the APIs under the section [Payments
     * Info](#tag/Payments-Info).
     *
     *
     * @summary Retrieve Checkout Info
     */
    getV1Checkout(metadata: types.GetV1CheckoutMetadataParam): Promise<FetchResponse<200, types.GetV1CheckoutResponse200>>;
    /**
     * Voids a checkout transaction.
     *
     * > This API is **deprecated**. It is advised to use the APIs under the section
     * [Voids](#tag/Voids).
     *
     *
     * @summary Void Checkout
     */
    voidV1Checkout(body: types.VoidV1CheckoutBodyParam, metadata: types.VoidV1CheckoutMetadataParam): Promise<FetchResponse<200, types.VoidV1CheckoutResponse200>>;
    /**
     * Returns all the void transactions done on a checkout.
     *
     * @summary Retrieve Voids of Checkout
     */
    getV1CheckoutVoids(metadata: types.GetV1CheckoutVoidsMetadataParam): Promise<FetchResponse<200, types.GetV1CheckoutVoidsResponse200>>;
    /**
     * Returns the refund transaction identified by a void ID.
     *
     * > This API is **deprecated**. It is advised to use the APIs under the section
     * [Voids](#tag/Voids).
     *
     *
     * @summary Retrive Void Info
     */
    getV1CheckoutVoid(metadata: types.GetV1CheckoutVoidMetadataParam): Promise<FetchResponse<200, types.GetV1CheckoutVoidResponse200>>;
    /**
     * Refunds a payment transaction.
     *
     * > This API is **deprecated**. It is advised to use the APIs under the section
     * [Refunds](#tag/Refunds).
     *
     *
     * @summary Refund Checkout
     */
    refundV1Checkout(body: types.RefundV1CheckoutBodyParam, metadata: types.RefundV1CheckoutMetadataParam): Promise<FetchResponse<200, types.RefundV1CheckoutResponse200>>;
    /**
     * Returns all the refunds done on a checkout transaction.
     *
     * > This API is **deprecated**. It is advised to use the APIs under the section
     * [Refunds](#tag/Refunds).
     *
     *
     * @summary Retrieve Refunds of Checkout
     */
    getV1CheckoutRefunds(metadata: types.GetV1CheckoutRefundsMetadataParam): Promise<FetchResponse<200, types.GetV1CheckoutRefundsResponse200>>;
    /**
     * Returns the refund transaction identified by a refund ID.
     *
     * > This API is **deprecated**. It is advised to use the APIs under the section
     * [Refunds](#tag/Refunds).
     *
     *
     * @summary Retrieve Refund Info
     */
    getV1CheckoutRefund(metadata: types.GetV1CheckoutRefundMetadataParam): Promise<FetchResponse<200, types.GetV1CheckoutRefundResponse200>>;
    /**
     * Retrieve the transaction information by supplying its payment ID.
     *
     * @summary Retrieve Payment via ID
     */
    getPaymentViaPaymentId(metadata: types.GetPaymentViaPaymentIdMetadataParam): Promise<FetchResponse<200, types.GetPaymentViaPaymentIdResponse200>>;
    /**
     * Void the transaction identified by the payment ID.
     *
     * @summary Void Payment via ID
     */
    voidV1PaymentViaIdViaDeleteMethod(body: types.VoidV1PaymentViaIdViaDeleteMethodBodyParam, metadata: types.VoidV1PaymentViaIdViaDeleteMethodMetadataParam): Promise<FetchResponse<200, types.VoidV1PaymentViaIdViaDeleteMethodResponse200>>;
    /**
     * Retrieve the transaction/s information by supplying a merchant's request reference
     * number. The resulting response is an array of payment information.
     *
     *
     * @summary Retrieve Payment via RRN
     */
    getPaymentViaRequestReferenceNumber(metadata: types.GetPaymentViaRequestReferenceNumberMetadataParam): Promise<FetchResponse<200, types.GetPaymentViaRequestReferenceNumberResponse200>>;
    /**
     * A simplified version of the *Retrieve Payment via ID* API. This only returns the payment
     * status.
     *
     * @summary Retrieve Payment Status
     */
    getPaymentStatusViaPaymentId(metadata: types.GetPaymentStatusViaPaymentIdMetadataParam): Promise<FetchResponse<200, types.GetPaymentStatusViaPaymentIdResponse200>>;
    /**
     * Registers a webhook URL for a specific transaction event on which the merchant wants to
     * be notified of.
     *
     * @summary Create Webhook
     */
    createV1Webhook(body: types.CreateV1WebhookBodyParam): Promise<FetchResponse<200, types.CreateV1WebhookResponse200>>;
    /**
     * Retrieves a list of webhooks that a merchant registered.
     *
     * @summary Get Webhooks
     */
    getV1Webhooks(): Promise<FetchResponse<200, types.GetV1WebhooksResponse200>>;
    /**
     * Retrieves a webhook via a webhook ID.
     *
     * @summary Get Webhook
     */
    getV1Webhook(metadata: types.GetV1WebhookMetadataParam): Promise<FetchResponse<200, types.GetV1WebhookResponse200>>;
    /**
     * Change the URL of a registered webhook.
     *
     * @summary Update Webhook
     */
    updateV1Webhook(body: types.UpdateV1WebhookBodyParam, metadata: types.UpdateV1WebhookMetadataParam): Promise<FetchResponse<200, types.UpdateV1WebhookResponse200>>;
    /**
     * Removes a registered webhook from a merchant.
     *
     * > The API returns the last state of the webhook upon successful deletion.
     *
     *
     * @summary Delete Webhook
     */
    deleteV1Webhook(metadata: types.DeleteV1WebhookMetadataParam): Promise<FetchResponse<200, types.DeleteV1WebhookResponse200>>;
    /**
     * Void the transaction identified by the payment ID.
     *
     * @summary Void Payment via ID
     */
    voidV1PaymentViaIdViaPostMethod(body: types.VoidV1PaymentViaIdViaPostMethodBodyParam, metadata: types.VoidV1PaymentViaIdViaPostMethodMetadataParam): Promise<FetchResponse<200, types.VoidV1PaymentViaIdViaPostMethodResponse200>>;
    /**
     * Retrieves a list of void transactions associated to a payment transaction.
     *
     * @summary Retrieve Void Transactions
     */
    getV1VoidsOfPayment(metadata: types.GetV1VoidsOfPaymentMetadataParam): Promise<FetchResponse<200, types.GetV1VoidsOfPaymentResponse200>>;
    /**
     * Voids the transaction identified by the merchant's request reference number.
     *
     * > If the RRN is not a unique identifier by the merchant, the [Void via Payment
     * ID](#operation/voidV1PaymentViaIdViaPostMethod) should be used instead.
     *
     *
     * @summary Void Payment via RRN
     */
    voidV1PaymentViaRrn(body: types.VoidV1PaymentViaRrnBodyParam, metadata: types.VoidV1PaymentViaRrnMetadataParam): Promise<FetchResponse<200, types.VoidV1PaymentViaRrnResponse200>>;
    /**
     * Retrieves a void transaction identified by the provided payment ID and void ID.
     *
     * @summary Retrieve Void Transaction
     */
    getV1VoidOfPayment(metadata: types.GetV1VoidOfPaymentMetadataParam): Promise<FetchResponse<200, types.GetV1VoidOfPaymentResponse200>>;
    /**
     * Refund the transaction identified by the payment ID.
     *
     * @summary Refund Payment via ID
     */
    refundV1PaymentViaId(body: types.RefundV1PaymentViaIdBodyParam, metadata: types.RefundV1PaymentViaIdMetadataParam): Promise<FetchResponse<200, types.RefundV1PaymentViaIdResponse200>>;
    /**
     * Retrieves a list of refund transactions associated to a payment transaction.
     *
     * @summary Retrieve Refund Transactions
     */
    getV1RefundsOfPayment(metadata: types.GetV1RefundsOfPaymentMetadataParam): Promise<FetchResponse<200, types.GetV1RefundsOfPaymentResponse200>>;
    /**
     * Refunds the transaction identified by the merchant's request reference number.
     *
     * > If the RRN is not a unique identifier by the merchant, the [Refund via Payment
     * ID](#operation/refundV1PaymentViaId) should be used instead.
     *
     *
     * @summary Refund Payment via RRN
     */
    refundV1PaymentViaRrn(body: types.RefundV1PaymentViaRrnBodyParam, metadata: types.RefundV1PaymentViaRrnMetadataParam): Promise<FetchResponse<200, types.RefundV1PaymentViaRrnResponse200>>;
    /**
     * Retrieves a refund transaction identified by the provided payment ID and refund ID.
     *
     * @summary Retrieve Refund Transaction
     */
    getV1RefundOfPayment(metadata: types.GetV1RefundOfPaymentMetadataParam): Promise<FetchResponse<200, types.GetV1RefundOfPaymentResponse200>>;
    /**
     * Cancel the transaction identified by the payment ID.
     *
     * @summary Cancel Payment via ID
     */
    cancelV1PaymentViaIdViaPostMethod(metadata: types.CancelV1PaymentViaIdViaPostMethodMetadataParam): Promise<FetchResponse<200, types.CancelV1PaymentViaIdViaPostMethodResponse200>>;
    /**
     * Provides customization settings for the merchant to change some elements on the user
     * interface.
     *
     * @summary Set Customizations
     */
    setV1Customizations(body: types.SetV1CustomizationsBodyParam): Promise<FetchResponse<200, types.SetV1CustomizationsResponse200>>;
    /**
     * Retrieves the customizations that are set by the merchant.
     *
     * @summary Retrieve Customizations
     */
    getV1Customizations(): Promise<FetchResponse<200, types.GetV1CustomizationsResponse200>>;
    /**
     * Removes the customizations set and use the default look-and-feel of the payment user
     * interface.
     *
     * @summary Remove Customizations
     */
    deleteV1Customizations(): Promise<FetchResponse<number, unknown>>;
}
declare const createSDK: SDK;
export = createSDK;
