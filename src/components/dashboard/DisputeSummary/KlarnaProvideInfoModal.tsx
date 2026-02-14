/**
 * Klarna Provide Information Modal Component
 * Dynamic form generated from Klarna requests
 */

import React, { useCallback } from 'react';
import {
  Modal,
  Input,
  Button,
  Select,
  DatePicker,
  Upload,
  Tooltip,
} from 'antd';
import { UploadOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import {
  KlarnaFormShipments as KlarnaFormShipmentsConfig,
  type KlarnaFormField,
  type KlarnaShipmentData,
} from '@/config/klarnaForm';
import { useDisputeModals } from './DisputeModalsContext';

export const KlarnaProvideInfoModal: React.FC = () => {
  const {
    klarnaModalVisible,
    klarnaDisplayForm,
    klarnaProvideInfo,
    klarnaIsMultiShipments,
    klarnaHasShipments,
    closeKlarnaModal,
    setKlarnaDisplayForm,
    setKlarnaProvideInfo,
  } = useDisputeModals();

  // Handle Klarna form field change
  const handleKlarnaFieldChange = useCallback(
    (requestIndex: number, fieldKey: string, value: string | null) => {
      setKlarnaProvideInfo((prev) => {
        const newInfo = [...prev];
        if (!newInfo[requestIndex]) {
          newInfo[requestIndex] = {};
        }
        newInfo[requestIndex][fieldKey] = value || '';
        return newInfo;
      });
    },
    [setKlarnaProvideInfo],
  );

  // Handle Klarna shipment field change
  const handleKlarnaShipmentChange = useCallback(
    (
      requestIndex: number,
      shipmentIndex: number,
      fieldKey: string,
      value: string | null,
    ) => {
      setKlarnaProvideInfo((prev) => {
        const newInfo = [...prev];
        if (!newInfo[requestIndex]) {
          newInfo[requestIndex] = {};
        }
        if (!newInfo[requestIndex].list_of_shipments) {
          newInfo[requestIndex].list_of_shipments = [];
        }
        if (!newInfo[requestIndex].list_of_shipments![shipmentIndex]) {
          newInfo[requestIndex].list_of_shipments![shipmentIndex] = {};
        }
        newInfo[requestIndex].list_of_shipments![shipmentIndex][
          fieldKey as keyof KlarnaShipmentData
        ] = value || '';
        return newInfo;
      });
    },
    [setKlarnaProvideInfo],
  );

  // Handle add Klarna shipment
  const handleAddKlarnaShipment = useCallback(
    (requestIndex: number) => {
      setKlarnaProvideInfo((prev) => {
        const newInfo = [...prev];
        if (!newInfo[requestIndex]) {
          newInfo[requestIndex] = {};
        }
        if (!newInfo[requestIndex].list_of_shipments) {
          newInfo[requestIndex].list_of_shipments = [];
        }
        newInfo[requestIndex].list_of_shipments!.push({});
        return newInfo;
      });

      // Also add a new shipments form section
      setKlarnaDisplayForm((prev) => {
        const newDisplayForm = [...prev];
        if (newDisplayForm[requestIndex]) {
          newDisplayForm[requestIndex] = {
            ...newDisplayForm[requestIndex],
            KlarnaFormShipments: [
              ...newDisplayForm[requestIndex].KlarnaFormShipments,
              [...KlarnaFormShipmentsConfig],
            ],
          };
        }
        return newDisplayForm;
      });
    },
    [setKlarnaProvideInfo, setKlarnaDisplayForm],
  );

  // Handle remove Klarna shipment
  const handleRemoveKlarnaShipment = useCallback(
    (requestIndex: number, shipmentIndex: number) => {
      setKlarnaProvideInfo((prev) => {
        const newInfo = [...prev];
        if (newInfo[requestIndex]?.list_of_shipments) {
          newInfo[requestIndex].list_of_shipments!.splice(shipmentIndex, 1);
        }
        return newInfo;
      });

      // Also remove from display form
      setKlarnaDisplayForm((prev) => {
        const newDisplayForm = [...prev];
        if (newDisplayForm[requestIndex]?.KlarnaFormShipments) {
          newDisplayForm[requestIndex].KlarnaFormShipments.splice(
            shipmentIndex,
            1,
          );
        }
        return newDisplayForm;
      });
    },
    [setKlarnaProvideInfo, setKlarnaDisplayForm],
  );

  return (
    <Modal
      title="Provide Information"
      open={klarnaModalVisible}
      onCancel={closeKlarnaModal}
      width={700}
      footer={
        <Button type="primary" onClick={closeKlarnaModal}>
          Done
        </Button>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {klarnaDisplayForm.map((formSection, requestIndex) => (
          <div key={requestIndex}>
            {/* General Section */}
            {formSection.KlarnaForm.length > 0 && (
              <div
                style={{
                  border: '1px solid #e8e8e8',
                  borderRadius: 4,
                  padding: 16,
                  background: '#fafafa',
                  marginBottom: 16,
                }}
              >
                <div
                  style={{ marginBottom: 12, fontWeight: 600, fontSize: 14 }}
                >
                  General
                </div>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12,
                  }}
                >
                  {formSection.KlarnaForm.map((field: KlarnaFormField) => (
                    <div
                      key={field.key}
                      style={{ display: 'flex', alignItems: 'center' }}
                    >
                      <div
                        style={{
                          width: 220,
                          fontSize: 13,
                          color: '#666',
                          textAlign: 'right',
                          paddingRight: 8,
                          flexShrink: 0,
                        }}
                      >
                        {field.label}:
                      </div>
                      {field.type === 'DropDown' && field.value ? (
                        <Select
                          value={
                            (klarnaProvideInfo[requestIndex]?.[
                              field.key
                            ] as string) || undefined
                          }
                          onChange={(value) =>
                            handleKlarnaFieldChange(
                              requestIndex,
                              field.key,
                              value,
                            )
                          }
                          placeholder={`Select ${field.label.toLowerCase()}`}
                          style={{ flex: 1, minWidth: 0 }}
                          options={field.value.map((opt) => ({
                            value: opt.value,
                            label: opt.label,
                          }))}
                          labelRender={({ label }) => (
                            <Tooltip title={label} placement="topLeft">
                              <span
                                style={{
                                  display: 'block',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {label}
                              </span>
                            </Tooltip>
                          )}
                          allowClear
                        />
                      ) : field.type === 'Date' ? (
                        <DatePicker
                          value={
                            klarnaProvideInfo[requestIndex]?.[field.key]
                              ? dayjs(
                                  klarnaProvideInfo[requestIndex][
                                    field.key
                                  ] as string,
                                )
                              : null
                          }
                          onChange={(date) =>
                            handleKlarnaFieldChange(
                              requestIndex,
                              field.key,
                              date ? date.toISOString() : null,
                            )
                          }
                          style={{ flex: 1 }}
                        />
                      ) : field.type === 'TextArea' ? (
                        <Input.TextArea
                          value={
                            (klarnaProvideInfo[requestIndex]?.[
                              field.key
                            ] as string) || ''
                          }
                          onChange={(e) =>
                            handleKlarnaFieldChange(
                              requestIndex,
                              field.key,
                              e.target.value,
                            )
                          }
                          placeholder={`Enter ${field.label.toLowerCase()}`}
                          maxLength={field.maxLength}
                          rows={2}
                          style={{ flex: 1 }}
                        />
                      ) : field.type === 'UploadFile' ? (
                        <Upload
                          beforeUpload={() => false}
                          showUploadList={false}
                          accept=".png,.jpg,.jpeg,.pdf"
                        >
                          <Button icon={<UploadOutlined />}>
                            Upload {field.label}
                          </Button>
                        </Upload>
                      ) : (
                        <Input
                          value={
                            (klarnaProvideInfo[requestIndex]?.[
                              field.key
                            ] as string) || ''
                          }
                          onChange={(e) =>
                            handleKlarnaFieldChange(
                              requestIndex,
                              field.key,
                              e.target.value,
                            )
                          }
                          placeholder={`Enter ${field.label.toLowerCase()}`}
                          maxLength={field.maxLength}
                          minLength={field.minLength}
                          style={{ flex: 1 }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Shipments Section */}
            {klarnaHasShipments &&
              formSection.KlarnaFormShipments.length > 0 && (
                <div
                  style={{
                    border: '1px solid #e8e8e8',
                    borderRadius: 4,
                    padding: 16,
                    background: '#fafafa',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 12,
                    }}
                  >
                    <div style={{ fontWeight: 600, fontSize: 14 }}>
                      Shipments
                    </div>
                    {klarnaIsMultiShipments[requestIndex] && (
                      <Button
                        type="primary"
                        size="small"
                        onClick={() => handleAddKlarnaShipment(requestIndex)}
                      >
                        Add Shipments
                      </Button>
                    )}
                  </div>

                  {formSection.KlarnaFormShipments.map(
                    (shipmentFields, shipmentIndex) => (
                      <div
                        key={shipmentIndex}
                        style={{
                          border: '1px dashed #d9d9d9',
                          borderRadius: 4,
                          padding: 12,
                          marginBottom:
                            shipmentIndex <
                            formSection.KlarnaFormShipments.length - 1
                              ? 12
                              : 0,
                          background: '#fff',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: 12,
                          }}
                        >
                          <div
                            style={{
                              fontWeight: 500,
                              fontSize: 13,
                              color: '#666',
                            }}
                          >
                            Shipment #{shipmentIndex + 1}
                          </div>
                          {shipmentIndex > 0 && (
                            <Button
                              type="text"
                              size="small"
                              danger
                              icon={<DeleteOutlined />}
                              onClick={() =>
                                handleRemoveKlarnaShipment(
                                  requestIndex,
                                  shipmentIndex,
                                )
                              }
                            >
                              Remove
                            </Button>
                          )}
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 12,
                          }}
                        >
                          {shipmentFields.map((field: KlarnaFormField) => (
                            <div
                              key={field.key}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                              }}
                            >
                              <div
                                style={{
                                  width: 200,
                                  fontSize: 13,
                                  color: '#666',
                                  textAlign: 'right',
                                  paddingRight: 8,
                                  flexShrink: 0,
                                }}
                              >
                                {field.label}:
                              </div>
                              {field.type === 'DropDown' && field.value ? (
                                <Select
                                  value={
                                    klarnaProvideInfo[requestIndex]
                                      ?.list_of_shipments?.[shipmentIndex]?.[
                                      field.key as keyof KlarnaShipmentData
                                    ] || undefined
                                  }
                                  onChange={(value) =>
                                    handleKlarnaShipmentChange(
                                      requestIndex,
                                      shipmentIndex,
                                      field.key,
                                      value,
                                    )
                                  }
                                  placeholder={`Select ${field.label.toLowerCase()}`}
                                  style={{ flex: 1, minWidth: 0 }}
                                  options={field.value.map((opt) => ({
                                    value: opt.value,
                                    label: opt.label,
                                  }))}
                                  labelRender={({ label }) => (
                                    <Tooltip title={label} placement="topLeft">
                                      <span
                                        style={{
                                          display: 'block',
                                          overflow: 'hidden',
                                          textOverflow: 'ellipsis',
                                          whiteSpace: 'nowrap',
                                        }}
                                      >
                                        {label}
                                      </span>
                                    </Tooltip>
                                  )}
                                  allowClear
                                />
                              ) : field.type === 'TextArea' ? (
                                <Input.TextArea
                                  value={
                                    klarnaProvideInfo[requestIndex]
                                      ?.list_of_shipments?.[shipmentIndex]?.[
                                      field.key as keyof KlarnaShipmentData
                                    ] || ''
                                  }
                                  onChange={(e) =>
                                    handleKlarnaShipmentChange(
                                      requestIndex,
                                      shipmentIndex,
                                      field.key,
                                      e.target.value,
                                    )
                                  }
                                  placeholder={`Enter ${field.label.toLowerCase()}`}
                                  maxLength={field.maxLength}
                                  rows={2}
                                  style={{ flex: 1 }}
                                />
                              ) : (
                                <Input
                                  value={
                                    klarnaProvideInfo[requestIndex]
                                      ?.list_of_shipments?.[shipmentIndex]?.[
                                      field.key as keyof KlarnaShipmentData
                                    ] || ''
                                  }
                                  onChange={(e) =>
                                    handleKlarnaShipmentChange(
                                      requestIndex,
                                      shipmentIndex,
                                      field.key,
                                      e.target.value,
                                    )
                                  }
                                  placeholder={`Enter ${field.label.toLowerCase()}`}
                                  maxLength={field.maxLength}
                                  style={{ flex: 1 }}
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ),
                  )}
                </div>
              )}
          </div>
        ))}

        {/* Empty state when no form fields parsed */}
        {klarnaDisplayForm.length === 0 && (
          <div style={{ textAlign: 'center', padding: 24, color: '#999' }}>
            No requested fields available
          </div>
        )}
      </div>
    </Modal>
  );
};

export default KlarnaProvideInfoModal;
