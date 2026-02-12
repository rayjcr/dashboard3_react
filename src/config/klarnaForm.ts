/**
 * Klarna Form Configuration
 */

export interface KlarnaFormOption {
  value: string;
  label: string;
}

export interface KlarnaFormField {
  label: string;
  key: string;
  type: 'Text' | 'TextArea' | 'DropDown' | 'Date' | 'UploadFile';
  value?: KlarnaFormOption[];
  maxLength?: number;
  minLength?: number;
}

export interface KlarnaDisplayForm {
  KlarnaForm: KlarnaFormField[];
  KlarnaFormShipments: KlarnaFormField[][];
}

export interface KlarnaShipmentData {
  capture_id?: string;
  is_shipping_company_contacted?: string;
  shipping_carrier?: string;
  shipping_date?: string;
  tracking_id?: string;
}

export interface KlarnaProvideInfoData {
  [key: string]: string | KlarnaShipmentData[] | undefined;
  list_of_shipments?: KlarnaShipmentData[];
}

const IsShippingCompanyContacted: KlarnaFormOption[] = [
  {
    value:
      'yes_and_the_shipping_company_is_currently_attempting_to_recall_the_order',
    label:
      'Yes, the shipping company is currently attempting to recall the order',
  },
  {
    value: 'yes_and_the_order_was_delivered_back_to_us',
    label: 'Yes, the order was delivered back to us',
  },
  {
    value: 'yes_but_order_has_already_been_delivered',
    label: 'Yes, but order has already been delivered',
  },
  {
    value: 'no_but_we_will_do_as_soon_as_possible',
    label: 'No, but we will do as soon as possible',
  },
  {
    value:
      'no_but_we_allow_klarna_to_reach_out_to_the_shipping_company_in_order_to_try_to_stop_the_order',
    label:
      'No, but we allow Klarna to reach out to the shipping company in order to try to stop the order',
  },
  {
    value: 'order_was_shipped_without_a_tracking_id_and_cannot_be_recalled',
    label: 'Order was shipped without a tracking id and cannot be recalled',
  },
];

const YesOrNo: KlarnaFormOption[] = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
];

const YesOrNoForCancell: KlarnaFormOption[] = [
  { value: 'yes_will_cancel', label: 'Yes, will cancel' },
  { value: 'no', label: 'No' },
];

const GoodsReturned: KlarnaFormOption[] = [
  { value: 'yes_in_full', label: 'Yes' },
  { value: 'yes_partially', label: 'Yes,Partially' },
  { value: 'no', label: 'No' },
];

const IsOrderShipped: KlarnaFormOption[] = [
  { value: 'yes_in_full', label: 'Yes' },
  { value: 'yes_partially', label: 'Yes,Partially' },
  { value: 'no_will_cancel_the_order', label: 'No, order will be canceled' },
];

const ShippingCarrier: KlarnaFormOption[] = [
  { value: 'postnord', label: 'Postnord' },
  { value: 'bring', label: 'Bring' },
  { value: 'dhl', label: 'DHL' },
  { value: 'ups', label: 'UPS' },
  { value: 'db_schenker', label: 'DB Schenker' },
  { value: 'posten_bring', label: 'Posten Bring' },
  { value: 'gls', label: 'GLS' },
  { value: 'swipbox', label: 'Swipbox' },
  { value: 'posti', label: 'Posti' },
  {
    value: 'posti_packagestation_service_smartpost',
    label: 'Posti Packagestation Service Smartpost',
  },
  { value: 'matkahuolto', label: 'Matkahuolto' },
  { value: 'deutsche_post', label: 'Deutsche Post' },
  { value: 'hermes', label: 'Hermes' },
  { value: 'dpd', label: 'DPD' },
  { value: 'osterreichische_post', label: 'Osterreichische Post' },
  { value: 'post_nl', label: 'Post NL' },
  { value: 'kiala', label: 'Kiala' },
  { value: 'fedex', label: 'Fedex' },
  { value: 'usps', label: 'USPS' },
  { value: 'laser_ship', label: 'Laser Ship' },
  { value: 'canpar', label: 'Canpar' },
  { value: 'shipping_chimp', label: 'Shipping Chimp' },
  { value: 'canpost', label: 'Canpost' },
  { value: 'purolator', label: 'Purolator' },
  { value: 'other', label: 'Other' },
  { value: 'order_not_sent', label: 'Order not sent' },
];

const OrderType: KlarnaFormOption[] = [
  { value: 'services', label: 'Services' },
  { value: 'physical_goods', label: 'Physical Goods' },
  { value: 'tickets_travel', label: 'Tickets Travel' },
];

