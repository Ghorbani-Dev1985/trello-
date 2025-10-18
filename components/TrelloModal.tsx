'use client'
import React from 'react'
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader
} from '@heroui/modal'
import { Button } from '@heroui/button'

type TrelloModalProps = {
  isOpen: boolean
  onClose: () => void
  title?: string
  children?: React.ReactNode
  confirmLabel?: string
  cancelLabel?: string
  onConfirm?: () => void
  confirmColor?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning'
  disableConfirm?: boolean
}

export default function TrelloModal({
  isOpen,
  onClose,
  title,
  children,
  confirmLabel = 'Ok',
  cancelLabel = 'Cancel',
  onConfirm,
  confirmColor = 'primary',
  disableConfirm = false,
}: TrelloModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} placement="center">
      <ModalContent>
        {() => (
          <>
            {title && <ModalHeader><p className='text-primary_text'>{title}</p></ModalHeader>}

            <ModalBody>{children}</ModalBody>

            <ModalFooter>
              <Button variant="flat" onPress={onClose}>
                {cancelLabel}
              </Button>
              {onConfirm && (
                <Button
                  color={confirmColor}
                  onPress={onConfirm}
                  isDisabled={disableConfirm}
                >
                  {confirmLabel}
                </Button>
              )}
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  )
}
