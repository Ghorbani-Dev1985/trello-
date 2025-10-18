'use client'
import React, { useState } from 'react'
import useBoardStore from '../store/useBoardStore'
import Column from './Column'
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowUturnLeftIcon,
  ArrowUturnRightIcon,
  NoSymbolIcon,
  PlusCircleIcon,
} from '@heroicons/react/20/solid'
import { Button } from '@heroui/button'
import { Input } from '@heroui/input'
import TrelloModal from './TrelloModal'

export default function Board() {
  const { getSnapshot, apply, undo, redo, reset, addColumn } = useBoardStore()
  const snapshot = getSnapshot()
  const { columns, cards } = snapshot

  // --- State for Add Column Modal ---
  const [isAddModalOpen, setAddModalOpen] = useState(false)
  const [newColumnTitle, setNewColumnTitle] = useState('')

  // --- Card Position Finder ---
  const findCardPosition = (cardId: string) => {
    for (const colId of Object.keys(columns)) {
      const idx = columns[colId].cardIds.indexOf(cardId)
      if (idx !== -1) return { colId, idx }
    }
    return null
  }

  // --- Drag & Drop Handler ---
  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over) return
    const cardId = String(active.id)
    const overId = String(over.id)

    if (columns[overId]) {
      const from = findCardPosition(cardId)
      if (!from) return
      const toCol = overId
      const next = structuredClone(snapshot)
      next.columns[from.colId].cardIds.splice(from.idx, 1)
      next.columns[toCol].cardIds.push(cardId)
      apply(next)
      return
    }

    const toPos = findCardPosition(overId)
    const fromPos = findCardPosition(cardId)
    if (!toPos || !fromPos) return
    const next = structuredClone(snapshot)
    next.columns[fromPos.colId].cardIds.splice(fromPos.idx, 1)
    let insertIdx = toPos.idx
    if (fromPos.colId === toPos.colId && fromPos.idx < toPos.idx)
      insertIdx = toPos.idx - 1
    next.columns[toPos.colId].cardIds.splice(insertIdx, 0, cardId)
    apply(next)
  }

  // --- Add Column Handler ---
  const handleAddColumn = () => {
    if (newColumnTitle.trim()) {
      addColumn(newColumnTitle.trim())
      setNewColumnTitle('')
      setAddModalOpen(false)
    }
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="flex gap-2 mb-4 text-secondary">
        <Button isIconOnly aria-label="undo" color="secondary" onPress={undo}>
          <ArrowUturnLeftIcon className="size-6 text-primary" />
        </Button>
        <Button isIconOnly aria-label="redo" color="secondary" onPress={redo}>
          <ArrowUturnRightIcon className="size-6 text-primary" />
        </Button>
        <Button isIconOnly aria-label="undo" color="secondary" onPress={reset}>
          <NoSymbolIcon className="size-6 text-rose-500" />
        </Button>
        <Button
          isIconOnly aria-label="redo" color="secondary"
          onPress={() => setAddModalOpen(true)}
        >
          <PlusCircleIcon className="size-6 text-emerald-500" />
        </Button>
      </div>

      {/* Board Columns */}
      <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <div className="flex gap-4 overflow-auto pb-4">
          <AnimatePresence initial={false}>
            {Object.values(columns).map((col) => (
              <motion.div key={col.id} layout className="min-w-[280px]">
                <Column
                  column={col}
                  cards={col.cardIds.map((cid) => cards[cid])}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </DndContext>

      {/* Add Column Modal */}
       <TrelloModal isOpen={isAddModalOpen} onClose={() => setAddModalOpen(false)} title='Add New Column' confirmLabel='Add New' onConfirm={handleAddColumn} disableConfirm={!newColumnTitle.trim()}>
        <Input label="Column Name" placeholder='Please enter new column name' value={newColumnTitle} onChange={(e) => setNewColumnTitle(e.target.value)} autoFocus/>
       </TrelloModal>
    </div>
  )
}