const ReceivedPayment: KlarnaFormOption[] = [
  {
    value: 'yes_will_make_changes_to_order',
    label: 'Yes, will make changes to the order',
  },
  {
    value: 'yes_refunded_consumer',
    label: 'Yes, but the funds have been refunded to the consumer',
  },
  { value: 'not_received_payment', label: 'Not received payment' },
];

const ReturnInfo: KlarnaFormOption[] = [
  {
    value: 'yes_will_make_changes_to_order',
    label: 'Yes, will make changes to the order',
  },
  { value: 'yes_but_not_accepted', label: 'Yes, but not accepted' },
  { value: 'return_not_received', label: 'Not received' },
];

const ServiceDeliveredBy: KlarnaFormOption[] = [
  { value: 'email', label: 'Email' },
  { value: 'online', label: 'Online' },
  { value: 'phone', label: 'Phone' },
  { value: 'physically', label: 'Physically' },
  { value: 'other', label: 'Other' },
];

const Country: KlarnaFormOption[] = [
  { value: 'at', label: 'AT' },
  { value: 'de', label: 'DE' },
  { value: 'es', label: 'ES' },
  { value: 'it', label: 'IT' },
  { value: 'fr', label: 'FR' },
  { value: 'be', label: 'BE' },
  { value: 'nl', label: 'NL' },
  { value: 'ie', label: 'IE' },
  { value: 'fi', label: 'FI' },
  { value: 'gr', label: 'GR' },
  { value: 'pt', label: 'PT' },
  { value: 'se', label: 'SE' },
  { value: 'no', label: 'NO' },
  { value: 'dk', label: 'DK' },
  { value: 'gb', label: 'GB' },
  { value: 'us', label: 'US' },
  { value: 'ca', label: 'CA' },
  { value: 'au', label: 'AU' },
  { value: 'nz', label: 'NZ' },
  { value: 'pl', label: 'PL' },
  { value: 'cz', label: 'CZ' },
  { value: 'ro', label: 'RO' },
  { value: 'ch', label: 'CH' },
  { value: 'mx', label: 'MX' },
  { value: 'other', label: 'Other' },
];

export const KlarnaForm: KlarnaFormField[] = [
  {
    label: 'Capture ID',
    key: 'capture_id',
    type: 'Text',
  },
  {
    label: 'The customer has been contacted',
    key: 'customer_has_been_contacted',
    type: 'DropDown',
    value: YesOrNo,
  },
  {
    label: 'Delivered with proof',
    key: 'delivered_with_proof',
    type: 'DropDown',
    value: YesOrNo,
  },
  {
    label: 'Delivery address',
    key: 'delivery_address',
    type: 'TextArea',
    maxLength: 5000,
  },
  {
    label: 'Goods returned',
    key: 'goods_returned',
    type: 'DropDown',
    value: GoodsReturned,
  },
  {
    label: 'Is order shipped',
    key: 'is_order_shipped',
    type: 'DropDown',
    value: IsOrderShipped,
  },
  {
    label: 'Is shipping company contacted',
    key: 'is_shipping_company_contacted',
    type: 'DropDown',
    value: IsShippingCompanyContacted,
  },
  {
    label: 'Is travel order',
    key: 'is_travel_order',
    type: 'DropDown',
    value: YesOrNoForCancell,
  },
  {
    label: 'Last digits of phone for delivery notification',
    key: 'last_digits_of_phone_for_delivery_notification',
    type: 'Text',
    minLength: 3,
  },
  {
    label: 'Order already shipped',
    key: 'order_already_shipped',
    type: 'DropDown',
    value: GoodsReturned,
  },
  {
    label: 'Order already used',
    key: 'order_already_used',
    type: 'DropDown',
    value: GoodsReturned,
  },
  {
    label: 'Order is cancellable',
    key: 'order_is_cancellable',
    type: 'DropDown',
    value: YesOrNoForCancell,
  },
  {
    label: 'Order is refundable',
    key: 'order_is_refundable',
    type: 'DropDown',
    value: GoodsReturned,
  },
  {
    label: 'Order Type',
    key: 'order_type',
    type: 'DropDown',
    value: OrderType,
  },
  {
    label: 'Proof of Delivery',
    key: 'proof_of_delivery',
    type: 'UploadFile',
  },
  {
    label: 'Received Payment',
    key: 'received_payment',
    type: 'DropDown',
    value: ReceivedPayment,
  },
  {
    label: 'Retrun Info',
    key: 'return_info',
    type: 'DropDown',
    value: ReturnInfo,
  },
  {
    label: 'Service Already Used',
    key: 'service_already_used',
    type: 'DropDown',
    value: YesOrNo,
  },
  {
    label: 'Service Delivered By',
    key: 'service_delivered_by',
    type: 'DropDown',
    value: ServiceDeliveredBy,
  },
  {
    label: 'Shipments Country',
    key: 'shipment_country',
    type: 'DropDown',
    value: Country,
  },
  {
    label: 'Shipments Carrier',
    key: 'shipping_carrier',
    type: 'DropDown',
    value: ShippingCarrier,
  },
  {
    label: 'Shipping Date',
    key: 'shipping_date',
    type: 'Date',
    maxLength: 100,
  },
  {
    label: 'Tracking Id',
    key: 'tracking_id',
    type: 'TextArea',
    maxLength: 100,
  },
];

