'use client'
import React, { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { motion } from 'framer-motion'
import useBoardStore from '../store/useBoardStore'
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/20/solid'
import { Card as HeroCard, CardBody } from '@heroui/card'
import TrelloModal from './TrelloModal'
import { Input } from '@heroui/input'

export default function Card({ card, index, columnId }: { 
  card: { id: string, title: string }, 
  index: number, 
  columnId: string 
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id
  })
  const { editCard, deleteCard } = useBoardStore()

  // State برای مودال‌ها
  const [isEditModalOpen, setEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false)
  const [editCardTitle, setEditCardTitle] = useState(card.title)

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 999 : undefined
  }

  // تابع برای ویرایش کارت
  const handleEditCard = () => {
    if (editCardTitle.trim()) {
      editCard(card.id, editCardTitle.trim())
      setEditModalOpen(false)
    }
  }

  // تابع برای پاک کردن کارت
  const handleDeleteCard = () => {
    deleteCard(card.id)
    setDeleteModalOpen(false)
  }

  // بازنشانی مقدار ویرایش هنگام باز شدن مودال
  const handleEditModalOpen = () => {
    setEditCardTitle(card.title)
    setEditModalOpen(true)
  }

  return (
    <>
      <motion.div
        layout
        ref={setNodeRef}
        style={style}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      >
        <HeroCard className="w-full bg-zinc-50 py-1 rounded-2xl border border-zinc-300 border-dashed hover:shadow-md transition-shadow">
          <CardBody>
            <div className="flex justify-between items-center">
              {/* قسمت متن کارت - اینجا درگ میشه */}
              <div 
                className="flex-1 min-w-0 cursor-grab"
                {...attributes}
                {...listeners}
              >
                <p className="text-sm font-medium text-gray-900 truncate">
                  {card.title}
                </p>
              </div>
              
              {/* دکمه‌ها - اینجا درگ نمیشه */}
              <div className="flex gap-2 flex-shrink-0">
                <button 
                  className="text-sm py-1 hover:bg-gray-100 rounded p-1 transition-colors cursor-pointer"
                  onClick={handleEditModalOpen}
                  aria-label="Edit card"
                >
                  <PencilSquareIcon className='text-sky-500 hover:text-sky-600 size-4'/>
                </button>
                <button 
                  className="text-sm py-1 hover:bg-gray-100 rounded p-1 transition-colors cursor-pointer"
                  onClick={() => setDeleteModalOpen(true)}
                  aria-label="Delete card"
                >
                  <TrashIcon className='text-rose-500 hover:text-rose-600 size-4'/>
                </button>
              </div>
            </div>
          </CardBody>
        </HeroCard>
      </motion.div>

      {/* Edit cart modal */}
      <TrelloModal
        isOpen={isEditModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Card"
        confirmLabel="Save Changes"
        onConfirm={handleEditCard}
        disableConfirm={!editCardTitle.trim()}
      >
        <Input
          label="Card Name"
          placeholder="Please enter card name"
          value={editCardTitle}
          onChange={(e) => setEditCardTitle(e.target.value)}
          autoFocus
          onKeyPress={(e) => {
            if (e.key === 'Enter' && editCardTitle.trim()) {
              handleEditCard()
            }
          }}
        />
      </TrelloModal>

      {/* Delete cart modal */}
      <TrelloModal
        isOpen={isDeleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Card"
        confirmLabel="Delete"
        confirmColor="danger"
        onConfirm={handleDeleteCard}
      >
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <TrashIcon className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Delete Card
          </h3>
          <p className="text-sm text-gray-500">
            Are you sure you want to delete the card "<strong>{card.title}</strong>"? 
            This action cannot be undone.
          </p>
        </div>
      </TrelloModal>
    </>
  )
}