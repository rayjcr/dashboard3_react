/**
 * Context for managing Dispute Modal states
 * Centralizes all modal-related state to improve component organization
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useMemo,
  type ReactNode,
} from 'react';
import type { MessageInstance } from 'antd/es/message/interface';
import type { DisputeSummaryTableRow, DisputeNote } from '@/types/dashboard';
import type {
  UploadedFileInfo,
  AfterPayFileInfo,
} from '@/services/api/disputeApi';
import type {
  KlarnaDisplayForm,
  KlarnaProvideInfoData,
} from '@/config/klarnaForm';
import {
  type PPCPProvideInfoData,
  type AfterpayProvideInfoData,
  getInitialPPCPProvideInfo,
  getInitialAfterpayProvideInfo,
} from './utils';

// ============ Context State Types ============

interface DisputeModalsState {
  // Detail Modal
  detailModalVisible: boolean;
  detailModalLoading: boolean;
  selectedRecord: DisputeSummaryTableRow | null;
  disputeNotes: DisputeNote[];

  // Action Modal
  actionModalVisible: boolean;
  actionRecord: DisputeSummaryTableRow | null;
  actionNote: string;

  // Upload state
  uploadedFiles: UploadedFileInfo[];
  uploading: boolean;

  // PPCP Provide Information Modal
  ppcpModalVisible: boolean;
  ppcpProvideInfo: PPCPProvideInfoData;

  // Afterpay Provide Information Modal
  afterpayModalVisible: boolean;
  afterpayProvideInfo: AfterpayProvideInfoData;
  afterpayShippingDocUploading: boolean;
  afterpayRefundPolicyUploading: boolean;

  // Klarna Provide Information Modal
  klarnaModalVisible: boolean;
  klarnaDisplayForm: KlarnaDisplayForm[];
  klarnaProvideInfo: KlarnaProvideInfoData[];
  klarnaIsMultiShipments: boolean[];
  klarnaHasShipments: boolean;
  klarnaRequestIds: number[];

  // Confirm Submit Modal
  confirmModalVisible: boolean;
  submitting: boolean;

  // Accept and Refund Modal
  acceptRefundModalVisible: boolean;
  acceptRefundLoading: boolean;
}

interface DisputeModalsActions {
  // Detail Modal actions
  openDetailModal: (record: DisputeSummaryTableRow) => void;
  closeDetailModal: () => void;
  setDetailModalLoading: (loading: boolean) => void;
  setDisputeNotes: (notes: DisputeNote[]) => void;

  // Action Modal actions
  openActionModal: (record: DisputeSummaryTableRow) => void;
  closeActionModal: () => void;
  setActionNote: (note: string) => void;

  // Upload actions
  setUploadedFiles: React.Dispatch<React.SetStateAction<UploadedFileInfo[]>>;
  setUploading: (uploading: boolean) => void;
  removeUploadedFile: (fileId: string) => void;
  pendingFilesRef: React.MutableRefObject<File[]>;
  uploadTimerRef: React.MutableRefObject<ReturnType<typeof setTimeout> | null>;
  pendingSubmitFilesRef: React.MutableRefObject<File[]>;

  // PPCP Modal actions
  openPPCPModal: () => void;
  closePPCPModal: () => void;
  setPPCPProvideInfo: React.Dispatch<React.SetStateAction<PPCPProvideInfoData>>;
  handlePPCPFieldChange: (
    field: keyof PPCPProvideInfoData,
    value: string,
  ) => void;

  // Afterpay Modal actions
  openAfterpayModal: () => void;
  closeAfterpayModal: () => void;
  setAfterpayProvideInfo: React.Dispatch<
    React.SetStateAction<AfterpayProvideInfoData>
  >;
  handleAfterpayFieldChange: (
    field: keyof AfterpayProvideInfoData,
    value: string | AfterPayFileInfo | null,
  ) => void;
  setAfterPayShippingDocUploading: (uploading: boolean) => void;
  setAfterPayRefundPolicyUploading: (uploading: boolean) => void;
  pendingAfterPayShippingDocRef: React.MutableRefObject<File | null>;
  pendingAfterPayRefundPolicyRef: React.MutableRefObject<File | null>;
  afterpayShippingDocTimerRef: React.MutableRefObject<ReturnType<
    typeof setTimeout
  > | null>;
  afterpayRefundPolicyTimerRef: React.MutableRefObject<ReturnType<
    typeof setTimeout
  > | null>;

  // Klarna Modal actions
  openKlarnaModal: () => void;
  closeKlarnaModal: () => void;
  setKlarnaDisplayForm: React.Dispatch<
    React.SetStateAction<KlarnaDisplayForm[]>
  >;
  setKlarnaProvideInfo: React.Dispatch<
    React.SetStateAction<KlarnaProvideInfoData[]>
  >;
  setKlarnaIsMultiShipments: React.Dispatch<React.SetStateAction<boolean[]>>;
  setKlarnaHasShipments: (hasShipments: boolean) => void;
  setKlarnaRequestIds: React.Dispatch<React.SetStateAction<number[]>>;

  // Confirm Modal actions
  openConfirmModal: () => void;
  closeConfirmModal: () => void;
  setSubmitting: (submitting: boolean) => void;

  // Accept Refund Modal actions
  openAcceptRefundModal: () => void;
  closeAcceptRefundModal: () => void;
  setAcceptRefundLoading: (loading: boolean) => void;

  // Reset all states
  resetAllStates: () => void;
}

interface DisputeModalsContextValue
  extends DisputeModalsState, DisputeModalsActions {
  message: MessageInstance;
}

// ============ Context Creation ============

const DisputeModalsContext = createContext<DisputeModalsContextValue | null>(
  null,
);

// ============ Provider Component ============

interface DisputeModalsProviderProps {
  children: ReactNode;
  message: MessageInstance;
}

export const DisputeModalsProvider: React.FC<DisputeModalsProviderProps> = ({
  children,
  message,
}) => {
  // Detail Modal state
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [detailModalLoading, setDetailModalLoading] = useState(false);
  const [selectedRecord, setSelectedRecord] =
    useState<DisputeSummaryTableRow | null>(null);
  const [disputeNotes, setDisputeNotes] = useState<DisputeNote[]>([]);

  // Action Modal state
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [actionRecord, setActionRecord] =
    useState<DisputeSummaryTableRow | null>(null);
  const [actionNote, setActionNote] = useState('');

  // Upload state
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFileInfo[]>([]);
  const [uploading, setUploading] = useState(false);
  const pendingFilesRef = useRef<File[]>([]);
  const uploadTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingSubmitFilesRef = useRef<File[]>([]);

  // PPCP Provide Information Modal state
  const [ppcpModalVisible, setPPCPModalVisible] = useState(false);
  const [ppcpProvideInfo, setPPCPProvideInfo] = useState<PPCPProvideInfoData>(
    getInitialPPCPProvideInfo(),
  );

  // Afterpay Provide Information Modal state
  const [afterpayModalVisible, setAfterpayModalVisible] = useState(false);
  const [afterpayProvideInfo, setAfterpayProvideInfo] =
    useState<AfterpayProvideInfoData>(getInitialAfterpayProvideInfo());
  const [afterpayShippingDocUploading, setAfterPayShippingDocUploading] =
    useState(false);
  const [afterpayRefundPolicyUploading, setAfterPayRefundPolicyUploading] =
    useState(false);
  const pendingAfterPayShippingDocRef = useRef<File | null>(null);
  const pendingAfterPayRefundPolicyRef = useRef<File | null>(null);
  const afterpayShippingDocTimerRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);
  const afterpayRefundPolicyTimerRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);

  // Klarna Provide Information Modal state
  const [klarnaModalVisible, setKlarnaModalVisible] = useState(false);
  const [klarnaDisplayForm, setKlarnaDisplayForm] = useState<
    KlarnaDisplayForm[]
  >([]);
  const [klarnaProvideInfo, setKlarnaProvideInfo] = useState<
    KlarnaProvideInfoData[]
  >([]);
  const [klarnaIsMultiShipments, setKlarnaIsMultiShipments] = useState<
    boolean[]
  >([]);
  const [klarnaHasShipments, setKlarnaHasShipments] = useState(false);
  const [klarnaRequestIds, setKlarnaRequestIds] = useState<number[]>([]);

  // Confirm Submit Modal state
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Accept and Refund Modal state
  const [acceptRefundModalVisible, setAcceptRefundModalVisible] =
    useState(false);
  const [acceptRefundLoading, setAcceptRefundLoading] = useState(false);

  // ============ Actions ============

  // Detail Modal actions
  const openDetailModal = useCallback((record: DisputeSummaryTableRow) => {
    setSelectedRecord(record);
    setDetailModalVisible(true);
    setDetailModalLoading(true);
    setDisputeNotes([]);
  }, []);

  const closeDetailModal = useCallback(() => {
    setDetailModalVisible(false);
  }, []);

  // Action Modal actions
  const openActionModal = useCallback((record: DisputeSummaryTableRow) => {
    setActionRecord(record);
    setActionNote('');
    setUploadedFiles([]);
    setUploading(false);
    setPPCPProvideInfo(getInitialPPCPProvideInfo());
    setAfterpayProvideInfo(getInitialAfterpayProvideInfo());
    setKlarnaDisplayForm([]);
    setKlarnaProvideInfo([]);
    setKlarnaIsMultiShipments([]);
    setKlarnaHasShipments(false);
    setKlarnaRequestIds([]);
    setConfirmModalVisible(false);
    setSubmitting(false);
    pendingSubmitFilesRef.current = [];
    setActionModalVisible(true);
  }, []);

  const closeActionModal = useCallback(() => {
    setActionModalVisible(false);
    setActionRecord(null);
    setActionNote('');
    setUploadedFiles([]);
    setUploading(false);
    setPPCPProvideInfo(getInitialPPCPProvideInfo());
    setPPCPModalVisible(false);
    setAfterpayModalVisible(false);
    setKlarnaModalVisible(false);
    setKlarnaDisplayForm([]);
    setKlarnaProvideInfo([]);
    setKlarnaIsMultiShipments([]);
    setKlarnaHasShipments(false);
    setKlarnaRequestIds([]);
    setConfirmModalVisible(false);
    setSubmitting(false);
    pendingSubmitFilesRef.current = [];
    setAcceptRefundModalVisible(false);
    setAcceptRefundLoading(false);
  }, []);

  // Upload actions
  const removeUploadedFile = useCallback((fileId: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.fileId !== fileId));
  }, []);

  // PPCP Modal actions
  const openPPCPModal = useCallback(() => {
    setPPCPModalVisible(true);
  }, []);

  const closePPCPModal = useCallback(() => {
    setPPCPModalVisible(false);
  }, []);

  const handlePPCPFieldChange = useCallback(
    (field: keyof PPCPProvideInfoData, value: string) => {
      setPPCPProvideInfo((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  // Afterpay Modal actions
  const openAfterpayModal = useCallback(() => {
    setAfterpayModalVisible(true);
  }, []);

  const closeAfterpayModal = useCallback(() => {
    setAfterpayModalVisible(false);
  }, []);

  const handleAfterpayFieldChange = useCallback(
    (
      field: keyof AfterpayProvideInfoData,
      value: string | AfterPayFileInfo | null,
    ) => {
      setAfterpayProvideInfo((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  // Klarna Modal actions
  const openKlarnaModal = useCallback(() => {
    setKlarnaModalVisible(true);
  }, []);

  const closeKlarnaModal = useCallback(() => {
    setKlarnaModalVisible(false);
  }, []);

  // Confirm Modal actions
  const openConfirmModal = useCallback(() => {
    setConfirmModalVisible(true);
  }, []);

  const closeConfirmModal = useCallback(() => {
    setConfirmModalVisible(false);
  }, []);

  // Accept Refund Modal actions
  const openAcceptRefundModal = useCallback(() => {
    setAcceptRefundModalVisible(true);
  }, []);

  const closeAcceptRefundModal = useCallback(() => {
    setAcceptRefundModalVisible(false);
  }, []);

  // Reset all states
  const resetAllStates = useCallback(() => {
    setDetailModalVisible(false);
    setDetailModalLoading(false);
    setSelectedRecord(null);
    setDisputeNotes([]);
    setActionModalVisible(false);
    setActionRecord(null);
    setActionNote('');
    setUploadedFiles([]);
    setUploading(false);
    setPPCPModalVisible(false);
    setPPCPProvideInfo(getInitialPPCPProvideInfo());
    setAfterpayModalVisible(false);
    setAfterpayProvideInfo(getInitialAfterpayProvideInfo());
    setKlarnaModalVisible(false);
    setKlarnaDisplayForm([]);
    setKlarnaProvideInfo([]);
    setKlarnaIsMultiShipments([]);
    setKlarnaHasShipments(false);
    setKlarnaRequestIds([]);
    setConfirmModalVisible(false);
    setSubmitting(false);
    setAcceptRefundModalVisible(false);
    setAcceptRefundLoading(false);
    pendingFilesRef.current = [];
    pendingSubmitFilesRef.current = [];
  }, []);

  // ============ Context Value ============

  const contextValue = useMemo<DisputeModalsContextValue>(
    () => ({
      // State
      detailModalVisible,
      detailModalLoading,
      selectedRecord,
      disputeNotes,
      actionModalVisible,
      actionRecord,
      actionNote,
      uploadedFiles,
      uploading,
      ppcpModalVisible,
      ppcpProvideInfo,
      afterpayModalVisible,
      afterpayProvideInfo,
      afterpayShippingDocUploading,
      afterpayRefundPolicyUploading,
      klarnaModalVisible,
      klarnaDisplayForm,
      klarnaProvideInfo,
      klarnaIsMultiShipments,
      klarnaHasShipments,
      klarnaRequestIds,
      confirmModalVisible,
      submitting,
      acceptRefundModalVisible,
      acceptRefundLoading,

      // Actions
      openDetailModal,
      closeDetailModal,
      setDetailModalLoading,
      setDisputeNotes,
      openActionModal,
      closeActionModal,
      setActionNote,
      setUploadedFiles,
      setUploading,
      removeUploadedFile,
      pendingFilesRef,
      uploadTimerRef,
      pendingSubmitFilesRef,
      openPPCPModal,
      closePPCPModal,
      setPPCPProvideInfo,
      handlePPCPFieldChange,
      openAfterpayModal,
      closeAfterpayModal,
      setAfterpayProvideInfo,
      handleAfterpayFieldChange,
      setAfterPayShippingDocUploading,
      setAfterPayRefundPolicyUploading,
      pendingAfterPayShippingDocRef,
      pendingAfterPayRefundPolicyRef,
      afterpayShippingDocTimerRef,
      afterpayRefundPolicyTimerRef,
      openKlarnaModal,
      closeKlarnaModal,
      setKlarnaDisplayForm,
      setKlarnaProvideInfo,
      setKlarnaIsMultiShipments,
      setKlarnaHasShipments,
      setKlarnaRequestIds,
      openConfirmModal,
      closeConfirmModal,
      setSubmitting,
      openAcceptRefundModal,
      closeAcceptRefundModal,
      setAcceptRefundLoading,
      resetAllStates,

      // Message API
      message,
    }),
    [
      detailModalVisible,
      detailModalLoading,
      selectedRecord,
      disputeNotes,
      actionModalVisible,
      actionRecord,
      actionNote,
      uploadedFiles,
      uploading,
      ppcpModalVisible,
      ppcpProvideInfo,
      afterpayModalVisible,
      afterpayProvideInfo,
      afterpayShippingDocUploading,
      afterpayRefundPolicyUploading,
      klarnaModalVisible,
      klarnaDisplayForm,
      klarnaProvideInfo,
      klarnaIsMultiShipments,
      klarnaHasShipments,
      klarnaRequestIds,
      confirmModalVisible,
      submitting,
      acceptRefundModalVisible,
      acceptRefundLoading,
      openDetailModal,
      closeDetailModal,
      openActionModal,
      closeActionModal,
      removeUploadedFile,
      openPPCPModal,
      closePPCPModal,
      handlePPCPFieldChange,
      openAfterpayModal,
      closeAfterpayModal,
      handleAfterpayFieldChange,
      openKlarnaModal,
      closeKlarnaModal,
      openConfirmModal,
      closeConfirmModal,
      openAcceptRefundModal,
      closeAcceptRefundModal,
      resetAllStates,
      message,
    ],
  );

  return (
    <DisputeModalsContext.Provider value={contextValue}>
      {children}
    </DisputeModalsContext.Provider>
  );
};

// ============ Custom Hook ============

export const useDisputeModals = (): DisputeModalsContextValue => {
  const context = useContext(DisputeModalsContext);
  if (!context) {
    throw new Error(
      'useDisputeModals must be used within a DisputeModalsProvider',
    );
  }
  return context;
};

export default DisputeModalsContext;