export const KlarnaFormShipments: KlarnaFormField[] = [
  {
    label: 'Capture ID',
    key: 'capture_id',
    type: 'Text',
    maxLength: 100,
  },
  {
    label: 'Is shipping company contacted',
    key: 'is_shipping_company_contacted',
    type: 'DropDown',
    value: IsShippingCompanyContacted,
  },
  {
    label: 'Shipping carrier',
    key: 'shipping_carrier',
    type: 'DropDown',
    value: ShippingCarrier,
  },
  {
    label: 'Shipping date',
    key: 'shipping_date',
    type: 'TextArea',
    maxLength: 100,
  },
  {
    label: 'Tracking id',
    key: 'tracking_id',
    type: 'TextArea',
    maxLength: 100,
  },
];

/**
 * Parse requests JSON and generate display form
 */
export function parseKlarnaRequests(requests: string | null | undefined): {
  displayKlarnaForm: KlarnaDisplayForm[];
  isMultiShipments: boolean[];
  hasShipments: boolean;
  requestIds: number[];
} {
  const displayKlarnaForm: KlarnaDisplayForm[] = [];
  const isMultiShipments: boolean[] = [];
  const requestIds: number[] = [];
  let hasShipments = false;

  if (!requests) {
    return { displayKlarnaForm, isMultiShipments, hasShipments, requestIds };
  }

  try {
    const requestsObj = JSON.parse(requests);

    for (let i = 0; i < requestsObj.length; i++) {
      displayKlarnaForm[i] = {
        KlarnaForm: [],
        KlarnaFormShipments: [[]],
      };

      // Store request_id
      requestIds[i] = requestsObj[i].request_id || i + 1;

      if (
        requestsObj[i].requested_fields &&
        requestsObj[i].requested_fields.length > 0
      ) {
        for (let j = 0; j < requestsObj[i].requested_fields.length; j++) {
          const fieldKey = requestsObj[i].requested_fields[j];

          // Filter general fields (exclude shipment and list_of_shipments)
          if (fieldKey !== 'shipment' && fieldKey !== 'list_of_shipments') {
            const generalFields = KlarnaForm.filter(
              (item) => item.key === fieldKey,
            );
            displayKlarnaForm[i].KlarnaForm =
              displayKlarnaForm[i].KlarnaForm.concat(generalFields);
          }
        }

        // Check if shipments are included
        if (
          requestsObj[i].requested_fields.includes('list_of_shipments') ||
          requestsObj[i].requested_fields.includes('shipment')
        ) {
          displayKlarnaForm[i].KlarnaFormShipments[0] = [
            ...KlarnaFormShipments,
          ];
          hasShipments = true;
        }

        // Check if multi shipments
        if (requestsObj[i].requested_fields.includes('list_of_shipments')) {
          isMultiShipments[i] = true;
        } else {
          isMultiShipments[i] = false;
        }
      }
    }
  } catch (error) {
    console.error('Failed to parse Klarna requests:', error);
  }

  return { displayKlarnaForm, isMultiShipments, hasShipments, requestIds };
}

/**
 * Create initial Klarna provide info data
 */
export function createInitialKlarnaProvideInfo(
  displayKlarnaForm: KlarnaDisplayForm[],
): KlarnaProvideInfoData[] {
  const klarnaProvideInfo: KlarnaProvideInfoData[] = [];

  for (let i = 0; i < displayKlarnaForm.length; i++) {
    klarnaProvideInfo[i] = {};

    // Initialize list_of_shipments if needed
    if (
      displayKlarnaForm[i].KlarnaFormShipments[0] &&
      displayKlarnaForm[i].KlarnaFormShipments[0].length > 0
    ) {
      klarnaProvideInfo[i].list_of_shipments = [{}];
    }
  }

  return klarnaProvideInfo;
}
