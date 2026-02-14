/**
 * PPCP Provide Information Modal Component
 * For Card/Paze vendors - contains Tracking Number, Carrier Name, Refund ID fields
 */

import React from 'react';
import { Modal, Input, Button } from 'antd';
import { useDisputeModals } from './DisputeModalsContext';
import { shouldShowProofOfFulfillment } from './utils';

export const PPCPProvideInfoModal: React.FC = () => {
  const {
    ppcpModalVisible,
    ppcpProvideInfo,
    actionRecord,
    closePPCPModal,
    handlePPCPFieldChange,
  } = useDisputeModals();

  return (
    <Modal
      title="Provide Information"
      open={ppcpModalVisible}
      onCancel={closePPCPModal}
      width={500}
      footer={
        <Button type="primary" onClick={closePPCPModal}>
          Done
        </Button>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Hint text */}
        <div style={{ color: '#666', fontSize: 14, marginBottom: 8 }}>
          For different reasons of dispute, the type of evidence will be
          different.
        </div>

        {/* Proof of Fulfillment Section */}
        {shouldShowProofOfFulfillment(actionRecord) && (
          <div
            style={{
              border: '1px solid #e8e8e8',
              borderRadius: 4,
              padding: 16,
              background: '#fafafa',
            }}
          >
            <div style={{ marginBottom: 16, fontWeight: 600, fontSize: 14 }}>
              Proof of Fulfillment
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ width: 120, fontSize: 13, color: '#666' }}>
                  Tracking Number:
                </div>
                <Input
                  value={ppcpProvideInfo.trackNum}
                  onChange={(e) =>
                    handlePPCPFieldChange('trackNum', e.target.value)
                  }
                  placeholder="Enter tracking number"
                  style={{ flex: 1 }}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ width: 120, fontSize: 13, color: '#666' }}>
                  Carrier Name:
                </div>
                <Input
                  value={ppcpProvideInfo.carrierName}
                  onChange={(e) =>
                    handlePPCPFieldChange('carrierName', e.target.value)
                  }
                  placeholder="Enter carrier name"
                  style={{ flex: 1 }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Proof of Refund Section */}
        <div
          style={{
            border: '1px solid #e8e8e8',
            borderRadius: 4,
            padding: 16,
            background: '#fafafa',
          }}
        >
          <div style={{ marginBottom: 16, fontWeight: 600, fontSize: 14 }}>
            Proof of Refund
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ width: 120, fontSize: 13, color: '#666' }}>
              Refund ID/Reference:
            </div>
            <Input
              value={ppcpProvideInfo.refId}
              onChange={(e) => handlePPCPFieldChange('refId', e.target.value)}
              placeholder="Enter refund ID or reference"
              style={{ flex: 1 }}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default PPCPProvideInfoModal;
