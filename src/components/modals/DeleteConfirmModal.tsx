import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal } from "react-native";
import { colors, spacing, radius } from "../../constants/theme";

interface DeleteConfirmModalProps {
  visible: boolean;
  contactName?: string;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteConfirmModal({
  visible,
  contactName,
  onClose,
  onConfirm,
}: DeleteConfirmModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Delete contact?</Text>
          <Text style={styles.deleteWarningText}>
            Are you sure you want to remove {contactName}?
          </Text>
          
          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.saveButton, { backgroundColor: colors.danger }]} onPress={onConfirm}>
              <Text style={styles.saveButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    padding: spacing.lg,
  },
  modalContent: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: spacing.lg,
  },
  deleteWarningText: {
    color: colors.text,
    fontSize: 16,
    marginBottom: spacing.xl,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: spacing.sm,
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    marginRight: spacing.sm,
  },
  cancelButtonText: {
    color: colors.mutedText,
    fontSize: 16,
    fontWeight: "600",
  },
  saveButton: {
    paddingVertical: 10,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
  },
  saveButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
