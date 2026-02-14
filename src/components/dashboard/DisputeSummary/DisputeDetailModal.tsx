/**
 * Dispute Detail Modal Component
 * Displays dispute details including basic info and status change history
 */

import React from 'react';
import {
  Modal,
  Spin,
  Descriptions,
  Timeline,
  Empty,
  Tag,
  Typography,
  Button,
} from 'antd';
import type { DisputeNote } from '@/types/dashboard';
import { useDisputeModals } from './DisputeModalsContext';
import {
  getStatusTagColor,
  getStatusDisplayText,
  parseEvidence,
} from './utils';

const { Text } = Typography;

// Scoped styles for description HTML content
const descriptionStyles = `
  .dispute-description-content ul,
  .dispute-description-content ol {
    margin: 8px 0;
    padding-left: 20px;
    list-style-position: outside;
  }
  .dispute-description-content ul {
    list-style-type: disc;
  }
  .dispute-description-content ol {
    list-style-type: decimal;
  }
  .dispute-description-content li {
    margin: 4px 0;
    padding: 0;
    display: list-item;
  }
  .dispute-description-content p {
    margin: 8px 0;
  }
  .dispute-description-content a {
    color: #1890ff;
    text-decoration: underline;
  }
  .dispute-description-content table {
    border-collapse: collapse;
    margin: 8px 0;
  }
  .dispute-description-content th,
  .dispute-description-content td {
    border: 1px solid #d9d9d9;
    padding: 8px;
  }
`;

export const DisputeDetailModal: React.FC = () => {
  const {
    detailModalVisible,
    detailModalLoading,
    selectedRecord,
    disputeNotes,
    closeDetailModal,
  } = useDisputeModals();

  return (
    <Modal
      title="Dispute Detail"
      open={detailModalVisible}
      onCancel={closeDetailModal}
      footer={[
        <Button key="close" onClick={closeDetailModal}>
          Close
        </Button>,
      ]}
      width={700}
      styles={{ body: { maxHeight: '60vh', overflowY: 'auto' } }}
    >
      {detailModalLoading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Spin size="large" />
        </div>
      ) : (
        <>
          {/* Basic Info */}
          <Descriptions
            bordered
            column={1}
            size="small"
            style={{ marginBottom: 24 }}
          >
            <Descriptions.Item label="Dispute case ID">
              {selectedRecord?.caseId || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Description">
              {selectedRecord?.description ? (
                <div
                  className="dispute-description-content"
                  dangerouslySetInnerHTML={{
                    __html: selectedRecord.description,
                  }}
                  style={{
                    all: 'revert',
                    fontSize: 14,
                    lineHeight: 1.6,
                    color: '#333',
                  }}
                />
              ) : (
                '-'
              )}
            </Descriptions.Item>
          </Descriptions>

          {/* Scoped styles for description HTML content */}
          <style>{descriptionStyles}</style>

          {/* Status Change History */}
          <div style={{ marginBottom: 16 }}>
            <Text strong style={{ fontSize: 14 }}>
              Status Change History
            </Text>
          </div>

          {disputeNotes.length > 0 ? (
            <Timeline
              items={disputeNotes.map((note: DisputeNote, index: number) => {
                const evidenceList = parseEvidence(note.evidence);
                return {
                  key: index,
                  color: getStatusTagColor(note.status),
                  children: (
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ marginBottom: 8 }}>
                        <Tag color={getStatusTagColor(note.status)}>
                          {getStatusDisplayText(note.status)}
                        </Tag>
                        <Text
                          type="secondary"
                          style={{ marginLeft: 8, fontSize: 12 }}
                        >
                          Updated: {note.time_updated || '-'}
                        </Text>
                      </div>
                      <div
                        style={{
                          background: '#f5f5f5',
                          padding: 12,
                          borderRadius: 4,
                          border: '1px solid #e8e8e8',
                        }}
                      >
                        <div style={{ marginBottom: 8 }}>
                          <Text strong style={{ fontSize: 12, color: '#333' }}>
                            From:{' '}
                          </Text>
                          <Text style={{ fontSize: 12, color: '#666' }}>
                            {note.note_from || '-'}
                          </Text>
                        </div>
                        <div style={{ marginBottom: 8 }}>
                          <Text strong style={{ fontSize: 12, color: '#333' }}>
                            Note:{' '}
                          </Text>
                          {note.note ? (
                            <div
                              className="dispute-description-content"
                              dangerouslySetInnerHTML={{
                                __html: note.note
                                  .replace(/\n/g, '<br />')
                                  .replace(/\\n/g, '<br />'),
                              }}
                              style={{
                                fontSize: 12,
                                color: '#666',
                                marginTop: 4,
                              }}
                            />
                          ) : (
                            <Text style={{ fontSize: 12, color: '#666' }}>
                              -
                            </Text>
                          )}
                        </div>
                        {evidenceList.length > 0 && (
                          <div>
                            <Text
                              strong
                              style={{ fontSize: 12, color: '#333' }}
                            >
                              Evidence:{' '}
                            </Text>
                            <ul
                              style={{
                                margin: '4px 0 0 0',
                                padding: 0,
                                color: '#666',
                                listStyle: 'none',
                              }}
                            >
                              {evidenceList.map((ev, evIndex) => (
                                <li
                                  key={evIndex}
                                  style={{ fontSize: 12, marginLeft: 0 }}
                                >
                                  {ev.file_name}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  ),
                };
              })}
            />
          ) : (
            <Empty description="No status change history" />
          )}
        </>
      )}
    </Modal>
  );
};

export default DisputeDetailModal;
