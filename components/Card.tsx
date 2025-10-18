'use client'
import React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { motion } from 'framer-motion'
import useBoardStore from '../store/useBoardStore'
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/20/solid'
import { Card as HeroCard, CardBody } from '@heroui/card'


export default function Card({ card}: { card: { id: string, title: string }, index: number, columnId: string }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id
  })
  const { editCard, deleteCard } = useBoardStore()

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 999 : undefined
  }



  return (
    <motion.div
      layout
      ref={setNodeRef}
      className="cursor-grab"
      style={style}
      {...attributes}
      {...listeners}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
    >
      <HeroCard className="w-full bg-zinc-50 py-1 rounded-2xl border border-zinc-300 border-dashed">
        <CardBody>
          <div className="flex justify-between items-center">
            <div>{card.title}</div>
            <div className="flex gap-2">
              <button className="text-sm py-1" onClick={() => {
                const t = prompt('ویرایش عنوان کارت:', card.title)
                if (t !== null) editCard(card.id, t)
              }}><PencilSquareIcon className='text-sky-500 hover:text-sky-300 size-4'/></button>
              <button className="text-sm py-1" onClick={() => {
                if (confirm('حذف کارت؟')) deleteCard(card.id)
              }}><TrashIcon className='text-rose-500 hover:text-rose-300 size-4'/></button>
            </div>
          </div>
        </CardBody>
      </HeroCard>
    </motion.div>
  )
}
